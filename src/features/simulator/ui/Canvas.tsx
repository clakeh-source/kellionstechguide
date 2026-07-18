import { useEffect, useRef, useState } from "react";
import type { Device, Link, PathHop, Topology } from "../types";
import { Router as RouterIcon, Server, MonitorSmartphone, Layers, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  topology: Topology;
  selectedDeviceId: string | null;
  onSelectDevice: (id: string | null) => void;
  onMoveDevice: (id: string, x: number, y: number) => void;
  onRemoveDevice: (id: string) => void;
  onOpenCli: (id: string) => void;
  cableMode: boolean;
  cablePending: { deviceId: string; portId: string } | null;
  onPortClick: (deviceId: string, portId: string) => void;
  onRemoveLink: (id: string) => void;
  animatedPath?: PathHop[] | null;
  animationOk?: boolean | null;
}

const DEVICE_WIDTH = 132;
const DEVICE_HEIGHT = 84;

const deviceIcon = (kind: Device["kind"]) => {
  if (kind === "router") return RouterIcon;
  if (kind === "switchL2") return Server;
  if (kind === "switchL3") return Layers;
  return MonitorSmartphone;
};
const deviceColor = (kind: Device["kind"]) => {
  if (kind === "router") return "border-amber-400 bg-amber-50";
  if (kind === "switchL2") return "border-sky-400 bg-sky-50";
  if (kind === "switchL3") return "border-indigo-400 bg-indigo-50";
  return "border-emerald-400 bg-emerald-50";
};

function centerOfDevice(d: Device) { return { x: d.x + DEVICE_WIDTH / 2, y: d.y + DEVICE_HEIGHT / 2 }; }

