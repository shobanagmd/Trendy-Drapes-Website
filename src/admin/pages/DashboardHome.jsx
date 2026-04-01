import { useState, useEffect, useMemo } from "react";
import { StatCard } from "@/admin/components/StatCard";
import { Input } from "@/components/ui/input";
import { getAllProducts } from "@/lib/productStorage";
import { useLocalProducts } from "@/admin/hooks/useLocalProducts";
import { useAdminSearch } from "@/admin/contexts/AdminSearchContext";
import {
  IndianRupee, TrendingUp, ShoppingCart, Package, Users, Percent, Award, TrendingDown,
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
  { name: "Wireless Earbuds Pro", sold: 2840, revenue: "₹4,20,000", stock: 450 },
  { name: "Cotton Kurta Set", sold: 3200, revenue: "₹8,00,000", stock: 1200 },
  { name: "Smart Watch X200", sold: 1850, revenue: "₹2,85,000", stock: 320 },
  { name: "Premium Face Serum", sold: 4100, revenue: "₹2,10,000", stock: 2800 },
  { name: "Yoga Mat Premium", sold: 1560, revenue: "₹96,800", stock: 680 },
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
  { id: "ORD-78451", customer: "Rahul Sharma", items: 3, total: "₹2,480", status: "Delivered", time: "12 min ago" },
  { id: "ORD-78450", customer: "Priya Patel", items: 1, total: "₹899", status: "Shipped", time: "28 min ago" },
  { id: "ORD-78449", customer: "Amit Kumar", items: 5, total: "₹4,120", status: "Processing", time: "1 hr ago" },
  { id: "ORD-78448", customer: "Sneha Reddy", items: 2, total: "₹1,560", status: "Delivered", time: "2 hrs ago" },
  { id: "ORD-78447", customer: "Vikram Singh", items: 4, total: "₹3,200", status: "Cancelled", time: "3 hrs ago" },
];

const orderStatus = {
  Delivered: "badge-success", Shipped: "badge-info", Processing: "badge-warning", Cancelled: "badge-danger",
};

const recentActivity = [
  { text: "Order #78451 delivered successfully to Rahul Sharma", time: "28 min ago", icon: CheckCircle2 },
  { text: "Product 'Smart Watch X200' stock low — 320 units left", time: "1 hr ago", icon: Package },
  { text: "Return request #RET-2841 approved — refund initiated", time: "3 hrs ago", icon: Clock },
  { text: "Payout of ₹12,40,000 processed to bank account", time: "5 hrs ago", icon: IndianRupee },
  { text: "New product 'Bluetooth Speaker V3' listed successfully", time: "6 hrs ago", icon: Store },
];

