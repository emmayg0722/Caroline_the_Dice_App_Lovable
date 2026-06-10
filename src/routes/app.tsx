import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PhoneShell } from "@/components/caroline/Dice";
import { BottomNav } from "@/components/caroline/BottomNav";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <PhoneShell>
      <div className="min-h-screen pb-28">
        <Outlet />
      </div>
      <BottomNav />
    </PhoneShell>
  );
}
