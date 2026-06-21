# Rebuild as CertForge — Phase 1 Plan

Rename the project from TechGuide to **CertForge** and rebuild the missing app shell, navigation, auth, dashboard, and vendor learning-path pages from scratch. The 7 existing tool pages stay.

## New name & branding

- Product name everywhere: **CertForge**
- Tagline: *"Forge your networking certifications."*
- Vendors covered: Cisco CCNA 200-301, Juniper JNCIA-Junos, Fortinet FCA/FCF, Fortinet NSE 4 / FCP
- Visual direction: fresh modern light UI with vendor accent colors (Cisco blue, Juniper green, Fortinet red), forge-warm primary (amber/orange) for the brand itself

## Design system

- Tokens in `index.css` (HSL): `--background` near-white, `--foreground` slate-900, `--primary` forge amber (`28 90% 52%`), `--cisco` (`210 90% 45%`), `--juniper` (`150 65% 38%`), `--fortinet` (`0 75% 50%`)
- Fonts via `@fontsource`: **Space Grotesk** (display/headings) + **DM Sans** (body)
- Tailwind config extended with the tokens, gradients, and shadow utilities
- shadcn/ui primitives restored (button, card, input, dropdown-menu, sheet, tabs, badge, dialog, sonner, tooltip, navigation-menu, etc.)

## App shell

- `main.tsx`, `App.tsx`, `index.css`, `vite-env.d.ts`
- Router (`BrowserRouter`) with `React.lazy` + `Suspense` + `PageSkeleton` + `PageErrorBoundary`
- `RootLayout` = sticky `TopNav` + `<Outlet/>` + `Footer`
- `AppLayout` (authenticated workspace) = `SidebarProvider` + `AppSidebar` + header with `SidebarTrigger` + `<Outlet/>`

## Navigation

**TopNav (global / discovery)**
- Logo → `/`
- Tracks dropdown: Cisco CCNA, Juniper JNCIA, Fortinet FCA/FCF, Fortinet NSE 4
- Labs, Tools, Pricing, About, Blog
- Right: Search, Sign In / Avatar menu, "Start free" CTA
- Mobile: `Sheet` drawer

**SideNav (workspace, authenticated routes only)**
- Dashboard, My Tracks, Continue Learning, Labs, Practice Exams, Notes, Progress, Tools, Settings
- `collapsible="icon"`, active route via `NavLink`, group containing active route stays open

## Routes to (re)build

Public:
- `/` Home (hero, 3 vendor cards, value props, featured labs, CTA)
- `/tracks/cisco-ccna`, `/tracks/juniper-jncia`, `/tracks/fortinet-fca`, `/tracks/fortinet-nse4` — vendor landing pages with module outlines
- `/labs`, `/labs/virtual`, `/labs/packet-tracer`, `/labs/practice-exams`
- `/tools` (index of the 7 existing tool pages)
- `/pricing`, `/about`, `/blog`, `/contact`, `/faq`
- `/auth` (sign in / sign up)
- `*` NotFound

Workspace (auth-gated via `RequireAuth`):
- `/app/dashboard`, `/app/tracks`, `/app/tracks/:vendor`, `/app/labs`, `/app/exams`, `/app/notes`, `/app/progress`, `/app/profile`, `/app/settings`

Existing tool routes preserved: `/tool/cisco-cli-assistant`, `/tool/subnet-calculator`, `/tool/speed-test`, `/tool/atlas-asset-manager`, `/tool/smartnet-dashboards`, `/tool/smartnet-reports`, `/tool/smartnet-sensors`

## Auth + database (Lovable Cloud)

- Email/password + Google sign-in
- `useAuth` hook (session + user, listens to `onAuthStateChange`)
- Tables (with GRANTs + RLS):
  - `profiles` (id, full_name, avatar_url, created_at) — user-owned
  - `user_roles` + `app_role` enum + `has_role()` security-definer function (per platform rules)
  - `track_progress` (user_id, vendor, module_slug, status, score, updated_at)
  - `lab_attempts` (user_id, lab_slug, completed_at, duration_sec, score)
- Trigger to auto-create a `profiles` row on signup

## Dashboard scaffold

- Cards: "Continue Cisco CCNA", "Continue Juniper JNCIA", "Continue Fortinet"
- Progress bars driven by `track_progress`
- Recent lab attempts list
- Quick links to tools

## SEO

- Centralized `seoData.ts` + `SEOHead` component
- Unique title/desc per route, JSON-LD `Course` schema on vendor track pages
- Updated `robots.txt` + `sitemap.xml` referencing new routes and the CertForge brand
- Update `index.html` `<title>` and meta to CertForge

## Out of scope (later phases)

- Full lab content/exercises beyond outline stubs
- Payment integration (Pricing page is informational only)
- AI assistant integrations beyond placeholders

## Verification

- Build is green (`vite build`)
- Manual click-through of every route at desktop + mobile widths
- Logged-out and logged-in states render correctly
- Keyboard tab order through TopNav and SideNav
- Active nav highlight matches current route
- No duplicate or dead links

## Deliverable summary at the end

- List of routes shipped vs. stubs
- List of routes that still need real content
