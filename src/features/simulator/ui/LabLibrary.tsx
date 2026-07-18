import { Lock, PlayCircle, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { labs, type LabDef } from "../labs";
import { cn } from "@/lib/utils";

interface Props {
  currentLabId: string | null;
  unlocked: boolean;
  onLoad: (lab: LabDef) => void;
}

export function LabLibrary({ currentLabId, unlocked, onLoad }: Props) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold">Lab library</p>
        {!unlocked && (
          <Badge variant="outline" className="text-[10px]">Free preview</Badge>
        )}
      </div>
      <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
        {labs.map((lab) => {
          const locked = lab.locked && !unlocked;
          const active = lab.id === currentLabId;
          return (
            <button
              key={lab.id}
              onClick={() => { if (!locked) onLoad(lab); }}
              className={cn(
                "w-full text-left rounded-md border p-2 text-xs transition-colors",
                active ? "border-primary bg-accent/40" : "border-border/60 hover:border-primary/40 hover:bg-accent/30",
                locked && "opacity-70 cursor-not-allowed",
              )}
              disabled={locked}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-sm">{lab.title}</span>
                {locked ? <Lock className="h-3.5 w-3.5 text-muted-foreground" /> : <PlayCircle className="h-3.5 w-3.5 text-primary" />}
              </div>
              <p className="mt-1 text-muted-foreground line-clamp-2">{lab.goal}</p>
            </button>
          );
        })}
      </div>
      {!unlocked && (
        <div className="mt-3 rounded-md border border-primary/30 bg-primary/5 p-2.5 space-y-1.5">
          <p className="text-xs font-semibold">Unlock the full lab library</p>
          <p className="text-[11px] text-muted-foreground">10+ scenarios including OSPF, inter-VLAN routing, ACLs, NAT, and DHCP relay.</p>
          <Button asChild size="sm" variant="forge" className="w-full">
            <Link to="/products/cisco-network-simulator"><ShoppingCart className="h-3.5 w-3.5" /> View plans</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
