import { useCallback, useState } from "react";
import type { Device, DeviceKind, Link, PathHop, Topology } from "./types";
import { createDevice } from "./engine/factory";
import { runCommand, initialState, prompt as promptFor, type CliState } from "./engine/cli";
import { simulatePing } from "./engine/ping";

export interface TerminalEntry { prompt: string; cmd: string; output: string[]; }
export interface DeviceSession { state: CliState; history: TerminalEntry[]; }

export function useSimulatorState(initial: Topology) {
  const [topology, setTopology] = useState<Topology>(initial);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [cableMode, setCableMode] = useState<boolean>(false);
  const [cablePending, setCablePending] = useState<{ deviceId: string; portId: string } | null>(null);
  const [sessions, setSessions] = useState<Record<string, DeviceSession>>({});
  const [lastPath, setLastPath] = useState<PathHop[] | null>(null);
  const [lastPingMsg, setLastPingMsg] = useState<string | null>(null);
  const [lastPingOk, setLastPingOk] = useState<boolean | null>(null);

  const load = useCallback((t: Topology) => {
    setTopology(t); setSelectedDeviceId(null); setCableMode(false); setCablePending(null);
    setSessions({}); setLastPath(null); setLastPingMsg(null); setLastPingOk(null);
  }, []);

  const addDevice = useCallback((kind: DeviceKind, x: number, y: number) => {
    setTopology((prev) => {
      const names = Object.values(prev.devices).map((d) => d.name);
      const dev = createDevice(kind, x, y, names);
      return { ...prev, devices: { ...prev.devices, [dev.id]: dev }, order: [...prev.order, dev.id] };
    });
  }, []);

  const removeDevice = useCallback((id: string) => {
    setTopology((prev) => {
      const nextDevices = { ...prev.devices }; delete nextDevices[id];
      const nextLinks: Record<string, Link> = {};
      for (const [k, l] of Object.entries(prev.links)) if (l.aDeviceId !== id && l.bDeviceId !== id) nextLinks[k] = l;
      return { devices: nextDevices, links: nextLinks, order: prev.order.filter((x) => x !== id) };
    });
    setSessions((s) => { const c = { ...s }; delete c[id]; return c; });
    setSelectedDeviceId((cur) => (cur === id ? null : cur));
  }, []);

  const moveDevice = useCallback((id: string, x: number, y: number) => {
    setTopology((prev) => {
      const d = prev.devices[id]; if (!d) return prev;
      return { ...prev, devices: { ...prev.devices, [id]: { ...d, x, y } } };
    });
  }, []);

  const clickPortForCabling = useCallback((deviceId: string, portId: string) => {
    if (!cableMode) return;
    if (!cablePending) { setCablePending({ deviceId, portId }); return; }
    if (cablePending.deviceId === deviceId) { setCablePending(null); return; }
    setTopology((prev) => {
      // ensure no other cable on either endpoint
      const nextLinks: Record<string, Link> = {};
      for (const [k, l] of Object.entries(prev.links)) {
        const conflict =
          (l.aDeviceId === cablePending.deviceId && l.aPortId === cablePending.portId) ||
          (l.bDeviceId === cablePending.deviceId && l.bPortId === cablePending.portId) ||
          (l.aDeviceId === deviceId && l.aPortId === portId) ||
          (l.bDeviceId === deviceId && l.bPortId === portId);
        if (!conflict) nextLinks[k] = l;
      }
      const id = `l_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,6)}`;
      nextLinks[id] = { id, aDeviceId: cablePending.deviceId, aPortId: cablePending.portId, bDeviceId: deviceId, bPortId: portId };
      return { ...prev, links: nextLinks };
    });
    setCablePending(null);
    setCableMode(false);
  }, [cableMode, cablePending]);

  const removeLink = useCallback((linkId: string) => {
    setTopology((prev) => { const c = { ...prev.links }; delete c[linkId]; return { ...prev, links: c }; });
  }, []);

  const runCliCommand = useCallback((deviceId: string, cmd: string) => {
    setTopology((prev) => {
      const device = prev.devices[deviceId]; if (!device) return prev;
      const prior = sessions[deviceId] ?? { state: initialState(device.kind), history: [] };
      const p = promptFor(device, prior.state);
      const { output, state, device: updated } = runCommand(device, cmd, prior.state);
      const nextSession: DeviceSession = { state, history: [...prior.history, { prompt: p, cmd, output }] };
      setSessions((s) => ({ ...s, [deviceId]: nextSession }));
      return { ...prev, devices: { ...prev.devices, [deviceId]: updated } };
    });
  }, [sessions]);

  const clearTerminal = useCallback((deviceId: string) => {
    setSessions((s) => ({ ...s, [deviceId]: { state: s[deviceId]?.state ?? initialState("router"), history: [] } }));
  }, []);

  const runPing = useCallback((fromDeviceId: string, toIp: string) => {
    const result = simulatePing(topology, fromDeviceId, toIp);
    setLastPath(result.path);
    setLastPingOk(result.ok);
    setLastPingMsg(result.ok ? `Reply from ${toIp}: bytes=32 time<1ms TTL=64` : `Request timed out — ${result.reason}`);
  }, [topology]);

  const clearPing = useCallback(() => { setLastPath(null); setLastPingMsg(null); setLastPingOk(null); }, []);

  return {
    topology, load,
    selectedDeviceId, setSelectedDeviceId,
    cableMode, setCableMode, cablePending, setCablePending,
    addDevice, removeDevice, moveDevice,
    clickPortForCabling, removeLink,
    sessions, runCliCommand, clearTerminal,
    lastPath, lastPingMsg, lastPingOk, runPing, clearPing,
  };
}
