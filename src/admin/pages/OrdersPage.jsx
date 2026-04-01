import { useState } from "react";
import { StatCard } from "@/admin/components/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ShoppingCart, Truck, CheckCircle2, XCircle, RotateCcw, Eye, X, MapPin, Download, Package, ExternalLink, Calendar, Map, Check, ChevronDown } from "lucide-react";
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
          <div className="bg-card rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            {/* Modal Header */}
            <div className="sticky top-0 flex items-center justify-between p-5 border-b bg-card z-10">
              <div>
                <h2 className="text-lg font-bold text-card-foreground flex items-center gap-2">
                  Order Details <span className="text-muted-foreground font-normal">#{selectedOrder.id}</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5"><Calendar className="inline h-3 w-3 mr-1" /> Placed on {selectedOrder.date}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs font-semibold" onClick={() => alert("Downloading Invoice PDF...")}>
                  <Download className="h-3.5 w-3.5" /> Invoice
                </Button>
                <button onClick={() => setSelectedOrder(null)} className="p-1.5 hover:bg-secondary rounded-md transition-colors text-muted-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-5 grid gap-6">
              {/* Top Details Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg border bg-secondary/30 p-4 shadow-sm">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                     Payment Info
                  </h3>
                  <div className="space-y-2">
                    <p className="text-sm flex justify-between"><span className="text-muted-foreground">Method:</span> <span className={`font-semibold ${paymentStyle[selectedOrder.payment]}`}>{selectedOrder.payment}</span></p>
                    <p className="text-sm flex justify-between"><span className="text-muted-foreground">Total Amount:</span> <span className="font-bold text-card-foreground">{selectedOrder.total}</span></p>
                    <p className="text-sm flex justify-between"><span className="text-muted-foreground">Status:</span> <span className="text-green-600 font-medium">Paid</span></p>
                  </div>
                </div>

                <div className="rounded-lg border bg-secondary/30 p-4 shadow-sm md:col-span-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                     Customer & Shipping
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium text-card-foreground text-sm">{selectedOrder.customer}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{selectedOrder.email}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">+91 98765 43210</p>
                    </div>
                    <div>
                      <div className="flex items-start gap-1.5">
                        <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-card-foreground leading-relaxed">
                            Plot No. 42, Silicon Valley Layout,<br/>
                            Madhapur, Hyderabad, TS 500081
                          </p>
                          <a href="https://maps.google.com/?q=Madhapur,Hyderabad" target="_blank" rel="noreferrer" className="text-[11px] text-primary hover:underline mt-1 inline-flex items-center gap-1">
                            View on Google Maps <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status & Tracking */}
              <div className="rounded-lg border p-4 shadow-sm">
                <div className="flex flex-col md:flex-row gap-6 md:items-end justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-card-foreground mb-2">Update Order Status</h3>
                    <div className="flex gap-2 relative">
                      <select 
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm font-medium w-40"
                        defaultValue={selectedOrder.status}
                      >
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Returned">Returned</option>
                      </select>
                      <Button size="sm" className="h-9">Update</Button>
                    </div>
                  </div>
                  <div className="flex-1 bg-secondary/50 rounded-md p-3 max-w-sm">
                    <h4 className="text-xs font-semibold text-muted-foreground mb-2">Shipment Tracking</h4>
                    <div className="space-y-2">
                       <select className="flex h-8 w-full rounded-md border border-border bg-background px-3 py-1 text-xs shadow-sm outline-none">
                         <option>BlueDart Express</option>
                         <option>Ekart Logistics</option>
                         <option>Delhivery</option>
                       </select>
                       <div className="flex gap-2">
                         <Input placeholder="Tracking ID" className="h-8 text-xs bg-background" defaultValue="BD789456123IN" />
                         <Button size="sm" variant="secondary" className="h-8 text-xs font-semibold whitespace-nowrap">Save</Button>
                       </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-sm font-semibold text-card-foreground mb-3 flex items-center gap-1.5 border-b pb-2">
                  <Package className="h-4 w-4" /> Ordered Items ({selectedOrder.items})
                </h3>
                <div className="overflow-x-auto rounded-lg border">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary/50 border-b">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground text-xs">Product</th>
                        <th className="px-3 py-2 text-right font-medium text-muted-foreground text-xs">Qty</th>
                        <th className="px-3 py-2 text-right font-medium text-muted-foreground text-xs">Price</th>
                        <th className="px-3 py-2 text-right font-medium text-muted-foreground text-xs">Discount</th>
                        <th className="px-3 py-2 text-right font-medium text-muted-foreground text-xs">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {Array.from({ length: selectedOrder.items }).map((_, i) => {
                        const basePrice = (parseFloat(selectedOrder.total.replace(/[^0-9.]/g, '')) / selectedOrder.items).toFixed(2);
                        return (
                        <tr key={i} className="hover:bg-secondary/20">
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded border bg-secondary flex items-center justify-center shrink-0">
                                <Package className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <div>
                                <p className="font-medium text-card-foreground line-clamp-1">Product Item {i + 1}</p>
                                <p className="text-xs text-muted-foreground">{selectedOrder.seller}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-right text-card-foreground font-medium">1</td>
                          <td className="px-3 py-3 text-right text-muted-foreground">${basePrice}</td>
                          <td className="px-3 py-3 text-right text-success text-xs">10%</td>
                          <td className="px-3 py-3 text-right font-medium text-card-foreground">${(basePrice * 0.9).toFixed(2)}</td>
                        </tr>
                      )})}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
