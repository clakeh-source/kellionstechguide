export type Vendor = "cisco" | "juniper" | "fortinet";

export interface CliCommand {
  match: string | RegExp;
  output: string | string[];
  /** Optional mode change: applies to Cisco/Junos prompt tracking */
  mode?: "user" | "enable" | "config" | "config-if" | "operational" | "configuration";
}

export interface Step {
  instruction: string;
  expect: string | RegExp;
  success: string;
  hint?: string;
  /** Canonical example command shown by the AI coach when the user gets stuck. */
  example: string;
  /** Optional per-step diagnosis rules: if the typed command matches `when`, show `reason`. */
  diagnose?: { when: RegExp; reason: string }[];
}

export interface CoachHint {
  reason: string;
  suggestion: string;
  example: string;
}

export interface Scenario {
  id: string;
  vendor: Vendor;
  title: string;
  intro: string;
  hostname: string;
  steps: Step[];
  commands: CliCommand[];
}

export interface HistoryEntry {
  prompt: string;
  cmd: string;
  output: string[];
}
