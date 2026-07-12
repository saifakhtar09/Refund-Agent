import { GoogleGenerativeAI } from '@google/generative-ai';
import { Customer, AgentLog, RefundDecision } from '@/types';
import {
  findCustomerById,
  findCustomerByEmail,
  findCustomerByName,
  findCustomerByOrderId,
  customers
} from '@/data/customers';
import { checkRefundPolicy, calculateDaysSinceDelivery, refundPolicyMd } from '@/data/refundPolicy';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SentimentLevel = 'positive' | 'neutral' | 'frustrated' | 'angry';

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  sentiment?: SentimentLevel;
  timestamp: Date;
}

export interface RefundRecord {
  customerId: string;
  customerName: string;
  orderId: string;
  productName: string;
  amount: number;
  approved: boolean;
  reason: string;
  sentiment: SentimentLevel;
  escalated: boolean;
  timestamp: Date;
}

// ─── State ────────────────────────────────────────────────────────────────────

let logCallback: ((log: AgentLog) => void) | null = null;
const refundHistory: RefundRecord[] = [];

export function setLogCallback(callback: (log: AgentLog) => void) {
  logCallback = callback;
}

export function clearLogCallback() {
  logCallback = null;
}

export function getRefundHistory(): RefundRecord[] {
  return [...refundHistory];
}

export function clearRefundHistory() {
  refundHistory.length = 0;
}

function addLog(type: AgentLog['type'], message: string, details?: Record<string, unknown>) {
  const log: AgentLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    message,
    timestamp: new Date(),
    details
  };
  if (logCallback) logCallback(log);
  return log;
}

// ─── Tools ────────────────────────────────────────────────────────────────────

const tools = {
  findCustomer: async (query: string): Promise<Customer | null> => {
    addLog('tool_call', `Searching for customer: "${query}"`);

    let customer = findCustomerById(query);
    if (customer) { addLog('info', 'Customer found by ID', { customerId: customer.id, name: customer.name }); return customer; }

    customer = findCustomerByEmail(query);
    if (customer) { addLog('info', 'Customer found by email', { customerId: customer.id, name: customer.name }); return customer; }

    customer = findCustomerByOrderId(query);
    if (customer) { addLog('info', 'Customer found by order ID', { customerId: customer.id, name: customer.name }); return customer; }

    customer = findCustomerByName(query);
    if (customer) { addLog('info', 'Customer found by name', { customerId: customer.id, name: customer.name }); return customer; }

    addLog('error', `Customer not found: "${query}"`);
    return null;
  },

  getOrder: async (orderId: string): Promise<Customer | null> => {
    addLog('tool_call', `Fetching order details for: ${orderId}`);
    const customer = findCustomerByOrderId(orderId);
    if (customer) {
      addLog('info', 'Order found', { productName: customer.productName, productPrice: customer.productPrice, orderStatus: customer.orderStatus });
      return customer;
    }
    addLog('error', `Order not found: ${orderId}`);
    return null;
  },

  checkRefundPolicy: async (customer: Customer): Promise<{ eligible: boolean; reason: string; daysSinceDelivery: number }> => {
    addLog('tool_call', 'Checking refund policy...', {
      productName: customer.productName,
      productCategory: customer.productCategory,
      productPrice: customer.productPrice
    });

    const daysSinceDelivery = calculateDaysSinceDelivery(customer.deliveryDate);
    addLog('reasoning', `Order delivered ${daysSinceDelivery} days ago`);

    const result = checkRefundPolicy(
      daysSinceDelivery,
      customer.productUsed,
      customer.productCategory,
      customer.productPrice,
      customer.orderStatus
    );

    addLog('info', `Policy check result: ${result.eligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}`, {
      reason: result.reason,
      policySection: result.policySection
    });

    return { eligible: result.eligible, reason: result.reason, daysSinceDelivery };
  },

  approveRefund: async (customer: Customer, reason: string): Promise<RefundDecision> => {
    addLog('tool_call', 'Processing refund approval...');
    const decision: RefundDecision = { approved: true, reason, customerId: customer.id, orderId: customer.orderId };
    addLog('decision', 'REFUND APPROVED', { customer: customer.name, orderId: customer.orderId, productName: customer.productName, amount: customer.productPrice });
    return decision;
  },

  denyRefund: async (customer: Customer, reason: string): Promise<RefundDecision> => {
    addLog('tool_call', 'Processing refund denial...');
    const decision: RefundDecision = { approved: false, reason, customerId: customer.id, orderId: customer.orderId };
    addLog('decision', 'REFUND DENIED', { customer: customer.name, orderId: customer.orderId, reason });
    return decision;
  },

  logDecision: async (decision: RefundDecision): Promise<void> => {
    addLog('tool_call', 'Logging final decision...', { approved: decision.approved, reason: decision.reason });
  }
};

// ─── Agent ────────────────────────────────────────────────────────────────────

