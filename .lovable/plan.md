

# Project Recovery Required

## Problem
The project filesystem is missing the vast majority of its source files. What should be a project with 70+ pages, dozens of UI components, hooks, utilities, and data files currently contains only **~10 source files**:

**What exists:**
- `src/components/ui/sidebar.tsx`
- `src/components/ccna/WeakAreasPractice.tsx`
- `src/components/marketing/AnimatedCounter.tsx`, `DemoTerminal.tsx`, `SiteFooter.tsx`, `SiteHeader.tsx`
- `src/components/smart-netmonitor/SNMPredictiveMonitoring.tsx`
- `src/contexts/SubscriptionContext.tsx`
- `src/integrations/supabase/client.ts`
- 7 page files (out of 70+)

**What is missing (partial list):**
- `src/main.tsx`, `src/App.tsx` — the app entry points
- All UI primitives: `button.tsx`, `card.tsx`, `badge.tsx`, `input.tsx`, `dialog.tsx`, `select.tsx`, `tabs.tsx`, `progress.tsx`, `label.tsx`, `separator.tsx`, `skeleton.tsx`, `tooltip.tsx`, `sheet.tsx`, `table.tsx`
- All hooks: `useAuth.ts`, `useToolPage.ts`, `useCCNAProgress.ts`, `use-mobile.ts`, `use-toast.ts`, `useSmartNetMonitor.ts`, `useANMPolling.ts`, `useSensorScheduling.ts`
- All lib utilities: `utils.ts`, `subnetUtils.ts`, `ciscoConfigParser.ts`, `exportUtils.ts`
- All data files: `ccnaData.ts`, `seoData.ts`, `toolsData.ts`
- All NextGen components, atlas components, notification components
- 60+ page files including `CiscoSwitchMigration.tsx`, `Dashboard.tsx`, `LandingPage.tsx`, etc.
- `src/index.css`

## Root Cause
This appears to be a GitHub sync issue or file system corruption. The remaining files are ones recently shown in the conversation context, but the bulk of the codebase is gone.

## Recovery Plan

### Option A: Restore from GitHub (Recommended)
If the GitHub repository still has all the files, the project can be restored by re-syncing. Check the GitHub repo to verify the files are there.

### Option B: Restore from a previous version
Use the version history in Lovable (Settings > Version History) to roll back to a point before the files were lost.

### Option C: Rebuild
If neither GitHub nor version history has the files, we would need to recreate everything from scratch — this would be a massive effort given the scale of the project.

## Recommended Next Step
1. Check your GitHub repository to see if all files are intact there
2. If yes, try disconnecting and reconnecting GitHub, or restoring from version history
3. Once the codebase is restored, we can proceed with testing the Cisco Switch Migration Tool

I cannot test the migration tool or fix the build errors because the tool's page file (`CiscoSwitchMigration.tsx`), its parser (`ciscoConfigParser.ts`), and virtually all dependencies simply do not exist in the current filesystem.

