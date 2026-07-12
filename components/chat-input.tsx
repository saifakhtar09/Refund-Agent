'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ChatInputProps {
  onSend: (message: string) => void;
  onMicClick?: () => void;
  isLoading: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  onMicClick,
  isLoading,
  placeholder,
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
    }
  }, [message]);

  const handleSubmit = () => {
    if (!message.trim() || isLoading) return;
    onSend(message.trim());
    setMessage('');
  };

  return (
    <div className="flex items-end gap-2">
      
      {/* TEXT AREA */}
      <Textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={placeholder || 'Type your message...'}
        className="min-h-[44px] max-h-[120px] resize-none rounded-xl"
        disabled={isLoading}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
          }
        }}
      />

      {/* MIC BUTTON (INLINE) */}
      <Button
        type="button"
        onClick={onMicClick}
        size="icon"
        className="h-11 w-11 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 text-white"
      >
        <Mic className="h-4 w-4" />
      </Button>

      {/* SEND BUTTON */}
      <Button
        onClick={handleSubmit}
        size="icon"
        className="h-11 w-11 rounded-xl"
        disabled={!message.trim() || isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}