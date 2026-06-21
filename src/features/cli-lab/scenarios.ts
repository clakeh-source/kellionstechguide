import type { Scenario } from "./types";

export const ciscoScenario: Scenario = {
  id: "cisco-int-down",
  vendor: "cisco",
  title: "Cisco IOS — Interface is down",
  hostname: "R1",
  intro:
    "Users on VLAN 10 cannot reach the gateway. Gi0/1 appears administratively down on R1. Bring the interface back online and verify connectivity.",
  steps: [
    { instruction: "Enter privileged EXEC mode.", expect: /^en(able)?$/i, success: "You are now in privileged EXEC mode." },
    { instruction: "List interface status to confirm Gi0/1 is down.", expect: /^sh(ow)?\s+ip\s+int(erface)?\s+br(ief)?$/i, success: "Confirmed: Gi0/1 is administratively down." },
    { instruction: "Enter global configuration mode.", expect: /^conf(igure)?\s+t(erminal)?$/i, success: "Now in global config." },
    { instruction: "Select interface GigabitEthernet0/1.", expect: /^int(erface)?\s+gi(gabitethernet)?\s*0\/1$/i, success: "Interface selected." },
    { instruction: "Bring the interface up.", expect: /^no\s+shut(down)?$/i, success: "Interface enabled." },
    { instruction: "Return to privileged EXEC and verify it is up/up.", expect: /^sh(ow)?\s+int(erface)?\s+gi(gabitethernet)?\s*0\/1$/i, success: "Gi0/1 is up/up. Lab complete." },
  ],
  commands: [
    { match: /^en(able)?$/i, output: "", mode: "enable" },
    { match: /^disable$/i, output: "", mode: "user" },
    {
      match: /^sh(ow)?\s+ip\s+int(erface)?\s+br(ief)?$/i,
      output: [
        "Interface              IP-Address      OK? Method Status                Protocol",
        "GigabitEthernet0/0     192.0.2.1       YES NVRAM  up                    up",
        "GigabitEthernet0/1     10.10.10.1      YES NVRAM  administratively down down",
        "GigabitEthernet0/2     unassigned      YES NVRAM  up                    up",
      ],
    },
    { match: /^conf(igure)?\s+t(erminal)?$/i, output: "Enter configuration commands, one per line.  End with CNTL/Z.", mode: "config" },
    { match: /^int(erface)?\s+gi(gabitethernet)?\s*0\/1$/i, output: "", mode: "config-if" },
    { match: /^no\s+shut(down)?$/i, output: ["%LINK-3-UPDOWN: Interface GigabitEthernet0/1, changed state to up", "%LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/1, changed state to up"] },
    { match: /^shut(down)?$/i, output: ["%LINK-5-CHANGED: Interface GigabitEthernet0/1, changed state to administratively down"] },
    { match: /^exit$/i, output: "", mode: "config" },
    { match: /^end$/i, output: "", mode: "enable" },
    {
      match: /^sh(ow)?\s+int(erface)?\s+gi(gabitethernet)?\s*0\/1$/i,
      output: [
        "GigabitEthernet0/1 is up, line protocol is up",
        "  Hardware is iGbE, address is 0011.2233.4455 (bia 0011.2233.4455)",
        "  Internet address is 10.10.10.1/24",
        "  MTU 1500 bytes, BW 1000000 Kbit/sec, DLY 10 usec,",
        "  Full-duplex, 1000Mb/s, link type is auto, media type is RJ45",
      ],
    },
    { match: /^sh(ow)?\s+ver(sion)?$/i, output: ["Cisco IOS Software, C2900 Software, Version 15.7(3)M3", "R1 uptime is 1 day, 4 hours, 12 minutes"] },
  ],
};

