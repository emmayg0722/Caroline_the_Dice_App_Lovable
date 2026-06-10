import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { PhoneShell } from "@/components/caroline/Dice";
import { BottomNav } from "@/components/caroline/BottomNav";
import { useCarolineStore } from "@/lib/caroline-store";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  const { theme } = useCarolineStore();
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("theme-dark", theme === "dark");
  }, [theme]);
  return (
    <PhoneShell>
      <div className="min-h-screen pb-24">
        <Outlet />
      </div>
      <BottomNav />
    </PhoneShell>
  );
}
