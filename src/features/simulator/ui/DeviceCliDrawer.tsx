import { useEffect, useRef, useState, KeyboardEvent } from "react";
import type { Device } from "../types";
import type { DeviceSession } from "../useSimulatorState";
import { prompt as promptFor, initialState } from "../engine/cli";
import { Button } from "@/components/ui/button";
import { Eraser, X } from "lucide-react";

interface Props {
  device: Device;
  session?: DeviceSession;
  onRun: (cmd: string) => void;
  onClear: () => void;
  onClose: () => void;
}

export function DeviceCliDrawer({ device, session, onRun, onClear, onClose }: Props) {
  const [value, setValue] = useState("");
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [hIdx, setHIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const state = session?.state ?? initialState(device.kind);
  const history = session?.history ?? [];
  const prompt = promptFor(device, state);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }); }, [history]);
  useEffect(() => { inputRef.current?.focus(); }, [device.id]);

  const submit = () => {
    if (!value.trim()) return;
    setCmdHistory((h) => [...h, value]);
    setHIdx(-1);
    onRun(value);
    setValue("");
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); submit(); }
    else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      const next = hIdx < 0 ? cmdHistory.length - 1 : Math.max(0, hIdx - 1);
      setHIdx(next); setValue(cmdHistory[next]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (hIdx < 0) return;
      const next = hIdx + 1;
      if (next >= cmdHistory.length) { setHIdx(-1); setValue(""); }
      else { setHIdx(next); setValue(cmdHistory[next]); }
    }
  };

  return (
    <div className="flex flex-col h-full rounded-lg border border-border bg-slate-950 text-slate-100 overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-800 px-3 py-2 bg-slate-900">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
          <span className="ml-1 text-xs text-slate-400 font-mono">{device.name} — {device.kind}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" className="h-7 text-slate-300 hover:text-white hover:bg-slate-800" onClick={onClear}>
            <Eraser className="h-3.5 w-3.5" /> Clear
          </Button>
          <Button size="sm" variant="ghost" className="h-7 text-slate-300 hover:text-white hover:bg-slate-800" onClick={onClose}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto font-mono text-[13px] leading-relaxed" onClick={() => inputRef.current?.focus()}>
        <div className="px-4 py-3">
          {history.length === 0 && (
            <p className="text-slate-500">
              {device.kind === "pc"
                ? "PC console. Try: `ip address 192.168.1.10 255.255.255.0 192.168.1.1`, then `ipconfig`."
                : "Cisco IOS. Try: `enable`, `configure terminal`, `interface Gi0/0`, `ip address 10.0.0.1 255.255.255.0`, `no shutdown`."}
            </p>
          )}
          {history.map((entry, i) => (
            <div key={i} className="mb-1">
              <div>
                <span className="text-emerald-400">{entry.prompt}</span>
                <span className="text-amber-300">{entry.cmd}</span>
              </div>
              {entry.output.map((line, j) => (
                <div key={j} className="text-slate-200 whitespace-pre">{line}</div>
              ))}
            </div>
          ))}
          <div className="flex items-center">
            <span className="text-emerald-400 font-mono">{prompt}</span>
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKey}
              spellCheck={false}
              autoComplete="off"
              className="flex-1 bg-transparent border-0 outline-none text-amber-300 font-mono text-[13px] ml-1"
              aria-label="Terminal input"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
