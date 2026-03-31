import { useState, useEffect } from "react";
import { StatCard } from "@/components/StatCard";
import { DollarSign, TrendingUp, CreditCard, Receipt, Search, Plus, Minus, Edit2, AlertTriangle, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getAllProducts, updateProduct } from "@/lib/productStorage";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

const monthlyPL = [
  { month: "Oct", revenue: 548000, costs: 376000, profit: 172000 },
  { month: "Nov", revenue: 675000, costs: 462000, profit: 213000 },
  { month: "Dec", revenue: 802000, costs: 515000, profit: 287000 },
  { month: "Jan", revenue: 568000, costs: 395000, profit: 173000 },
  { month: "Feb", revenue: 595000, costs: 408000, profit: 187000 },
  { month: "Mar", revenue: 735000, costs: 497000, profit: 238000 },
];

const costBreakdown = [
  { name: "Seller Payouts", value: 52 },
  { name: "Logistics", value: 26 },
  { name: "Platform Ops", value: 14 },
  { name: "Refunds", value: 8 },
];

const COLORS = ["hsl(25,95%,53%)", "hsl(210,92%,55%)", "hsl(280,65%,55%)", "hsl(38,92%,50%)"];

const sellerPayouts = [
  { name: "TechZone", revenue: 124000, payout: 105400 },
  { name: "FashionHub", revenue: 89200, payout: 75820 },
  { name: "GadgetWorld", revenue: 68000, payout: 57800 },
  { name: "BeautyFirst", revenue: 45600, payout: 38760 },
  { name: "FitGear", revenue: 32400, payout: 27540 },
];

const transactions = [
  { id: "TXN-9821", type: "Seller Payout", seller: "TechZone Electronics", amount: "$12,400", date: "Mar 21, 2026", status: "Completed" },
  { id: "TXN-9820", type: "Refund", seller: "FashionHub India", amount: "$89.99", date: "Mar 21, 2026", status: "Processing" },
  { id: "TXN-9819", type: "Commission", seller: "GadgetWorld", amount: "$3,420", date: "Mar 20, 2026", status: "Completed" },
  { id: "TXN-9818", type: "Seller Payout", seller: "BeautyFirst Co.", amount: "$8,760", date: "Mar 20, 2026", status: "Completed" },
  { id: "TXN-9817", type: "Ad Revenue", seller: "TechZone Electronics", amount: "$2,100", date: "Mar 19, 2026", status: "Pending" },
  { id: "TXN-9816", type: "Refund", seller: "GadgetWorld", amount: "$156.00", date: "Mar 19, 2026", status: "Completed" },
];

const txnStatus = { Completed: "badge-success", Processing: "badge-warning", Pending: "badge-info" };
const txnType = { "Seller Payout": "badge-info", Refund: "badge-danger", Commission: "badge-success", "Ad Revenue": "badge-neutral" };

