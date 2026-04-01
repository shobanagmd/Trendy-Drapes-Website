import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Package, ShoppingCart, IndianRupee, FileBarChart,
  UserCircle, Settings, HeadphonesIcon, ChevronLeft, ChevronRight, Store, X, CreditCard, RotateCcw
} from "lucide-react";
import { cn } from "@/lib/utils";

const mainNav = [
  { title: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { title: "Products", path: "/admin/products", icon: Package },
  { title: "Orders", path: "/admin/orders", icon: ShoppingCart },
  { title: "Payments", path: "/admin/payments", icon: CreditCard },
  { title: "Returns", path: "/admin/returns", icon: RotateCcw },
];

const analyticsNav = [
  { title: "Finance", path: "/admin/finance", icon: IndianRupee },
  { title: "Sales Reports", path: "/admin/reports", icon: FileBarChart },
];

const systemNav = [
  { title: "Profile", path: "/admin/profile", icon: UserCircle },
  { title: "Support", path: "/admin/support", icon: HeadphonesIcon },
  { title: "Settings", path: "/admin/settings", icon: Settings },
];

function NavSection({ label, items, collapsed, onNavClick }) {
  const location = useLocation();
  return (
    <div className="mb-2">
      {!collapsed && (
        <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/50">
          {label}
        </p>
      )}
      <div className="space-y-0.5">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/admin"}
              onClick={onNavClick}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}

export function DashboardSidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={onMobileClose} />
      )}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen flex-col bg-sidebar transition-all duration-300",
          "lg:translate-x-0",
          collapsed ? "lg:w-[64px]" : "lg:w-[230px]",
          mobileOpen ? "translate-x-0 w-[230px]" : "-translate-x-full w-[230px] lg:translate-x-0"
        )}
      >
        <div className="flex h-14 items-center gap-2.5 border-b border-sidebar-border px-3.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Store className="h-4 w-4" />
          </div>
          {(!collapsed || mobileOpen) && (
            <div className="min-w-0 flex-1">
              <span className="block text-sm font-bold text-sidebar-accent-foreground truncate">Trendy Drapes</span>
              <span className="block text-[10px] text-sidebar-foreground/60 leading-none">Admin Panel</span>
            </div>
          )}
          <button onClick={onMobileClose} className="lg:hidden p-1 text-sidebar-foreground hover:bg-sidebar-accent rounded">
            <X className="h-4 w-4" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
          <NavSection label="Main" items={mainNav} collapsed={collapsed && !mobileOpen} onNavClick={onMobileClose} />
          {(!collapsed || mobileOpen) && <div className="my-2 border-t border-sidebar-border" />}
          <NavSection label="Analytics" items={analyticsNav} collapsed={collapsed && !mobileOpen} onNavClick={onMobileClose} />
          {(!collapsed || mobileOpen) && <div className="my-2 border-t border-sidebar-border" />}
          <NavSection label="System" items={systemNav} collapsed={collapsed && !mobileOpen} onNavClick={onMobileClose} />
        </nav>
        <div className="hidden lg:block border-t border-sidebar-border p-2">
          <button
            onClick={onToggle}
            className="flex w-full items-center justify-center rounded-lg p-2 text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      </aside>
    </>
  );
}
