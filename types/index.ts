export interface Customer {
  id: string;
  name: string;
  email: string;
  orderId: string;
  productName: string;
  productCategory: ProductCategory;
  purchaseDate: string;
  deliveryDate: string;
  productPrice: number;
  orderStatus: OrderStatus;
  productUsed: boolean;
  refundRequested: boolean;
  refundStatus: RefundStatus;
}

export type ProductCategory =
  | 'Electronics'
  | 'Clothing'
  | 'Shoes'
  | 'Home & Garden'
  | 'Sports'
  | 'Books'
  | 'Beauty'
  | 'Gift Cards'
  | 'Custom Products';

export type OrderStatus =
  | 'Delivered'
  | 'In Transit'
  | 'Processing'
  | 'Cancelled';

export type RefundStatus =
  | 'Pending'
  | 'Approved'
  | 'Denied'
  | 'Not Requested';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface AgentLog {
  id: string;
  type: 'tool_call' | 'reasoning' | 'decision' | 'error' | 'info';
  message: string;
  timestamp: Date;
  details?: Record<string, unknown>;
}

export interface RefundDecision {
  approved: boolean;
  reason: string;
  customerId?: string;
  orderId?: string;
}

export interface AgentState {
  customer: Customer | null;
  checkingPolicy: boolean;
  policyResult: string | null;
  decision: RefundDecision | null;
}

export type AgentTool =
  | 'findCustomer'
  | 'getOrder'
  | 'checkRefundPolicy'
  | 'calculateEligibility'
  | 'approveRefund'
  | 'denyRefund'
  | 'logDecision';
