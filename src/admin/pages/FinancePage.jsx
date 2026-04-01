import { useState, useEffect, useMemo, useCallback } from "react";
import { StatCard } from "@/admin/components/StatCard";
import {
  IndianRupee, TrendingUp, CreditCard, Receipt, Search,
  Package, Plus, Minus, Edit2, Check, X, Download,
  Calendar, Filter, ChevronDown,
} from "lucide-react";
import { Input } from "@/admin/components/ui/input";
import { Button } from "@/admin/components/ui/button";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { getAllProducts, updateProduct } from "@/admin/lib/productStorage";

// ─── Constants ────────────────────────────────────────────────────────────────
const COLORS = ["hsl(25,95%,53%)", "hsl(210,92%,55%)", "hsl(280,65%,55%)", "hsl(38,92%,50%)"];

const monthlyPL = [
  { month: "Oct", revenue: 548000, costs: 376000, profit: 172000, shipping: 32000, tax: 54800, discount: 12000 },
  { month: "Nov", revenue: 675000, costs: 462000, profit: 213000, shipping: 40500, tax: 67500, discount: 18000 },
  { month: "Dec", revenue: 802000, costs: 515000, profit: 287000, shipping: 48120, tax: 80200, discount: 22000 },
  { month: "Jan", revenue: 568000, costs: 395000, profit: 173000, shipping: 34080, tax: 56800, discount: 14000 },
  { month: "Feb", revenue: 595000, costs: 408000, profit: 187000, shipping: 35700, tax: 59500, discount: 16000 },
  { month: "Mar", revenue: 735000, costs: 497000, profit: 238000, shipping: 44100, tax: 73500, discount: 19000 },
];

const dailyRevenue = [
  { day: "Mon", revenue: 24500 }, { day: "Tue", revenue: 31200 },
  { day: "Wed", revenue: 28900 }, { day: "Thu", revenue: 35600 },
  { day: "Fri", revenue: 42100 }, { day: "Sat", revenue: 38700 },
  { day: "Sun", revenue: 29300 },
];

const costBreakdown = [
  { name: "Seller Payouts", value: 52 },
  { name: "Logistics",      value: 26 },
  { name: "Platform Ops",   value: 14 },
  { name: "Refunds",        value: 8  },
];

const INITIAL_PAYOUTS = [
  { id: 1, name: "TrendyWear Co.",   amount: 105400, status: "Pending",   date: "—",          revenue: 124000 },
  { id: 2, name: "FashionHub India", amount: 75820,  status: "Completed", date: "Mar 20 2026", revenue: 89200  },
  { id: 3, name: "GadgetWorld",      amount: 57800,  status: "Pending",   date: "—",          revenue: 68000  },
  { id: 4, name: "BeautyFirst Co.",  amount: 38760,  status: "Completed", date: "Mar 21 2026", revenue: 45600  },
  { id: 5, name: "FitGear India",    amount: 27540,  status: "Pending",   date: "—",          revenue: 32400  },
];

const INITIAL_TRANSACTIONS = [
  { id: "TXN-9821", type: "Seller Payout", seller: "TrendyWear Co.",   amount: 12400, date: "Mar 21 2026 09:14", status: "Completed" },
  { id: "TXN-9820", type: "Refund",        seller: "FashionHub India", amount: 8999,  date: "Mar 21 2026 08:30", status: "Pending"   },
  { id: "TXN-9819", type: "Commission",    seller: "GadgetWorld",      amount: 3420,  date: "Mar 20 2026 17:55", status: "Completed" },
  { id: "TXN-9818", type: "Seller Payout", seller: "BeautyFirst Co.",  amount: 8760,  date: "Mar 20 2026 14:22", status: "Completed" },
  { id: "TXN-9817", type: "Ad Revenue",    seller: "TrendyWear Co.",   amount: 2100,  date: "Mar 19 2026 11:05", status: "Pending"   },
  { id: "TXN-9816", type: "Refund",        seller: "GadgetWorld",      amount: 1560,  date: "Mar 19 2026 09:40", status: "Completed" },
];

