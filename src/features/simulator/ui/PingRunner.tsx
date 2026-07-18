import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play } from "lucide-react";
import type { Topology } from "../types";

interface Props {
  topology: Topology;
  lastMsg: string | null;
  lastOk: boolean | null;
  onRun: (fromId: string, toIp: string) => void;
  onClear: () => void;
  defaultFromName?: string;
  defaultToIp?: string;
}

export function PingRunner({ topology, lastMsg, lastOk, onRun, defaultFromName, defaultToIp }: Props) {
  const pcs = Object.values(topology.devices).filter((d) => d.kind === "pc");
  const defaultFrom = pcs.find((p) => p.name === defaultFromName)?.id ?? pcs[0]?.id ?? "";
  const [fromId, setFromId] = useState(defaultFrom);
  const [toIp, setToIp] = useState(defaultToIp ?? "");

  return (
    <div className="rounded-lg border border-border bg-card p-3 space-y-3">
      <div className="flex items-center gap-2">
        <Play className="h-4 w-4 text-primary" />
        <p className="font-semibold text-sm">Run ping</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-[11px]">From</Label>
          <select
            value={fromId}
            onChange={(e) => setFromId(e.target.value)}
            className="w-full mt-1 h-9 rounded-md border border-input bg-background px-2 text-sm"
          >
            {pcs.length === 0 && <option value="">— Add a PC first —</option>}
            {pcs.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <Label className="text-[11px]">To IP</Label>
          <Input value={toIp} onChange={(e) => setToIp(e.target.value)} placeholder="192.168.2.10" className="mt-1 h-9 text-sm font-mono" />
        </div>
      </div>
      <Button
        variant="forge" size="sm" className="w-full"
        disabled={!fromId || !toIp}
        onClick={() => onRun(fromId, toIp)}
      >
        Ping
      </Button>
      {lastMsg && (
        <div className={`text-xs rounded-md border p-2 font-mono ${lastOk ? "border-success/40 bg-success/10 text-success" : "border-destructive/40 bg-destructive/10 text-destructive"}`}>
          {lastMsg}
        </div>
      )}
    </div>
  );
}