export const juniperScenario: Scenario = {
  id: "junos-ospf-commit",
  vendor: "juniper",
  title: "Juniper Junos — Add OSPF and commit",
  hostname: "user@R1",
  intro:
    "Enable OSPF on ge-0/0/0 in area 0, review the candidate config, then commit the change safely.",
  steps: [
    { instruction: "Enter configuration mode.", expect: /^configure$/i, success: "You are in configuration mode." },
    { instruction: "Add ge-0/0/0 to OSPF area 0.", expect: /^set\s+protocols\s+ospf\s+area\s+0(\.0\.0\.0)?\s+interface\s+ge-0\/0\/0$/i, success: "Statement added to candidate config." },
    { instruction: "Review the pending change.", expect: /^show\s+\|\s+compare$/i, success: "Candidate diff displayed." },
    { instruction: "Validate the candidate config.", expect: /^commit\s+check$/i, success: "Configuration check succeeded." },
    { instruction: "Commit the change.", expect: /^commit$/i, success: "Commit complete. Lab done." },
  ],
  commands: [
    { match: /^cli$/i, output: "", mode: "operational" },
    { match: /^configure$/i, output: "Entering configuration mode\n\n[edit]", mode: "configuration" },
    { match: /^set\s+protocols\s+ospf\s+area\s+0(\.0\.0\.0)?\s+interface\s+ge-0\/0\/0$/i, output: "" },
    {
      match: /^show\s+\|\s+compare$/i,
      output: [
        "[edit protocols]",
        "+   ospf {",
        "+       area 0.0.0.0 {",
        "+           interface ge-0/0/0.0;",
        "+       }",
        "+   }",
      ],
    },
    { match: /^commit\s+check$/i, output: "configuration check succeeds" },
    { match: /^commit$/i, output: "commit complete" },
    { match: /^rollback\s+1$/i, output: "load complete" },
    { match: /^exit$/i, output: "Exiting configuration mode", mode: "operational" },
    {
      match: /^show\s+ospf\s+neighbor$/i,
      output: [
        "Address          Interface              State     ID               Pri  Dead",
        "10.0.0.2         ge-0/0/0.0             Full      2.2.2.2          128  37",
      ],
    },
    { match: /^show\s+version$/i, output: "Junos: 21.4R3-S2.6" },
  ],
};

export const fortinetScenario: Scenario = {
  id: "fortigate-flow-trace",
  vendor: "fortinet",
  title: "Fortinet FortiGate — Trace a blocked session",
  hostname: "FGT-01",
  intro:
    "Traffic from 10.0.0.5 to 8.8.8.8 is being dropped. Use the flow-trace diagnostic to find which policy is denying it.",
  steps: [
    { instruction: "Verify the system is running.", expect: /^get\s+system\s+status$/i, success: "FortiGate is online." },
    { instruction: "Set the flow filter for source 10.0.0.5.", expect: /^diagnose\s+debug\s+flow\s+filter\s+saddr\s+10\.0\.0\.5$/i, success: "Filter applied." },
    { instruction: "Send debug output to the console.", expect: /^diagnose\s+debug\s+flow\s+show\s+console\s+enable$/i, success: "Console output enabled." },
    { instruction: "Enable debug globally.", expect: /^diagnose\s+debug\s+enable$/i, success: "Debug enabled." },
    { instruction: "Start the trace for 5 packets.", expect: /^diagnose\s+debug\s+flow\s+trace\s+start\s+5$/i, success: "Trace shows policy 0 (implicit deny). Add an allow policy to fix." },
    { instruction: "Disable debug when finished.", expect: /^diagnose\s+debug\s+disable$/i, success: "Debug disabled. Lab complete." },
  ],
  commands: [
    {
      match: /^get\s+system\s+status$/i,
      output: [
        "Version: FortiGate-100F v7.4.3,build2573,240315 (GA)",
        "Serial-Number: FG100FTK20000001",
        "Hostname: FGT-01",
        "Operation Mode: NAT",
        "Current HA mode: standalone",
      ],
    },
    {
      match: /^show\s+firewall\s+policy\s+10$/i,
      output: [
        "config firewall policy",
        "    edit 10",
        '        set name "LAN-to-WAN"',
        '        set srcintf "port2"',
        '        set dstintf "port1"',
        '        set srcaddr "LAN_NET"',
        '        set dstaddr "all"',
        '        set action accept',
        '        set schedule "always"',
        '        set service "DNS"',
        "    next",
        "end",
      ],
    },
    { match: /^diagnose\s+debug\s+flow\s+filter\s+saddr\s+10\.0\.0\.5$/i, output: "" },
    { match: /^diagnose\s+debug\s+flow\s+show\s+console\s+enable$/i, output: "show trace messages on console" },
    { match: /^diagnose\s+debug\s+enable$/i, output: "" },
    {
      match: /^diagnose\s+debug\s+flow\s+trace\s+start\s+5$/i,
      output: [
        "id=20085 trace_id=1 func=print_pkt_detail line=5892 msg=\"vd-root:0 received a packet(proto=6, 10.0.0.5:51422->8.8.8.8:443) tun_id=0.0.0.0 from port2.\"",
        "id=20085 trace_id=1 func=init_ip_session_common line=6076 msg=\"allocate a new session-0001a2f3\"",
        "id=20085 trace_id=1 func=vf_ip_route_input_common line=2605 msg=\"find a route: flag=04000000 gw-203.0.113.1 via port1\"",
        "id=20085 trace_id=1 func=fw_forward_handler line=890  msg=\"Denied by forward policy check (policy 0)\"",
      ],
    },
    { match: /^diagnose\s+debug\s+disable$/i, output: "" },
    { match: /^diagnose\s+debug\s+reset$/i, output: "" },
  ],
};

export const scenarios = {
  cisco: ciscoScenario,
  juniper: juniperScenario,
  fortinet: fortinetScenario,
};
