// Thin wrapper around RevenueCat. Safe to import on web:
// every native call is gated behind `isNative()` and a try/catch.
//
// Setup checklist (do this once, on your Mac after `npx cap add ios`):
//   1. Create an App Store Connect non-consumable IAP with product ID
//      `caroline_pro_lifetime` priced at $4.99.
//   2. In RevenueCat dashboard: create an Entitlement called `pro`,
//      attach the product, copy your iOS public SDK key.
//   3. Set VITE_REVENUECAT_IOS_KEY in your .env (or replace the literal below).
//   4. `bun run build && npx cap sync ios && npx cap open ios` then test on a
//      real device with a Sandbox Apple ID.

import { Capacitor } from "@capacitor/core";

export const PRO_PRODUCT_ID = "caroline_pro_lifetime";
export const PRO_ENTITLEMENT_ID = "pro";

const RC_IOS_KEY =
  (import.meta as any).env?.VITE_REVENUECAT_IOS_KEY ?? "";

function isNative() {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

let initPromise: Promise<void> | null = null;

async function ensureInit(): Promise<void> {
  if (!isNative()) return;
  if (initPromise) return initPromise;
  initPromise = (async () => {
    try {
      const { Purchases, LOG_LEVEL } = await import(
        "@revenuecat/purchases-capacitor"
      );
      await Purchases.setLogLevel({ level: LOG_LEVEL.WARN });
      if (RC_IOS_KEY) {
        await Purchases.configure({ apiKey: RC_IOS_KEY });
      }
    } catch (err) {
      console.warn("[iap] init failed", err);
    }
  })();
  return initPromise;
}

/** Returns true if the user owns the Pro entitlement. */
export async function checkProEntitlement(): Promise<boolean> {
  if (!isNative()) return false;
  await ensureInit();
  try {
    const { Purchases } = await import("@revenuecat/purchases-capacitor");
    const info = await Purchases.getCustomerInfo();
    return Boolean(info.customerInfo.entitlements.active[PRO_ENTITLEMENT_ID]);
  } catch (err) {
    console.warn("[iap] checkProEntitlement failed", err);
    return false;
  }
}

/** Launches the native purchase sheet. Resolves true if Pro is now active. */
export async function purchasePro(): Promise<boolean> {
  if (!isNative()) {
    throw new Error("In-app purchases are only available in the iOS app.");
  }
  await ensureInit();
  const { Purchases } = await import("@revenuecat/purchases-capacitor");
  const offerings = await Purchases.getOfferings();
  const current = offerings.current;
  const pkg =
    current?.availablePackages.find(
      (p) => p.product.identifier === PRO_PRODUCT_ID,
    ) ?? current?.availablePackages[0];
  if (!pkg) throw new Error("No Pro offering configured in RevenueCat.");
  const result = await Purchases.purchasePackage({ aPackage: pkg });
  return Boolean(
    result.customerInfo.entitlements.active[PRO_ENTITLEMENT_ID],
  );
}

/** Restores prior purchases (Apple requires a visible Restore button). */
export async function restorePurchases(): Promise<boolean> {
  if (!isNative()) {
    throw new Error("Restore is only available in the iOS app.");
  }
  await ensureInit();
  const { Purchases } = await import("@revenuecat/purchases-capacitor");
  const info = await Purchases.restorePurchases();
  return Boolean(info.customerInfo.entitlements.active[PRO_ENTITLEMENT_ID]);
}

export function isIapAvailable() {
  return isNative();
}
