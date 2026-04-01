import { useState } from "react";
import { StatCard } from "@/admin/components/StatCard";
import { FileBarChart, TrendingUp, ShoppingCart, Users, Search, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const monthlySales = [
  { month: "Jul", orders: 3200, revenue: 485000 },
  { month: "Aug", orders: 3580, revenue: 510000 },
  { month: "Sep", orders: 3400, revenue: 495000 },
  { month: "Oct", orders: 3760, revenue: 548000 },
  { month: "Nov", orders: 4520, revenue: 675000 },
  { month: "Dec", orders: 5800, revenue: 802000 },
  { month: "Jan", orders: 3980, revenue: 568000 },
  { month: "Feb", orders: 4200, revenue: 595000 },
  { month: "Mar", orders: 5100, revenue: 735000 },
];

const sellerSales = [
  { seller: "TechZone", jan: 82000, feb: 91000, mar: 124000 },
  { seller: "FashionHub", jan: 68000, feb: 74000, mar: 89000 },
  { seller: "GadgetWorld", jan: 52000, feb: 58000, mar: 68000 },
  { seller: "BeautyFirst", jan: 38000, feb: 42000, mar: 46000 },
  { seller: "FitGear", jan: 22000, feb: 28000, mar: 32000 },
];

const topProducts = [
  { item: "Wireless Earbuds Pro", seller: "TechZone", qty: "2,840", value: "$142,000", growth: "+18%" },
  { item: "Cotton Kurta Set", seller: "FashionHub", qty: "3,200", value: "$128,000", growth: "+24%" },
  { item: "Smart Watch X200", seller: "GadgetWorld", qty: "1,850", value: "$185,000", growth: "+12%" },
  { item: "Premium Face Serum", seller: "BeautyFirst", qty: "4,100", value: "$82,000", growth: "+8%" },
  { item: "Yoga Mat Premium", seller: "FitGear", qty: "1,560", value: "$46,800", growth: "+15%" },
  { item: "Running Shoes Air Max", seller: "ShoePalace", qty: "2,100", value: "$125,900", growth: "+22%" },
];

export default function ReportsPage() {
  const [search, setSearch] = useState("");
  const filteredProducts = topProducts.filter(
    (p) =>
      p.item.toLowerCase().includes(search.toLowerCase()) ||
      p.seller.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="page-header flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Sales Reports</h1>
          <p className="page-subtitle">Comprehensive sales analytics, seller comparisons, and product performance</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs font-semibold whitespace-nowrap" onClick={() => alert("Downloading Daily Report (CSV)...")}>
            <Download className="h-3.5 w-3.5" /> Daily Report
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs font-semibold whitespace-nowrap" onClick={() => alert("Downloading Weekly Report (CSV)...")}>
            <Download className="h-3.5 w-3.5" /> Weekly Report
          </Button>
          <Button size="sm" className="gap-1.5 h-8 text-xs font-semibold whitespace-nowrap" onClick={() => alert("Generating GST Invoice Report (PDF)...")}>
            <FileText className="h-3.5 w-3.5" /> GST Invoice Report
          </Button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Sales (Q1)" value="$1.90M" change="+16.4% vs Q4" changeType="positive" icon={TrendingUp} />
        <StatCard title="Total Orders" value="13,280" change="+11.2% vs Q4" changeType="positive" icon={ShoppingCart} />
        <StatCard title="Avg. Order Value" value="$143" change="+4.7% improvement" changeType="positive" icon={FileBarChart} />
        <StatCard title="Active Customers" value="28,400" change="+3,200 new" changeType="positive" icon={Users} />
      </div>

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
            <YAxis yAxisId="left" tick={{ fontSize: 11 }} stroke="hsl(220,9%,46%)" tickFormatter={(v) => `$${v / 1000}k`} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} stroke="hsl(220,9%,46%)" />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="hsl(25,95%,53%)" fill="url(#salesGrad)" strokeWidth={2} name="Revenue" />
            <Line yAxisId="right" type="monotone" dataKey="orders" stroke="hsl(210,92%,55%)" strokeWidth={2} dot={{ r: 3 }} name="Orders" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card">
        <h3 className="chart-title">Seller Sales Comparison (Q1 2026)</h3>
        <p className="chart-subtitle mb-4">Monthly sales by top sellers</p>
        <ResponsiveContainer width="100%" height={230}>
          <BarChart data={sellerSales} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
            <XAxis dataKey="seller" tick={{ fontSize: 10 }} stroke="hsl(220,9%,46%)" />
            <YAxis tick={{ fontSize: 10 }} stroke="hsl(220,9%,46%)" tickFormatter={(v) => `$${v / 1000}k`} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v) => [`$${(v / 1000).toFixed(0)}k`]} />
            <Bar dataKey="jan" name="January" fill="hsl(25,95%,53%)" radius={[2, 2, 0, 0]} />
            <Bar dataKey="feb" name="February" fill="hsl(210,92%,55%)" radius={[2, 2, 0, 0]} />
            <Bar dataKey="mar" name="March" fill="hsl(217,91%,60%)" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

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
            <thead><tr><th>Product</th><th>Seller</th><th>Quantity Sold</th><th>Revenue</th><th>Growth</th></tr></thead>
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
    </div>
  );
}
