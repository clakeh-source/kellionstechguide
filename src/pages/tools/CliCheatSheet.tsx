import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";

interface Entry { cmd: string; note: string }
interface Section { title: string; entries: Entry[] }

const sections: Section[] = [
  {
    title: "Modes & basics",
    entries: [
      { cmd: "enable", note: "Enter privileged EXEC mode." },
      { cmd: "configure terminal", note: "Enter global config from privileged EXEC." },
      { cmd: "end", note: "Return to privileged EXEC from any config mode." },
      { cmd: "exit", note: "Back up one level." },
      { cmd: "do <cmd>", note: "Run a privileged EXEC command from config mode." },
    ],
  },
  {
    title: "Show / verify",
    entries: [
      { cmd: "show ip interface brief", note: "One-line summary of every interface." },
      { cmd: "show running-config", note: "Live device config." },
      { cmd: "show startup-config", note: "Config that boots on reload." },
      { cmd: "show version", note: "Hardware, IOS version, uptime." },
      { cmd: "show cdp neighbors", note: "Directly connected Cisco neighbors." },
      { cmd: "show interfaces status", note: "Switchport link and VLAN summary." },
    ],
  },
  {
    title: "Interfaces",
    entries: [
      { cmd: "interface gi0/1", note: "Enter interface config." },
      { cmd: "description Uplink to core", note: "Human-readable interface tag." },
      { cmd: "ip address 10.0.0.1 255.255.255.0", note: "Set an IPv4 address." },
      { cmd: "no shutdown", note: "Bring the interface up." },
      { cmd: "switchport mode access", note: "Force the port to access mode." },
      { cmd: "switchport access vlan 20", note: "Assign the port to VLAN 20." },
    ],
  },
  {
    title: "Routing",
    entries: [
      { cmd: "ip route 0.0.0.0 0.0.0.0 10.0.0.1", note: "Default static route." },
      { cmd: "router ospf 1", note: "Enter OSPF process 1." },
      { cmd: "network 10.0.0.0 0.255.255.255 area 0", note: "Advertise a network into OSPF area 0." },
      { cmd: "show ip route", note: "Full routing table." },
      { cmd: "show ip ospf neighbor", note: "OSPF adjacency state." },
    ],
  },
  {
    title: "Save & recover",
    entries: [
      { cmd: "copy running-config startup-config", note: "Persist config across reload." },
      { cmd: "write memory", note: "Older shorthand for the save command." },
      { cmd: "reload", note: "Restart the device." },
      { cmd: "erase startup-config", note: "Wipe saved config (careful — device boots blank)." },
    ],
  },
];

export default function CliCheatSheet() {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return sections;
    return sections
      .map((s) => ({ ...s, entries: s.entries.filter((e) => e.cmd.toLowerCase().includes(needle) || e.note.toLowerCase().includes(needle)) }))
      .filter((s) => s.entries.length > 0);
  }, [q]);

  return (
    <>
      <SEO title="Cisco CLI Cheat Sheet — Free Tools — CertForge" description="A concise, searchable Cisco IOS command reference for CCNA-level tasks." />
      <section className="container py-10">
        <Link to="/free-tools" className="text-sm text-muted-foreground inline-flex items-center gap-1 hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> All free tools
        </Link>
      </section>
      <section className="container pb-16 space-y-6 max-w-3xl">
        <header className="space-y-3">
          <Badge variant="outline">Free tool</Badge>
          <h1 className="text-3xl font-display font-bold tracking-tight">Cisco IOS CLI Cheat Sheet</h1>
          <p className="text-muted-foreground">The commands you actually reach for on lab day. Search across every section.</p>
        </header>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search commands…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>

        {filtered.length === 0 && <p className="text-sm text-muted-foreground">No commands match "{q}".</p>}

        <div className="space-y-4">
          {filtered.map((s) => (
            <Card key={s.title}>
              <CardHeader><CardTitle className="text-lg">{s.title}</CardTitle></CardHeader>
              <CardContent>
                <ul className="divide-y divide-border">
                  {s.entries.map((e) => (
                    <li key={e.cmd} className="py-2.5 grid gap-1 sm:grid-cols-[280px_1fr] sm:items-center">
                      <code className="font-mono text-sm text-foreground">{e.cmd}</code>
                      <span className="text-sm text-muted-foreground">{e.note}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
