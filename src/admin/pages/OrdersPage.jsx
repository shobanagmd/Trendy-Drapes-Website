import { useState } from "react";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ShoppingCart, Truck, CheckCircle2, XCircle, RotateCcw, Eye, X } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const orderTrend = [
  { date: "Mar 1", orders: 142, revenue: 18200 },
  { date: "Mar 5", orders: 168, revenue: 21400 },
  { date: "Mar 9", orders: 155, revenue: 19800 },
  { date: "Mar 13", orders: 198, revenue: 25600 },
  { date: "Mar 17", orders: 182, revenue: 23400 },
  { date: "Mar 21", orders: 215, revenue: 28900 },
];

const statusBreakdown = [
  { name: "Delivered", value: 58 },
  { name: "Shipped", value: 22 },
  { name: "Processing", value: 12 },
  { name: "Cancelled", value: 5 },
  { name: "Returned", value: 3 },
];
const STATUS_COLORS = ["hsl(152,69%,40%)", "hsl(210,92%,55%)", "hsl(38,92%,50%)", "hsl(0,84%,60%)", "hsl(280,65%,55%)"];

const orders = [
  { id: "ORD-78451", customer: "Rahul Sharma", email: "rahul@email.com", items: 3, total: "$248.97", payment: "UPI", seller: "TechZone", date: "Mar 21, 2026", status: "Delivered" },
  { id: "ORD-78450", customer: "Priya Patel", email: "priya@email.com", items: 1, total: "$89.99", payment: "Card", seller: "FashionHub", date: "Mar 21, 2026", status: "Shipped" },
  { id: "ORD-78449", customer: "Amit Kumar", email: "amit@email.com", items: 5, total: "$412.50", payment: "COD", seller: "GadgetWorld", date: "Mar 20, 2026", status: "Processing" },
  { id: "ORD-78448", customer: "Sneha Reddy", email: "sneha@email.com", items: 2, total: "$156.00", payment: "UPI", seller: "BeautyFirst", date: "Mar 20, 2026", status: "Delivered" },
  { id: "ORD-78447", customer: "Vikram Singh", email: "vikram@email.com", items: 4, total: "$320.00", payment: "Card", seller: "FitGear", date: "Mar 19, 2026", status: "Cancelled" },
  { id: "ORD-78446", customer: "Meera Joshi", email: "meera@email.com", items: 2, total: "$178.00", payment: "Wallet", seller: "HomeEssentials", date: "Mar 19, 2026", status: "Returned" },
  { id: "ORD-78445", customer: "Karan Mehta", email: "karan@email.com", items: 1, total: "$99.99", payment: "UPI", seller: "TechZone", date: "Mar 18, 2026", status: "Delivered" },
  { id: "ORD-78444", customer: "Anita Desai", email: "anita@email.com", items: 3, total: "$267.00", payment: "Card", seller: "FashionHub", date: "Mar 18, 2026", status: "Shipped" },
];