const txnStatusStyle = { Completed: "badge-success", Processing: "badge-warning", Pending: "badge-info" };
const txnTypeStyle   = { "Seller Payout": "badge-info", Refund: "badge-danger", Commission: "badge-success", "Ad Revenue": "badge-neutral" };

const fmt   = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
const fmtK  = (v) => `₹${(v / 1000).toFixed(0)}k`;

// ─── Stock helpers ────────────────────────────────────────────────────────────
const stockStatus = (qty) => {
  if (qty === 0)  return { label: "Out of Stock", cls: "badge-danger"   };
  if (qty < 50)   return { label: "Low Stock",    cls: "badge-warning"  };
  return              { label: "In Stock",      cls: "badge-success" };
};

const parsePrice = (p) => {
  if (typeof p === "number") return p;
  return parseFloat(String(p).replace(/[^0-9.]/g, "")) || 0;
};

// ─── CSV / PDF export helpers ─────────────────────────────────────────────────
const downloadCSV = (rows, filename) => {
  const header = Object.keys(rows[0]).join(",");
  const body   = rows.map((r) => Object.values(r).map((v) => `"${v}"`).join(",")).join("\n");
  const blob   = new Blob([`${header}\n${body}`], { type: "text/csv" });
  const a      = document.createElement("a");
  a.href       = URL.createObjectURL(blob);
  a.download   = filename;
  a.click();
};

const downloadPDF = (title, rows, filename) => {
  const header = Object.keys(rows[0]);
  const html = `<html><head><style>
    body{font-family:sans-serif;padding:20px}
    h2{margin-bottom:12px}
    table{border-collapse:collapse;width:100%}
    th,td{border:1px solid #ddd;padding:8px;font-size:12px}
    th{background:#f5f5f5;font-weight:600}
  </style></head><body>
    <h2>${title}</h2>
    <table>
      <thead><tr>${header.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
      <tbody>${rows.map((r) => `<tr>${Object.values(r).map((v) => `<td>${v}</td>`).join("")}</tr>`).join("")}</tbody>
    </table>
  </body></html>`;
  const blob = new Blob([html], { type: "text/html" });
  const a    = document.createElement("a");
  a.href     = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
};

