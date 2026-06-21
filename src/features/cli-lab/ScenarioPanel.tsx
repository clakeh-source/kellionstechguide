import { useState } from "react";
import { Check, Circle, Lightbulb, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Scenario } from "./types";

interface Props {
  scenario: Scenario;
  stepIndex: number;
  completed: boolean;
}

export function ScenarioPanel({ scenario, stepIndex, completed }: Props) {
  const [showHint, setShowHint] = useState(false);
  const current = scenario.steps[stepIndex];

  return (
    <div className="rounded-lg border border-border bg-card p-5 space-y-4 h-[520px] overflow-y-auto">
      <div className="space-y-2">
        <Badge variant="outline" className="capitalize">{scenario.vendor}</Badge>
        <h2 className="font-display text-xl font-semibold">{scenario.title}</h2>
        <p className="text-sm text-muted-foreground">{scenario.intro}</p>
      </div>

      {completed ? (
        <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 p-4 flex items-start gap-3">
          <Trophy className="h-5 w-5 text-emerald-600 mt-0.5" />
          <div>
            <p className="font-medium text-emerald-700 dark:text-emerald-300">Scenario complete</p>
            <p className="text-sm text-muted-foreground">Reset to try again, or switch vendors above.</p>
          </div>
        </div>
      ) : (
        <div className="rounded-md bg-muted/50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Current step</p>
          <p className="text-sm mt-1">{current?.instruction}</p>
          {current?.hint && (
            <div className="mt-2">
              <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setShowHint((v) => !v)}>
                <Lightbulb className="h-3.5 w-3.5" /> {showHint ? "Hide hint" : "Show hint"}
              </Button>
              {showHint && <p className="text-xs text-muted-foreground mt-1">{current.hint}</p>}
            </div>
          )}
        </div>
      )}

      <ol className="space-y-2">
        {scenario.steps.map((s, i) => {
          const done = i < stepIndex;
          const active = i === stepIndex && !completed;
          return (
            <li key={i} className={`flex items-start gap-2 text-sm ${active ? "text-foreground font-medium" : done ? "text-muted-foreground line-through" : "text-muted-foreground"}`}>
              {done ? (
                <Check className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
              ) : (
                <Circle className={`h-4 w-4 mt-0.5 shrink-0 ${active ? "text-primary" : ""}`} />
              )}
              <span>{s.instruction}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
