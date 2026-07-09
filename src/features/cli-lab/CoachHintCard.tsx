import { Sparkles, X, CornerDownLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CoachHint } from "./types";

interface Props {
  hint: CoachHint;
  onDismiss: () => void;
  onInsert: (cmd: string) => void;
}

export function CoachHintCard({ hint, onDismiss, onInsert }: Props) {
  return (
    <div className="mx-3 my-2 rounded-md border border-primary/30 bg-primary/5 text-slate-100 p-3 text-[13px] font-sans">
      <div className="flex items-start gap-2">
        <div className="mt-0.5 rounded-md bg-primary/20 p-1">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-primary">AI Coach</p>
            <button
              onClick={onDismiss}
              aria-label="Dismiss hint"
              className="text-slate-400 hover:text-slate-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="mt-1 text-slate-200">{hint.reason}</p>
          <p className="mt-1 text-slate-300">{hint.suggestion}</p>
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <code className="rounded bg-slate-900 border border-slate-700 px-2 py-1 font-mono text-amber-300">
              {hint.example}
            </code>
            <Button
              size="sm"
              variant="secondary"
              className="h-7"
              onClick={() => onInsert(hint.example)}
            >
              <CornerDownLeft className="h-3.5 w-3.5" /> Insert
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
