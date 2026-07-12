"use client";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { VoiceState } from "@/hooks/useVoice";
import { cn } from "@/lib/utils";

interface Props {
  state: VoiceState;
  isSupported: boolean;
  transcript: string;
  onStart: () => void;
  onStop: () => void;
}

export default function VoiceButton({
  state,
  isSupported,
  transcript,
  onStart,
  onStop,
}: Props) {
  const isRecording  = state === "recording";
  const isProcessing = state === "processing";

  const handleClick = () => {
    if (!isSupported) return;
    if (isRecording) onStop();
    else onStart();
  };

  return (
    <div className="relative flex items-center">
      {/* Live transcript bubble */}
      {isRecording && transcript && (
        <div className="absolute bottom-full right-0 mb-2 max-w-[220px] bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs px-3 py-1.5 rounded-xl rounded-br-sm shadow-lg whitespace-nowrap overflow-hidden text-ellipsis z-10">
          {transcript}
          <span className="inline-block w-1.5 h-3.5 bg-red-400 ml-0.5 animate-pulse rounded-sm" />
        </div>
      )}

      {/* Waveform bars — visible only when recording */}
      {isRecording && (
        <div className="absolute inset-0 flex items-center justify-center gap-[2px] pointer-events-none rounded-lg overflow-hidden">
          {[0.4, 0.7, 1, 0.6, 0.8, 0.5, 0.9].map((delay, i) => (
            <span
              key={i}
              className="wave-bar w-[2px] h-4 bg-red-400 rounded-full origin-center"
              style={{ animationDelay: `${delay * 0.3}s` }}
            />
          ))}
        </div>
      )}

      <button
        onClick={handleClick}
        disabled={!isSupported || isProcessing}
        title={
          !isSupported
            ? "Voice not supported (use Chrome)"
            : isRecording
            ? "Click to stop recording"
            : isProcessing
            ? "Processing..."
            : "Click to speak"
        }
        className={cn(
          "relative w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 overflow-hidden",
          !isSupported &&
            "opacity-30 cursor-not-allowed bg-slate-200 dark:bg-slate-700",
          state === "idle" &&
            "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400",
          isRecording &&
            "bg-red-500 text-white shadow-md shadow-red-200 dark:shadow-red-900/50",
          isProcessing &&
            "bg-amber-100 dark:bg-amber-950/60 text-amber-600 cursor-not-allowed",
          state === "error" && "bg-slate-200 dark:bg-slate-700 text-slate-400"
        )}
      >
        {isProcessing ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : isRecording ? (
          <MicOff className="w-3.5 h-3.5 relative z-10" />
        ) : (
          <Mic className="w-3.5 h-3.5" />
        )}

        {/* Pulse ring when recording */}
        {isRecording && (
          <span className="absolute inset-0 rounded-lg bg-red-400 opacity-40 animate-ping" />
        )}
      </button>

      {/* Error tooltip */}
      {state === "error" && (
        <div className="absolute bottom-full right-0 mb-2 w-52 bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-[10px] px-2.5 py-1.5 rounded-lg shadow-lg leading-relaxed z-10">
          Voice not available in this browser. Use Chrome for voice input.
        </div>
      )}
    </div>
  );
}