export default function DashboardHome() {
  const [products, setProducts] = useState([]);
  const { localProducts, deletedProducts } = useLocalProducts();
  const { searchQuery: search, setSearchQuery: setSearch } = useAdminSearch();

  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [stockLevel, setStockLevel] = useState("All");
  const [dateSort, setDateSort] = useState("Newest First");

  useEffect(() => {
    const baseProducts = getAllProducts();
    const combined = [...baseProducts, ...localProducts];
    
    const uniqueMap = new Map();
    combined.forEach(p => {
      if (!deletedProducts.includes(p.id)) {
        uniqueMap.set(p.id, p);
      }
    });
    
    setProducts(Array.from(uniqueMap.values()));
  }, [localProducts, deletedProducts]);

  const getStatus = (product) => {
    if (product.stock === 0) return "Out of Stock";
    return "Active";
  };

  const filteredProducts = useMemo(() => {
    let result = products.map(p => ({
      ...p,
      status: getStatus(p)
    }));

    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(lowerSearch) || 
        (p.category && p.category.toLowerCase().includes(lowerSearch))
      );
    }

    if (category !== "All") {
      result = result.filter(p => p.category === category);
    }

    if (status !== "All") {
      result = result.filter(p => p.status === status);
    }

    if (stockLevel !== "All") {
      result = result.filter(p => {
        if (stockLevel === "Low Stock") return p.stock > 0 && p.stock < 10;
        if (stockLevel === "Medium Stock") return p.stock >= 10 && p.stock <= 20;
        if (stockLevel === "High Stock") return p.stock > 20;
        return true;
      });
    }

    result.sort((a, b) => {
        const dateA = new Date(a.dateCreated || "2000-01-01").getTime();
        const dateB = new Date(b.dateCreated || "2000-01-01").getTime();
        if (dateSort === "Newest First") return dateB - dateA;
        return dateA - dateB;
    });

    return result;
  }, [products, search, category, status, stockLevel, dateSort]);

  const extractedCategories = products.map(p => p.category).filter(Boolean);
  const predefinedCategories = ["All", "Sarees", "Lehengas", "Jewellery", "Indo-Western"];
  const uniqueCategories = [...new Set([...predefinedCategories, ...extractedCategories])];

  return (
    <div className="space-y-5">
      <div className="page-header">
        <h1 className="page-title">Store Dashboard</h1>
        <p className="page-subtitle">Your store overview and real-time analytics</p>
      </div>

    {/* Product Search & Database Section */}
<div className="rounded-xl border bg-card shadow-sm overflow-hidden mb-6">
  {/* Filter Bar Header - Added bg-secondary/10 for subtle separation */}
  <div className="p-4 bg-secondary/10 border-b border-border/50">
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      
      {/* Left Side: Search Bar - Forced width and vertical alignment */}
      <div className="relative w-full lg:max-w-md flex items-center">
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground/70" />
        <Input 
          placeholder="Search products..." 
          className="pl-10 bg-background border-border/50 h-10 w-full focus:ring-2 focus:ring-primary/20 transition-all" 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
        />
      </div>
      
      {/* Right Side: Filter Group - Using flex-nowrap on desktop to prevent jagged edges */}
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full lg:w-auto">
        <select 
          className="h-10 flex-1 lg:flex-none min-w-[110px] rounded-md border border-border/50 bg-background px-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
          value={category} onChange={(e) => setCategory(e.target.value)}
        >
          {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select 
          className="h-10 flex-1 lg:flex-none min-w-[110px] rounded-md border border-border/50 bg-background px-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
          value={status} onChange={(e) => setStatus(e.target.value)}
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Out of Stock">Out of Stock</option>
        </select>

        <select 
          className="h-10 flex-1 lg:flex-none min-w-[120px] rounded-md border border-border/50 bg-background px-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
          value={stockLevel} onChange={(e) => setStockLevel(e.target.value)}
        >
          <option value="All">Stock Levels</option>
          <option value="Low Stock">Low (&lt;10)</option>
          <option value="Medium Stock">Mid (10-20)</option>
          <option value="High Stock">High (&gt;20)</option>
        </select>

        <select 
          className="h-10 flex-1 lg:flex-none min-w-[100px] rounded-md border border-border/50 bg-background px-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
          value={dateSort} onChange={(e) => setDateSort(e.target.value)}
        >
          <option value="Newest First">Newest</option>
          <option value="Oldest First">Oldest</option>
        </select>
      </div>
    </div>
  </div>

  {/* Table Section - Improved cell padding for alignment with header */}
  <div className="overflow-x-auto">
    <table className="w-full text-sm text-left border-collapse">
      <thead className="bg-secondary/30 text-muted-foreground font-semibold uppercase text-[11px] tracking-wider border-b border-border/50">
        <tr>
          <th className="px-5 py-4 w-16 text-center">Image</th>
          <th className="px-4 py-4">Product Details</th>
          <th className="px-4 py-4">Category</th>
          <th className="px-4 py-4 text-right">Price</th>
          <th className="px-4 py-4 text-right">Stock</th>
          <th className="px-5 py-4 text-center">Status</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border/40">
        {filteredProducts.length > 0 ? filteredProducts.map((p) => (
          <tr key={p.id} className="hover:bg-secondary/20 transition-colors">
            <td className="px-5 py-3">
              <div className="w-10 h-10 rounded border border-border bg-secondary overflow-hidden flex items-center justify-center mx-auto">
                {p.image && (p.image.startsWith("http") || p.image.startsWith("data:") || p.image.startsWith("/")) ? (
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl">{p.image || "📦"}</span>
                )}
              </div>
            </td>
            <td className="px-4 py-3 font-medium text-card-foreground max-w-[200px] truncate" title={p.name}>{p.name}</td>
            <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{p.category}</td>
            <td className="px-4 py-3 font-medium text-card-foreground text-right">₹{Number(p.price).toLocaleString("en-IN")}</td>
            <td className="px-4 py-3 text-card-foreground font-semibold text-right">{p.stock.toLocaleString()}</td>
            <td className="px-5 py-3 text-center">
              <span className={p.status === "Active" ? "badge-success" : p.status === "Out of Stock" ? "badge-danger" : "badge-warning"}>
                {p.status}
              </span>
            </td>
          </tr>
        )) : (
          <tr><td colSpan="6" className="text-center py-12 text-muted-foreground">No products match your current filters.</td></tr>
        )}
      </tbody>
    </table>
  </div>
</div>

      {/* Primary KPI Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-4">
        <StatCard title="Total Revenue" value="₹39.2L" change="+18.2% vs last quarter" changeType="positive" icon={IndianRupee} />
        <StatCard title="Total Orders" value="37,540" change="+12.4% this month" changeType="positive" icon={ShoppingCart} />
        <StatCard title="Total Products" value="12,840" change="+248 new this week" changeType="positive" icon={Package} />
        <StatCard title="Total Customers" value="28,400" change="+3,200 new this quarter" changeType="positive" icon={Users} />
      </div>

      {/* Secondary KPI Cards */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <StatCard title="Profit Margin" value="32.4%" change="+2.8% vs last quarter" changeType="positive" icon={Percent} />
        <StatCard title="Most Profitable Category" value="Electronics" change="32% of total profit" changeType="positive" icon={Award} />
        <StatCard title="Least Profitable Category" value="Sports" change="Needs marketing push" changeType="negative" icon={TrendingDown} />
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
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(220, 9%, 46%)" tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(value) => [`₹${(value / 1000).toFixed(0)}k`]} />
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
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(220, 9%, 46%)" tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v) => [`₹${(v / 1000).toFixed(0)}k`]} />
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
