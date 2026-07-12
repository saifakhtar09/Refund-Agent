'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage, AgentLog } from '@/types';
import { ChatBubble } from './chat-message';
import { AgentLogs } from './agent-log';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Bot,
  Sparkles,
  Activity,
  Trash2,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  History,
  Send,
  Mic,
  MicOff,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useVoice } from '@/hooks/useVoice';

// ─── Types ────────────────────────────────────────────────────────────────────

interface RefundDecisionRecord {
  id: string;
  customerName: string;
  orderId: string;
  amount: number;
  approved: boolean;
  timestamp: Date;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <Card className="flex-1 min-w-0">
      <CardContent className="p-4 flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-muted-foreground mb-1">{label}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
        <div
          className={`h-9 w-9 rounded-xl flex items-center justify-center ${color
            .replace('text-', 'bg-')
            .replace('-600', '-100')
            .replace('-500', '-100')}`}
        >
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

export function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi 👋 I'm your AI Support Agent. I can help with refunds and orders.",
      timestamp: new Date(),
    },
  ]);

  const [logs, setLogs]           = useState<AgentLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [decisions, setDecisions] = useState<RefundDecisionRecord[]>([]);
  const [input, setInput]         = useState('');

  // Hydration-safe mount flag — no SSR/client mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Stats
  const approved     = decisions.filter((d) => d.approved).length;
  const denied       = decisions.filter((d) => !d.approved).length;
  const total        = 15;
  const approvalRate = decisions.length > 0 ? Math.round((approved / decisions.length) * 100) : 0;
  const pending      = Math.max(0, total - approved - denied);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef    = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Send ──────────────────────────────────────────────────────────────────
  const handleSendMessage = useCallback(async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;

    const userMessage: ChatMessage = {
      id:        `user_${Date.now()}`,
      role:      'user',
      content:   trimmed,
      timestamp: new Date(),
    };

    setMessages((p) => [...p, userMessage]);
    setIsLoading(true);
    setLogs([]);

    try {
      const res  = await fetch('/api/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ message: trimmed }),
      });
      const data = await res.json();

      setMessages((p) => [
        ...p,
        {
          id:        `ai_${Date.now()}`,
          role:      'assistant',
          content:   data.response,
          timestamp: new Date(),
        },
      ]);

      setLogs(data.logs || []);

      if (data.decision) {
        setDecisions((prev) => [
          ...prev,
          {
            id:           `dec_${Date.now()}`,
            customerName: data.decision.customerName ?? 'Unknown',
            orderId:      data.decision.orderId ?? '-',
            amount:       data.decision.amount ?? 0,
            approved:     data.decision.approved,
            timestamp:    new Date(),
          },
        ]);
      }
    } catch {
      toast.error('Request failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSend = useCallback(() => {
    if (!input.trim() || isLoading) return;
    handleSendMessage(input);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  }, [input, isLoading, handleSendMessage]);

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 112) + 'px';
  };

  // ── Voice ─────────────────────────────────────────────────────────────────
  const handleVoiceTranscript = useCallback(
    (text: string) => {
      if (text.trim()) {
        handleSendMessage(text.trim());
        toast.success('Voice message sent');
      }
    },
    [handleSendMessage]
  );

  const voice = useVoice(handleVoiceTranscript);

  useEffect(() => {
    if (voice.error) toast.warning(voice.error);
  }, [voice.error]);

  // ── Clear ─────────────────────────────────────────────────────────────────
  const handleClearChat = () => {
    setMessages([
      {
        id:        'welcome',
        role:      'assistant',
        content:   "Hi 👋 I'm your AI Support Agent. I can help with refunds and orders.",
        timestamp: new Date(),
      },
    ]);
    setLogs([]);
    fetch('/api/chat', { method: 'DELETE' }).catch(() => {});
  };

  const isRecording  = voice.state === 'recording';
  const isProcessing = voice.state === 'processing';

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-4rem)] p-4">

      
      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">

        {/* ── Chat Card ── */}
        <Card className="flex flex-col overflow-hidden rounded-2xl shadow-sm">

          {/* Header */}
          <CardHeader className="border-b py-3 px-4 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center shadow-sm shrink-0">
                  <Bot className="h-5 w-5 text-white" />
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold leading-tight">
                    ShopSmart AI Agent
                  </CardTitle>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <span className="text-[10px] text-emerald-600 font-medium">Online</span>
                    <span className="text-[10px] text-muted-foreground">·</span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                      <Sparkles className="h-2.5 w-2.5" /> Gemini 2.0 Flash
                    </span>
                    {mounted && voice.isSupported && (
                      <Badge variant="secondary" className="text-[9px] py-0 px-1.5 h-4 rounded-full">
                        🎤 Voice
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={handleClearChat}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                title="Clear chat"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0 min-h-0 overflow-hidden">

            {/* Recording banner */}
            {mounted && isRecording && (
              <div className="flex items-center gap-3 px-4 py-2 bg-red-50 dark:bg-red-950/30 border-b border-red-200 dark:border-red-900 shrink-0">
                <div className="flex gap-[3px] items-end h-3.5">
                  {[0.4, 0.7, 1, 0.6, 0.85, 0.5, 0.9, 0.65].map((d, i) => (
                    <span
                      key={i}
                      className="wave-bar w-[2.5px] bg-red-500 rounded-full"
                      style={{ height: '100%', animationDelay: `${d * 0.25}s` }}
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold text-red-600 dark:text-red-400">Listening…</span>
                {voice.transcript && (
                  <span className="text-xs text-red-500 italic flex-1 truncate">"{voice.transcript}"</span>
                )}
                <button
                  onClick={voice.stopRecording}
                  className="text-xs text-red-600 hover:underline font-medium shrink-0"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Messages */}
            <ScrollArea className="flex-1 min-h-0">
              <div className="p-4 space-y-4">
                <AnimatePresence>
                  {messages.map((m) => (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChatBubble message={m} />
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 text-sm text-muted-foreground pl-1"
                  >
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                    <span>Thinking…</span>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* ── Input area ── */}
            <div className="border-t px-4 py-3 shrink-0 bg-background">
              <div
                className={cn(
                  'flex items-end gap-2 rounded-xl border px-3 py-2 transition-all duration-200',
                  'bg-muted/40 border-border',
                  'focus-within:border-violet-400 dark:focus-within:border-violet-600',
                  'focus-within:ring-2 focus-within:ring-violet-100 dark:focus-within:ring-violet-950/40',
                  'focus-within:bg-background',
                )}
              >
                {/* Textarea */}
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={autoResize}
                  onKeyDown={handleKey}
                  disabled={isLoading || isRecording}
                  placeholder={isRecording ? 'Listening… speak now' : 'Type your message…'}
                  rows={1}
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none outline-none max-h-28 leading-relaxed disabled:opacity-40 py-0.5"
                />

                {/* Single mic button — mount-gated, no duplicate */}
                {mounted && (
                  <button
                    onClick={isRecording ? voice.stopRecording : voice.startRecording}
                    disabled={!voice.isSupported || isProcessing}
                    title={
                      !voice.isSupported
                        ? 'Voice not supported (use Chrome)'
                        : isRecording
                        ? 'Stop recording'
                        : 'Start voice input'
                    }
                    className={cn(
                      'relative w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 overflow-hidden',
                      !voice.isSupported && 'opacity-30 cursor-not-allowed bg-muted',
                      voice.state === 'idle' &&
                        'bg-muted text-muted-foreground hover:bg-violet-100 dark:hover:bg-violet-950/60 hover:text-violet-600',
                      isRecording &&
                        'bg-red-500 text-white shadow-md shadow-red-200 dark:shadow-red-900/50',
                      isProcessing &&
                        'bg-amber-100 dark:bg-amber-950/60 text-amber-600 cursor-not-allowed',
                      voice.state === 'error' && 'bg-muted text-muted-foreground',
                    )}
                  >
                    {isProcessing ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : isRecording ? (
                      <MicOff className="w-3.5 h-3.5 relative z-10" />
                    ) : (
                      <Mic className="w-3.5 h-3.5" />
                    )}
                    {isRecording && (
                      <span className="absolute inset-0 rounded-lg bg-red-400 opacity-30 animate-ping" />
                    )}
                  </button>
                )}

                {/* Send button */}
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200',
                    input.trim() && !isLoading
                      ? 'bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-sm hover:shadow-md hover:scale-105'
                      : 'bg-muted text-muted-foreground cursor-not-allowed',
                  )}
                >
                  {isLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <p className="text-[10px] text-muted-foreground text-center mt-1.5 select-none">
                Enter to send · Shift+Enter for new line · 🎤 Mic for voice input
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ── Right Panel ── */}
        <div className="flex flex-col gap-4 min-h-0">

          {/* Agent Reasoning */}
          <Card className="flex-1 flex flex-col rounded-2xl overflow-hidden min-h-0">
            <CardHeader className="border-b py-3 px-4 shrink-0">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Activity className="h-4 w-4 text-violet-500" />
                Agent Reasoning
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 min-h-0">
              <ScrollArea className="h-full p-4">
                {logs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-center gap-2">
                    <Activity className="h-8 w-8 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground font-medium">No activity yet</p>
                    <p className="text-xs text-muted-foreground">
                      Ask the AI about a refund to see step-by-step reasoning here
                    </p>
                  </div>
                ) : (
                  <AgentLogs logs={logs} />
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Decision History */}
          <Card className="rounded-2xl overflow-hidden shrink-0" style={{ maxHeight: '220px' }}>
            <CardHeader className="border-b py-3 px-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <History className="h-4 w-4 text-violet-500" />
                Decision History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-36 p-3">
                {decisions.length === 0 ? (
                  <div className="flex items-center justify-center h-20 gap-2 text-muted-foreground">
                    <History className="h-4 w-4 opacity-30" />
                    <p className="text-xs">No decisions yet this session</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {decisions.map((d) => (
                      <div
                        key={d.id}
                        className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-2">
                          {d.approved ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                          )}
                          <span className="font-medium truncate max-w-[100px]">{d.customerName}</span>
                          <span className="text-muted-foreground">{d.orderId}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-medium">${d.amount.toFixed(2)}</span>
                          <Badge
                            variant={d.approved ? 'default' : 'destructive'}
                            className="text-[9px] py-0 px-1.5 h-4"
                          >
                            {d.approved ? 'Approved' : 'Denied'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}