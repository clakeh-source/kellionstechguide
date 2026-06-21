import { useState } from "react";
import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { scenarios } from "@/features/cli-lab/scenarios";
import { useCliEngine } from "@/features/cli-lab/useCliEngine";
import { CliTerminal } from "@/features/cli-lab/CliTerminal";
import { ScenarioPanel } from "@/features/cli-lab/ScenarioPanel";
import type { Vendor } from "@/features/cli-lab/types";

function LabPane({ vendor }: { vendor: Vendor }) {
  const scenario = scenarios[vendor];
  const engine = useCliEngine(scenario);
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
      <ScenarioPanel scenario={scenario} stepIndex={engine.stepIndex} completed={engine.completed} />
      <CliTerminal
        prompt={engine.prompt}
        history={engine.history}
        onRun={engine.run}
        onClear={engine.clear}
        onReset={engine.reset}
      />
    </div>
  );
}

export default function LabsVirtual() {
  const [tab, setTab] = useState<Vendor>("cisco");
  return (
    <>
      <SEO
        title="Virtual CLI labs — CertForge"
        description="Browser-based Cisco IOS, Juniper Junos, and Fortinet FortiGate troubleshooting labs with step-by-step guided commands."
      />
      <section className="container py-12">
        <header className="max-w-2xl mb-8 space-y-3">
          <Badge variant="outline">Virtual labs</Badge>
          <h1 className="text-4xl font-display font-bold tracking-tight">Guided CLI troubleshooting</h1>
          <p className="text-muted-foreground">
            Pick a vendor, follow the guided steps, and run real-world commands in a sandboxed terminal. The checklist advances automatically as you complete each step.
          </p>
        </header>

        <Tabs value={tab} onValueChange={(v) => setTab(v as Vendor)}>
          <TabsList>
            <TabsTrigger value="cisco">Cisco IOS</TabsTrigger>
            <TabsTrigger value="juniper">Juniper Junos</TabsTrigger>
            <TabsTrigger value="fortinet">Fortinet FortiGate</TabsTrigger>
          </TabsList>
          {(["cisco", "juniper", "fortinet"] as Vendor[]).map((v) => (
            <TabsContent key={v} value={v}>
              {tab === v && <LabPane vendor={v} />}
            </TabsContent>
          ))}
        </Tabs>

        <p className="mt-6 text-xs text-muted-foreground">
          Sandboxed emulator. Commands are matched against a guided script — this is not a live device. Vendor syntax is kept separate per scenario.
        </p>
      </section>
    </>
  );
}