const statusStyle = {
  Delivered: "badge-success", Shipped: "badge-info", Processing: "badge-warning", Cancelled: "badge-danger", Returned: "badge-neutral",
};
const paymentStyle = {
  UPI: "badge-info", Card: "badge-success", COD: "badge-warning", Wallet: "badge-neutral",
};

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const filtered = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-5">
      <div className="page-header">
        <h1 className="page-title">Orders</h1>
        <p className="page-subtitle">Track orders, shipments, returns, and customer purchases</p>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        <StatCard title="Total Orders" value="5,120" change="+8.4% this month" changeType="positive" icon={ShoppingCart} />
        <StatCard title="Shipped" value="1,128" change="In transit" changeType="neutral" icon={Truck} />
        <StatCard title="Delivered" value="2,970" change="58% delivery rate" changeType="positive" icon={CheckCircle2} />
        <StatCard title="Cancelled" value="256" change="5% cancel rate" changeType="negative" icon={XCircle} />
        <StatCard title="Returns" value="154" change="3% return rate" changeType="negative" icon={RotateCcw} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 chart-card">
          <h3 className="chart-title">Order Volume Trend</h3>
          <p className="chart-subtitle mb-4">Daily orders & revenue — March 2026</p>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={orderTrend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="ordGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(25,95%,53%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(25,95%,53%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(220,9%,46%)" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(220,9%,46%)" />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Area type="monotone" dataKey="orders" stroke="hsl(25,95%,53%)" fill="url(#ordGrad)" strokeWidth={2} name="Orders" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Order Status Breakdown</h3>
          <p className="chart-subtitle">Current distribution</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={statusBreakdown} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value">
                {statusBreakdown.map((_, i) => <Cell key={i} fill={STATUS_COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v) => [`${v}%`]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-1">
            {statusBreakdown.map((s, i) => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: STATUS_COLORS[i] }} />{s.name}</span>
                <span className="font-semibold text-card-foreground">{s.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search orders..." className="pl-9 bg-card" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {["All", "Delivered", "Shipped", "Processing", "Cancelled"].map((f) => (
          <Button
            key={f}
            onClick={() => setStatusFilter(f)}
            variant={f === statusFilter ? "default" : "outline"}
            size="sm"
            className="text-xs"
          >
            {f}
          </Button>
        ))}
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Order ID</th><th>Customer</th><th>Seller</th><th>Items</th><th>Total</th><th>Payment</th><th>Date</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id}>
                  <td className="font-medium text-card-foreground">{o.id}</td>
                  <td><div><p className="text-card-foreground text-sm">{o.customer}</p><p className="text-[10px] text-muted-foreground">{o.email}</p></div></td>
                  <td className="text-card-foreground">{o.seller}</td>
                  <td className="text-muted-foreground">{o.items}</td>
                  <td className="font-medium text-card-foreground">{o.total}</td>
                  <td><span className={paymentStyle[o.payment]}>{o.payment}</span></td>
                  <td className="text-muted-foreground text-xs">{o.date}</td>
                  <td><span className={`text-xs font-medium ${statusStyle[o.status]}`}>{o.status}</span></td>
                  <td><button onClick={() => setSelectedOrder(o)} className="rounded p-1.5 hover:bg-secondary transition-colors" title="View order details"><Eye className="h-3.5 w-3.5 text-muted-foreground" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 flex items-center justify-between p-6 border-b bg-card">
              <h2 className="text-lg font-semibold">Order Details</h2>
              <button onClick={() => setSelectedOrder(null)} className="p-1 hover:bg-secondary rounded">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Order ID</p>
                  <p className="text-sm font-semibold text-card-foreground">{selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Status</p>
                  <p className={`text-sm font-semibold ${statusStyle[selectedOrder.status]}`}>{selectedOrder.status}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Order Date</p>
                  <p className="text-sm font-semibold text-card-foreground">{selectedOrder.date}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Total Amount</p>
                  <p className="text-sm font-semibold text-card-foreground">{selectedOrder.total}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold text-card-foreground mb-3">Customer Information</h3>
                <div className="space-y-2">
                  <p className="text-sm"><span className="text-muted-foreground">Name:</span> <span className="font-medium text-card-foreground">{selectedOrder.customer}</span></p>
                  <p className="text-sm"><span className="text-muted-foreground">Email:</span> <span className="font-medium text-card-foreground">{selectedOrder.email}</span></p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold text-card-foreground mb-3">Order Information</h3>
                <div className="space-y-2">
                  <p className="text-sm"><span className="text-muted-foreground">Seller:</span> <span className="font-medium text-card-foreground">{selectedOrder.seller}</span></p>
                  <p className="text-sm"><span className="text-muted-foreground">Items:</span> <span className="font-medium text-card-foreground">{selectedOrder.items}</span></p>
                  <p className="text-sm"><span className="text-muted-foreground">Payment Method:</span> <span className={`text-sm font-semibold ${paymentStyle[selectedOrder.payment]}`}>{selectedOrder.payment}</span></p>
                </div>
              </div>

              <div className="border-t pt-4">
                <Button onClick={() => setSelectedOrder(null)} className="w-full">Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