export function Canvas(props: Props) {
  const { topology, selectedDeviceId, onSelectDevice, onMoveDevice, onRemoveDevice, onOpenCli, cableMode, cablePending, onPortClick, onRemoveLink, animatedPath, animationOk } = props;
  const canvasRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const [animStep, setAnimStep] = useState<number>(-1);

  // Animate ping path: step by step
  useEffect(() => {
    if (!animatedPath || animatedPath.length === 0) { setAnimStep(-1); return; }
    setAnimStep(0);
    let i = 0;
    const t = setInterval(() => {
      i++;
      if (i >= animatedPath.length) { clearInterval(t); return; }
      setAnimStep(i);
    }, 500);
    return () => clearInterval(t);
  }, [animatedPath]);

  useEffect(() => {
    if (!drag) return;
    const onMove = (e: MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect(); if (!rect) return;
      const x = Math.max(0, Math.min(rect.width - DEVICE_WIDTH, e.clientX - rect.left - drag.offsetX));
      const y = Math.max(0, Math.min(rect.height - DEVICE_HEIGHT, e.clientY - rect.top - drag.offsetY));
      onMoveDevice(drag.id, x, y);
    };
    const onUp = () => setDrag(null);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [drag, onMoveDevice]);

  const linkHighlightSet = new Set<string>();
  if (animatedPath && animStep >= 0) {
    for (let i = 0; i < Math.min(animStep, animatedPath.length - 1); i++) {
      const from = animatedPath[i];
      const to = animatedPath[i + 1];
      if (!from.egressPortId || !to.ingressPortId) continue;
      for (const l of Object.values(topology.links)) {
        if ((l.aDeviceId === from.deviceId && l.aPortId === from.egressPortId && l.bDeviceId === to.deviceId && l.bPortId === to.ingressPortId) ||
            (l.bDeviceId === from.deviceId && l.bPortId === from.egressPortId && l.aDeviceId === to.deviceId && l.aPortId === to.ingressPortId)) {
          linkHighlightSet.add(l.id);
        }
      }
    }
  }

  const renderLink = (l: Link) => {
    const a = topology.devices[l.aDeviceId]; const b = topology.devices[l.bDeviceId];
    if (!a || !b) return null;
    const p1 = centerOfDevice(a); const p2 = centerOfDevice(b);
    const highlighted = linkHighlightSet.has(l.id);
    const success = animationOk === true;
    const stroke = highlighted ? (success ? "hsl(142 71% 45%)" : "hsl(0 84% 60%)") : "hsl(220 15% 60%)";
    return (
      <g key={l.id}>
        <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={stroke} strokeWidth={highlighted ? 3 : 1.5} strokeDasharray={highlighted ? "0" : "0"} />
        <text
          x={(p1.x + p2.x) / 2} y={(p1.y + p2.y) / 2 - 6}
          fontSize={9} fill="hsl(220 10% 45%)" textAnchor="middle"
          className="pointer-events-none select-none"
        >
          {l.aPortId} ↔ {l.bPortId}
        </text>
        <circle cx={(p1.x + p2.x) / 2} cy={(p1.y + p2.y) / 2 + 6} r={8}
          className="cursor-pointer" fill="white" stroke="hsl(220 15% 70%)"
          onClick={() => onRemoveLink(l.id)}
        />
        <text x={(p1.x + p2.x) / 2} y={(p1.y + p2.y) / 2 + 9} fontSize={10} textAnchor="middle" className="pointer-events-none select-none" fill="hsl(0 70% 50%)">×</text>
      </g>
    );
  };

  return (
    <div
      ref={canvasRef}
      className="relative flex-1 rounded-lg border border-dashed border-border bg-[radial-gradient(circle_at_1px_1px,hsl(220_15%_88%)_1px,transparent_0)] [background-size:16px_16px] min-h-[520px] overflow-hidden"
      onClick={(e) => { if (e.target === e.currentTarget) onSelectDevice(null); }}
    >
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <g className="pointer-events-auto">
          {Object.values(topology.links).map(renderLink)}
        </g>
      </svg>

      {topology.order.map((id) => {
        const d = topology.devices[id]; if (!d) return null;
        const Icon = deviceIcon(d.kind);
        const isSelected = selectedDeviceId === d.id;
        const isPending = cablePending?.deviceId === d.id;
        const isAnimated = animatedPath && animStep >= 0 && animatedPath.slice(0, animStep + 1).some((h) => h.deviceId === d.id);
        return (
          <div
            key={id}
            className={cn(
              "absolute rounded-lg border-2 shadow-sm select-none",
              deviceColor(d.kind),
              isSelected && "ring-2 ring-primary",
              isAnimated && "ring-2 ring-emerald-500",
              isPending && "ring-2 ring-amber-500",
            )}
            style={{ left: d.x, top: d.y, width: DEVICE_WIDTH, height: DEVICE_HEIGHT }}
            onMouseDown={(e) => {
              if (cableMode) return;
              const rect = canvasRef.current!.getBoundingClientRect();
              setDrag({ id, offsetX: e.clientX - rect.left - d.x, offsetY: e.clientY - rect.top - d.y });
              onSelectDevice(id);
            }}
            onDoubleClick={() => onOpenCli(id)}
          >
            <div className="flex items-center justify-between px-2 pt-1">
              <span className="text-[11px] font-mono font-semibold text-foreground/80">{d.name}</span>
              <button
                className="text-muted-foreground hover:text-destructive"
                onClick={(e) => { e.stopPropagation(); onRemoveDevice(d.id); }}
                aria-label="Remove device"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            <div className="flex items-center justify-center py-1">
              <Icon className="h-6 w-6 opacity-80" />
            </div>
            <div className="flex flex-wrap justify-center gap-0.5 px-1">
              {d.ports.slice(0, 4).map((p) => {
                const isPortPending = cablePending?.deviceId === d.id && cablePending.portId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={(e) => { e.stopPropagation(); if (cableMode) onPortClick(d.id, p.id); else onOpenCli(d.id); }}
                    className={cn(
                      "text-[8px] font-mono rounded border px-1 leading-tight",
                      isPortPending ? "bg-amber-400 text-white border-amber-500" :
                        cableMode ? "bg-white border-primary/50 hover:bg-primary/10 cursor-crosshair" :
                        "bg-white/60 border-border/60"
                    )}
                    title={cableMode ? "Click to patch this port" : "Double-click device to open CLI"}
                  >
                    {p.label}
                  </button>
                );
              })}
              {d.ports.length > 4 && <span className="text-[8px] text-muted-foreground">+{d.ports.length - 4}</span>}
            </div>
          </div>
        );
      })}

      {/* Animation dot */}
      {animatedPath && animatedPath.length > 1 && animStep >= 0 && animStep < animatedPath.length && (() => {
        const cur = topology.devices[animatedPath[animStep].deviceId];
        if (!cur) return null;
        const c = centerOfDevice(cur);
        return (
          <div
            className={cn(
              "absolute h-3 w-3 rounded-full transition-all duration-500 ease-linear shadow-lg",
              animationOk === false && animStep === animatedPath.length - 1 ? "bg-red-500" : "bg-emerald-500 ring-2 ring-emerald-300",
            )}
            style={{ left: c.x - 6, top: c.y - 6 }}
          />
        );
      })()}
    </div>
  );
}
