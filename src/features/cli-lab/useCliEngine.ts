import { useCallback, useMemo, useState } from "react";
import type { HistoryEntry, Scenario } from "./types";

function matches(pattern: string | RegExp, input: string): boolean {
  if (typeof pattern === "string") return pattern.toLowerCase() === input.toLowerCase();
  return pattern.test(input);
}

function vendorError(vendor: Scenario["vendor"]): string {
  if (vendor === "cisco") return "% Invalid input detected at '^' marker.";
  if (vendor === "juniper") return "syntax error.";
  return "Command fail. Return code -61";
}

export function useCliEngine(scenario: Scenario) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [mode, setMode] = useState<string>(
    scenario.vendor === "cisco" ? "user" : scenario.vendor === "juniper" ? "operational" : "exec"
  );

  const prompt = useMemo(() => {
    if (scenario.vendor === "cisco") {
      if (mode === "user") return `${scenario.hostname}>`;
      if (mode === "enable") return `${scenario.hostname}#`;
      if (mode === "config") return `${scenario.hostname}(config)#`;
      if (mode === "config-if") return `${scenario.hostname}(config-if)#`;
      return `${scenario.hostname}#`;
    }
    if (scenario.vendor === "juniper") {
      return mode === "configuration" ? `${scenario.hostname}# ` : `${scenario.hostname}> `;
    }
    return `${scenario.hostname} # `;
  }, [scenario, mode]);

  const completed = stepIndex >= scenario.steps.length;

  const run = useCallback(
    (raw: string) => {
      const cmd = raw.trim();
      if (!cmd) return;
      const currentPrompt = prompt;
      const match = scenario.commands.find((c) => matches(c.match, cmd));

      let outputLines: string[];
      if (match) {
        const o = match.output;
        outputLines = Array.isArray(o) ? o : o ? [o] : [];
        if (match.mode) setMode(match.mode);
      } else {
        outputLines = [vendorError(scenario.vendor)];
      }

      // Check step advancement
      const step = scenario.steps[stepIndex];
      let successLine: string | null = null;
      if (step && matches(step.expect, cmd)) {
        successLine = `✓ ${step.success}`;
        setStepIndex((i) => i + 1);
      }

      setHistory((h) => [
        ...h,
        { prompt: currentPrompt, cmd, output: successLine ? [...outputLines, successLine] : outputLines },
      ]);
    },
    [prompt, scenario, stepIndex]
  );

  const reset = useCallback(() => {
    setHistory([]);
    setStepIndex(0);
    setMode(scenario.vendor === "cisco" ? "user" : scenario.vendor === "juniper" ? "operational" : "exec");
  }, [scenario]);

  const clear = useCallback(() => setHistory([]), []);

  return { history, prompt, run, reset, clear, stepIndex, completed };
}
