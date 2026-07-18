import { Router, Server, Cable, MonitorSmartphone, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DeviceKind } from "../types";

interface Props {
  onAdd: (kind: DeviceKind) => void;
  cableMode: boolean;
  onToggleCable: () => void;
}

const items: { kind: DeviceKind; label: string; icon: typeof Router; color: string }[] = [
  { kind: "router", label: "Router", icon: Router, color: "text-amber-600" },
  { kind: "switchL2", label: "L2 Switch", icon: Server, color: "text-sky-600" },
  { kind: "switchL3", label: "L3 Switch", icon: Layers, color: "text-indigo-600" },
  { kind: "pc", label: "PC", icon: MonitorSmartphone, color: "text-emerald-600" },
];

export function Toolbox({ onAdd, cableMode, onToggleCable }: Props) {
  return (
    <aside className="w-52 shrink-0 rounded-lg border border-border bg-card p-3 space-y-1.5">
      <p className="px-1 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Devices</p>
      {items.map((it) => (
        <button
          key={it.kind}
          onClick={() => onAdd(it.kind)}
          className="w-full flex items-center gap-2 rounded-md border border-border/60 bg-background px-2.5 py-2 text-sm font-medium hover:border-primary/60 hover:bg-accent transition-colors"
        >
          <it.icon className={cn("h-4 w-4", it.color)} /> {it.label}
        </button>
      ))}
      <div className="h-px bg-border my-2" />
      <Button
        variant={cableMode ? "forge" : "outline"}
        size="sm"
        className="w-full"
        onClick={onToggleCable}
      >
        <Cable className="h-4 w-4" /> {cableMode ? "Cabling…" : "Patch cable"}
      </Button>
      <p className="text-[11px] text-muted-foreground px-1 pt-1">
        Cable mode: click a port on one device, then a port on another to patch them.
      </p>
    </aside>
  );
}
