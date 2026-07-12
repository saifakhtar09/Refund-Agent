'use client';

import { AgentLog } from '@/types';
import { cn } from '@/lib/utils';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  Settings,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';

interface AgentLogItemProps {
  log: AgentLog;
}

export function AgentLogItem({ log }: AgentLogItemProps) {
  const getIcon = () => {
    switch (log.type) {
      case 'tool_call':
        return <Settings className="h-4 w-4 text-blue-500" />;
      case 'reasoning':
        return <ArrowRight className="h-4 w-4 text-amber-500" />;
      case 'decision':
        return log.message.includes('APPROVED') ? (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        ) : (
          <XCircle className="h-4 w-4 text-red-500" />
        );
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'info':
      default:
        return <Info className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getBackgroundColor = () => {
    switch (log.type) {
      case 'tool_call':
        return 'bg-blue-500/10 border-blue-500/20';
      case 'reasoning':
        return 'bg-amber-500/10 border-amber-500/20';
      case 'decision':
        return log.message.includes('APPROVED')
          ? 'bg-green-500/10 border-green-500/20'
          : 'bg-red-500/10 border-red-500/20';
      case 'error':
        return 'bg-red-500/10 border-red-500/20';
      default:
        return 'bg-muted/50 border-border';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'flex gap-3 p-3 rounded-lg border',
        getBackgroundColor()
      )}
    >
      <div className="mt-0.5 shrink-0">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium">{log.message}</div>
        {log.details && Object.keys(log.details).length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {Object.entries(log.details).map(([key, value]) => (
              <span
                key={key}
                className="inline-flex items-center text-xs bg-background/50 px-2 py-0.5 rounded"
              >
                <span className="text-muted-foreground mr-1">{key}:</span>
                <span className="font-mono truncate max-w-[150px]">
                  {String(value)}
                </span>
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="shrink-0 text-xs text-muted-foreground">
        {new Date(log.timestamp).toLocaleTimeString()}
      </div>
    </motion.div>
  );
}

interface AgentLogsProps {
  logs: AgentLog[];
  className?: string;
}

export function AgentLogs({ logs, className }: AgentLogsProps) {
  if (logs.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center h-full text-muted-foreground p-8', className)}>
        <Settings className="h-12 w-12 mb-3 opacity-20" />
        <p className="text-center text-sm">
          Agent reasoning logs will appear here as the AI processes refund requests.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {logs.map((log) => (
        <AgentLogItem key={log.id} log={log} />
      ))}
    </div>
  );
}
