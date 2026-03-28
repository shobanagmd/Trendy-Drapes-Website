import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Shield, Bell, Lock, Store, Search } from "lucide-react";

const sections = [
  {
    icon: Bell, title: "Notifications",
    desc: "Configure alert preferences",
    items: [
      { label: "New order alerts", desc: "Get notified for every new order placed", on: true },
      { label: "Low stock warnings", desc: "Alert when product stock drops below threshold", on: true },
      { label: "Seller registration alerts", desc: "Notifications for new seller sign-ups", on: true },
      { label: "Return/refund requests", desc: "Get notified of customer return requests", on: false },
    ],
  },
  {
    icon: Shield, title: "Security",
    desc: "Account security settings",
    items: [
      { label: "Two-factor authentication", desc: "Extra security for admin accounts", on: true },
      { label: "Login activity alerts", desc: "Get notified of new login attempts", on: true },
      { label: "Auto-session timeout", desc: "Auto-logout after 30 min inactivity", on: false },
    ],
  },
  {
    icon: Store, title: "Marketplace",
    desc: "Platform-level preferences",
    items: [
      { label: "Auto-approve verified sellers", desc: "Skip manual approval for GST-verified sellers", on: false },
      { label: "Enable COD orders", desc: "Allow cash on delivery payment method", on: true },
      { label: "Commission auto-deduction", desc: "Automatically deduct commission from seller payouts", on: true },
    ],
  },
];

export default function SettingsPage() {
  const [search, setSearch] = useState("");
  const filteredSections = sections.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.items.some((item) =>
        item.label.toLowerCase().includes(search.toLowerCase())
      )
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Application preferences and system configurations</p>
        <div className="relative max-w-sm mt-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search settings..."
            className="pl-9 bg-secondary border-none text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-5">
        {filteredSections.map((s) => (
          <div key={s.title} className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-lg bg-secondary p-2"><s.icon className="h-4 w-4 text-primary" /></div>
              <div><h3 className="text-sm font-semibold text-card-foreground">{s.title}</h3><p className="text-xs text-muted-foreground">{s.desc}</p></div>
            </div>
            <div className="space-y-3">
              {s.items.map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-3">
                  <div><p className="text-xs font-medium text-card-foreground">{item.label}</p><p className="text-[11px] text-muted-foreground">{item.desc}</p></div>
                  <Switch defaultChecked={item.on} />
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-lg bg-secondary p-2"><Lock className="h-4 w-4 text-primary" /></div>
            <div><h3 className="text-sm font-semibold text-card-foreground">Change Password</h3><p className="text-xs text-muted-foreground">Update admin password</p></div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div><label className="text-xs font-medium text-card-foreground block mb-1">Current</label><Input type="password" placeholder="••••••••" className="bg-secondary border-none text-sm" /></div>
            <div><label className="text-xs font-medium text-card-foreground block mb-1">New</label><Input type="password" placeholder="••••••••" className="bg-secondary border-none text-sm" /></div>
            <div><label className="text-xs font-medium text-card-foreground block mb-1">Confirm</label><Input type="password" placeholder="••••••••" className="bg-secondary border-none text-sm" /></div>
          </div>
          <Button className="mt-4" size="sm">Update Password</Button>
        </div>
      </div>
    </div>
  );
}
