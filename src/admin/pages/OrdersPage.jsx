import { useState } from "react";
import { StatCard } from "@/admin/components/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, ShoppingCart, Truck, CheckCircle2, XCircle, RotateCcw,
  Eye, X, MapPin, Download, Package, ExternalLink, Calendar, Check,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

const orderTrend = [
  { date: "Mar 1",  orders: 142, revenue: 18200 },
  { date: "Mar 5",  orders: 168, revenue: 21400 },
  { date: "Mar 9",  orders: 155, revenue: 19800 },
  { date: "Mar 13", orders: 198, revenue: 25600 },
  { date: "Mar 17", orders: 182, revenue: 23400 },
  { date: "Mar 21", orders: 215, revenue: 28900 },
];

const statusBreakdown = [
  { name: "Delivered",  value: 58 },
  { name: "Shipped",    value: 22 },
  { name: "Processing", value: 12 },
  { name: "Cancelled",  value: 5  },
  { name: "Returned",   value: 3  },
];
const STATUS_COLORS = [
  "hsl(152,69%,40%)", "hsl(210,92%,55%)", "hsl(38,92%,50%)",
  "hsl(0,84%,60%)", "hsl(280,65%,55%)",
];


/* ─── Invoice download helper ──────────────────────────────────── */
function downloadInvoice(order) {
  const items = Array.from({ length: order.items }, (_, i) => {
    const raw = parseFloat(order.total.replace(/[^0-9.]/g, ""));
    const base = (raw / order.items).toFixed(2);
    const disc = (base * 0.1).toFixed(2);
    const net  = (base * 0.9).toFixed(2);
    const gst  = (net * 0.18).toFixed(2);
    return { name: `Product Item ${i + 1}`, base, disc, net, gst };
  });

  const totalNet = items.reduce((s, r) => s + parseFloat(r.net), 0).toFixed(2);
  const totalGST = items.reduce((s, r) => s + parseFloat(r.gst), 0).toFixed(2);
  const grandTotal = (parseFloat(totalNet) + parseFloat(totalGST)).toFixed(2);

  const rows = items.map((it, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${it.name} (${order.seller})</td>
      <td>1</td>
      <td>₹${it.base}</td>
      <td>₹${it.disc} (10%)</td>
      <td>₹${it.net}</td>
      <td>₹${it.gst} (18%)</td>
      <td><strong>₹${(parseFloat(it.net) + parseFloat(it.gst)).toFixed(2)}</strong></td>
    </tr>`).join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Invoice - ${order.id}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color:#1a1a2e; background:#fff; padding:40px; }
    .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:32px; padding-bottom:20px; border-bottom:2px solid #f0f0f0; }
    .brand { font-size:24px; font-weight:800; color:#e85d04; letter-spacing:-0.5px; }
    .brand span { color:#1a1a2e; }
    .invoice-meta { text-align:right; }
    .invoice-meta h2 { font-size:20px; font-weight:700; color:#1a1a2e; }
    .invoice-meta p { font-size:12px; color:#666; margin-top:2px; }
    .badge { display:inline-block; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:600; background:#dcfce7; color:#15803d; }
    .section { margin-bottom:24px; }
    .section-title { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:#999; margin-bottom:10px; }
    .info-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; }
    .info-box { background:#f8f9fa; border-radius:8px; padding:14px 16px; }
    .info-box h4 { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:#999; margin-bottom:8px; }
    .info-box p { font-size:13px; color:#1a1a2e; line-height:1.6; }
    .info-box .highlight { font-weight:700; color:#e85d04; }
    table { width:100%; border-collapse:collapse; font-size:12px; }
    thead tr { background:#1a1a2e; color:#fff; }
    thead th { padding:10px 12px; text-align:left; font-weight:600; font-size:11px; text-transform:uppercase; letter-spacing:0.5px; }
    tbody tr:nth-child(even) { background:#f8f9fa; }
    tbody td { padding:10px 12px; color:#333; border-bottom:1px solid #f0f0f0; }
    tfoot tr { background:#fff3e0; }
    tfoot td { padding:10px 12px; font-weight:700; border-top:2px solid #e85d04; }
    .totals { margin-top:16px; display:flex; justify-content:flex-end; }
    .totals-box { background:#1a1a2e; color:#fff; border-radius:10px; padding:16px 24px; min-width:240px; }
    .totals-box .row { display:flex; justify-content:space-between; margin-bottom:6px; font-size:13px; }
    .totals-box .grand { font-size:16px; font-weight:800; color:#e85d04; border-top:1px solid rgba(255,255,255,0.2); padding-top:8px; margin-top:8px; }
    .tracking { background:#f0f9ff; border:1px solid #bae6fd; border-radius:8px; padding:14px 16px; margin-top:16px; }
    .tracking h4 { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:#0369a1; margin-bottom:8px; }
    .tracking-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; font-size:12px; }
    .tracking-grid .label { color:#666; font-weight:600; font-size:10px; text-transform:uppercase; }
    .tracking-grid .value { color:#1a1a2e; font-weight:600; margin-top:2px; }
    .footer { margin-top:32px; padding-top:16px; border-top:1px solid #f0f0f0; display:flex; justify-content:space-between; font-size:11px; color:#999; }
    @media print { body { padding:20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">Admin<span>Panel</span></div>
      <p style="font-size:12px;color:#666;margin-top:4px;">Your Trusted Marketplace</p>
    </div>
    <div class="invoice-meta">
      <h2>TAX INVOICE</h2>
      <p>Invoice #: ${order.id.replace("ORD-", "INV-")}</p>
      <p>Date: ${order.date}</p>
      <p style="margin-top:6px"><span class="badge">PAID</span></p>
    </div>
  </div>

  <div class="section">
    <div class="info-grid">
      <div class="info-box">
        <h4>Bill To</h4>
        <p><strong>${order.customer}</strong><br/>${order.email}<br/>+91 98765 43210<br/>Plot 42, Madhapur<br/>Hyderabad, TS 500081</p>
      </div>
      <div class="info-box">
        <h4>Order Info</h4>
        <p>Order ID: <strong>${order.id}</strong><br/>Date: ${order.date}<br/>Seller: <strong>${order.seller}</strong><br/>Payment: <strong>${order.payment}</strong></p>
      </div>
      <div class="info-box">
        <h4>Amount Summary</h4>
        <p>Items: ${order.items}<br/>Total: <span class="highlight">${order.total}</span><br/>Status: <strong>Paid</strong></p>
      </div>
    </div>
  </div>

  ${order.trackingId ? `
  <div class="tracking">
    <h4>Shipment Tracking</h4>
    <div class="tracking-grid">
      <div><div class="label">Courier</div><div class="value">${order.courier || "—"}</div></div>
      <div><div class="label">Tracking ID</div><div class="value">${order.trackingId}</div></div>
      <div><div class="label">Est. Delivery</div><div class="value">${order.estimatedDelivery || "—"}</div></div>
      <div><div class="label">Status</div><div class="value">${order.status}</div></div>
    </div>
  </div>` : ""}

  <div class="section" style="margin-top:20px">
    <div class="section-title">Order Items</div>
    <table>
      <thead>
        <tr>
          <th>#</th><th>Product</th><th>Qty</th><th>Unit Price</th>
          <th>Discount</th><th>Net Price</th><th>GST (18%)</th><th>Total</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="totals">
      <div class="totals-box">
        <div class="row"><span>Subtotal</span><span>₹${totalNet}</span></div>
        <div class="row"><span>GST (18%)</span><span>₹${totalGST}</span></div>
        <div class="row grand"><span>Grand Total</span><span>₹${grandTotal}</span></div>
      </div>
    </div>
  </div>

  <div class="footer">
    <span>Thank you for your order! For support, contact support@adminpanel.com</span>
    <span>Generated on ${new Date().toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })}</span>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `Invoice-${order.id}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

const INITIAL_ORDERS = [
  { id: "ORD-78451", customer: "Rahul Sharma",  email: "rahul@email.com",  items: 3, total: "₹2,48,997", payment: "UPI",    seller: "TechZone",       date: "Mar 21, 2026", status: "Delivered",  courier: "BlueDart Express",  trackingId: "BD789456123IN", estimatedDelivery: "Mar 23, 2026", trackingLink: "https://www.bluedart.com" },
  { id: "ORD-78450", customer: "Priya Patel",   email: "priya@email.com",  items: 1, total: "₹8,999",    payment: "Card",   seller: "FashionHub",     date: "Mar 21, 2026", status: "Shipped",    courier: "Delhivery",         trackingId: "DL456789012",   estimatedDelivery: "Mar 24, 2026", trackingLink: "https://www.delhivery.com" },
  { id: "ORD-78449", customer: "Amit Kumar",    email: "amit@email.com",   items: 5, total: "₹41,250",   payment: "COD",    seller: "GadgetWorld",    date: "Mar 20, 2026", status: "Processing", courier: "",                  trackingId: "",              estimatedDelivery: "",             trackingLink: "" },
  { id: "ORD-78448", customer: "Sneha Reddy",   email: "sneha@email.com",  items: 2, total: "₹15,600",   payment: "UPI",    seller: "BeautyFirst",    date: "Mar 20, 2026", status: "Delivered",  courier: "Ekart Logistics",   trackingId: "EK123456789",   estimatedDelivery: "Mar 22, 2026", trackingLink: "https://www.ekartlogistics.com" },
  { id: "ORD-78447", customer: "Vikram Singh",  email: "vikram@email.com", items: 4, total: "₹32,000",   payment: "Card",   seller: "FitGear",        date: "Mar 19, 2026", status: "Cancelled",  courier: "",                  trackingId: "",              estimatedDelivery: "",             trackingLink: "" },
  { id: "ORD-78446", customer: "Meera Joshi",   email: "meera@email.com",  items: 2, total: "₹17,800",   payment: "Wallet", seller: "HomeEssentials", date: "Mar 19, 2026", status: "Returned",   courier: "BlueDart Express",  trackingId: "BD321654987IN", estimatedDelivery: "Mar 21, 2026", trackingLink: "https://www.bluedart.com" },
  { id: "ORD-78445", customer: "Karan Mehta",   email: "karan@email.com",  items: 1, total: "₹9,999",    payment: "UPI",    seller: "TechZone",       date: "Mar 18, 2026", status: "Delivered",  courier: "Delhivery",         trackingId: "DL987654321",   estimatedDelivery: "Mar 20, 2026", trackingLink: "https://www.delhivery.com" },
  { id: "ORD-78444", customer: "Anita Desai",   email: "anita@email.com",  items: 3, total: "₹26,700",   payment: "Card",   seller: "FashionHub",     date: "Mar 18, 2026", status: "Shipped",    courier: "Ekart Logistics",   trackingId: "EK654321098",   estimatedDelivery: "Mar 23, 2026", trackingLink: "https://www.ekartlogistics.com" },
];

const statusStyle = {
  Delivered: "badge-success", Shipped: "badge-info", Processing: "badge-warning",
  Cancelled: "badge-danger",  Returned: "badge-neutral",
};
const paymentStyle = {
  UPI: "badge-info", Card: "badge-success", COD: "badge-warning", Wallet: "badge-neutral",
};

const COURIERS = ["BlueDart Express", "Ekart Logistics", "Delhivery", "India Post", "DTDC", "XpressBees"];

const STATUS_FLOW = ["Processing", "Shipped", "Delivered"];

export default function OrdersPage() {
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Mutable orders state — all updates live here
  const [orders, setOrders] = useState(INITIAL_ORDERS);

  // Per-modal edit state
  const [editStatus, setEditStatus]           = useState("");
  const [editCourier, setEditCourier]         = useState("");
  const [editTrackingId, setEditTrackingId]   = useState("");
  const [editEstDate, setEditEstDate]         = useState("");
  const [editTrackingLink, setEditTrackingLink] = useState("");

  // Save feedback
  const [statusSaved, setStatusSaved]     = useState(false);
  const [trackingSaved, setTrackingSaved] = useState(false);

  const openOrder = (o) => {
    setSelectedOrder(o);
    setEditStatus(o.status);
    setEditCourier(o.courier || "BlueDart Express");
    setEditTrackingId(o.trackingId || "");
    setEditEstDate(o.estimatedDelivery || "");
    setEditTrackingLink(o.trackingLink || "");
    setStatusSaved(false);
    setTrackingSaved(false);
  };

  const closeModal = () => setSelectedOrder(null);

  const handleUpdateStatus = () => {
    setOrders(prev =>
      prev.map(o => o.id === selectedOrder.id ? { ...o, status: editStatus } : o)
    );
    setSelectedOrder(prev => ({ ...prev, status: editStatus }));
    setStatusSaved(true);
    setTimeout(() => setStatusSaved(false), 2000);
  };

  const handleSaveTracking = () => {
    const update = {
      courier: editCourier,
      trackingId: editTrackingId,
      estimatedDelivery: editEstDate,
      trackingLink: editTrackingLink,
    };
    setOrders(prev =>
      prev.map(o => o.id === selectedOrder.id ? { ...o, ...update } : o)
    );
    setSelectedOrder(prev => ({ ...prev, ...update }));
    setTrackingSaved(true);
    setTimeout(() => setTrackingSaved(false), 2000);
  };

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

      {/* Stat Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        <StatCard title="Total Orders" value="5,120"  todayValue="128" change="+8.4% this month"   changeType="positive" icon={ShoppingCart} />
        <StatCard title="Shipped"      value="1,128"  todayValue="42"  change="In transit"          changeType="neutral"  icon={Truck} />
        <StatCard title="Delivered"    value="2,970"  todayValue="86"  change="58% delivery rate"   changeType="positive" icon={CheckCircle2} />
        <StatCard title="Cancelled"    value="256"    todayValue="12"  change="5% cancel rate"      changeType="negative" icon={XCircle} />
        <StatCard title="Returns"      value="154"    todayValue="8"   change="3% return rate"      changeType="negative" icon={RotateCcw} />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 chart-card">
          <h3 className="chart-title">Order Volume Trend</h3>
          <p className="chart-subtitle mb-4">Daily orders &amp; revenue — March 2026</p>
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
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: STATUS_COLORS[i] }} />
                  {s.name}
                </span>
                <span className="font-semibold text-card-foreground">{s.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            className="pl-9 bg-card"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {["All", "Delivered", "Shipped", "Processing", "Cancelled", "Returned"].map((f) => (
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

      {/* Orders Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Seller</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Date</th>
                <th>Status</th>
                <th>Courier</th>
                <th>Tracking ID</th>
                <th>Est. Delivery</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id}>
                  <td className="font-medium text-card-foreground">{o.id}</td>
                  <td>
                    <div>
                      <p className="text-card-foreground text-sm">{o.customer}</p>
                      <p className="text-[10px] text-muted-foreground">{o.email}</p>
                    </div>
                  </td>
                  <td className="text-card-foreground">{o.seller}</td>
                  <td className="text-muted-foreground">{o.items}</td>
                  <td className="font-medium text-card-foreground">{o.total}</td>
                  <td><span className={paymentStyle[o.payment]}>{o.payment}</span></td>
                  <td className="text-muted-foreground text-xs">{o.date}</td>
                  <td><span className={`text-xs font-medium ${statusStyle[o.status]}`}>{o.status}</span></td>
                  <td className="text-xs text-muted-foreground">{o.courier || "—"}</td>
                  <td className="text-xs text-muted-foreground font-mono">{o.trackingId || "—"}</td>
                  <td className="text-xs text-muted-foreground">{o.estimatedDelivery || "—"}</td>
                  <td>
                    <button
                      onClick={() => openOrder(o)}
                      className="rounded p-1.5 hover:bg-secondary transition-colors"
                      title="View order details"
                    >
                      <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  </td>
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
                <p className="text-xs text-muted-foreground mt-0.5">
                  <Calendar className="inline h-3 w-3 mr-1" /> Placed on {selectedOrder.date}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 h-8 text-xs font-semibold"
                  onClick={() => downloadInvoice(selectedOrder)}
                >
                  <Download className="h-3.5 w-3.5" /> Invoice
                </Button>
                <button
                  onClick={closeModal}
                  className="p-1.5 hover:bg-secondary rounded-md transition-colors text-muted-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-5 grid gap-6">
              {/* Top Details Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg border bg-secondary/30 p-4 shadow-sm">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Payment Info</h3>
                  <div className="space-y-2">
                    <p className="text-sm flex justify-between">
                      <span className="text-muted-foreground">Method:</span>
                      <span className={`font-semibold ${paymentStyle[selectedOrder.payment]}`}>{selectedOrder.payment}</span>
                    </p>
                    <p className="text-sm flex justify-between">
                      <span className="text-muted-foreground">Total:</span>
                      <span className="font-bold text-card-foreground">{selectedOrder.total}</span>
                    </p>
                    <p className="text-sm flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="text-success font-medium">Paid</span>
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border bg-secondary/30 p-4 shadow-sm md:col-span-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Customer &amp; Shipping</h3>
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
                            Plot No. 42, Silicon Valley Layout,<br />
                            Madhapur, Hyderabad, TS 500081
                          </p>
                          <a
                            href="https://maps.google.com/?q=Madhapur,Hyderabad"
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-primary hover:underline mt-1 inline-flex items-center gap-1"
                          >
                            View on Google Maps <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Update + Shipment Tracking */}
              <div className="rounded-lg border p-4 shadow-sm space-y-4">
                <h3 className="text-sm font-semibold text-card-foreground border-b pb-2">Order Management</h3>

                {/* Status update */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Update Order Status</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {["Processing", "Shipped", "Delivered", "Cancelled", "Returned"].map((s) => (
                      <button
                        key={s}
                        onClick={() => setEditStatus(s)}
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-all ${
                          editStatus === s
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/50 hover:text-card-foreground"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                    <Button
                      size="sm"
                      className="h-8 text-xs ml-1 gap-1.5"
                      onClick={handleUpdateStatus}
                      disabled={editStatus === selectedOrder.status}
                    >
                      {statusSaved ? <><Check className="h-3 w-3" /> Saved</> : "Update Status"}
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5">
                    Current status: <span className={`font-semibold ${statusStyle[selectedOrder.status]}`}>{selectedOrder.status}</span>
                  </p>
                </div>

                {/* Tracking details */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Shipment Tracking Details</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-muted-foreground font-medium block mb-1">Courier Partner</label>
                      <select
                        className="flex h-8 w-full rounded-md border border-border bg-background px-3 py-1 text-xs shadow-sm outline-none focus:ring-1 focus:ring-primary/40"
                        value={editCourier}
                        onChange={(e) => setEditCourier(e.target.value)}
                      >
                        {COURIERS.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground font-medium block mb-1">Tracking ID</label>
                      <Input
                        placeholder="e.g. BD789456123IN"
                        className="h-8 text-xs bg-background"
                        value={editTrackingId}
                        onChange={(e) => setEditTrackingId(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground font-medium block mb-1">Estimated Delivery Date</label>
                      <Input
                        placeholder="e.g. Mar 25, 2026"
                        className="h-8 text-xs bg-background"
                        value={editEstDate}
                        onChange={(e) => setEditEstDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground font-medium block mb-1">Tracking Link</label>
                      <Input
                        placeholder="https://..."
                        className="h-8 text-xs bg-background"
                        value={editTrackingLink}
                        onChange={(e) => setEditTrackingLink(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <Button size="sm" variant="secondary" className="h-8 text-xs gap-1.5" onClick={handleSaveTracking}>
                      {trackingSaved ? <><Check className="h-3 w-3" /> Tracking Saved</> : "Save Tracking"}
                    </Button>
                    {selectedOrder.trackingLink && (
                      <a
                        href={selectedOrder.trackingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                      >
                        Track Shipment <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Current tracking display */}
                {(selectedOrder.trackingId || selectedOrder.courier) && (
                  <div className="rounded-md bg-secondary/40 p-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <p className="text-muted-foreground font-medium mb-0.5">Courier</p>
                      <p className="text-card-foreground font-semibold">{selectedOrder.courier || "—"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground font-medium mb-0.5">Tracking ID</p>
                      <p className="text-card-foreground font-mono font-semibold">{selectedOrder.trackingId || "—"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground font-medium mb-0.5">Est. Delivery</p>
                      <p className="text-card-foreground font-semibold">{selectedOrder.estimatedDelivery || "—"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground font-medium mb-0.5">Tracking Link</p>
                      {selectedOrder.trackingLink ? (
                        <a href={selectedOrder.trackingLink} target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                          Open <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      ) : <p className="text-muted-foreground">—</p>}
                    </div>
                  </div>
                )}
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
                        const raw = parseFloat(selectedOrder.total.replace(/[^0-9.]/g, ""));
                        const basePrice = (raw / selectedOrder.items).toFixed(2);
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
                            <td className="px-3 py-3 text-right text-muted-foreground">₹{basePrice}</td>
                            <td className="px-3 py-3 text-right text-success text-xs">10%</td>
                            <td className="px-3 py-3 text-right font-medium text-card-foreground">₹{(basePrice * 0.9).toFixed(2)}</td>
                          </tr>
                        );
                      })}
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
