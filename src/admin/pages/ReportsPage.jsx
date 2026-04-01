import { useState } from "react";
import { StatCard } from "@/admin/components/StatCard";
import {
  FileBarChart, TrendingUp, ShoppingCart, Users, Search,
  Download, FileText, X, IndianRupee,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

/* ─── chart data ───────────────────────────────────────────────── */
const monthlySales = [
  { month: "Jul", orders: 3200,  revenue: 485000 },
  { month: "Aug", orders: 3580,  revenue: 510000 },
  { month: "Sep", orders: 3400,  revenue: 495000 },
  { month: "Oct", orders: 3760,  revenue: 548000 },
  { month: "Nov", orders: 4520,  revenue: 675000 },
  { month: "Dec", orders: 5800,  revenue: 802000 },
  { month: "Jan", orders: 3980,  revenue: 568000 },
  { month: "Feb", orders: 4200,  revenue: 595000 },
  { month: "Mar", orders: 5100,  revenue: 735000 },
];

const sellerSales = [
  { seller: "TechZone",       jan: 82000,  feb: 91000,  mar: 124000 },
  { seller: "FashionHub",     jan: 68000,  feb: 74000,  mar: 89000  },
  { seller: "GadgetWorld",    jan: 52000,  feb: 58000,  mar: 68000  },
  { seller: "BeautyFirst",    jan: 38000,  feb: 42000,  mar: 46000  },
  { seller: "FitGear",        jan: 22000,  feb: 28000,  mar: 32000  },
];

const topProducts = [
  { item: "Wireless Earbuds Pro",  seller: "TechZone",    qty: "2,840", value: "₹1,42,000", growth: "+18%" },
  { item: "Cotton Kurta Set",      seller: "FashionHub",  qty: "3,200", value: "₹1,28,000", growth: "+24%" },
  { item: "Smart Watch X200",      seller: "GadgetWorld", qty: "1,850", value: "₹1,85,000", growth: "+12%" },
  { item: "Premium Face Serum",    seller: "BeautyFirst", qty: "4,100", value: "₹82,000",   growth: "+8%"  },
  { item: "Yoga Mat Premium",      seller: "FitGear",     qty: "1,560", value: "₹46,800",   growth: "+15%" },
  { item: "Running Shoes Air Max", seller: "ShoePalace",  qty: "2,100", value: "₹1,25,900", growth: "+22%" },
];

/* ─── report row data ───────────────────────────────────────────── */
const REPORT_ROWS = [
  { orderId: "ORD-78451", product: "Wireless Earbuds Pro",  qty: 2, revenue: "₹4,980", discount: "₹498",  payment: "UPI",    status: "Paid",    gst: "₹747" },
  { orderId: "ORD-78450", product: "Cotton Kurta Set",       qty: 1, revenue: "₹2,500", discount: "₹250",  payment: "Card",   status: "Paid",    gst: "₹375" },
  { orderId: "ORD-78449", product: "Smart Watch X200",       qty: 3, revenue: "₹7,200", discount: "₹720",  payment: "COD",    status: "Pending", gst: "₹1,080" },
  { orderId: "ORD-78448", product: "Premium Face Serum",     qty: 2, revenue: "₹1,800", discount: "₹180",  payment: "UPI",    status: "Paid",    gst: "₹270" },
  { orderId: "ORD-78447", product: "Yoga Mat Premium",       qty: 1, revenue: "₹1,200", discount: "₹120",  payment: "Card",   status: "Refunded","gst": "₹0"  },
  { orderId: "ORD-78446", product: "Running Shoes Air Max",  qty: 2, revenue: "₹5,800", discount: "₹580",  payment: "Wallet", status: "Paid",    gst: "₹870" },
  { orderId: "ORD-78445", product: "Bluetooth Speaker V3",   qty: 1, revenue: "₹3,499", discount: "₹350",  payment: "UPI",    status: "Paid",    gst: "₹525" },
  { orderId: "ORD-78444", product: "Protein Powder XL",      qty: 4, revenue: "₹9,600", discount: "₹960",  payment: "Card",   status: "Paid",    gst: "₹1,440" },
];

/* Report configs — what rows are shown per period */
const REPORT_CONFIGS = {
  daily:   { label: "Daily Report",   subtitle: "Today — Apr 1, 2026",    rows: REPORT_ROWS.slice(0, 3) },
  weekly:  { label: "Weekly Report",  subtitle: "Mar 25 – Apr 1, 2026",   rows: REPORT_ROWS.slice(0, 5) },
  monthly: { label: "Monthly Report", subtitle: "March 2026",             rows: REPORT_ROWS.slice(0, 7) },
  yearly:  { label: "Yearly Report",  subtitle: "Financial Year 2025–26", rows: REPORT_ROWS },
  gst:     { label: "GST Invoice Report", subtitle: "April 2026",         rows: REPORT_ROWS },
};

/* ─── CSV download helper ───────────────────────────────────────── */
function downloadCSV(rows, filename) {
  const headers = ["Order ID", "Product", "Qty", "Revenue", "Discount", "Payment", "Status", "GST"];
  const lines = [
    headers.join(","),
    ...rows.map(r =>
      [r.orderId, `"${r.product}"`, r.qty, r.revenue, r.discount, r.payment, r.status, r.gst].join(",")
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* ─── Report Modal ──────────────────────────────────────────────── */
function ReportModal({ type, onClose }) {
  const config = REPORT_CONFIGS[type];
  if (!config) return null;
  const rows = config.rows;

  const totalRevenue  = rows.reduce((s, r) => s + parseInt(r.revenue.replace(/[^0-9]/g, ""), 10), 0);
  const totalDiscount = rows.reduce((s, r) => s + parseInt(r.discount.replace(/[^0-9]/g, ""), 10), 0);
  const totalGST      = rows.reduce((s, r) => s + parseInt(r.gst.replace(/[^0-9]/g, ""), 10), 0);
  const paidCount     = rows.filter(r => r.status === "Paid").length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b bg-card z-10">
          <div>
            <h2 className="text-lg font-bold text-card-foreground">{config.label}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{config.subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="gap-1.5 h-8 text-xs font-semibold"
              onClick={() => downloadCSV(rows, `${type}-report.csv`)}
            >
              <Download className="h-3.5 w-3.5" /> Download CSV
            </Button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-secondary rounded-md transition-colors text-muted-foreground ml-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total Orders",   value: rows.length       },
              { label: "Total Revenue",  value: `₹${totalRevenue.toLocaleString("en-IN")}` },
              { label: "Total Discounts",value: `₹${totalDiscount.toLocaleString("en-IN")}` },
              { label: "GST Collected",  value: `₹${totalGST.toLocaleString("en-IN")}` },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-lg bg-secondary/40 p-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">{label}</p>
                <p className="text-sm font-bold text-card-foreground mt-0.5">{value}</p>
              </div>
            ))}
          </div>

          {/* Payment Status breakdown */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-success" />
              Paid: <strong className="text-card-foreground ml-1">{paidCount}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-warning" />
              Pending/Other: <strong className="text-card-foreground ml-1">{rows.length - paidCount}</strong>
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-xs">
              <thead className="bg-secondary/50 border-b">
                <tr>
                  {["Order ID", "Product", "Qty", "Revenue", "Discount", "Payment", "Status", ...(type === "gst" ? ["GST"] : [])].map(h => (
                    <th key={h} className="px-3 py-2.5 text-left font-semibold text-muted-foreground uppercase tracking-wide text-[10px]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((r) => (
                  <tr key={r.orderId} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-3 py-2.5 font-medium text-card-foreground font-mono text-[11px]">{r.orderId}</td>
                    <td className="px-3 py-2.5 text-card-foreground">{r.product}</td>
                    <td className="px-3 py-2.5 text-muted-foreground text-center">{r.qty}</td>
                    <td className="px-3 py-2.5 font-semibold text-card-foreground">{r.revenue}</td>
                    <td className="px-3 py-2.5 text-success font-medium">{r.discount}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{r.payment}</td>
                    <td className="px-3 py-2.5">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                        r.status === "Paid"     ? "bg-success/10 text-success"
                        : r.status === "Pending" ? "bg-warning/10 text-warning"
                        : "bg-destructive/10 text-destructive"
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    {type === "gst" && (
                      <td className="px-3 py-2.5 font-medium text-card-foreground">{r.gst}</td>
                    )}
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-secondary/30 border-t">
                <tr>
                  <td className="px-3 py-2.5 font-bold text-card-foreground text-[11px]" colSpan={3}>Totals</td>
                  <td className="px-3 py-2.5 font-bold text-card-foreground">₹{totalRevenue.toLocaleString("en-IN")}</td>
                  <td className="px-3 py-2.5 font-bold text-success">₹{totalDiscount.toLocaleString("en-IN")}</td>
                  <td colSpan={type === "gst" ? 1 : 2} />
                  {type === "gst" && <td className="px-3 py-2.5 font-bold text-card-foreground">₹{totalGST.toLocaleString("en-IN")}</td>}
                  {type !== "gst" && <td />}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────── */
export default function ReportsPage() {
  const [search, setSearch]         = useState("");
  const [activeReport, setActiveReport] = useState(null);

  const filteredProducts = topProducts.filter(
    (p) =>
      p.item.toLowerCase().includes(search.toLowerCase()) ||
      p.seller.toLowerCase().includes(search.toLowerCase())
  );

  const REPORT_BTNS = [
    { key: "daily",   label: "Daily Report",   variant: "outline" },
    { key: "weekly",  label: "Weekly Report",  variant: "outline" },
    { key: "monthly", label: "Monthly Report", variant: "outline" },
    { key: "yearly",  label: "Yearly Report",  variant: "outline" },
    { key: "gst",     label: "GST Invoice",    variant: "default" },
  ];

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="page-header flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Sales Reports</h1>
          <p className="page-subtitle">Comprehensive sales analytics, seller comparisons, and downloadable reports</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {REPORT_BTNS.map(({ key, label, variant }) => (
            <Button
              key={key}
              variant={variant}
              size="sm"
              className="gap-1.5 h-8 text-xs font-semibold whitespace-nowrap"
              onClick={() => setActiveReport(key)}
            >
              {key === "gst" ? <FileText className="h-3.5 w-3.5" /> : <Download className="h-3.5 w-3.5" />}
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Sales (Q1)"   value="₹1.90Cr" change="+16.4% vs Q4"        changeType="positive" icon={TrendingUp} />
        <StatCard title="Total Orders"       value="13,280"  change="+11.2% vs Q4"         changeType="positive" icon={ShoppingCart} />
        <StatCard title="Avg. Order Value"   value="₹1,430"  change="+4.7% improvement"    changeType="positive" icon={FileBarChart} />
        <StatCard title="Active Customers"   value="28,400"  change="+3,200 new"           changeType="positive" icon={Users} />
      </div>

      {/* Revenue Trend Chart */}
      <div className="chart-card">
        <h3 className="chart-title">Sales Revenue Trend</h3>
        <p className="chart-subtitle mb-4">Monthly revenue and order volume — last 9 months</p>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={monthlySales} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(25,95%,53%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(25,95%,53%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(220,9%,46%)" />
            <YAxis yAxisId="left"  tick={{ fontSize: 11 }} stroke="hsl(220,9%,46%)" tickFormatter={(v) => `₹${v/1000}k`} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} stroke="hsl(220,9%,46%)" />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Area  yAxisId="left"  type="monotone" dataKey="revenue" stroke="hsl(25,95%,53%)"  fill="url(#salesGrad)" strokeWidth={2} name="Revenue" />
            <Line  yAxisId="right" type="monotone" dataKey="orders"  stroke="hsl(210,92%,55%)" strokeWidth={2} dot={{ r: 3 }} name="Orders" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Seller Comparison */}
      <div className="chart-card">
        <h3 className="chart-title">Seller Sales Comparison (Q1 2026)</h3>
        <p className="chart-subtitle mb-4">Monthly sales by top sellers</p>
        <ResponsiveContainer width="100%" height={230}>
          <BarChart data={sellerSales} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
            <XAxis dataKey="seller" tick={{ fontSize: 10 }} stroke="hsl(220,9%,46%)" />
            <YAxis tick={{ fontSize: 10 }} stroke="hsl(220,9%,46%)" tickFormatter={(v) => `₹${v/1000}k`} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v) => [`₹${(v/1000).toFixed(0)}k`]} />
            <Bar dataKey="jan" name="January"  fill="hsl(25,95%,53%)"   radius={[2, 2, 0, 0]} />
            <Bar dataKey="feb" name="February" fill="hsl(210,92%,55%)"  radius={[2, 2, 0, 0]} />
            <Bar dataKey="mar" name="March"    fill="hsl(217,91%,60%)"  radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Selling Products Table */}
      <div className="chart-card">
        <h3 className="chart-title">Top Selling Products</h3>
        <p className="chart-subtitle mb-3">Best performing products this quarter</p>
        <div className="relative max-w-sm mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-9 bg-secondary border-none text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr><th>Product</th><th>Seller</th><th>Quantity Sold</th><th>Revenue</th><th>Growth</th></tr>
            </thead>
            <tbody>
              {filteredProducts.map((s) => (
                <tr key={s.item}>
                  <td className="font-medium text-card-foreground">{s.item}</td>
                  <td className="text-muted-foreground">{s.seller}</td>
                  <td className="text-card-foreground">{s.qty}</td>
                  <td className="font-medium text-card-foreground">{s.value}</td>
                  <td>
                    <span className={s.growth.startsWith("+") ? "text-success text-xs font-medium" : "text-destructive text-xs font-medium"}>
                      {s.growth}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Downloadable Report Tiles */}
      <div className="rounded-xl border bg-card shadow-sm p-5">
        <h3 className="chart-title mb-1">Downloadable Reports</h3>
        <p className="chart-subtitle mb-4">Click any report to view details and download as CSV</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {REPORT_BTNS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveReport(key)}
              className="flex flex-col items-center gap-2 rounded-xl border bg-secondary/30 hover:bg-secondary/60 hover:border-primary/40 p-4 text-center transition-all group"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                {key === "gst"
                  ? <FileText className="h-5 w-5 text-primary" />
                  : <IndianRupee className="h-5 w-5 text-primary" />
                }
              </div>
              <p className="text-xs font-semibold text-card-foreground leading-tight">{label}</p>
              <p className="text-[10px] text-muted-foreground">View &amp; Download</p>
            </button>
          ))}
        </div>
      </div>

      {/* Report Modal */}
      {activeReport && (
        <ReportModal type={activeReport} onClose={() => setActiveReport(null)} />
      )}
    </div>
  );
}
