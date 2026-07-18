import { useEffect, useState } from "react";

// Simulator entitlement is currently client-side (localStorage).
// v2: replace with a `simulator_entitlements` table + edge function that flips the flag after Stripe checkout.
const KEY = "certforge:simulator:entitlement:v1";

export function useSimulatorEntitlement() {
  const [unlocked, setUnlocked] = useState<boolean>(() => {
    try { return window.localStorage.getItem(KEY) === "1"; } catch { return false; }
  });
  useEffect(() => {
    try { window.localStorage.setItem(KEY, unlocked ? "1" : "0"); } catch { /* ignore */ }
  }, [unlocked]);
  return { unlocked, unlock: () => setUnlocked(true), lock: () => setUnlocked(false) };
}
