# Virtual CLI Lab Engine + Vendor Nav

## 1. TopNav: add vendor links

In `src/components/layout/TopNav.tsx`, add three top-level NavLinks between the Tracks dropdown and the existing primary links:

- **Cisco** → `/tracks/cisco-ccna`
- **Juniper** → `/tracks/juniper-jncia`
- **Fortinet** → `/tracks/fortinet-fca`

Mirror them in the mobile Sheet menu under a "Vendors" group. Style matches existing NavLink (muted → foreground when active).

## 2. Virtual CLI engine

New folder `src/features/cli-lab/` with:

- **`types.ts`** — `CliCommand { match: string | RegExp; output: string | string[]; hint?: string }`, `Scenario { id; vendor: "cisco"|"juniper"|"fortinet"; title; prompt; intro; steps: Step[]; commands: CliCommand[] }`, `Step { instruction; expect: string | RegExp; success: string; hint?: string }`.
- **`scenarios.ts`** — 3 curated scenarios (one per vendor), each ~5 guided steps:
  - *Cisco IOS — Troubleshoot an interface down*: `enable`, `show ip interface brief`, `show interfaces gi0/1`, `configure terminal` → `interface gi0/1` → `no shutdown`, `show interfaces gi0/1` (verify up/up).
  - *Juniper Junos — Commit & rollback an OSPF change*: `cli`, `configure`, `set protocols ospf area 0 interface ge-0/0/0`, `show | compare`, `commit check`, `commit`, `rollback 1` + `commit`.
  - *Fortinet FortiGate — Diagnose a failing firewall policy*: `get system status`, `show firewall policy 10`, `diagnose debug flow filter saddr 10.0.0.5`, `diagnose debug flow show console enable`, `diagnose debug enable`, `diagnose debug flow trace start 5`, `diagnose debug disable`.
  - Realistic vendor-accurate output strings; no mixing of vendor syntax.
- **`useCliEngine.ts`** — hook holding history `{prompt, cmd, output}[]`, current step index, completion state. `run(cmd)`:
  1. Find matching `CliCommand` (case-insensitive, trimmed) → push output. Unknown command → vendor-appropriate error (`% Invalid input detected at '^' marker.` / `unknown command.` / `Command fail. Return code -61`).
  2. If current step's `expect` matches the typed command, advance step + show `success` toast line.
  3. Update prompt based on mode for Cisco (`R1>` → `R1#` → `R1(config)#` → `R1(config-if)#`) and Junos (`user@R1>` → `user@R1#`).
- **`CliTerminal.tsx`** — terminal UI: scrollable monospace pane (JetBrains Mono, dark slate bg, green prompt, gold for typed cmd), input bound to engine, command history (↑/↓), Tab no-op, Enter submits, autoscroll, Clear button, Reset scenario button. Sandboxed — no DOM/global access; pure string matching only.
- **`ScenarioPanel.tsx`** — left side: scenario intro, ordered checklist of steps with current step highlighted, optional Hint button revealing `hint`, completion banner when all steps done.

## 3. Rewrite `src/pages/LabsVirtual.tsx`

Replace the placeholder cards with:

- SEO title/description for virtual CLI labs.
- Header (badge + h1 + intro).
- `Tabs` (Cisco / Juniper / Fortinet) — selecting a tab loads that vendor's scenario.
- Two-column layout (lg): left `ScenarioPanel`, right `CliTerminal`. Stacks on mobile.
- Footer note: "Sandboxed emulator. Commands are matched against a guided script — this is not a live device."

## 4. Constraints honored

- No DOM / global access from user input; engine only does string/regex matching on a static command table.
- Vendor commands kept strictly separate per scenario file.
- No simulated network telemetry — only canned CLI output tied to guided steps (acceptable per the Strict Data Rule, which targets Atlas/NetMonitor).

## 5. Files touched

Create: `src/features/cli-lab/{types.ts,scenarios.ts,useCliEngine.ts,CliTerminal.tsx,ScenarioPanel.tsx}`
Edit: `src/components/layout/TopNav.tsx`, `src/pages/LabsVirtual.tsx`

## 6. Verification

- Build green.
- Manual: open `/labs/virtual`, switch tabs, run each scenario's happy-path commands, confirm prompt changes, step checklist advances, completion banner appears, unknown command shows vendor error.
- TopNav shows Cisco/Juniper/Fortinet on desktop + mobile; links route to the correct track pages.

Let me know if you want deeper detail on any step or extra scenarios per vendor.
