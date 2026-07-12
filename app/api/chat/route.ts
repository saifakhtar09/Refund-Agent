import { NextRequest, NextResponse } from 'next/server';
import { RefundAgent, setLogCallback, clearLogCallback } from '@/lib/agent';
import { AgentLog } from '@/types';

const pendingLogs: AgentLog[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, apiKey } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Set up log callback to collect logs
    pendingLogs.length = 0;
    setLogCallback((log: AgentLog) => {
      pendingLogs.push(log);
    });

    const agent = new RefundAgent(apiKey);
    const response = await agent.processRefundRequest(message);

    // Clear callback
    clearLogCallback();

    return NextResponse.json({
      response,
      logs: pendingLogs
    });

  } catch (error) {
    console.error('Chat API error:', error);
    clearLogCallback();

    return NextResponse.json(
      { error: 'An error occurred processing your request' },
      { status: 500 }
    );
  }
}
