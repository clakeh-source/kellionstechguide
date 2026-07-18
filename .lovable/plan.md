## Cisco Network Simulator — Build Plan

A browser-based, drag-and-drop Cisco lab: place devices, patch cables, click a device to open its CLI, and watch ping traffic animate across links. Free preview with 2 starter labs at `/labs/simulator`; the full lab library unlocks after purchase of the existing `cisco-network-simulator` product.

### User experience

- Toolbox on the left: Router, L2 Switch, L3 Switch, PC, Cable tool.
- Canvas in the middle: drag devices in, click "Cable", then click two device ports to patch them. Links show link state (up/down/admin-down) with colored line.
- Click a device → right-side drawer opens with that device's CLI terminal (reusing the existing `cli-lab` engine and terminal UI).
- Top bar: Save, Load, Reset, Run Ping (pick source + destination host), Lab selector.
- Packet animation: when a PC runs `ping`, an ICMP dot travels hop-by-hop along the links, respecting interface state, IP/subnet match, static routes, VLAN membership, and trunk allowed lists. Failed hops show where and why (no route, VLAN mismatch, shutdown interface).

### Devices & CLI coverage (first release)

- **Router (IOS)**: `enable`, `configure terminal`, `interface`, `ip address`, `no shutdown`, `ip route`, `router ospf` (single area), `show ip interface brief`, `show ip route`, `show running-config`.
- **L2 Switch (IOS)**: `vlan`, `name`, `interface`, `switchport mode access|trunk`, `switchport access vlan`, `switchport trunk allowed vlan`, `show vlan brief`, `show interfaces trunk`, `shutdown` / `no shutdown`.
- **L3 Switch**: everything L2 does + `ip routing`, SVIs (`interface vlan X` + `ip address`), static routes.
- **PC**: `ipconfig`, `ipconfig /all`, `ip address <ip> <mask> <gw>`, `ping <ip>`, `arp -a`.
- **Cabling**: straight-through only in v1; port picker filters by device type. Warn on obvious mismatches (e.g. cabling into a shutdown-only port).

### Access model

- Public route `/labs/simulator` — free canvas + 2 starter labs ("Two-router static route", "VLAN + trunk between switches"). Save/load limited to 1 local slot.
- Locked labs (8 more) show a lock icon; clicking prompts "Unlock full lab library" → routes to `/products/cisco-network-simulator`.
- Unlock check: after purchase, a `simulator_entitlements` row lets the client read all labs. No auth-gated route change — the same page just reveals more labs when entitled.

### Free-tier gating (backend)

- New table `public.simulator_entitlements` (user_id, active, source, granted_at) with RLS: users read their own row; only service role writes. Edge function `grant-simulator-access` flips the row after a successful Stripe checkout for this product's price IDs. Client reads the row on mount; falls back to "locked" if row is missing.

### Save / Load

- v1 stores topologies in `localStorage` under `certforge:simulator:v1`. A single "My topology" slot for free users; unlocked users get 5 named slots. No server sync in v1 — flagged as a v2 item.

### Technical structure

```text
src/features/simulator/
  types.ts                 // Device, Port, Link, Topology, PacketEvent
  engine/
    topology.ts            // graph ops: add/remove device, connect/disconnect ports
    forwarding.ts          // L2 MAC + VLAN table, L3 route lookup, per-device tick
    ping.ts                // orchestrates hop-by-hop ICMP with success/failure reason
    cli/
      router.ts            // IOS router command set + apply-to-config
      switchL2.ts
      switchL3.ts
      pc.ts
  state/
    useSimulator.ts        // Zustand-free React context: topology + selected device
  ui/
    Canvas.tsx             // SVG canvas, drag, cable tool
    DeviceNode.tsx
    LinkLine.tsx
    Toolbox.tsx
    DeviceCliDrawer.tsx    // wraps existing CliTerminal
    PingRunner.tsx
    LabLibrary.tsx         // free vs locked labs
  data/
    labs.ts                // 10 pre-built topologies + objectives
src/pages/LabsSimulator.tsx     // /labs/simulator route
supabase/
  migrations/<ts>_simulator_entitlements.sql
  functions/grant-simulator-access/index.ts
```

- The existing `src/features/cli-lab` engine handles guided *scenarios*. For the simulator we need a **stateful config model** per device, so `engine/cli/*.ts` are new — they parse commands, mutate a `DeviceConfig` object, and produce `show` output from that object (not from static scripts). The CLI terminal component itself is reused.
- Ping is a small event loop: at each hop, look up next-hop via routing table (routers/L3 switches) or default gateway (PCs); for switches, forward by MAC table with VLAN filtering. Animation uses `requestAnimationFrame` and interpolates along the link's SVG path.
- No packet-level TCP/UDP in v1 — only ICMP echo + a "cable test" primitive.

### Navigation & product hooks

- Add "Network Simulator" link to the TopNav "Labs" area and to `/labs` index.
- On `/products/cisco-network-simulator`, add a "Try free preview" button linking to `/labs/simulator`.

### Out of scope for v1 (called out to the user)

- Multi-user collaboration, real packet capture, WAN protocols beyond OSPF single-area, wireless, ACLs, NAT, IPv6, cloud sync of saved topologies. These are candidates for v2.

### Verification

- Build passes.
- Manual: drop 2 routers + a PC on each side, patch cables, configure IPs and a static route via CLI, run ping from PC1 to PC2, see the animation reach the destination. Shut an interface, retry, see failure at the correct hop.
- Free-tier lock: signed-out user sees 2 unlocked + 8 locked labs; clicking a locked lab opens the product page.