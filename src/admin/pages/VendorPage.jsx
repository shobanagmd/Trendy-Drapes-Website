import { useNavigate } from "react-router-dom";
import { StatCard } from "@/admin/components/StatCard";
import { Button } from "@/components/ui/button";
import {
  Store, ShieldCheck, Clock, Star, Mail, Phone, MapPin,
  FileText, CheckCircle2, XCircle, AlertTriangle, Ban, Eye,
  UserCheck, Package, ShoppingCart, IndianRupee
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const vendor = {
  name: "ShopVault Store",
  owner: "Admin User",
  email: "admin@shopvault.com",
  phone: "+91 98765-43210",
  location: "Mumbai, MH",
  gst: "27AABCT1234F1Z5",
  pan: "AABCT1234F",
  bank: "Verified",
  products: 480,
  orders: 12400,
  revenue: "₹1.24Cr",
  rating: 4.7,
  onTime: 96,
  joinDate: "Jan 2024",
  status: "Active",
};

const monthlyPerformance = [
  { name: "Oct", onTime: 94, rating: 90 },
  { name: "Nov", onTime: 95, rating: 92 },
  { name: "Dec", onTime: 93, rating: 88 },
  { name: "Jan", onTime: 96, rating: 94 },
  { name: "Feb", onTime: 97, rating: 93 },
  { name: "Mar", onTime: 96, rating: 94 },
];

const statusStyle = {
  Active: "badge-success",
  "Pending KYC": "badge-warning",
  Suspended: "badge-danger",
};

export default function VendorPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-5">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Vendor Management</h1>
          <p className="page-subtitle">KYC verification, compliance, and store performance</p>
        </div>
        <span className={statusStyle[vendor.status]}>{vendor.status}</span>
      </div>

      {/* Store Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Products" value={String(vendor.products)} change="Active listings" changeType="positive" icon={Package} />
        <StatCard title="Total Orders" value={vendor.orders.toLocaleString()} change="+340 this month" changeType="positive" icon={ShoppingCart} />
        <StatCard title="On-Time Delivery" value={`${vendor.onTime}%`} change="Last 30 days" changeType="positive" icon={Clock} />
        <StatCard title="Revenue" value={vendor.revenue} change="+12% vs last month" changeType="positive" icon={IndianRupee} />
      </div>

      {/* Vendor Profile Card */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Store className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-card-foreground">{vendor.name}</h3>
              <p className="text-xs text-muted-foreground">Owner: {vendor.owner} · Since {vendor.joinDate}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="text-xs"><Eye className="h-3 w-3 mr-1" />Edit Profile</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="space-y-1.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5"><Mail className="h-3 w-3" />{vendor.email}</div>
            <div className="flex items-center gap-1.5"><Phone className="h-3 w-3" />{vendor.phone}</div>
            <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3" />{vendor.location}</div>
          </div>

          {/* KYC Status */}
          <div className="space-y-1.5 text-xs">
            <div className={`flex items-center gap-1.5 ${vendor.gst === "Pending" ? "text-warning" : "text-success"}`}>
              <ShieldCheck className="h-3 w-3" />GST: {vendor.gst === "Pending" ? "Pending" : "Verified"}
            </div>
            <div className={`flex items-center gap-1.5 ${vendor.pan === "Submitted" ? "text-warning" : "text-success"}`}>
              <FileText className="h-3 w-3" />PAN: {vendor.pan === "Submitted" ? "Submitted" : "Verified"}
            </div>
            <div className={`flex items-center gap-1.5 ${vendor.bank === "Pending" ? "text-warning" : "text-success"}`}>
              <CheckCircle2 className="h-3 w-3" />Bank: {vendor.bank}
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`h-4 w-4 ${i < Math.floor(vendor.rating) ? "text-warning fill-warning" : "text-border"}`} />
            ))}
            <span className="text-sm font-medium text-card-foreground ml-1">{vendor.rating}</span>
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="chart-card">
        <h3 className="chart-title">Monthly Performance</h3>
        <p className="chart-subtitle mb-3">On-time delivery rate & satisfaction score</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthlyPerformance} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(220, 9%, 46%)" />
            <YAxis tick={{ fontSize: 11 }} stroke="hsl(220, 9%, 46%)" domain={[0, 100]} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Bar dataKey="onTime" name="On-Time %" fill="hsl(25, 95%, 53%)" radius={[3, 3, 0, 0]} />
            <Bar dataKey="rating" name="Rating Score" fill="hsl(210, 92%, 55%)" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Management Workflow */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-card-foreground">Onboarding & KYC</h3>
          </div>
          <div className="space-y-2">
            {[
              { label: "Document Upload Review", desc: "Verify uploaded business documents", icon: FileText, path: "/vendor/document-review" },
              { label: "GST / PAN Verification", desc: "Validate tax registration details", icon: ShieldCheck, path: "/vendor/gst-pan-verification" },
              { label: "Bank Account Check", desc: "Confirm bank details for payouts", icon: CheckCircle2, path: "/vendor/bank-account-check" },
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
              { label: "Approve → Activate Account", desc: "Vendor gets full marketplace access", icon: CheckCircle2, cls: "text-success", path: "/vendor/approve" },
              { label: "Reject → Send Reason", desc: "Notify vendor with rejection details", icon: XCircle, cls: "text-destructive", path: "/vendor/reject" },
              { label: "Request More Docs", desc: "Ask for additional verification", icon: FileText, cls: "text-warning", path: "/vendor/request-docs" },
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
              { label: "Temporary Suspension", desc: "Pause vendor activities temporarily", icon: AlertTriangle, cls: "text-warning", path: "/vendor/temporary-suspension" },
              { label: "Permanent Ban", desc: "Remove vendor from marketplace", icon: Ban, cls: "text-destructive", path: "/vendor/permanent-ban" },
              { label: "Notify Vendor", desc: "Send suspension/ban notification", icon: Mail, cls: "text-info", path: "/vendor/notify" },
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
    </div>
  );
}
