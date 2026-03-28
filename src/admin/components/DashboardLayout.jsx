import { useState } from "react";
import { Outlet } from "react-router-dom";
import { DashboardSidebar } from "@/admin/components/DashboardSidebar";
import { DashboardHeader } from "@/admin/components/DashboardHeader";
import { cn } from "@/lib/utils";

export function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div
        className={cn(
          "flex flex-col min-h-screen transition-all duration-300",
          collapsed ? "lg:ml-[64px]" : "lg:ml-[230px]",
          "ml-0"
        )}
      >
        <DashboardHeader onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 lg:p-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