// ─── Collapsible section wrapper ──────────────────────────────────────────────
const Section = ({ title, subtitle, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-3 border-b hover:bg-secondary/30 transition-colors"
      >
        <div>
          <h3 className="chart-title text-left">{title}</h3>
          {subtitle && <p className="chart-subtitle text-left">{subtitle}</p>}
        </div>
        <ChevronDown size={16} className={`text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="p-5">{children}</div>}
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// Main Component
// ═════════════════════════════════════════════════════════════════════════════
export default function FinancePage() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [txnSearch,    setTxnSearch]    = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFrom,     setDateFrom]     = useState("");
  const [dateTo,       setDateTo]       = useState("");
  const [sellerFilter, setSellerFilter] = useState("All");
  const [reportType,   setReportType]   = useState("monthly");

  const [stockItems,  setStockItems]  = useState([]);
  const [editingId,   setEditingId]   = useState(null);
  const [editQty,     setEditQty]     = useState("");
  const [payouts,     setPayouts]     = useState(INITIAL_PAYOUTS);
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);

  // ── Load products for stock management ────────────────────────────────────
  useEffect(() => {
    const products = getAllProducts();
    const mapped = products.map((p) => ({
      id:    p.id,
      name:  p.name,
      stock: typeof p.stock === "number" ? p.stock : 100,
      price: parsePrice(p.price || p.mrp || 0),
      seller: p.seller || "Trendy Drapes",
      category: p.category || "—",
    }));
    setStockItems(mapped);
  }, []);

  // ── Derived revenue figures ────────────────────────────────────────────────
  const revenueBreakdown = useMemo(() => {
    const latest = monthlyPL[monthlyPL.length - 1];
    return {
      productRevenue: latest.revenue,
      shipping:       latest.shipping,
      tax:            latest.tax,
      discounts:      latest.discount,
      total:          latest.revenue + latest.shipping - latest.discount,
    };
  }, []);

  const totalStock = useMemo(() =>
    stockItems.reduce((sum, i) => sum + i.stock, 0), [stockItems]);
  const totalStockValue = useMemo(() =>
    stockItems.reduce((sum, i) => sum + i.stock * i.price, 0), [stockItems]);
  const lowStockCount = useMemo(() =>
    stockItems.filter((i) => i.stock > 0 && i.stock < 50).length, [stockItems]);
  const outOfStockCount = useMemo(() =>
    stockItems.filter((i) => i.stock === 0).length, [stockItems]);

  const pendingPayouts = useMemo(() =>
    payouts.filter((p) => p.status === "Pending"), [payouts]);
  const completedPayouts = useMemo(() =>
    payouts.filter((p) => p.status === "Completed"), [payouts]);

  // ── Filtered transactions ──────────────────────────────────────────────────
  const filteredTxns = useMemo(() => transactions.filter((t) => {
    const q = txnSearch.toLowerCase();
    const matchSearch = !q || t.id.toLowerCase().includes(q) ||
      t.seller.toLowerCase().includes(q) || t.type.toLowerCase().includes(q);
    const matchStatus = statusFilter === "All" || t.status === statusFilter;
    const matchSeller = sellerFilter === "All" || t.seller === sellerFilter;
    return matchSearch && matchStatus && matchSeller;
  }), [transactions, txnSearch, statusFilter, sellerFilter]);

  const sellers = useMemo(() => ["All", ...new Set(transactions.map((t) => t.seller))], [transactions]);

  // ── Stock actions ──────────────────────────────────────────────────────────
  const adjustStock = useCallback((id, delta) => {
    setStockItems((prev) => prev.map((item) =>
      item.id === id ? { ...item, stock: Math.max(0, item.stock + delta) } : item
    ));
  }, []);

  const saveEditStock = useCallback((id) => {
    const qty = parseInt(editQty, 10);
    if (isNaN(qty) || qty < 0) return;
    setStockItems((prev) => prev.map((item) =>
      item.id === id ? { ...item, stock: qty } : item
    ));
    setEditingId(null);
    setEditQty("");
  }, [editQty]);

  // ── Payout actions ─────────────────────────────────────────────────────────
  const markPayoutComplete = useCallback((id) => {
    const now = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    setPayouts((prev) => prev.map((p) =>
      p.id === id ? { ...p, status: "Completed", date: now } : p
    ));
  }, []);

  // ── Export handlers ────────────────────────────────────────────────────────
  const exportStockCSV = () => downloadCSV(
    stockItems.map((i) => ({ Name: i.name, Stock: i.stock, Status: stockStatus(i.stock).label, Price: fmt(i.price), "Total Value": fmt(i.stock * i.price) })),
    "stock_report.csv"
  );
  const exportStockPDF = () => downloadPDF("Stock Management Report",
    stockItems.map((i) => ({ Name: i.name, Stock: i.stock, Status: stockStatus(i.stock).label, Price: fmt(i.price), "Total Value": fmt(i.stock * i.price) })),
    "stock_report.html"
  );
  const exportPayoutsCSV = () => downloadCSV(
    payouts.map((p) => ({ Seller: p.name, Amount: fmt(p.amount), Status: p.status, Date: p.date })),
    "payout_report.csv"
  );
  const exportPayoutsPDF = () => downloadPDF("Seller Payout Report",
    payouts.map((p) => ({ Seller: p.name, Amount: fmt(p.amount), Status: p.status, Date: p.date })),
    "payout_report.html"
  );
  const exportTxnCSV = () => downloadCSV(
    filteredTxns.map((t) => ({ ID: t.id, Type: t.type, Seller: t.seller, Amount: fmt(t.amount), Date: t.date, Status: t.status })),
    "transactions_report.csv"
  );

  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6">

      <div className="page-header">
        <h1 className="page-title">Finance</h1>
        <p className="page-subtitle">Revenue analytics, stock management, seller payouts, and transaction tracking</p>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard title="Gross Revenue"   value="₹39.2L" change="+18.2% vs Q3"        changeType="positive" icon={IndianRupee} />
        <StatCard title="Net Profit"      value="₹12.7L" change="+22.1% vs Q3"        changeType="positive" icon={TrendingUp} />
        <StatCard title="Seller Payouts"  value="₹24.8L" change="63% of revenue"      changeType="neutral"  icon={Receipt}    />
        <StatCard title="Profit Margin"   value="32.4%"  change="+2.8% improvement"   changeType="positive" icon={CreditCard} />
      </div>

      {/* ── Charts Row ── */}
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
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(220,9%,46%)" tickFormatter={fmtK} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v) => [fmtK(v)]} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(25,95%,53%)"  fill="url(#revGrad2)"  strokeWidth={2} />
              <Area type="monotone" dataKey="costs"   stroke="hsl(210,92%,55%)" fill="none"            strokeWidth={1.5} strokeDasharray="4 4" />
              <Area type="monotone" dataKey="profit"  stroke="hsl(152,69%,40%)" fill="url(#profGrad2)" strokeWidth={2} />
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
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: COLORS[i] }} />{c.name}
                </span>
                <span className="font-semibold text-card-foreground">{c.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          STOCK MANAGEMENT
      ══════════════════════════════════════════════════════════════════════ */}
      <Section title="Stock Management" subtitle="Live inventory levels, values, and stock actions">
        {/* Stock stat row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          {[
            { label: "Total Products",   value: stockItems.length,              color: "text-card-foreground" },
            { label: "Total Units",      value: totalStock.toLocaleString(),     color: "text-card-foreground" },
            { label: "Low Stock Items",  value: lowStockCount,                  color: "text-yellow-600"       },
            { label: "Out of Stock",     value: outOfStockCount,                color: "text-red-600"          },
          ].map((s) => (
            <div key={s.label} className="rounded-lg bg-secondary/50 p-3">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{s.label}</p>
              <p className={`text-lg font-bold mt-0.5 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Total stock value */}
        <div className="rounded-lg bg-secondary/50 p-3 mb-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Total Inventory Value</p>
            <p className="text-xl font-bold text-card-foreground mt-0.5">{fmt(totalStockValue)}</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="text-xs gap-1.5" onClick={exportStockCSV}>
              <Download className="h-3 w-3" /> CSV
            </Button>
            <Button size="sm" variant="outline" className="text-xs gap-1.5" onClick={exportStockPDF}>
              <Download className="h-3 w-3" /> PDF
            </Button>
          </div>
        </div>

        {/* Stock table */}
        <div className="overflow-x-auto rounded-lg border">
          <table className="data-table w-full table-fixed min-w-[900px]">
            <thead>
              <tr>
                <th className="text-left w-[24%]">Product</th>
                <th className="text-left w-[16%]">Category</th>
                <th className="text-right w-[12%]">Stock Qty</th>
                <th className="text-center w-[12%]">Status</th>
                <th className="text-right w-[12%]">Price</th>
                <th className="text-right w-[12%]">Total Value</th>
                <th className="text-right w-[12%]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stockItems.map((item) => {
                const ss = stockStatus(item.stock);
                const isLow = item.stock > 0 && item.stock < 50;
                return (
                  <tr key={item.id} className={isLow ? "bg-yellow-50/40" : ""}>
                    <td className="text-left">
                      <p className="font-medium text-card-foreground text-sm truncate max-w-[180px]" title={item.name}>
                        {item.name}
                      </p>
                    </td>
                    <td className="text-muted-foreground text-xs text-left">{item.category}</td>
                    <td className="text-right">
                      {editingId === item.id ? (
                        <div className="flex items-center justify-end gap-1">
                          <input
                            type="number" min="0"
                            value={editQty}
                            onChange={(e) => setEditQty(e.target.value)}
                            className="w-16 px-2 py-1 text-xs border border-input rounded bg-background"
                            autoFocus
                          />
                          <button onClick={() => saveEditStock(item.id)} className="p-1 text-green-600 hover:bg-secondary rounded">
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => setEditingId(null)} className="p-1 text-destructive hover:bg-secondary rounded">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="font-semibold text-card-foreground">{item.stock}</span>
                      )}
                    </td>
                    <td className="text-center"><span className={ss.cls}>{ss.label}</span></td>
                    <td className="text-card-foreground text-right">{fmt(item.price)}</td>
                    <td className="text-card-foreground text-right">{fmt(item.stock * item.price)}</td>
                    <td className="text-right flex justify-end">
                      <div className="flex items-center gap-1">
                        <button onClick={() => adjustStock(item.id, 10)} title="Add 10 units"
                          className="rounded p-1.5 hover:bg-secondary transition-colors text-green-600">
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => adjustStock(item.id, -10)} title="Remove 10 units"
                          className="rounded p-1.5 hover:bg-secondary transition-colors text-red-500">
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => { setEditingId(item.id); setEditQty(String(item.stock)); }}
                          title="Edit stock" className="rounded p-1.5 hover:bg-secondary transition-colors text-muted-foreground">
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════════════════
          REVENUE BREAKDOWN
      ══════════════════════════════════════════════════════════════════════ */}
      <Section title="Revenue Breakdown" subtitle="Detailed revenue components for current month">
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-5 mb-4">
          {[
            { label: "Product Revenue",   value: revenueBreakdown.productRevenue, color: "text-green-600"  },
            { label: "Shipping Charges",  value: revenueBreakdown.shipping,       color: "text-blue-600"   },
            { label: "GST (18%)",         value: revenueBreakdown.tax,            color: "text-orange-600" },
            { label: "Discounts Applied", value: revenueBreakdown.discounts,      color: "text-red-600",   sign: "-" },
            { label: "Total Revenue",     value: revenueBreakdown.total,          color: "text-card-foreground", bold: true },
          ].map((item) => (
            <div key={item.label} className={`rounded-lg bg-secondary/50 p-3 ${item.bold ? "border-2 border-primary/30" : ""}`}>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{item.label}</p>
              <p className={`text-lg font-bold mt-0.5 ${item.color}`}>
                {item.sign}{fmt(item.value)}
              </p>
            </div>
          ))}
        </div>

        {/* Revenue breakdown bar chart */}
        <ResponsiveContainer width="100%" height={180}>
          <BarChart
            data={[
              { name: "Product Rev",  value: revenueBreakdown.productRevenue },
              { name: "Shipping",     value: revenueBreakdown.shipping       },
              { name: "Tax",          value: revenueBreakdown.tax            },
              { name: "Discounts",    value: revenueBreakdown.discounts      },
              { name: "Total",        value: revenueBreakdown.total          },
            ]}
            margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(220,9%,46%)" />
            <YAxis tick={{ fontSize: 10 }} stroke="hsl(220,9%,46%)" tickFormatter={fmtK} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v) => [fmtK(v)]} />
            <Bar dataKey="value" fill="hsl(25,95%,53%)" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Section>

      {/* ══════════════════════════════════════════════════════════════════════
          SELLER PAYOUT MANAGEMENT
      ══════════════════════════════════════════════════════════════════════ */}
      <Section title="Seller Payout Management" subtitle="Track and manage seller payouts">
        {/* Payout stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
          <div className="rounded-lg bg-secondary/50 p-3">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Pending Payouts</p>
            <p className="text-lg font-bold text-yellow-600 mt-0.5">{pendingPayouts.length}</p>
            <p className="text-[11px] text-muted-foreground">{fmt(pendingPayouts.reduce((s, p) => s + p.amount, 0))} total</p>
          </div>
          <div className="rounded-lg bg-secondary/50 p-3">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Completed Payouts</p>
            <p className="text-lg font-bold text-green-600 mt-0.5">{completedPayouts.length}</p>
            <p className="text-[11px] text-muted-foreground">{fmt(completedPayouts.reduce((s, p) => s + p.amount, 0))} total</p>
          </div>
          <div className="flex gap-2 items-center">
            <Button size="sm" variant="outline" className="text-xs gap-1.5" onClick={exportPayoutsCSV}>
              <Download className="h-3 w-3" /> CSV
            </Button>
            <Button size="sm" variant="outline" className="text-xs gap-1.5" onClick={exportPayoutsPDF}>
              <Download className="h-3 w-3" /> PDF
            </Button>
          </div>
        </div>

        {/* Payout table */}
        <div className="overflow-x-auto rounded-lg border">
          <table className="data-table w-full table-fixed min-w-[800px]">
            <thead>
              <tr>
                <th className="text-left w-[25%]">Seller Name</th>
                <th className="text-right w-[15%]">Revenue</th>
                <th className="text-right w-[15%]">Payout Amount</th>
                <th className="text-center w-[15%]">Status</th>
                <th className="text-right w-[15%]">Payment Date</th>
                <th className="text-right w-[15%]">Action</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((p) => (
                <tr key={p.id}>
                  <td className="font-medium text-card-foreground text-left">{p.name}</td>
                  <td className="text-muted-foreground text-right">{fmt(p.revenue)}</td>
                  <td className="font-semibold text-card-foreground text-right">{fmt(p.amount)}</td>
                  <td className="text-center">
                    <span className={p.status === "Completed" ? "badge-success" : "badge-warning"}>
                      {p.status}
                    </span>
                  </td>
                  <td className="text-muted-foreground text-right">{p.date}</td>
                  <td className="text-right flex justify-end">
                    {p.status === "Pending" ? (
                      <button
                        onClick={() => markPayoutComplete(p.id)}
                        className="flex items-center gap-1 text-xs font-medium text-green-700 hover:text-green-900 px-2 py-1 bg-green-50 hover:bg-green-100 rounded border border-green-200 transition-colors"
                      >
                        <Check className="h-3 w-3" /> Mark Paid
                      </button>
                    ) : (
                      <span className="text-xs text-muted-foreground mr-2">Paid</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════════════════
          PAYMENT TRACKING
      ══════════════════════════════════════════════════════════════════════ */}
      <Section title="Payment Tracking" subtitle="All transactions with timestamps and payout status">
        {/* Filters row */}
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by ID, seller, type..." className="pl-9 bg-secondary border-none text-sm"
              value={txnSearch} onChange={(e) => setTxnSearch(e.target.value)} />
          </div>
          <select
            value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            {["All", "Completed", "Pending", "Processing"].map((s) => <option key={s}>{s}</option>)}
          </select>
          <select
            value={sellerFilter} onChange={(e) => setSellerFilter(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            {sellers.map((s) => <option key={s}>{s}</option>)}
          </select>
          <Button size="sm" variant="outline" className="text-xs gap-1.5" onClick={exportTxnCSV}>
            <Download className="h-3 w-3" /> Export CSV
          </Button>
        </div>

        {/* Payment summary */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="rounded-lg bg-secondary/50 p-3">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Pending Payments</p>
            <p className="text-lg font-bold text-yellow-600 mt-0.5">
              {fmt(filteredTxns.filter((t) => t.status === "Pending").reduce((s, t) => s + t.amount, 0))}
            </p>
            <p className="text-[11px] text-muted-foreground">{filteredTxns.filter((t) => t.status === "Pending").length} transactions</p>
          </div>
          <div className="rounded-lg bg-secondary/50 p-3">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Completed Payments</p>
            <p className="text-lg font-bold text-green-600 mt-0.5">
              {fmt(filteredTxns.filter((t) => t.status === "Completed").reduce((s, t) => s + t.amount, 0))}
            </p>
            <p className="text-[11px] text-muted-foreground">{filteredTxns.filter((t) => t.status === "Completed").length} transactions</p>
          </div>
        </div>

        {/* Transactions table */}
        <div className="overflow-x-auto rounded-lg border">
          <table className="data-table w-full table-fixed min-w-[800px]">
            <thead>
              <tr>
                <th className="text-left w-[15%]">ID</th>
                <th className="text-left w-[15%]">Type</th>
                <th className="text-left w-[25%]">Seller</th>
                <th className="text-right w-[15%]">Amount</th>
                <th className="text-right w-[15%]">Timestamp</th>
                <th className="text-center w-[15%]">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTxns.map((t) => (
                <tr key={t.id}>
                  <td className="font-medium text-card-foreground text-left">{t.id}</td>
                  <td className="text-left"><span className={txnTypeStyle[t.type] || "badge-neutral"}>{t.type}</span></td>
                  <td className="text-card-foreground text-left">{t.seller}</td>
                  <td className="font-medium text-card-foreground text-right">{fmt(t.amount)}</td>
                  <td className="text-muted-foreground text-xs text-right">{t.date}</td>
                  <td className="text-center"><span className={txnStatusStyle[t.status] || "badge-neutral"}>{t.status}</span></td>
                </tr>
              ))}
              {filteredTxns.length === 0 && (
                <tr><td colSpan={6} className="text-center text-muted-foreground py-6">No transactions match your filters</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════════════════
          REPORTS & ANALYTICS
      ══════════════════════════════════════════════════════════════════════ */}
      <Section title="Reports & Analytics" subtitle="Daily revenue, monthly finance, and seller payout reports">
        {/* Report type selector */}
        <div className="flex gap-2 mb-4">
          {["daily", "monthly", "payouts"].map((r) => (
            <button key={r} onClick={() => setReportType(r)}
              className={`px-3 py-1.5 rounded text-xs font-medium capitalize transition-colors ${
                reportType === r ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}>
              {r === "daily" ? "Daily Revenue" : r === "monthly" ? "Monthly Finance" : "Seller Payouts"}
            </button>
          ))}
        </div>

        {reportType === "daily" && (
          <>
            <p className="text-sm text-muted-foreground mb-3">Revenue breakdown for the current week</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dailyRevenue} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(220,9%,46%)" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(220,9%,46%)" tickFormatter={fmtK} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v) => [fmtK(v)]} />
                <Bar dataKey="revenue" name="Daily Revenue" fill="hsl(25,95%,53%)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-3 flex justify-end">
              <Button size="sm" variant="outline" className="text-xs gap-1.5"
                onClick={() => downloadCSV(dailyRevenue.map((d) => ({ Day: d.day, Revenue: fmtK(d.revenue) })), "daily_revenue.csv")}>
                <Download className="h-3 w-3" /> Export CSV
              </Button>
            </div>
          </>
        )}

        {reportType === "monthly" && (
          <>
            <p className="text-sm text-muted-foreground mb-3">6-month finance report with P&L breakdown</p>
            <div className="overflow-x-auto rounded-lg border">
              <table className="data-table w-full table-fixed min-w-[800px]">
                <thead>
                  <tr>
                    <th className="text-left w-[16%]">Month</th>
                    <th className="text-right w-[14%]">Revenue</th>
                    <th className="text-right w-[14%]">Costs</th>
                    <th className="text-right w-[14%]">Shipping</th>
                    <th className="text-right w-[14%]">Tax</th>
                    <th className="text-right w-[14%]">Discounts</th>
                    <th className="text-right w-[14%]">Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyPL.map((m) => (
                    <tr key={m.month}>
                      <td className="font-medium text-card-foreground text-left">{m.month}</td>
                      <td className="text-green-600 font-medium text-right">{fmtK(m.revenue)}</td>
                      <td className="text-red-500 text-right">{fmtK(m.costs)}</td>
                      <td className="text-blue-600 text-right">{fmtK(m.shipping)}</td>
                      <td className="text-orange-500 text-right">{fmtK(m.tax)}</td>
                      <td className="text-red-400 text-right">{fmtK(m.discount)}</td>
                      <td className="font-bold text-card-foreground text-right">{fmtK(m.profit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <Button size="sm" variant="outline" className="text-xs gap-1.5"
                onClick={() => downloadCSV(monthlyPL.map((m) => ({ Month: m.month, Revenue: fmtK(m.revenue), Costs: fmtK(m.costs), Profit: fmtK(m.profit) })), "monthly_finance.csv")}>
                <Download className="h-3 w-3" /> CSV
              </Button>
              <Button size="sm" variant="outline" className="text-xs gap-1.5"
                onClick={() => downloadPDF("Monthly Finance Report", monthlyPL.map((m) => ({ Month: m.month, Revenue: fmtK(m.revenue), Costs: fmtK(m.costs), Profit: fmtK(m.profit) })), "monthly_finance.html")}>
                <Download className="h-3 w-3" /> PDF
              </Button>
            </div>
          </>
        )}

        {reportType === "payouts" && (
          <>
            <p className="text-sm text-muted-foreground mb-3">Seller payout report with status and amounts</p>
            <div className="overflow-x-auto rounded-lg border">
              <table className="data-table w-full table-fixed min-w-[800px]">
                <thead>
                  <tr>
                    <th className="text-left w-[25%]">Seller</th>
                    <th className="text-right w-[15%]">Total Revenue</th>
                    <th className="text-right w-[15%]">Payout Amount</th>
                    <th className="text-right w-[15%]">Commission</th>
                    <th className="text-center w-[15%]">Status</th>
                    <th className="text-right w-[15%]">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((p) => (
                    <tr key={p.id}>
                      <td className="font-medium text-card-foreground text-left">{p.name}</td>
                      <td className="text-card-foreground text-right">{fmt(p.revenue)}</td>
                      <td className="font-semibold text-card-foreground text-right">{fmt(p.amount)}</td>
                      <td className="text-orange-500 text-right">{fmt(p.revenue - p.amount)}</td>
                      <td className="text-center"><span className={p.status === "Completed" ? "badge-success" : "badge-warning"}>{p.status}</span></td>
                      <td className="text-muted-foreground text-right">{p.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <Button size="sm" variant="outline" className="text-xs gap-1.5" onClick={exportPayoutsCSV}>
                <Download className="h-3 w-3" /> CSV
              </Button>
              <Button size="sm" variant="outline" className="text-xs gap-1.5" onClick={exportPayoutsPDF}>
                <Download className="h-3 w-3" /> PDF
              </Button>
            </div>
          </>
        )}
      </Section>

      {/* ── Seller Revenue vs Payout chart (existing) ── */}
      <div className="chart-card">
        <h3 className="chart-title">Seller Revenue vs Payout</h3>
        <p className="chart-subtitle mb-4">Commission retained per seller</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={payouts.map((p) => ({ name: p.name, revenue: p.revenue, payout: p.amount }))}
            margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(220,9%,46%)" />
            <YAxis tick={{ fontSize: 10 }} stroke="hsl(220,9%,46%)" tickFormatter={fmtK} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v) => [fmtK(v)]} />
            <Bar dataKey="revenue" name="Revenue" fill="hsl(25,95%,53%)"   radius={[3, 3, 0, 0]} />
            <Bar dataKey="payout"  name="Payout"  fill="hsl(220,14%,80%)" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card">
        <h3 className="chart-title">Financial Summary</h3>
        <p className="chart-subtitle mb-4">Current quarter breakdown</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Gross Revenue",        value: "₹19.0L", sub: "This quarter", color: "text-card-foreground" },
            { label: "Platform Commission",  value: "₹2.85L", sub: "15% avg rate", color: "text-card-foreground" },
            { label: "Net Profit",           value: "₹2.38L", sub: "+22% growth", color: "text-green-600" },
            { label: "Most Profitable",      value: "Electronics", sub: "38% profit share", color: "text-primary" },
            { label: "Pending Payouts",      value: `₹${(pendingPayouts.reduce((s,p)=>s+p.amount,0)/100000).toFixed(2)}L`,
                                             sub: `${pendingPayouts.length} sellers`, color: "text-yellow-600" },
            { label: "Refunds Processed",    value: "₹0.42L", sub: "2.2% of revenue", color: "text-muted-foreground" },
            { label: "Ad Revenue",           value: "₹0.68L", sub: "Sponsored listings", color: "text-card-foreground" },
            { label: "Least Profitable",     value: "Sports", sub: "Needs marketing push", color: "text-destructive" },
          ].map((item) => (
            <div key={item.label} className="rounded-lg bg-secondary/50 p-4 border border-secondary transition-all hover:bg-secondary/70">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{item.label}</p>
              <p className={`text-lg font-bold mt-1 ${item.color}`}>{item.value}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{item.sub}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}