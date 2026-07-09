import { useCallback, useMemo, useState } from "react";
import type { CoachHint, HistoryEntry, Scenario, Step } from "./types";

function matches(pattern: string | RegExp, input: string): boolean {
  if (typeof pattern === "string") return pattern.toLowerCase() === input.toLowerCase();
  return pattern.test(input);
}

function vendorError(vendor: Scenario["vendor"]): string {
  if (vendor === "cisco") return "% Invalid input detected at '^' marker.";
  if (vendor === "juniper") return "syntax error.";
  return "Command fail. Return code -61";
}

function buildHint(
  scenario: Scenario,
  step: Step | undefined,
  cmd: string,
  recognized: boolean,
): CoachHint | null {
  if (!step) return null;

  // Rule 1: per-step diagnose patterns
  const diag = step.diagnose?.find((d) => d.when.test(cmd));
  if (diag) {
    return {
      reason: diag.reason,
      suggestion: `Try the expected command for this step:`,
      example: step.example,
    };
  }

  // Rule 2: command wasn't recognized at all
  if (!recognized) {
    return {
      reason: `That command isn't valid ${labelFor(scenario.vendor)} syntax in this context.`,
      suggestion: `The current step wants you to ${lowerFirst(step.instruction)}`,
      example: step.example,
    };
  }

  // Rule 3: recognized but not the step we're on
  return {
    reason: `That's a real command, but it doesn't complete the current step.`,
    suggestion: `Focus on the step: ${lowerFirst(step.instruction)}`,
    example: step.example,
  };
}

function labelFor(v: Scenario["vendor"]) {
  return v === "cisco" ? "Cisco IOS" : v === "juniper" ? "Junos" : "FortiOS";
}
function lowerFirst(s: string) {
  return s.charAt(0).toLowerCase() + s.slice(1).replace(/\.$/, "");
}

export function useCliEngine(scenario: Scenario) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [hint, setHint] = useState<CoachHint | null>(null);
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

      const step = scenario.steps[stepIndex];
      const advances = !!step && matches(step.expect, cmd);

      let successLine: string | null = null;
      if (advances) {
        successLine = `✓ ${step!.success}`;
        setStepIndex((i) => i + 1);
        setHint(null);
      } else if (!completed) {
        setHint(buildHint(scenario, step, cmd, !!match));
      }

      setHistory((h) => [
        ...h,
        { prompt: currentPrompt, cmd, output: successLine ? [...outputLines, successLine] : outputLines },
      ]);
    },
    [prompt, scenario, stepIndex, completed]
  );

  const reset = useCallback(() => {
    setHistory([]);
    setStepIndex(0);
    setHint(null);
    setMode(scenario.vendor === "cisco" ? "user" : scenario.vendor === "juniper" ? "operational" : "exec");
  }, [scenario]);

  const clear = useCallback(() => setHistory([]), []);
  const dismissHint = useCallback(() => setHint(null), []);

  return { history, prompt, run, reset, clear, stepIndex, completed, hint, dismissHint };
}
