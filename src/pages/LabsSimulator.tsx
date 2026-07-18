import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { useSimulatorState } from "@/features/simulator/useSimulatorState";
import { labs, type LabDef } from "@/features/simulator/labs";
import { useSimulatorEntitlement } from "@/features/simulator/useEntitlement";
import { Toolbox } from "@/features/simulator/ui/Toolbox";
import { Canvas } from "@/features/simulator/ui/Canvas";
import { DeviceCliDrawer } from "@/features/simulator/ui/DeviceCliDrawer";
import { PingRunner } from "@/features/simulator/ui/PingRunner";
import { LabLibrary } from "@/features/simulator/ui/LabLibrary";
import { RotateCcw, Save, Upload, Info } from "lucide-react";
import { toast } from "sonner";

const STORAGE_KEY = "certforge:simulator:topology:v1";
const DEFAULT_LAB = labs.find((l) => l.id === "two-router-static")!;

export default function LabsSimulator() {
  const { unlocked, unlock } = useSimulatorEntitlement();
  const [currentLabId, setCurrentLabId] = useState<string>(DEFAULT_LAB.id);
  const initialTopology = useMemo(() => DEFAULT_LAB.build(), []);
  const sim = useSimulatorState(initialTopology);

  const selectedDevice = sim.selectedDeviceId ? sim.topology.devices[sim.selectedDeviceId] : null;
  const currentLab = labs.find((l) => l.id === currentLabId);

  const handleLoadLab = (lab: LabDef) => {
    sim.load(lab.build());
    setCurrentLabId(lab.id);
    toast.success(`Loaded: ${lab.title}`);
  };

  const handleSave = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ topology: sim.topology, labId: currentLabId }));
      toast.success("Topology saved to this browser");
    } catch { toast.error("Failed to save"); }
  };
  const handleLoad = () => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) { toast.error("Nothing saved yet"); return; }
      const parsed = JSON.parse(raw);
      sim.load(parsed.topology);
      if (parsed.labId) setCurrentLabId(parsed.labId);
      toast.success("Loaded saved topology");
    } catch { toast.error("Failed to load"); }
  };
  const handleReset = () => { if (currentLab) handleLoadLab(currentLab); };

  return (
    <>
      <SEO title="Cisco Network Simulator — CertForge" description="Drag-and-drop virtual Cisco routers, switches, and PCs. Configure IOS from the browser and watch packet flow across your topology." />
      <section className="container py-8">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">Free preview</Badge>
              <Badge variant="cisco">Cisco</Badge>
            </div>
            <h1 className="text-3xl font-display font-bold tracking-tight">Cisco Network Simulator</h1>
            <p className="text-muted-foreground max-w-2xl mt-1 text-sm">
              Build topologies. Configure IOS. Ping across the network and see exactly where traffic fails.
              {!unlocked && " Two starter labs are free — unlock the full library with the Cisco Network Simulator product."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleSave}><Save className="h-4 w-4" /> Save</Button>
            <Button variant="outline" size="sm" onClick={handleLoad}><Upload className="h-4 w-4" /> Load</Button>
            <Button variant="outline" size="sm" onClick={handleReset}><RotateCcw className="h-4 w-4" /> Reset lab</Button>
          </div>
        </header>

        {currentLab && (
          <div className="mb-4 rounded-lg border border-primary/30 bg-primary/5 p-3 flex items-start gap-2 text-sm">
            <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">{currentLab.title}</p>
              <p className="text-muted-foreground text-xs mt-0.5">{currentLab.goal}</p>
            </div>
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-[13rem_1fr_20rem]">
          <Toolbox
            onAdd={(kind) => sim.addDevice(kind, 200, 200)}
            cableMode={sim.cableMode}
            onToggleCable={() => { sim.setCableMode(!sim.cableMode); sim.setCablePending(null); }}
          />

          <div className="flex flex-col gap-3">
            <Canvas
              topology={sim.topology}
              selectedDeviceId={sim.selectedDeviceId}
              onSelectDevice={sim.setSelectedDeviceId}
              onMoveDevice={sim.moveDevice}
              onRemoveDevice={sim.removeDevice}
              onOpenCli={sim.setSelectedDeviceId}
              cableMode={sim.cableMode}
              cablePending={sim.cablePending}
              onPortClick={sim.clickPortForCabling}
              onRemoveLink={sim.removeLink}
              animatedPath={sim.lastPath}
              animationOk={sim.lastPingOk}
            />

            {selectedDevice && (
              <div className="h-[420px]">
                <DeviceCliDrawer
                  device={selectedDevice}
                  session={sim.sessions[selectedDevice.id]}
                  onRun={(cmd) => sim.runCliCommand(selectedDevice.id, cmd)}
                  onClear={() => sim.clearTerminal(selectedDevice.id)}
                  onClose={() => sim.setSelectedDeviceId(null)}
                />
              </div>
            )}
          </div>

          <div className="space-y-3">
            <PingRunner
              topology={sim.topology}
              lastMsg={sim.lastPingMsg}
              lastOk={sim.lastPingOk}
              onRun={sim.runPing}
              onClear={sim.clearPing}
              defaultFromName={currentLab?.ping?.fromDeviceName}
              defaultToIp={currentLab?.ping?.toIp}
            />
            <LabLibrary currentLabId={currentLabId} unlocked={unlocked} onLoad={handleLoadLab} />

            {!unlocked && (
              <button
                onClick={() => { unlock(); toast.success("Full lab library unlocked (preview mode)"); }}
                className="w-full text-[11px] text-muted-foreground hover:text-foreground underline underline-offset-2"
                title="Preview only — real unlock happens after purchase"
              >
                Preview: unlock all labs locally
              </button>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
