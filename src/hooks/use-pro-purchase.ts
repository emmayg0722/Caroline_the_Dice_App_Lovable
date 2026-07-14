// Shared buy / restore / redeem flow for the Pro tab and Settings → Premium.
// On web (no native IAP) "buy" mocks the unlock so the app stays testable.

import { useState } from "react";
import { useCarolineStore } from "@/lib/caroline-store";

export function useProPurchase() {
  const { pro, setPro } = useCarolineStore();
  const [busy, setBusy] = useState<"buy" | "restore" | "redeem" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function buy() {
    setError(null);
    const { isIapAvailable, purchasePro } = await import("@/lib/iap");
    if (!isIapAvailable()) {
      // Web/preview: mock the unlock so the rest of the app is testable.
      setPro(!pro);
      return;
    }
    try {
      setBusy("buy");
      const ok = await purchasePro();
      if (ok) setPro(true);
    } catch (e: any) {
      if (e?.userCancelled) return;
      setError(e?.message ?? "Purchase failed. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  async function restore() {
    setError(null);
    const { isIapAvailable, restorePurchases } = await import("@/lib/iap");
    if (!isIapAvailable()) {
      setError("Restore is only available in the iOS app.");
      return;
    }
    try {
      setBusy("restore");
      const ok = await restorePurchases();
      setPro(ok);
      if (!ok) setError("No previous purchase found on this Apple ID.");
    } catch (e: any) {
      setError(e?.message ?? "Restore failed.");
    } finally {
      setBusy(null);
    }
  }

  async function redeem() {
    setError(null);
    const { isIapAvailable, redeemProCode } = await import("@/lib/iap");
    if (!isIapAvailable()) {
      setError("Redeeming codes is only available in the iOS app.");
      return;
    }
    try {
      setBusy("redeem");
      await redeemProCode();
    } catch (e: any) {
      setError(e?.message ?? "Could not open the redeem sheet.");
    } finally {
      setBusy(null);
    }
  }

  return { pro, busy, error, buy, restore, redeem };
}
