import { useState, useEffect } from "react";
import { StatCard } from "@/components/StatCard";
import { Input } from "@/components/ui/input";
import { getAllProducts } from "@/lib/productStorage";
import {
  DollarSign, TrendingUp, ShoppingCart, Package,
  ArrowUpRight, Clock, CheckCircle2, Store, Search, Calendar
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const revenueData = [
  { month: "Jul", revenue: 485000, orders: 3200, profit: 143000 },
  { month: "Aug", revenue: 510000, orders: 3580, profit: 152000 },
  { month: "Sep", revenue: 495000, orders: 3400, profit: 146000 },
  { month: "Oct", revenue: 548000, orders: 3760, profit: 172000 },
  { month: "Nov", revenue: 675000, orders: 4520, profit: 213000 },
  { month: "Dec", revenue: 802000, orders: 5800, profit: 287000 },
  { month: "Jan", revenue: 568000, orders: 3980, profit: 173000 },
  { month: "Feb", revenue: 595000, orders: 4200, profit: 187000 },
  { month: "Mar", revenue: 735000, orders: 5100, profit: 238000 },
];

const categoryData = [
  { name: "Electronics", value: 32 },
  { name: "Fashion", value: 28 },
  { name: "Home & Kitchen", value: 18 },
  { name: "Beauty", value: 12 },
  { name: "Sports", value: 10 },
];

const COLORS = [
  "hsl(25, 95%, 53%)", "hsl(210, 92%, 55%)", "hsl(152, 69%, 40%)",
  "hsl(280, 65%, 55%)", "hsl(38, 92%, 50%)"
];

const topProducts = [
  { name: "Wireless Earbuds Pro", sold: 2840, revenue: "$142,000", stock: 450 },
  { name: "Cotton Kurta Set", sold: 3200, revenue: "$128,000", stock: 1200 },
  { name: "Smart Watch X200", sold: 1850, revenue: "$185,000", stock: 320 },
  { name: "Premium Face Serum", sold: 4100, revenue: "$82,000", stock: 2800 },
  { name: "Yoga Mat Premium", sold: 1560, revenue: "$46,800", stock: 680 },
];

const monthlySales = [
  { name: "Oct", sales: 89000, orders: 620 },
  { name: "Nov", sales: 76000, orders: 840 },
  { name: "Dec", sales: 102000, orders: 1020 },
  { name: "Jan", sales: 65000, orders: 420 },
  { name: "Feb", sales: 54000, orders: 980 },
  { name: "Mar", sales: 73000, orders: 560 },
];

const recentOrders = [
  { id: "ORD-78451", customer: "Rahul Sharma", items: 3, total: "$248", status: "Delivered", time: "12 min ago" },
  { id: "ORD-78450", customer: "Priya Patel", items: 1, total: "$89", status: "Shipped", time: "28 min ago" },
  { id: "ORD-78449", customer: "Amit Kumar", items: 5, total: "$412", status: "Processing", time: "1 hr ago" },
  { id: "ORD-78448", customer: "Sneha Reddy", items: 2, total: "$156", status: "Delivered", time: "2 hrs ago" },
  { id: "ORD-78447", customer: "Vikram Singh", items: 4, total: "$320", status: "Cancelled", time: "3 hrs ago" },
];

const orderStatus = {
  Delivered: "badge-success", Shipped: "badge-info", Processing: "badge-warning", Cancelled: "badge-danger",
};

const recentActivity = [
  { text: "Order #78451 delivered successfully to Rahul Sharma", time: "28 min ago", icon: CheckCircle2 },
  { text: "Product 'Smart Watch X200' stock low — 320 units left", time: "1 hr ago", icon: Package },
  { text: "Return request #RET-2841 approved — refund initiated", time: "3 hrs ago", icon: Clock },
  { text: "Payout of $12,400 processed to bank account", time: "5 hrs ago", icon: DollarSign },
  { text: "New product 'Bluetooth Speaker V3' listed successfully", time: "6 hrs ago", icon: Store },
];

export default function DashboardHome() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [maxStock, setMaxStock] = useState("");
  const [dateCreated, setDateCreated] = useState("");

  useEffect(() => {
    setProducts(getAllProducts());
  }, []);

  const getStatus = (product) => {
    if (product.stock === 0) return "Out of Stock";
    if (product.stock < 50) return "Low Stock";
    return "Active";
  };

  const filteredProducts = products.map(p => ({ ...p, status: getStatus(p) })).filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "All" || p.category === category;
    const matchesStatus = status === "All" || p.status === status;
    const matchesStock = maxStock === "" || p.stock <= parseInt(maxStock);
    const matchesDate = dateCreated === "" || p.dateCreated === dateCreated;
    return matchesSearch && matchesCategory && matchesStatus && matchesStock && matchesDate;
  });

  const uniqueCategories = ["All", ...new Set(products.map(p => p.category))];

  return (
    <div className="space-y-5">
      <div className="page-header">
        <h1 className="page-title">Store Dashboard</h1>
        <p className="page-subtitle">Your store overview and real-time analytics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Revenue" value="$5.41M" change="+18.2% vs last quarter" changeType="positive" icon={DollarSign} />
        <StatCard title="Total Orders" value="37,540" change="+12.4% this month" changeType="positive" icon={ShoppingCart} />
        <StatCard title="Active Products" value="12,840" change="+248 new this week" changeType="positive" icon={Package} />
        <StatCard title="Avg. Rating" value="4.7 ★" change="Based on 8,420 reviews" changeType="positive" icon={TrendingUp} />
      </div>

      {/* Product Search & Database Section */}
      <div className="rounded-xl border bg-card shadow-sm p-5 overflow-hidden">
        <h3 className="chart-title mb-4">Product Database Search</h3>
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by name..." className="pl-9 bg-secondary border-none" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          
          <select 
            className="h-10 rounded-md border-0 bg-secondary px-3 py-1 text-sm shadow-sm font-medium text-card-foreground outline-none ring-1 ring-border/50 focus:ring-2 focus:ring-primary"
            value={category} onChange={(e) => setCategory(e.target.value)}
          >
            {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select 
            className="h-10 rounded-md border-0 bg-secondary px-3 py-1 text-sm shadow-sm font-medium text-card-foreground outline-none ring-1 ring-border/50 focus:ring-2 focus:ring-primary"
            value={status} onChange={(e) => setStatus(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>

          <div className="flex items-center gap-2">
            <Input type="number" placeholder="Max Stock" className="w-28 bg-secondary border-none" value={maxStock} onChange={(e) => setMaxStock(e.target.value)} />
          </div>

          <div className="flex items-center gap-2 relative">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input type="date" className="h-10 w-44 pl-9 bg-secondary border-none text-sm cursor-pointer" value={dateCreated} onChange={(e) => setDateCreated(e.target.value)} />
          </div>
        </div>

        <div className="overflow-x-auto border-t pt-4">
          <table className="data-table mt-0">
            <thead>
              <tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Date Added</th><th>Status</th></tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? filteredProducts.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <span className="w-9 h-11 rounded border border-border bg-secondary flex items-center justify-center text-base">{p.image}</span>
                      <span className="font-medium text-card-foreground text-sm">{p.name}</span>
                    </div>
                  </td>
                  <td className="text-muted-foreground">{p.category}</td>
                  <td className="font-medium text-card-foreground">{p.price}</td>
                  <td className="text-card-foreground font-semibold">{p.stock.toLocaleString()}</td>
                  <td className="text-muted-foreground text-xs font-medium">{p.dateCreated || "N/A"}</td>
                  <td>
                    <span className={p.status === "Active" ? "badge-success" : p.status === "Low Stock" ? "badge-warning" : "badge-danger"}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="6" className="text-center py-6 text-muted-foreground">No products match your current filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Revenue & Category Chart */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 chart-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="chart-title">Revenue & Profit Analytics</h3>
              <p className="chart-subtitle">Monthly revenue breakdown — last 9 months</p>
            </div>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" />Revenue</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-success" />Profit</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(25, 95%, 53%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(25, 95%, 53%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(152, 69%, 40%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(152, 69%, 40%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(220, 9%, 46%)" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(220, 9%, 46%)" tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(value) => [`$${(value / 1000).toFixed(0)}k`]} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(25, 95%, 53%)" fill="url(#revGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="profit" stroke="hsl(152, 69%, 40%)" fill="url(#profGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Sales by Category</h3>
          <p className="chart-subtitle">Revenue distribution</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v) => [`${v}%`, "Share"]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {categoryData.map((c, i) => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: COLORS[i] }} />
                  <span className="text-card-foreground">{c.name}</span>
                </span>
                <span className="font-semibold text-card-foreground">{c.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Sales + Top Products */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="chart-card">
          <h3 className="chart-title">Monthly Sales</h3>
          <p className="chart-subtitle mb-4">Sales performance over recent months</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlySales} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(220, 9%, 46%)" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(220, 9%, 46%)" tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v) => [`$${(v / 1000).toFixed(0)}k`]} />
              <Bar dataKey="sales" name="Sales" fill="hsl(25, 95%, 53%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Top Selling Products</h3>
          <p className="chart-subtitle mb-4">Best performers this month</p>
          <div className="space-y-3">
            {topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-card-foreground truncate">{p.name}</p>
                  <p className="text-[10px] text-muted-foreground">{p.sold.toLocaleString()} sold</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-card-foreground">{p.revenue}</p>
                  <p className="text-[10px] text-muted-foreground">{p.stock} in stock</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders + Activity */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="border-b px-5 py-3">
            <h3 className="chart-title">Recent Orders</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Time</th></tr></thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id}>
                    <td className="font-medium text-card-foreground">{o.id}</td>
                    <td className="text-card-foreground">{o.customer}</td>
                    <td className="text-muted-foreground">{o.items}</td>
                    <td className="font-medium text-card-foreground">{o.total}</td>
                    <td><span className={orderStatus[o.status]}>{o.status}</span></td>
                    <td className="text-muted-foreground text-xs">{o.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Recent Activity</h3>
          <p className="chart-subtitle mb-3">Latest updates</p>
          <div className="space-y-3">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="mt-0.5 rounded bg-secondary p-1">
                  <a.icon className="h-3 w-3 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-card-foreground leading-snug">{a.text}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
