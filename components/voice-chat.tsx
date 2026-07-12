'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, Bot, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface VoiceMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

const stateConfig: Record<VoiceState, { label: string; color: string; pulse: boolean }> = {
  idle:       { label: 'Tap mic to speak',  color: 'bg-gray-200 dark:bg-gray-700',   pulse: false },
  listening:  { label: 'Listening...',       color: 'bg-red-500',                     pulse: true  },
  processing: { label: 'Processing...',      color: 'bg-yellow-400',                  pulse: true  },
  speaking:   { label: 'Agent speaking...',  color: 'bg-blue-500',                    pulse: true  },
};

export function VoiceChat() {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [transcript, setTranscript] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check browser support
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition || !window.speechSynthesis) {
      setIsSupported(false);
      return;
    }

    synthRef.current = window.speechSynthesis;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setVoiceState('listening');
      setTranscript('');
    };

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += text;
        else interim += text;
      }
      setTranscript(final || interim);
    };

    recognition.onend = () => {
      // If we have a transcript, process it
      setTranscript(prev => {
        if (prev.trim()) {
          handleUserSpeech(prev.trim());
        } else {
          setVoiceState('idle');
        }
        return '';
      });
    };

    recognition.onerror = (event) => {
      if (event.error !== 'no-speech') {
        toast.error(`Microphone error: ${event.error}`);
      }
      setVoiceState('idle');
      setTranscript('');
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
      synthRef.current?.cancel();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const speak = useCallback((text: string) => {
    if (!synthRef.current || isMuted) return;

    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Pick a natural English voice if available
    const voices = synthRef.current.getVoices();
    const preferred = voices.find(v =>
      v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google'))
    ) || voices.find(v => v.lang.startsWith('en'));
    if (preferred) utterance.voice = preferred;

    utterance.onstart = () => setVoiceState('speaking');
    utterance.onend = () => setVoiceState('idle');
    utterance.onerror = () => setVoiceState('idle');

    synthRef.current.speak(utterance);
  }, [isMuted]);

  const handleUserSpeech = useCallback(async (text: string) => {
    setVoiceState('processing');

    const userMsg: VoiceMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });

      if (!res.ok) throw new Error('Request failed');
      const data = await res.json();

      const assistantMsg: VoiceMessage = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMsg]);

      // Speak the response
      speak(data.response);
    } catch {
      toast.error('Failed to process request');
      setVoiceState('idle');
    }
  }, [speak]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (voiceState === 'listening') {
      recognitionRef.current.stop();
      return;
    }

    if (voiceState === 'speaking') {
      synthRef.current?.cancel();
      setVoiceState('idle');
      return;
    }

    if (voiceState === 'idle') {
      try {
        recognitionRef.current.start();
      } catch {
        toast.error('Could not start microphone');
      }
    }
  };

  const toggleMute = () => {
    if (!isMuted === false && voiceState === 'speaking') {
      synthRef.current?.cancel();
      setVoiceState('idle');
    }
    setIsMuted(prev => !prev);
  };

  const clearConversation = () => {
    synthRef.current?.cancel();
    recognitionRef.current?.abort();
    setMessages([]);
    setVoiceState('idle');
    setTranscript('');
    fetch('/api/chat', { method: 'DELETE' }).catch(() => {});
  };

  const config = stateConfig[voiceState];

  if (!isSupported) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        <Bot className="h-10 w-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm">Voice chat requires Chrome or Edge browser.</p>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-[calc(100vh-6rem)]">
      <CardHeader className="border-b py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Voice Support Agent</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {config.label}
            </Badge>
            <Button variant="ghost" size="sm" onClick={toggleMute} className="h-8 w-8 p-0">
              {isMuted
                ? <VolumeX className="h-4 w-4 text-muted-foreground" />
                : <Volume2 className="h-4 w-4 text-primary" />
              }
            </Button>
            <Button variant="ghost" size="sm" onClick={clearConversation} className="h-8 w-8 p-0">
              <X className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm gap-2">
              <Bot className="h-8 w-8 opacity-30" />
              <p>Tap the mic and speak your refund request</p>
            </div>
          )}
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-muted rounded-bl-sm'
                  }`}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Live transcript */}
        <AnimatePresence>
          {transcript && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 py-2 border-t bg-muted/50 text-sm text-muted-foreground italic"
            >
              "{transcript}"
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mic button */}
        <div className="border-t p-6 flex flex-col items-center gap-3">
          <button
            onClick={toggleListening}
            disabled={voiceState === 'processing'}
            className={`relative h-20 w-20 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg
              ${voiceState === 'processing'
                ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
                : 'hover:scale-105 active:scale-95 cursor-pointer'
              }
              ${voiceState === 'listening' ? 'bg-red-500' : ''}
              ${voiceState === 'speaking'  ? 'bg-blue-500' : ''}
              ${voiceState === 'idle'      ? 'bg-primary' : ''}
            `}
          >
            {/* Pulse ring */}
            {config.pulse && (
              <span className={`absolute inset-0 rounded-full ${config.color} animate-ping opacity-30`} />
            )}
            {voiceState === 'listening'
              ? <MicOff className="h-8 w-8 text-white" />
              : voiceState === 'speaking'
              ? <Volume2 className="h-8 w-8 text-white" />
              : <Mic className="h-8 w-8 text-white" />
            }
          </button>
          <p className="text-xs text-muted-foreground">
            {voiceState === 'listening' && 'Tap to stop'}
            {voiceState === 'speaking'  && 'Tap to interrupt'}
            {voiceState === 'idle'      && 'Tap to speak'}
            {voiceState === 'processing' && 'Please wait...'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}