import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { StatCard } from "@/admin/components/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, Plus, Store, UserCheck, UserX, ShieldCheck, Clock,
  Star, Mail, Phone, MapPin, FileText, CheckCircle2, XCircle,
  AlertTriangle, Ban, Eye
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const sellers = [
  { id: 1, name: "TechZone Electronics", owner: "Rajesh Mehta", email: "rajesh@techzone.com", phone: "+91 98765-43210", location: "Mumbai, MH", gst: "27AABCT1234F1Z5", pan: "AABCT1234F", bank: "Verified", products: 480, orders: 12400, revenue: "$1.24M", rating: 4.7, onTime: 96, joinDate: "Jan 2024", status: "Active" },
  { id: 2, name: "FashionHub India", owner: "Priya Sharma", email: "priya@fashionhub.com", phone: "+91 87654-32109", location: "Delhi, DL", gst: "07AABCF5678G1Z3", pan: "AABCF5678G", bank: "Verified", products: 1250, orders: 18600, revenue: "$892K", rating: 4.5, onTime: 93, joinDate: "Mar 2024", status: "Active" },
  { id: 3, name: "GadgetWorld", owner: "Amit Patel", email: "amit@gadgetworld.in", phone: "+91 76543-21098", location: "Bangalore, KA", gst: "29AABCG9012H1Z1", pan: "AABCG9012H", bank: "Verified", products: 320, orders: 8400, revenue: "$680K", rating: 4.8, onTime: 98, joinDate: "Jun 2024", status: "Active" },
  { id: 4, name: "BeautyFirst Co.", owner: "Sneha Reddy", email: "sneha@beautyfirst.com", phone: "+91 65432-10987", location: "Hyderabad, TS", gst: "36AABCB3456I1Z9", pan: "AABCB3456I", bank: "Verified", products: 890, orders: 15200, revenue: "$456K", rating: 4.3, onTime: 91, joinDate: "Aug 2024", status: "Active" },
  { id: 5, name: "StyleMart", owner: "Karan Singh", email: "karan@stylemart.in", phone: "+91 54321-09876", location: "Pune, MH", gst: "Pending", pan: "Submitted", bank: "Pending", products: 0, orders: 0, revenue: "$0", rating: 0, onTime: 0, joinDate: "Mar 2026", status: "Pending KYC" },
  { id: 6, name: "QuickBuy Store", owner: "Deepak Gupta", email: "deepak@quickbuy.com", phone: "+91 43210-98765", location: "Chennai, TN", gst: "33AABCQ7890J1Z7", pan: "AABCQ7890J", bank: "Verified", products: 150, orders: 2800, revenue: "$124K", rating: 3.2, onTime: 72, joinDate: "Nov 2025", status: "Suspended" },
];

const performanceData = sellers.filter(s => s.status === "Active").map(s => ({
  name: s.name.split(" ")[0], onTime: s.onTime, rating: s.rating * 20
}));

const statusStyle = {
  Active: "badge-success", "Pending KYC": "badge-warning", Suspended: "badge-danger", Banned: "badge-neutral",
};

