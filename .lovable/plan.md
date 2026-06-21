
# Multi-Vendor Certification Learning Hub

Reposition TechGuide as a learning-first platform centered on three certification tracks — **Cisco CCNA 200-301**, **Juniper JNCIA-Junos**, and **Fortinet FCA/FCF + NSE 4/FCP** — while keeping existing network tools available in a secondary "Utilities" area. AI tools expand to support all three vendors.

> Note: the project filesystem is currently missing many files from a prior sync issue. This plan assumes the codebase is restored first (via Version History or GitHub re-sync). All work below targets the restored codebase.

## 1. Information Architecture

### TopNav (global discovery / conversion)
- **Certifications** ▾ — CCNA 200-301, JNCIA-Junos, Fortinet FCA/FCF, Fortinet NSE 4/FCP, "Compare tracks"
- **Labs** ▾ — Virtual Labs (CLI), Packet Tracer Labs, Practice Exams, Troubleshooting Scenarios
- **AI Study Helpers** ▾ — CLI Assistant (Cisco/Junos/FortiOS), Config Builder, ACL Builder, Switch Migration, Security Auditor
- **Resources** ▾ — Knowledge Base, Subnetting Guide, Network Intelligence, Blog
- **Utilities** ▾ (de-emphasized) — Subnet Calculator, Speed Test, DNS Lookup, Port Scanner, All Tools
- **Pricing**, **Sign In / Get Started**

### SideNav (in-app workspace, behind auth)
- Dashboard
- My Tracks (active cert → modules → lessons)
- Labs (Virtual / Packet Tracer / Exams)
- AI Helpers
- Progress & Achievements
- Settings

## 2. Cert Track Structure

Each track gets full parity with the existing CCNA Learning Lab engine:

```text
/tracks/:vendor/:cert
  ├── Overview + exam blueprint
  ├── Modules (6–8 domains per cert)
  │     └── Lessons (AI-assisted, marker-parsed)
  ├── CLI Practice (vendor-specific syntax)
  ├── Mock Exam (timed, scored)
  └── Progress dashboard
```

Vendor mapping:
- **Cisco CCNA 200-301** — reuse existing `/ccna-learning-lab`; alias under `/tracks/cisco/ccna`
- **Juniper JNCIA-Junos** — new track, Junos CLI emulator profile (operational/configuration modes, commit, `show` hierarchy)
- **Fortinet FCA / FCF** — entry track, FortiGate fundamentals, GUI-screenshot + CLI dual mode
- **Fortinet NSE 4 / FCP** — advanced FortiGate, security profiles, VPN, SD-WAN

## 3. CLI Engine Extensions

Extend the Packet Tracer / CLI engine with per-vendor adapters:
- `engines/cli/cisco-ios.ts` (existing)
- `engines/cli/junos.ts` — hierarchical config, `set`/`delete`/`commit`, op vs config mode
- `engines/cli/fortios.ts` — `config` blocks, `edit`/`next`/`end`, VDOM-aware prompts

Shared: command history, tab completion, abbreviation, diagnostics engine.

## 4. AI Tools — Vendor Expansion

Update `supabase/functions/nextgen-ai/index.ts` system prompts to accept a `vendor` field (`cisco` | `juniper` | `fortinet`) for:
- CLI Assistant
- Config Builder (already supports 8 platforms — surface Juniper/Fortinet prominently)
- ACL Builder (firewall-rule equivalent for Juniper `firewall` filters and FortiOS `policy`)
- Security Auditor
- Switch Migration (add Junos ⇄ IOS and FortiSwitch paths)

Add a vendor selector in each tool's UI. Re-label section as "Cert Study Helpers".

## 5. Homepage / Landing

- Hero: "Master Cisco, Juniper & Fortinet — One Learning Hub"
- Three vendor cards (CCNA / JNCIA / Fortinet) → track landing pages
- Secondary band: "Hands-on labs", "AI study helpers", "Free utilities"
- Social proof, pricing teaser, CTA

## 6. Data & Content Files

**New:**
- `src/data/tracks/jncia.ts` — modules, lessons, CLI scenarios, exam questions
- `src/data/tracks/fortinet-fca.ts`
- `src/data/tracks/fortinet-nse4.ts`
- `src/data/vendors.ts` — vendor metadata (name, logo, color accent, cert list)
- `src/lib/cli/junos-engine.ts`
- `src/lib/cli/fortios-engine.ts`

**Edit:**
- `src/components/marketing/SiteHeader.tsx` — new dropdown structure
- `src/components/marketing/SiteFooter.tsx` — vendor columns
- `src/data/toolsData.ts` — add vendor tags, regroup
- `src/data/seoData.ts` — entries for each track + vendor landing
- `src/App.tsx` — routes `/tracks/:vendor/:cert/*`
- `src/pages/Dashboard.tsx` — multi-track progress
- `src/pages/CCNALearningLab.tsx` — generalize into `<TrackEngine vendor cert />`
- `supabase/functions/nextgen-ai/index.ts` — vendor-aware prompts

**New pages:**
- `src/pages/tracks/VendorLanding.tsx` (Cisco / Juniper / Fortinet hubs)
- `src/pages/tracks/CertTrack.tsx` (generic track shell)
- `src/pages/tracks/CompareTracks.tsx`

## 7. Phased Rollout

1. **Phase 1 — Navigation + scaffolding** (no content yet)
   - New TopNav, vendor landing pages, route shells, SEO entries, homepage refocus.
2. **Phase 2 — JNCIA track (full parity)**
   - Junos CLI engine, lessons, mock exam, AI vendor switch for Junos.
3. **Phase 3 — Fortinet FCA/FCF track**
   - FortiOS CLI engine, lessons, GUI-style screenshots, mock exam.
4. **Phase 4 — Fortinet NSE 4 / FCP track**
   - Advanced modules (VPN, SD-WAN, FortiAnalyzer integration scenarios).
5. **Phase 5 — Polish**
   - Unified progress dashboard, cross-vendor comparisons, leaderboard updates.

## 8. Out of Scope (this plan)
- Payments/pricing changes (existing tiers stand; Pro unlocks all vendors).
- Mobile native apps.
- Live instructor sessions.

## 9. Prerequisite
Restore the project files (Version History or GitHub re-sync) before implementation. Once restored, Phase 1 can ship in a single iteration; Phases 2–4 each ship as their own iteration.
