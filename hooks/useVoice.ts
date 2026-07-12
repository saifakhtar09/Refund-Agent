"use client";
import { useState, useRef, useCallback, useEffect } from "react";

export type VoiceState = "idle" | "recording" | "processing" | "error";

interface UseVoiceReturn {
  state: VoiceState;
  transcript: string;
  error: string | null;
  isSupported: boolean;
  startRecording: () => void;
  stopRecording: () => void;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}
interface ISpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

export function useVoice(onTranscript: (text: string) => void): UseVoiceReturn {
  const [state, setState]           = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState("");
  const [error, setError]           = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false); // ← starts false (SSR-safe)
  const recognitionRef              = useRef<ISpeechRecognition | null>(null);

  // Detect support only on the client, after mount
  useEffect(() => {
    setIsSupported(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
    );
  }, []);

  const startRecording = useCallback(() => {
    if (!isSupported) {
      setError("Voice not supported — use Chrome or Edge.");
      setState("error");
      return;
    }
    setError(null);
    setTranscript("");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition: ISpeechRecognition = new SR();
    recognition.lang            = "en-US";
    recognition.interimResults  = true;
    recognition.continuous      = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setState("recording");

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      let interim = "";
      let final   = "";
      for (let i = e.results.length - 1; i >= 0; i--) {
        if (e.results[i].isFinal) { final = e.results[i][0].transcript; break; }
        else interim = e.results[i][0].transcript;
      }
      setTranscript(final || interim);
      if (final) {
        setState("processing");
        onTranscript(final.trim());
        setTimeout(() => { setState("idle"); setTranscript(""); }, 300);
      }
    };

    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
      if (e.error === "aborted" || e.error === "no-speech") { setState("idle"); return; }
      const msgs: Record<string, string> = {
        "not-allowed": "Microphone blocked — allow access in browser settings.",
        "network":     "Network error during speech recognition.",
      };
      setError(msgs[e.error] ?? `Speech error: ${e.error}`);
      setState("error");
    };

    recognition.onend = () => {
      setState((prev) => (prev === "recording" ? "idle" : prev));
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isSupported, onTranscript]);

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop();
    setState("idle");
    setTranscript("");
  }, []);

  return { state, transcript, error, isSupported, startRecording, stopRecording };
}