export default function SellersPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const filtered = sellers.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    if (tab === "all") return matchSearch;
    if (tab === "active") return matchSearch && s.status === "Active";
    if (tab === "pending") return matchSearch && s.status === "Pending KYC";
    if (tab === "suspended") return matchSearch && (s.status === "Suspended" || s.status === "Banned");
    return matchSearch;
  });

  return (
    <div className="space-y-5">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Seller Management</h1>
          <p className="page-subtitle">Onboarding, KYC verification, approval, and seller performance tracking</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Add Seller</Button>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Sellers" value="342" change="+18 this month" changeType="positive" icon={Store} />
        <StatCard title="Active Sellers" value="298" change="87% of total" changeType="positive" icon={UserCheck} />
        <StatCard title="Pending KYC" value="26" change="Awaiting verification" changeType="neutral" icon={Clock} />
        <StatCard title="Suspended" value="18" change="Policy violations" changeType="negative" icon={UserX} />
      </div>

      {/* Seller Performance Chart */}
      <div className="chart-card">
        <h3 className="chart-title">Active Seller Performance</h3>
        <p className="chart-subtitle mb-3">On-time delivery rate & satisfaction score</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={performanceData} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(220, 9%, 46%)" />
            <YAxis tick={{ fontSize: 11 }} stroke="hsl(220, 9%, 46%)" domain={[0, 100]} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Bar dataKey="onTime" name="On-Time %" fill="hsl(25, 95%, 53%)" radius={[3, 3, 0, 0]} />
            <Bar dataKey="rating" name="Rating Score" fill="hsl(210, 92%, 55%)" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Seller Management Workflow */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-card-foreground">Onboarding & KYC</h3>
          </div>
          <div className="space-y-2">
            {[
              { label: "Document Upload Review", desc: "Verify uploaded business documents", icon: FileText, path: "/sellers/document-review" },
              { label: "GST / PAN Verification", desc: "Validate tax registration details", icon: ShieldCheck, path: "/sellers/gst-pan-verification" },
              { label: "Bank Account Check", desc: "Confirm bank details for payouts", icon: CheckCircle2, path: "/sellers/bank-account-check" },
            ].map((item) => (
              <div key={item.label} onClick={() => navigate(item.path)} className="flex items-start gap-2.5 rounded-lg bg-secondary/50 p-3 cursor-pointer hover:bg-secondary/80 transition-colors">
                <item.icon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-card-foreground">{item.label}</p>
                  <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <UserCheck className="h-4 w-4 text-success" />
            <h3 className="text-sm font-semibold text-card-foreground">Approve / Reject</h3>
          </div>
          <div className="space-y-2">
            {[
              { label: "Approve → Activate Account", desc: "Seller gets full marketplace access", icon: CheckCircle2, cls: "text-success", path: "/sellers/approve" },
              { label: "Reject → Send Reason", desc: "Notify seller with rejection details", icon: XCircle, cls: "text-destructive", path: "/sellers/reject" },
              { label: "Request More Docs", desc: "Ask for additional verification", icon: FileText, cls: "text-warning", path: "/sellers/request-docs" },
            ].map((item) => (
              <div key={item.label} onClick={() => navigate(item.path)} className="flex items-start gap-2.5 rounded-lg bg-secondary/50 p-3 cursor-pointer hover:bg-secondary/80 transition-colors">
                <item.icon className={`h-4 w-4 mt-0.5 shrink-0 ${item.cls}`} />
                <div>
                  <p className="text-xs font-medium text-card-foreground">{item.label}</p>
                  <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Ban className="h-4 w-4 text-destructive" />
            <h3 className="text-sm font-semibold text-card-foreground">Suspend / Ban</h3>
          </div>
          <div className="space-y-2">
            {[
              { label: "Temporary Suspension", desc: "Pause seller activities temporarily", icon: AlertTriangle, cls: "text-warning", path: "/sellers/temporary-suspension" },
              { label: "Permanent Ban", desc: "Remove seller from marketplace", icon: Ban, cls: "text-destructive", path: "/sellers/permanent-ban" },
              { label: "Notify Seller", desc: "Send suspension/ban notification", icon: Mail, cls: "text-info", path: "/sellers/notify" },
            ].map((item) => (
              <div key={item.label} onClick={() => navigate(item.path)} className="flex items-start gap-2.5 rounded-lg bg-secondary/50 p-3 cursor-pointer hover:bg-secondary/80 transition-colors">
                <item.icon className={`h-4 w-4 mt-0.5 shrink-0 ${item.cls}`} />
                <div>
                  <p className="text-xs font-medium text-card-foreground">{item.label}</p>
                  <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search sellers..." className="pl-9 bg-card" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {[
          { key: "all", label: "All Sellers" },
          { key: "active", label: "Active" },
          { key: "pending", label: "Pending KYC" },
          { key: "suspended", label: "Suspended" },
        ].map((f) => (
          <Button key={f.key} variant={tab === f.key ? "default" : "outline"} size="sm" className="text-xs" onClick={() => setTab(f.key)}>{f.label}</Button>
        ))}
      </div>

      {/* Seller Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((s) => (
          <div key={s.id} className="rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-card-foreground text-sm">{s.name}</h3>
                <p className="text-xs text-muted-foreground">Owner: {s.owner}</p>
              </div>
              <span className={statusStyle[s.status]}>{s.status}</span>
            </div>
            <div className="space-y-1.5 mb-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5"><Mail className="h-3 w-3" />{s.email}</div>
              <div className="flex items-center gap-1.5"><Phone className="h-3 w-3" />{s.phone}</div>
              <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3" />{s.location}</div>
            </div>

            {/* KYC Status */}
            <div className="flex items-center gap-2 mb-3 text-[10px]">
              <span className={`flex items-center gap-1 ${s.gst === "Pending" ? "text-warning" : "text-success"}`}>
                <ShieldCheck className="h-3 w-3" />GST: {s.gst === "Pending" ? "Pending" : "Verified"}
              </span>
              <span className={`flex items-center gap-1 ${s.pan === "Submitted" ? "text-warning" : "text-success"}`}>
                <FileText className="h-3 w-3" />PAN: {s.pan === "Submitted" ? "Submitted" : "Verified"}
              </span>
              <span className={`flex items-center gap-1 ${s.bank === "Pending" ? "text-warning" : "text-success"}`}>
                <CheckCircle2 className="h-3 w-3" />Bank: {s.bank}
              </span>
            </div>

            {s.rating > 0 && (
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-3.5 w-3.5 ${i < Math.floor(s.rating) ? "text-warning fill-warning" : "text-border"}`} />
                ))}
                <span className="text-xs font-medium text-card-foreground ml-1">{s.rating}</span>
              </div>
            )}

            <div className="grid grid-cols-4 gap-2 pt-3 border-t text-center">
              <div>
                <p className="text-sm font-bold text-card-foreground">{s.products}</p>
                <p className="text-[10px] text-muted-foreground">Products</p>
              </div>
              <div>
                <p className="text-sm font-bold text-card-foreground">{s.orders.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">Orders</p>
              </div>
              <div>
                <p className="text-sm font-bold text-card-foreground">{s.onTime > 0 ? `${s.onTime}%` : "—"}</p>
                <p className="text-[10px] text-muted-foreground">On-Time</p>
              </div>
              <div>
                <p className="text-sm font-bold text-card-foreground">{s.revenue}</p>
                <p className="text-[10px] text-muted-foreground">Revenue</p>
              </div>
            </div>

            <div className="flex gap-2 mt-3 pt-3 border-t">
              <Button variant="outline" size="sm" className="flex-1 text-xs h-7"><Eye className="h-3 w-3 mr-1" />View</Button>
              {s.status === "Pending KYC" && (
                <>
                  <Button size="sm" className="flex-1 text-xs h-7"><CheckCircle2 className="h-3 w-3 mr-1" />Approve</Button>
                  <Button variant="destructive" size="sm" className="flex-1 text-xs h-7"><XCircle className="h-3 w-3 mr-1" />Reject</Button>
                </>
              )}
              {s.status === "Active" && (
                <Button variant="outline" size="sm" className="flex-1 text-xs h-7 text-destructive border-destructive/30 hover:bg-destructive/10"><AlertTriangle className="h-3 w-3 mr-1" />Suspend</Button>
              )}
              {s.status === "Suspended" && (
                <Button size="sm" className="flex-1 text-xs h-7"><UserCheck className="h-3 w-3 mr-1" />Reactivate</Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