export class RefundAgent {
  private apiKey: string;
  private conversationHistory: ConversationMessage[] = [];

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || '';
  }

  // Clear conversation memory (call when starting a new session)
  clearHistory() {
    this.conversationHistory = [];
    addLog('info', 'Conversation history cleared');
  }

  getHistory(): ConversationMessage[] {
    return [...this.conversationHistory];
  }

  async processRefundRequest(userMessage: string): Promise<string> {
    addLog('info', 'Processing new refund request...');
    addLog('reasoning', 'Analyzing customer message...');

    if (this.apiKey) {
      return this.processWithGemini(userMessage);
    }
    return this.processWithRules(userMessage);
  }

  // ── Sentiment Analysis ──────────────────────────────────────────────────────

  private async analyzeSentiment(message: string): Promise<SentimentLevel> {
    try {
      const genAI = new GoogleGenerativeAI(this.apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const result = await model.generateContent(`
Classify the sentiment of this customer support message as exactly one word.
Reply with only one of: positive, neutral, frustrated, angry

Message: "${message}"
`);

      const raw = result.response.text().trim().toLowerCase() as SentimentLevel;
      const valid: SentimentLevel[] = ['positive', 'neutral', 'frustrated', 'angry'];
      const sentiment = valid.includes(raw) ? raw : 'neutral';

      const emoji = { positive: '😊', neutral: '😐', frustrated: '😟', angry: '😠' }[sentiment];
      addLog('info', `Sentiment detected: ${emoji} ${sentiment}`, { sentiment });

      return sentiment;
    } catch {
      return 'neutral'; // fail silently
    }
  }

  // ── Escalation Detection ────────────────────────────────────────────────────

  private shouldEscalate(message: string, sentiment: SentimentLevel): boolean {
    const escalationPhrases = [
      'speak to a human', 'talk to a person', 'real agent', 'supervisor',
      'manager', 'lawyer', 'sue', 'legal action', 'this is ridiculous',
      'terrible service', 'worst', 'unacceptable', 'fraud', 'scam'
    ];

    const lowerMessage = message.toLowerCase();
    const hasEscalationPhrase = escalationPhrases.some(phrase => lowerMessage.includes(phrase));
    const isAngry = sentiment === 'angry';

    return hasEscalationPhrase || isAngry;
  }

  // ── Main Gemini Flow ────────────────────────────────────────────────────────

  private async processWithGemini(userMessage: string): Promise<string> {
    // 1. Analyze sentiment first
    const sentiment = await this.analyzeSentiment(userMessage);

    // 2. Check for escalation
    if (this.shouldEscalate(userMessage, sentiment)) {
      addLog('info', '🚨 Escalation triggered — routing to human agent', { sentiment, message: userMessage });

      const escalationMsg = `I completely understand your frustration, and I'm sorry for the experience you've had. I'm escalating your case to a senior support agent who will contact you within 2 hours. Your concern has been flagged as high priority. Reference: ESC-${Date.now().toString().slice(-6)}`;

      this.conversationHistory.push({ role: 'user', content: userMessage, sentiment, timestamp: new Date() });
      this.conversationHistory.push({ role: 'assistant', content: escalationMsg, timestamp: new Date() });

      return escalationMsg;
    }

    // 3. Run rule-based logic once and cache
    const refundDecision = await this.processWithRules(userMessage);

    // 4. Short-circuit if customer not found
    if (refundDecision.includes('Could you please provide')) {
      this.conversationHistory.push({ role: 'user', content: userMessage, sentiment, timestamp: new Date() });
      this.conversationHistory.push({ role: 'assistant', content: refundDecision, timestamp: new Date() });
      addLog('info', 'Customer not identified, skipping Gemini call');
      return refundDecision;
    }

    try {
      const genAI = new GoogleGenerativeAI(this.apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      addLog('info', 'Connecting to Gemini AI...');
      addLog('reasoning', 'Refund policy validation completed, sending to Gemini...');

      // 5. Build conversation history context
      const historyContext = this.conversationHistory.length > 0
        ? `Previous conversation:\n${this.conversationHistory
            .map(m => `${m.role === 'user' ? 'Customer' : 'Agent'}: ${m.content}`)
            .join('\n')}\n\n`
        : '';

      const prompt = `
You are a professional e-commerce customer support agent.

A refund decision has already been determined by the backend system based on the policy below.
Your job is to rewrite the decision message — do NOT change the outcome.

--- REFUND POLICY ---
${refundPolicyMd}
---------------------

${historyContext}Customer sentiment: ${sentiment}
Current customer message: ${userMessage}

Backend refund decision:
${refundDecision}

Instructions:
- Rewrite the response in a warm, professional, and empathetic tone.
- If sentiment is frustrated or angry, be extra empathetic and acknowledge their feelings first.
- Do not change whether the refund is approved or denied.
- Do not invent policy details not mentioned above.
- Keep the response concise (3–5 sentences max).
- Do not use markdown formatting like ** or ## in your response.
- If this is not the first message, acknowledge the conversation context naturally.
`;

      const response = await this.callGeminiWithRetry(model, prompt);
      addLog('info', 'Gemini response generated successfully');

      // 6. Save to conversation history
      this.conversationHistory.push({ role: 'user', content: userMessage, sentiment, timestamp: new Date() });
      this.conversationHistory.push({ role: 'assistant', content: response, timestamp: new Date() });

      return response;

    } catch (error) {
      addLog('error', `Gemini processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return refundDecision;
    }
  }

  // ── Retry Helper ────────────────────────────────────────────────────────────

  private async callGeminiWithRetry(
    model: ReturnType<InstanceType<typeof GoogleGenerativeAI>['getGenerativeModel']>,
    prompt: string,
    retries = 3,
    delayMs = 2000
  ): Promise<string> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const result = await model.generateContent(prompt);
        return result.response.text();
      } catch (error) {
        const is503 = error instanceof Error && error.message.includes('503');
        if (is503 && attempt < retries) {
          addLog('info', `Gemini busy, retrying... (attempt ${attempt}/${retries})`);
          await new Promise(res => setTimeout(res, delayMs * attempt));
        } else {
          throw error;
        }
      }
    }
    throw new Error('Gemini failed after all retries');
  }

  // ── Rule-Based Fallback ─────────────────────────────────────────────────────

  private async processWithRules(userMessage: string): Promise<string> {
    const lowerMessage = userMessage.toLowerCase();
    let customer: Customer | null = null;

    const orderIdMatch = userMessage.match(/ord_\d+/i);
    if (orderIdMatch) customer = findCustomerByOrderId(orderIdMatch[0]) || null;

    if (!customer) {
      const custIdMatch = userMessage.match(/cust_\d+/i);
      if (custIdMatch) customer = findCustomerById(custIdMatch[0]) || null;
    }

    if (!customer) {
      const emailMatch = userMessage.match(/[\w.-]+@[\w.-]+\.\w+/);
      if (emailMatch) customer = findCustomerByEmail(emailMatch[0]) || null;
    }

    if (!customer) {
      for (const c of customers) {
        if (
          lowerMessage.includes(c.name.toLowerCase()) ||
          lowerMessage.includes(c.name.split(' ')[0].toLowerCase()) ||
          lowerMessage.includes(c.name.split(' ').pop()?.toLowerCase() || '')
        ) { customer = c; break; }
      }
    }

    if (!customer) {
      for (const c of customers) {
        if (
          lowerMessage.includes(c.productName.toLowerCase()) ||
          lowerMessage.includes(c.productCategory.toLowerCase())
        ) { customer = c; break; }
      }
    }

    if (!customer) {
      addLog('error', 'Unable to identify customer from message');
      return "I'd be happy to help you with your refund request. Could you please provide your email address, order ID, or name so I can look up your order?";
    }

    addLog('info', `Processing refund for customer: ${customer.name}`);
    const eligibilityResult = await tools.checkRefundPolicy(customer);

    if (eligibilityResult.eligible) {
      await tools.approveRefund(customer, eligibilityResult.reason);
      await tools.logDecision({ approved: true, reason: eligibilityResult.reason, customerId: customer.id, orderId: customer.orderId });

      // Save to refund history
      refundHistory.push({
        customerId: customer.id,
        customerName: customer.name,
        orderId: customer.orderId,
        productName: customer.productName,
        amount: customer.productPrice,
        approved: true,
        reason: eligibilityResult.reason,
        sentiment: 'neutral', // updated later if Gemini flow runs
        escalated: false,
        timestamp: new Date()
      });

      return `Great news! Your refund request has been approved. ${eligibilityResult.reason}\n\nRefund details:\n- Product: ${customer.productName}\n- Amount: $${customer.productPrice.toFixed(2)}\n- Order ID: ${customer.orderId}\n\nYour refund will be processed within 5-7 business days.`;
    } else {
      await tools.denyRefund(customer, eligibilityResult.reason);
      await tools.logDecision({ approved: false, reason: eligibilityResult.reason, customerId: customer.id, orderId: customer.orderId });

      // Save to refund history
      refundHistory.push({
        customerId: customer.id,
        customerName: customer.name,
        orderId: customer.orderId,
        productName: customer.productName,
        amount: customer.productPrice,
        approved: false,
        reason: eligibilityResult.reason,
        sentiment: 'neutral',
        escalated: false,
        timestamp: new Date()
      });

      return `I'm sorry, but your refund request cannot be processed at this time.\n\nReason: ${eligibilityResult.reason}\n\nIf you have any questions about this decision, please feel free to ask or contact our customer service team.`;
    }
  }
}

export const refundAgent = new RefundAgent();
export { tools as agentTools };