export default function FinancePage() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);

  useEffect(() => {
    setProducts(getAllProducts());
  }, []);

  const handleUpdateStock = (id, newStock) => {
    if (newStock < 0) newStock = 0;
    updateProduct(id, { stock: newStock });
    setProducts(getAllProducts());
  };

  const handleEditStock = (id, currentStock) => {
    const val = prompt("Enter new stock count:", currentStock);
    if (val !== null && !isNaN(parseInt(val))) {
      handleUpdateStock(id, parseInt(val));
    }
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { label: "Out of Stock", class: "badge-danger" };
    if (stock < 50) return { label: "Low Stock", class: "badge-warning" };
    return { label: "In Stock", class: "badge-success" };
  };

  const parsePrice = (priceStr) => parseFloat(priceStr.replace(/[^0-9.]/g, ""));

  const totalInventoryValue = products.reduce((acc, p) => acc + (parsePrice(p.price) * p.stock), 0);
  const lowStockCount = products.filter(p => p.stock < 50).length;

  const filteredTransactions = transactions.filter(
    (t) =>
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.seller.toLowerCase().includes(search.toLowerCase()) ||
      t.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="page-header">
        <h1 className="page-title">Finance</h1>
        <p className="page-subtitle">Revenue analytics, seller payouts, commissions, and transaction tracking</p>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard title="Gross Revenue" value="$3.92M" change="+18.2% vs Q3" changeType="positive" icon={DollarSign} />
        <StatCard title="Net Profit" value="$1.27M" change="+22.1% vs Q3" changeType="positive" icon={TrendingUp} />
        <StatCard title="Seller Payouts" value="$2.48M" change="63% of revenue" changeType="neutral" icon={Receipt} />
        <StatCard title="Profit Margin" value="32.4%" change="+2.8% improvement" changeType="positive" icon={CreditCard} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 chart-card">
          <h3 className="chart-title">Profit & Loss Trend</h3>
          <p className="chart-subtitle mb-4">Monthly revenue, costs, and profit</p>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={monthlyPL} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(25,95%,53%)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="hsl(25,95%,53%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="profGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(152,69%,40%)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="hsl(152,69%,40%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(220,9%,46%)" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(220,9%,46%)" tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v) => [`$${(v / 1000).toFixed(0)}k`]} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(25,95%,53%)" fill="url(#revGrad2)" strokeWidth={2} />
              <Area type="monotone" dataKey="costs" stroke="hsl(210,92%,55%)" fill="none" strokeWidth={1.5} strokeDasharray="4 4" />
              <Area type="monotone" dataKey="profit" stroke="hsl(152,69%,40%)" fill="url(#profGrad2)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Cost Breakdown</h3>
          <p className="chart-subtitle">Where money is spent</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={costBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={78} paddingAngle={3} dataKey="value">
                {costBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v) => [`${v}%`]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-1">
            {costBreakdown.map((c, i) => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: COLORS[i] }} />{c.name}</span>
                <span className="font-semibold text-card-foreground">{c.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Seller Payout Comparison */}
      <div className="chart-card">
        <h3 className="chart-title">Seller Revenue vs Payout</h3>
        <p className="chart-subtitle mb-4">Commission retained per seller</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={sellerPayouts} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(220,9%,46%)" />
            <YAxis tick={{ fontSize: 10 }} stroke="hsl(220,9%,46%)" tickFormatter={(v) => `$${v / 1000}k`} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v) => [`$${(v / 1000).toFixed(0)}k`]} />
            <Bar dataKey="revenue" name="Revenue" fill="hsl(25,95%,53%)" radius={[3, 3, 0, 0]} />
            <Bar dataKey="payout" name="Payout" fill="hsl(220,14%,80%)" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Financial Summary */}
      <div className="chart-card">
        <h3 className="chart-title">Financial Summary</h3>
        <p className="chart-subtitle mb-4">Current quarter breakdown</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: "Gross Revenue", value: "$1.90M", sub: "This quarter" },
            { label: "Platform Commission", value: "$285K", sub: "15% avg rate" },
            { label: "Net Profit", value: "$238K", sub: "+22% growth" },
            { label: "Pending Payouts", value: "$145K", sub: "32 sellers" },
            { label: "Refunds Processed", value: "$42K", sub: "2.2% of revenue" },
            { label: "Ad Revenue", value: "$68K", sub: "Sponsored listings" },
          ].map((item) => (
            <div key={item.label} className="rounded-lg bg-secondary/50 p-3">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{item.label}</p>
              <p className="text-lg font-bold text-card-foreground mt-0.5">{item.value}</p>
              <p className="text-[11px] text-muted-foreground">{item.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stock Management */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden border-orange-200/50 dark:border-orange-900/50">
        <div className="border-b px-5 py-4 flex flex-wrap items-center justify-between gap-4 bg-orange-50/50 dark:bg-orange-950/20">
          <div>
            <h3 className="chart-title flex items-center gap-2">
              <Package className="h-5 w-5 text-orange-500" />
              Stock Management
            </h3>
            <p className="chart-subtitle mt-1">Manage inventory to forecast costs and prevent stockouts.</p>
          </div>
          <div className="flex gap-4 text-right">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Total Inventory Value</p>
              <p className="text-lg font-bold text-card-foreground">${totalInventoryValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            {lowStockCount > 0 && (
              <div className="bg-destructive/10 text-destructive px-3 py-1.5 rounded-lg flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <div className="text-left">
                  <p className="text-sm font-bold">{lowStockCount} Items Low</p>
                  <p className="text-[10px] leading-tight opacity-80">Requires restock</p>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr><th>Product</th><th>Status</th><th>Price</th><th>Stock Qty</th><th>Total Value</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {products.map(p => {
                const status = getStockStatus(p.stock);
                const value = parsePrice(p.price) * p.stock;
                return (
                  <tr key={p.id}>
                    <td className="font-medium text-card-foreground">{p.name}</td>
                    <td><span className={status.class}>{status.label}</span></td>
                    <td className="text-muted-foreground">{p.price}</td>
                    <td className="font-semibold text-card-foreground">{p.stock}</td>
                    <td className="font-medium text-card-foreground">${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => handleUpdateStock(p.id, p.stock - 1)}><Minus className="h-3 w-3" /></Button>
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => handleUpdateStock(p.id, p.stock + 1)}><Plus className="h-3 w-3" /></Button>
                        <Button variant="outline" size="icon" className="h-7 w-7 ml-1" onClick={() => handleEditStock(p.id, p.stock)}><Edit2 className="h-3 w-3" /></Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="border-b px-5 py-3">
          <h3 className="chart-title">Recent Transactions</h3>
        </div>
        <div className="relative max-w-sm px-5 pt-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            className="pl-9 bg-secondary border-none text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>ID</th><th>Type</th><th>Seller</th><th>Amount</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              {filteredTransactions.map((t) => (
                <tr key={t.id}>
                  <td className="font-medium text-card-foreground">{t.id}</td>
                  <td><span className={txnType[t.type]}>{t.type}</span></td>
                  <td className="text-card-foreground">{t.seller}</td>
                  <td className="font-medium text-card-foreground">{t.amount}</td>
                  <td className="text-muted-foreground">{t.date}</td>
                  <td><span className={txnStatus[t.status]}>{t.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
