import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Package, ShoppingCart, BarChart2, MessageSquare,
  CreditCard, Settings, Bell, Search, ChevronDown, Star, TrendingUp,
  TrendingDown, Edit2, Trash2, Plus, Eye, Send, Check, Clock, Truck,
  Filter, Download, Moon, Sun, Menu, X, ChevronRight, ArrowUpRight,
  ArrowDownRight, Shield, Store, Mail, Phone, MapPin, Lock, ToggleLeft,
  ToggleRight, LogOut, User, Zap, Award, RefreshCw, AlertCircle, IndianRupee,
  ShoppingBag, Users, Tag, ShieldCheck
} from "lucide-react";
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import { products as staticProducts } from "../../data/products";
import AddProductPage from "../../admin/pages/AddProductPage";
import CouponsPage from "../../admin/pages/CouponsPage";
import SellerOnboarding from "../pages/SellerOnboarding";
import { useAuth } from "../../contexts/AuthContext";
// ─── DUMMY DATA ──────────────────────────────────────────────────────────────

const SELLER = {
  name: "Arjun Mehta",
  storeName: "Trendy Drapes",
  email: "arjun@trendydrapes.com",
  phone: "+91 98765 43210",
  location: "Mumbai, Maharashtra",
  avatar: null,
  verified: true,
  joined: "Jan 2022",
  rating: 4.8,
};

const CATEGORIES = ["All", "Gold", "Diamond", "Silver", "Platinum", "Gemstone"];

const generateProducts = () => [
  { id: 1, name: "22K Gold Bangles Set", price: 42500, category: "Gold", stock: 12, sold: 87, image: "GB", status: "active" },
  { id: 2, name: "Solitaire Diamond Ring", price: 135000, category: "Diamond", stock: 5, sold: 34, image: "DR", status: "active" },
  { id: 3, name: "925 Silver Anklet Pair", price: 3200, category: "Silver", stock: 45, sold: 210, image: "SA", status: "active" },
  { id: 4, name: "Platinum Wedding Band", price: 28000, category: "Platinum", stock: 8, sold: 56, image: "PW", status: "active" },
  { id: 5, name: "Emerald Pendant Necklace", price: 67500, category: "Gemstone", stock: 3, sold: 18, image: "EP", status: "cancelled" },
  { id: 6, name: "Gold Chain Necklace 18K", price: 31000, category: "Gold", stock: 20, sold: 143, image: "GC", status: "active" },
  { id: 7, name: "Diamond Tennis Bracelet", price: 210000, category: "Diamond", stock: 2, sold: 11, image: "DT", status: "cancelled" },
  { id: 8, name: "Silver Filigree Earrings", price: 1800, category: "Silver", stock: 60, sold: 378, image: "SE", status: "active" },
];

const generateOrders = () => [
  { id: "ORD-001", customer: "Priya Sharma", product: "22K Gold Bangles Set", amount: 42500, status: "Delivered", date: "2025-03-24", city: "Delhi", trackingId: "TRK100234" },
  { id: "ORD-002", customer: "Rahul Nair", product: "Diamond Tennis Bracelet", amount: 210000, status: "Shipped", date: "2025-03-25", city: "Bangalore", trackingId: "TRK567890" },
  { id: "ORD-003", customer: "Sneha Patel", product: "925 Silver Anklet Pair", amount: 3200, status: "Pending", date: "2025-03-26", city: "Ahmedabad", trackingId: "TRK223344" },
  { id: "ORD-004", customer: "Karthik Raj", product: "Solitaire Diamond Ring", amount: 135000, status: "Delivered", date: "2025-03-22", city: "Chennai", trackingId: "TRK334455" },
  { id: "ORD-005", customer: "Divya Menon", product: "Emerald Pendant Necklace", amount: 67500, status: "Shipped", date: "2025-03-27", city: "Kochi", trackingId: "TRK445566" },
  { id: "ORD-006", customer: "Amit Verma", product: "Platinum Wedding Band", amount: 28000, status: "Pending", date: "2025-03-28", city: "Pune", trackingId: "TRK556677" },
  { id: "ORD-007", customer: "Meera Iyer", product: "Gold Chain Necklace 18K", amount: 31000, status: "Delivered", date: "2025-03-20", city: "Hyderabad", trackingId: "TRK667788" },
  { id: "ORD-008", customer: "Rohan Gupta", product: "Silver Filigree Earrings", amount: 1800, status: "Pending", date: "2025-03-29", city: "Jaipur", trackingId: "TRK778899" },
];

const generateMessages = () => [
  { id: 1, customer: "Priya Sharma", avatar: "PS", message: "Is the 22K bangle set available in size 2.6?", time: "10:32 AM", unread: true, replies: [] },
  { id: 2, customer: "Rahul Nair", avatar: "RN", message: "Can I get a custom engraving on the bracelet?", time: "Yesterday", unread: true, replies: ["Hi Rahul! Yes, we offer custom engraving. Please share the text you'd like."] },
  { id: 3, customer: "Sneha Patel", avatar: "SP", message: "What's the return policy for silver items?", time: "2 days ago", unread: false, replies: [] },
  { id: 4, customer: "Karthik Raj", avatar: "KR", message: "My order is showing delayed. When will it arrive?", time: "3 days ago", unread: false, replies: ["Sorry for the delay! Your order is on the way and will arrive within 2 days."] },
];

const generateReviews = () => [
  { id: 1, customer: "Priya Sharma", product: "22K Gold Bangles Set", rating: 5, comment: "Absolutely stunning quality! The finish is impeccable and my family loved the bangles.", date: "Mar 20, 2025", replied: false },
  { id: 2, customer: "Karthik Raj", product: "Solitaire Diamond Ring", rating: 5, comment: "Perfect ring for my proposal. The diamond sparkles beautifully!", date: "Mar 18, 2025", replied: true, reply: "Thank you so much! Wishing you both a wonderful journey ahead! 💍" },
  { id: 3, customer: "Meera Iyer", product: "Gold Chain Necklace 18K", rating: 4, comment: "Beautiful craftsmanship. Slight delay in delivery but worth the wait.", date: "Mar 15, 2025", replied: false },
  { id: 4, customer: "Divya Menon", product: "Emerald Pendant Necklace", rating: 5, comment: "The pendant is even more gorgeous in person. Love the packaging too!", date: "Mar 10, 2025", replied: true, reply: "We're so glad you loved it! The packaging is designed to match our jewelry quality." },
];

const generatePayments = () => [
  { id: "PAY-001", date: "Mar 25, 2025", amount: 252500, orders: 3, status: "Completed", method: "Bank Transfer" },
  { id: "PAY-002", date: "Mar 18, 2025", amount: 138200, orders: 2, status: "Completed", method: "Bank Transfer" },
  { id: "PAY-003", date: "Mar 11, 2025", amount: 97800, orders: 4, status: "Completed", method: "UPI" },
  { id: "PAY-004", date: "Mar 04, 2025", amount: 315600, orders: 5, status: "Completed", method: "Bank Transfer" },
  { id: "PAY-005", date: "Apr 01, 2025", amount: 68700, orders: 2, status: "Pending", method: "Bank Transfer" },
];

// Enhanced cancelled products dummy data with all required fields
const CANCELLED_PRODUCTS = [
  {
    id: 1,
    productName: "Wireless Earbuds",
    trackingId: "TRK112233",
    adminApproval: "Pending",
    shiprocketStatus: "In Transit",
    status: "cancelled",
    name: "Wireless Earbuds",
    cancelledCount: 1
  },
  {
    id: 2,
    productName: "Smartphone Case",
    trackingId: "TRK445566",
    adminApproval: "Approved",
    shiprocketStatus: "Returned",
    status: "cancelled",
    name: "Smartphone Case",
    cancelledCount: 1
  },
  {
    id: 3,
    productName: "Bluetooth Speaker",
    trackingId: "TRK778899",
    adminApproval: "Rejected",
    shiprocketStatus: "Not Shipped",
    status: "cancelled",
    name: "Bluetooth Speaker",
    cancelledCount: 1
  }
];

// Revenue data generators
const genWeeklyData = () => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.map(d => ({ time: d, revenue: Math.floor(Math.random() * 45000 + 12000) }));
};
const genTodayData = () => {
  const hours = ["9AM","10AM","11AM","12PM","1PM","2PM","3PM","4PM","5PM","6PM","7PM","8PM","9PM"];
  return hours.map(h => ({ time: h, revenue: Math.floor(Math.random() * 35000 + 5000) }));
};
const genYesterdayData = () => {
  const hours = ["9AM","10AM","11AM","12PM","1PM","2PM","3PM","4PM","5PM","6PM","7PM","8PM","9PM"];
  return hours.map(h => ({ time: h, revenue: Math.floor(Math.random() * 28000 + 4000) }));
};
const genMonthlyData = () => {
  return Array.from({ length: 30 }, (_, i) => ({
    time: `Mar ${i + 1}`,
    revenue: Math.floor(Math.random() * 120000 + 20000),
  }));
};
const genMonthlyBar = () => {
  const months = ["Oct","Nov","Dec","Jan","Feb","Mar"];
  return months.map(m => ({ month: m, revenue: Math.floor(Math.random() * 900000 + 200000), orders: Math.floor(Math.random() * 80 + 20) }));
};

const PIE_DATA = [
  { name: "Gold", value: 38, color: "hsl(var(--accent))" },
  { name: "Diamond", value: 28, color: "hsl(217 91% 60%)" },
  { name: "Silver", value: 18, color: "hsl(215 16% 47%)" },
  { name: "Platinum", value: 10, color: "hsl(210 40% 96%)" },
  { name: "Gemstone", value: 6, color: "hsl(142 71% 45%)" },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const fmt = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
const fmtShort = (n) => n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : n >= 1000 ? `₹${(n/1000).toFixed(0)}K` : `₹${n}`;

const statusColor = (s) => {
  if (s === "Delivered") return { bg: "hsla(142, 71%, 45%, 0.15)", text: "hsl(142, 71%, 45%)", dot: "hsl(142, 71%, 45%)" };
  if (s === "Shipped") return { bg: "hsla(217, 91%, 60%, 0.15)", text: "hsl(217, 91%, 60%)", dot: "hsl(217, 91%, 60%)" };
  return { bg: "hsla(var(--accent), 0.15)", text: "hsl(var(--accent))", dot: "hsl(var(--accent))" };
};

const avatarBg = (str) => {
  const colors = ["hsl(var(--accent))","hsl(217 91% 60%)","hsl(142 71% 45%)","hsl(322 81% 83%)","hsl(262 83% 78%)","hsl(160 84% 39%)"];
  let h = 0; for (let c of str) h = c.charCodeAt(0) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
};

// ─── SKELETON ────────────────────────────────────────────────────────────────

const Skeleton = ({ w = "100%", h = 20, r = 8 }) => (
  <div style={{ width: w, height: h, borderRadius: r, background: "var(--sk)", animation: "skeleton 1.4s ease infinite" }} />
);

// ─── MAIN APP ────────────────────────────────────────────────────────────────

 function App() {
  const [page, setPage] = useState("dashboard");
  const [dark, setDark] = useState(() => localStorage.getItem("seller-theme") === "dark");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [search, setSearch] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("seller-theme", dark ? "dark" : "light");
  }, [dark]);
  useEffect(() => {
    const pathname = location.pathname.replace(/^\/seller\//, "") || "dashboard";
    const validPages = ["dashboard","products","orders","analytics","notifications","payments","reviews","settings", "coupons", "onboarding"];
    if (validPages.includes(pathname)) {
      setPage(pathname);
    }
  }, [location.pathname]);

  const [products, setProducts] = useState(() => {
    try { return JSON.parse(localStorage.getItem("products")) || generateProducts(); } catch { return generateProducts(); }
  });
  const [orders] = useState(generateOrders);
  const [messages, setMessages] = useState([]);
  const [reviews, setReviews] = useState([]);

  const fetchNotifs = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("auth_token")}` }
      });
      const data = await res.json();
      if (data.success) setMessages(data.notifications.map(n => ({
        id: n.notification_id,
        user: "System",
        text: n.message,
        time: new Date(n.created_at).toLocaleTimeString(),
        unread: !n.is_read
      })));
    } catch (err) {}
  }, []);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch("/api/reviews/seller", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("auth_token")}` }
      });
      const data = await res.json();
      if (data.success) setReviews(data.reviews.map(r => ({
        id: r.review_id,
        product: r.product_name,
        user: r.customer_name,
        rating: r.rating,
        text: r.body,
        time: new Date(r.created_at).toLocaleDateString(),
        image: r.product_image || "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=100&h=100&fit=crop"
      })));
    } catch (err) {}
  }, []);

  useEffect(() => { 
    fetchNotifs();
    fetchReviews();
  }, [fetchNotifs, fetchReviews]);

  useEffect(() => { 
   
  }, []);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 1200); return () => clearTimeout(t); }, []);

  const D = dark ? DARK : LIGHT;

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "products", label: "Products", icon: Package },
    { id: "orders", label: "Orders", icon: ShoppingCart },
    { id: "analytics", label: "Analytics", icon: BarChart2 },
    { id: "coupons", label: "Coupons", icon: Tag },
    { id: "notifications", label: "Notifications", icon: MessageSquare, badge: messages.filter(m => m.unread).length },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "reviews", label: "Reviews", icon: Star },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "onboarding", label: "Business Details", icon: ShieldCheck },
  ];

  

  const renderPage = () => {
    const props = { products, setProducts, orders, messages, setMessages, reviews, setReviews, D, loading };
    switch (page) {
      case "dashboard": return <DashboardPage {...props} />;
      case "products": return <ProductsPage {...props} />;
      case "orders": return <OrdersPage {...props} />;
      case "analytics": return <AnalyticsPage {...props} />;
      case "coupons": return <CouponsPage />;
      case "notifications": return <MessagesPage {...props} />;
      case "payments": return <PaymentsPage {...props} D={D} />;
      case "reviews": return <ReviewsPage {...props} />;
      case "settings": return <SettingsPage {...props} dark={dark} setDark={setDark} />;
      case "onboarding": return <SellerOnboarding isEmbedded={true} />;
      default: return <DashboardPage {...props} />;
    }
  };

  return (
    <div style={{ ...styles.root, background: D.bg, color: D.text, minHeight: "100vh" }}>
      <style>{CSS(D) + ANIMATIONS}</style>

      <aside style={{ ...styles.sidebar, background: D.card, borderRight: `1px solid ${D.border}`, transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)", boxShadow: "4px 0 24px rgba(0,0,0,0.06)" }}>
        <div style={styles.sidebarLogo}>
          <div style={{ ...styles.logoMark, background: "linear-gradient(135deg, hsl(var(--accent)), hsl(var(--gold-light)))" }}>
            <Award size={18} color="#fff" />
          </div>
          {sidebarOpen && (
            <div onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
              <div style={{ fontWeight: 700, fontSize: 16, color: "hsl(var(--accent))", letterSpacing: "-0.3px" }}>Trendy Drapes</div>
              <div style={{ fontSize: 11, color: "hsl(var(--muted-foreground))", marginTop: 1 }}>Seller Center</div>
            </div>
          )}
        </div>

        <nav style={{ flex: 1, padding: "0px 0px", margin:0,overflowY: "auto" }}>
          {navItems.map(({ id, label, icon: Icon, badge }) => (
            <button key={id} onClick={() => { setPage(id); navigate("/seller/" + id); }} style={{ ...styles.navItem, background: page === id ? "hsla(var(--accent), 0.1)" : "transparent", color: page === id ? "hsl(var(--accent))" : "hsl(var(--muted-foreground))", borderLeft: page === id ? "3px solid hsl(var(--accent))" : "3px solid transparent" }}>
              <Icon size={18} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 13.5, fontWeight: page === id ? 600 : 400 }}>{label}</span>
              {badge > 0 && <span style={{ ...styles.badge, marginLeft: "auto" }}>{badge}</span>}
            </button>
          ))}
        </nav>

       
      </aside>

      <div style={{ ...styles.main, marginLeft: sidebarOpen ? 240 : 0 }}>
        <header style={{ ...styles.topbar, background: D.card, borderBottom: `1px solid ${D.border}`, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1 }}>
            <button onClick={() => setSidebarOpen(p => !p)} style={styles.iconBtn}>
              <Menu size={20} color={D.muted} />
            </button>
            <div style={{ ...styles.searchBar, background: D.bg, border: `1px solid ${D.border}` }}>
              <Search size={15} color={D.muted} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products, orders..." style={{ border: "none", background: "transparent", outline: "none", fontSize: 13.5, color: D.text, width: "100%" }} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={() => setDark(p => !p)} style={styles.iconBtn}>
              {dark ? <Sun size={18} color={D.muted} /> : <Moon size={18} color={D.muted} />}
            </button>
            <div style={{ position: "relative" }}>
              <button onClick={() => { setProfileOpen(p => !p); setNotifOpen(false); }} style={{ ...styles.profileBtn, border: `1px solid hsl(var(--border))` }}>
                <div style={{ ...styles.avatar, width: 32, height: 32, background: "hsl(var(--accent))", fontSize: 12 }}>AM</div>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{SELLER.name.split(" ")[0]}</span>
                <ChevronDown size={14} color="hsl(var(--muted-foreground))" />
              </button>
              {profileOpen && (
                <div style={{ ...styles.dropdown, background: D.card, border: `1px solid ${D.border}`, right: 0, width: 200 }}>
                  {[{ icon: User, label: "My Profile" }, { icon: ShieldCheck, label: "Business Details" }, { icon: LogOut, label: "Logout" }].map(({ icon: Icon, label }) => (
                    <button key={label} onClick={() => { 
                      if (label === "My Profile") setPage("settings"); 
                      if (label === "Business Details") setPage("onboarding");
                      setProfileOpen(false); 
                    }} style={{ ...styles.dropItem, color: label === "Logout" ? "hsl(var(--destructive))" : "hsl(var(--foreground))" }}>
                      <Icon size={15} /> {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        <main style={{ padding: "28px 28px 40px", minHeight: "calc(100vh - 60px)" }}>
          {renderPage()}
        </main>
      </div>

      {(notifOpen || profileOpen) && <div onClick={() => { setNotifOpen(false); setProfileOpen(false); }} style={{ position: "fixed", inset: 0, zIndex: 99 }} />}
    </div>
  );
}

// ─── DASHBOARD PAGE ──────────────────────────────────────────────────────────

function DashboardPage({ products, orders, D, loading }) {
  const navigate = useNavigate();
  const safeProducts = products || [];
  const safeOrders = orders || [];

  const [revenueFilter, setRevenueFilter] = useState("weekly");
  const [weeklyData] = useState(genWeeklyData);
  const [yesterdayData] = useState(genYesterdayData);
  const [monthlyData] = useState(genMonthlyData);

  const revenueData = revenueFilter === "weekly" ? weeklyData : revenueFilter === "yesterday" ? yesterdayData : monthlyData;
  const totalRevenue = revenueData?.reduce((s, d) => s + (d?.revenue || 0), 0) || 0;
  const prevRevenue = revenueFilter === "weekly" 
    ? (weeklyData?.reduce((s, d) => s + (d?.revenue || 0), 0) || 0) * 0.94 
    : totalRevenue * 0.91;
  const pctChange = prevRevenue !== 0 ? (((totalRevenue - prevRevenue) / prevRevenue) * 100).toFixed(1) : 0;
  const up = pctChange > 0;

  // Derive counts from products data - LIVE DATA
  const mostSoldCount = useMemo(() => {
    return safeProducts.filter(p => p && p.sold > 50).length;
  }, [safeProducts]);

  const leastSoldCount = useMemo(() => {
    return safeProducts.filter(p => p && p.sold < 20).length;
  }, [safeProducts]);

  const cancelledCount = useMemo(() => {
    return safeProducts.filter(p => p && p.status === "cancelled").length;
  }, [safeProducts]);

  const handleRevenueClick = () => {
    navigate('analytics');
  };

  const handleMostSoldClick = () => {
    navigate('products?view=most');
  };
  
  const handleLeastSoldClick = () => {
    navigate('products?view=least');
  };
  
  const handleCancelledClick = () => {
    navigate('products?view=cancelled');
  };
  
  const stats = [
    { 
      label: "Total Revenue", 
      value: "₹18.4L", 
      sub: "+12.5% this month", 
      icon: IndianRupee, 
      color: "hsl(var(--accent))", 
      bg: "hsla(var(--accent), 0.1)",
      onClick: handleRevenueClick
    },
    { 
      label: "Most Sold Products", 
      value: mostSoldCount || 0, 
      sub: `${mostSoldCount} top selling items`, 
      icon: ShoppingBag, 
      color: "hsl(217 91% 60%)", 
      bg: "hsla(217, 91%, 60%, 0.1)",
      onClick: handleMostSoldClick
    },
    { 
      label: "Least Sold Products", 
      value: leastSoldCount || 0, 
      sub: `${leastSoldCount} low performing items`, 
      icon: Package, 
      color: "hsl(142 71% 45%)", 
      bg: "hsla(142, 71%, 45%, 0.1)",
      onClick: handleLeastSoldClick
    },
    { 
      label: "Most Cancelled Products", 
      value: cancelledCount || 0, 
      sub: `${cancelledCount} items with cancellations`, 
      icon: Users, 
      color: "hsl(262 83% 70%)", 
      bg: "hsla(262, 83%, 70%, 0.1)",
      onClick: handleCancelledClick
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader title="Dashboard" subtitle={`Welcome back, ${SELLER.name?.split(" ")[0] || "Seller"}! `} D={D} />

      <div style={{ ...styles.card(D), background: "hsl(var(--primary))", padding: "24px 28px", display: "flex", alignItems: "center", gap: 20, overflow: "hidden", position: "relative" }}>
        <div style={{ position: "absolute", right: -40, top: -40, width: 200, height: 200, borderRadius: "50%", background: "hsla(var(--accent), 0.1)" }} />
        <div style={{ position: "absolute", right: 60, bottom: -60, width: 160, height: 160, borderRadius: "50%", background: "hsla(var(--accent), 0.05)" }} />
        <div style={{ ...styles.avatar, width: 64, height: 64, background: "hsl(var(--accent))", fontSize: 22, fontWeight: 700, flexShrink: 0, boxShadow: "0 0 0 4px hsla(var(--accent), 0.3)" }}>AM</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: "hsl(var(--primary-foreground))" }}>{SELLER.storeName || "Trendy Drapes"}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 4, background: "hsla(var(--accent), 0.2)", border: "1px solid hsla(var(--accent), 0.4)", color: "hsl(var(--accent))", fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20 }}>
              <Shield size={10} /> Verified Seller
            </span>
          </div>
          <div style={{ color: "hsl(var(--primary-foreground)/0.7)", fontSize: 13 }}>{SELLER.name || "Arjun Mehta"} · {SELLER.email || "arjun@trendydrapes.com"} · Member since {SELLER.joined || "Jan 2022"}</div>
          <div style={{ display: "flex", gap: 20, marginTop: 12 }}>
            {[["4.8★", "Rating"], ["937", "Sales"], ["₹18.4L", "Revenue"]].map(([v, l]) => (
              <div key={l}>
                <div style={{ color: "hsl(var(--accent))", fontWeight: 700, fontSize: 16 }}>{v}</div>
                <div style={{ color: "hsl(var(--primary-foreground)/0.5)", fontSize: 11 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        <button style={{ ...styles.goldBtn, flexShrink: 0 }}><Edit2 size={14} /> Edit Profile</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {stats.map((s, i) => (
          <div 
            key={i} 
            onClick={s.onClick} 
            style={{ 
              ...styles.card(D), 
              padding: "20px 22px", 
              display: "flex", 
              gap: 14, 
              alignItems: "flex-start",
              cursor: s.onClick ? "pointer" : "default",
              transition: "transform 0.2s, box-shadow 0.2s"
            }}
            onMouseEnter={(e) => {
              if (s.onClick) {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)";
              }
            }}
            onMouseLeave={(e) => {
              if (s.onClick) {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 1px 2px 0 rgb(0 0 0 / 0.05)";
              }
            }}
          >
            {loading ? <><Skeleton w={44} h={44} r={12} /><div style={{ flex: 1 }}><Skeleton w="60%" h={14} /><Skeleton w="80%" h={22} /></div></> : (
              <>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <s.icon size={20} color={s.color} />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "hsl(var(--muted-foreground))", marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 700 }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: "hsl(142 71% 45%)", marginTop: 3 }}>{s.sub}</div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <div style={{ ...styles.card(D), padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Revenue Analytics</div>
            {loading ? <Skeleton w={160} h={36} /> : (
              <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                <span style={{ fontSize: 28, fontWeight: 700, color: "hsl(var(--accent))" }}>{fmtShort(totalRevenue)}</span>
                <span style={{ fontSize: 13, color: up ? "hsl(var(--success))" : "hsl(var(--destructive))", display: "flex", alignItems: "center", gap: 3 }}>
                  {up ? <TrendingUp size={14} /> : <TrendingDown size={14} />} {up ? "+" : ""}{pctChange}%
                </span>
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {["weekly", "yesterday", "monthly"].map(f => (
              <button key={f} onClick={() => setRevenueFilter(f)} style={{ ...styles.filterBtn, background: revenueFilter === f ? "hsl(var(--accent))" : D.bg, color: revenueFilter === f ? "#fff" : D.muted, border: `1px solid ${revenueFilter === f ? "hsl(var(--accent))" : D.border}` }}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
        {loading ? <Skeleton w="100%" h={220} r={12} /> : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueData || []} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={D.border} vertical={false} />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: D.muted }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: D.muted }} axisLine={false} tickLine={false} tickFormatter={fmtShort} width={55} />
              <Tooltip content={<CustomTooltip D={D} />} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(var(--accent))" strokeWidth={2.5} fill="url(#goldGrad)" dot={false} activeDot={{ r: 5, fill: "hsl(var(--accent))" }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>
        <div style={{ ...styles.card(D), padding: 24, maxWidth: "800px", width: "100%" }}>
          <SectionHeader title="Recent Orders" action="View All" D={D} />
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
            {loading ? Array(4).fill(0).map((_, i) => <Skeleton key={i} h={48} r={10} />) :
              safeOrders.slice(0, 5).map(o => {
                const sc = statusColor(o?.status || "Pending");
                return (
                  <div key={`order-${o?.id || i}`} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: D.bg, borderRadius: 10 }}>
                    <div style={{ ...styles.avatar, width: 34, height: 34, background: avatarBg(o?.customer || "User"), fontSize: 12 }}>{(o?.customer || "U").split(" ").map(w => w[0]).join("")}</div>
                    <div style={{ flex: 1, overflow: "hidden" }}>
                      <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{o?.customer || "Unknown"}</div>
                      <div style={{ fontSize: 11, color: D.muted }}>{o?.id || "N/A"}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{fmtShort(o?.amount || 0)}</div>
                      <span style={{ fontSize: 11, background: sc.bg, color: sc.text, padding: "1px 7px", borderRadius: 20, display: "inline-block" }}>{o?.status || "Pending"}</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── BACK BUTTON ─────────────────────────────────────────────────────────────

function BackButton({ label = "← Back to Products", to = "/seller/products", D }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      style={{
        ...styles.outlineBtn(D),
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        marginBottom: 8,
        fontSize: 13,
      }}
    >
      {label}
    </button>
  );
}

// ─── PRODUCTS PAGE ───────────────────────────────────────────────────────────

function ProductsPage({ products, setProducts, D, loading, orders = [] }) {
  const location = useLocation();
  const searchParams = new URLSearchParams(location?.search || "");
  const viewMode = searchParams.get("view");

  const [catFilter, setCatFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState({ 
    name: "", 
    price: "", 
    category: "Gold", 
    subcategory: "",
    stock: "", 
    status: "active",
    description: "",
    sku: "",
    mrp: "",
    weight: "",
    length: "",
    breadth: "",
    height: "",
    brand: "",
    delivery_charge: "0",
    additional_charge: "0",
    imagePreview: null,
    imageData: null,
    variants: []
  });
  const [view, setView] = useState("table");
  const fileInputRef = useRef(null);

  const availableCategories = useMemo(() => {
    try {
      const storedProducts = JSON.parse(localStorage.getItem("products")) || [];
      const allProds = [...staticProducts, ...storedProducts];
      const normalized = allProds.map(p => ({
        category: (p.category || p.catvalue || "general").toLowerCase().trim()
      }));
      const uniqueCats = [...new Set(normalized.map(p => p.category))];
      if (uniqueCats.length === 0) return ["Ring", "Chain", "Bracelet"];
      
      return uniqueCats.map(c => c.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '));
    } catch {
      return ["Ring", "Chain", "Bracelet"];
    }
  }, []);
  
  const filterCategories = ["All", ...availableCategories];

  const safeProducts = products || [];
  const safeOrders = orders || [];
  
  const filtered = safeProducts.filter(p => {
    if (!p) return false;
    
    const pCat = (p.category || "").toLowerCase().trim();
    const selCat = catFilter.toLowerCase().trim();
    
    const matchesCat = selCat === "all" || pCat === selCat;
    const matchesSearch = (p.name || "").toLowerCase().includes((search || "").toLowerCase());
    
    return matchesCat && matchesSearch;
  });

  console.log("SELECTED:", catFilter);
  console.log("FILTERED:", filtered);

  const topProducts = [...safeProducts]
    .sort((a, b) => (b?.sold || 0) - (a?.sold || 0))
    .slice(0, 5);

  const leastSoldProducts = [...safeProducts]
    .sort((a, b) => (a?.sold || 0) - (b?.sold || 0))
    .slice(0, 5);

  const cancelledProducts = (() => {
    try {
      if (!safeOrders || !Array.isArray(safeOrders) || safeOrders.length === 0) {
        return [];
      }
      
      const cancelCountMap = {};
      
      safeOrders.forEach(order => {
        if (order?.status === "cancelled") {
          (order?.items || []).forEach(item => {
            const productId = item?.productId;
            const quantity = item?.quantity || 0;
            if (productId) {
              cancelCountMap[productId] = (cancelCountMap[productId] || 0) + quantity;
            }
          });
        }
      });
      
      const cancelled = safeProducts
        .filter(p => cancelCountMap[p.id] > 0 || p.status === "cancelled")
        .map(p => ({
          ...p,
          cancelledCount: cancelCountMap[p.id] || 0
        }))
        .sort((a, b) => (b?.cancelledCount || 0) - (a?.cancelledCount || 0))
        .slice(0, 5);
      
      return cancelled;
    } catch (error) {
      console.error("Error calculating cancelled products:", error);
      return [];
    }
  })();

  const enhancedCancelledProducts = useMemo(() => {
    const baseCancelled = cancelledProducts.length > 0 ? cancelledProducts : [];
    
    if (baseCancelled.length > 0) {
      return baseCancelled.map(product => ({
        ...product,
        productName: product.name || product.productName,
        trackingId: product.trackingId || `TRK${Math.floor(Math.random() * 900000 + 100000)}`,
        adminApproval: product.adminApproval || (Math.random() > 0.6 ? "Approved" : Math.random() > 0.3 ? "Pending" : "Rejected"),
        shiprocketStatus: product.shiprocketStatus || ["Not Shipped", "In Transit", "Delivered", "Returned"][Math.floor(Math.random() * 4)]
      }));
    }
    
    return CANCELLED_PRODUCTS;
  }, [cancelledProducts]);

  const [cancelledProductsData] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cancelledProductsData")) || enhancedCancelledProducts;
    } catch {
      return enhancedCancelledProducts;
    }
  });

  const addVariant = () => {
    setForm(p => ({
      ...p,
      variants: [...(p.variants || []), { sku: "", variant_name: "", variant_value: "", price: p.price, stock_quantity: p.stock, weight: p.weight }]
    }));
  };

  const removeVariant = (index) => {
    setForm(p => ({
      ...p,
      variants: (p.variants || []).filter((_, i) => i !== index)
    }));
  };

  const updateVariant = (index, field, value) => {
    setForm(p => {
      const newVariants = [...(p.variants || [])];
      newVariants[index] = { ...newVariants[index], [field]: value };
      return { ...p, variants: newVariants };
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(f => ({ 
          ...f, 
          imageData: reader.result, 
          imagePreview: URL.createObjectURL(file)
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const openAdd = () => { 
    setEditProduct(null); 
    setForm({ 
      name: "", 
      price: "", 
      category: "Gold", 
      subcategory: "",
      stock: "", 
      status: "active",
      description: "",
      sku: "",
      mrp: "",
      weight: "",
      length: "",
      breadth: "",
      height: "",
      brand: "",
      delivery_charge: "0",
      additional_charge: "0",
      imagePreview: null,
      imageData: null,
      variants: []
    }); 
    setShowModal(true); 
  };
  
  const openEdit = (p) => { 
    if (!p) return;
    setEditProduct(p); 
    setForm({ 
      name: p.name || "", 
      price: p.price || "", 
      category: p.category || "Gold", 
      subcategory: p.subcategory || "",
      stock: p.stock || "", 
      status: p.status || "active",
      description: p.description || "",
      sku: p.sku || "",
      mrp: p.mrp || p.price || "",
      weight: p.weight || "",
      length: p.length || "",
      breadth: p.breadth || "",
      height: p.height || "",
      brand: p.brand || "",
      delivery_charge: p.delivery_charge || "0",
      additional_charge: p.additional_charge || "0",
      imagePreview: p.imagePreview || null,
      imageData: p.imageData || null,
      variants: p.variants || []
    }); 
    setShowModal(true); 
  };
  
  const deleteProduct = (id) => {
    if (!id) return;
    setProducts(ps => {
      const newList = (ps || []).filter(p => p && p.id !== id);
      localStorage.setItem("products", JSON.stringify(newList));
      return newList;
    }); 
  };
  
  const saveProduct = () => {
    if (!form.name || !form.price || !form.category || !form.subcategory) {
      alert("Please ensure product name, price, category, and subcategory are all filled.");
      return;
    }
    
    if (editProduct) {
      setProducts(ps => {
        const newList = (ps || []).map(p => p && p.id === editProduct.id ? { 
          ...p, 
          name: form.name,
          price: +form.price,
          category: form.category.toLowerCase().trim(),
          subcategory: (form.subcategory || "").toLowerCase().trim(),
          stock: +form.stock,
          status: form.status,
          description: form.description,
          sku: form.sku,
          mrp: +form.mrp || +form.price,
          weight: form.weight,
          length: form.length,
          breadth: form.breadth,
          height: form.height,
          brand: form.brand,
          delivery_charge: +form.delivery_charge,
          additional_charge: +form.additional_charge,
          imageData: form.imageData,
          imagePreview: form.imagePreview,
          variants: form.variants || []
        } : p);
        localStorage.setItem("products", JSON.stringify(newList));
        return newList;
      });
    } else {
      const newProduct = { 
        ...form, 
        id: Date.now(), 
        price: +form.price, 
        stock: +form.stock, 
        sold: 0, 
        image: form.imageData || form.imagePreview || (form.name || "P").slice(0, 2).toUpperCase(), 
        rating: 4.5,
        description: form.description || "",
        sku: form.sku || "",
        mrp: +form.mrp || +form.price,
        weight: form.weight || null,
        length: form.length || null,
        breadth: form.breadth || null,
        height: form.height || null,
        brand: form.brand || "",
        delivery_charge: +form.delivery_charge || 0,
        additional_charge: +form.additional_charge || 0,
        imageData: form.imageData || null,
        imagePreview: form.imagePreview || null,
        status: "active",
        subcategory: (form.subcategory || "").toLowerCase().trim(),
        variants: form.variants || []
      };
      
      const existing = JSON.parse(localStorage.getItem("products")) || [];
      localStorage.setItem("products", JSON.stringify([...existing, newProduct]));
      
      setProducts(ps => [...(ps || []), newProduct]);
      window.dispatchEvent(new Event("local-storage"));
    }
    setShowModal(false);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20, width: "100%", maxWidth: "100%", padding: "0 16px", boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <PageHeader title="Products" subtitle="Loading products..." D={D} />
          <button style={{ ...styles.goldBtn, opacity: 0.6 }} disabled><Plus size={15} /> Add Product</button>
        </div>
        <Skeleton w="100%" h={300} r={16} />
      </div>
    );
  }

  if (viewMode === "most") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <BackButton D={D} />
        <PageHeader title="Top Products" subtitle="Your best-selling products by units sold" D={D} />
        <div style={{ ...styles.card(D), padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <TrendingUp size={18} color="hsl(var(--accent))" />
            <div style={{ fontWeight: 700, fontSize: 16 }}>Top Products</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {topProducts.map((p, i) => (
              <div key={p?.id || i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px", background: D.bg, borderRadius: 10 }}>
                <span style={{ width: 28, height: 28, borderRadius: 8, background: i === 0 ? "hsl(var(--accent))" : i === 1 ? "#d4af37" : D.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: i < 2 ? "#fff" : D.muted }}>{i + 1}</span>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: p.image && (p.image.startsWith("http") || p.image.startsWith("data:") || p.image.startsWith("/")) ? "transparent" : `${avatarBg(p?.image || "P")}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: avatarBg(p?.image || "P"), overflow: "hidden" }}>
                  {p.image && (p.image.startsWith("http") || p.image.startsWith("data:") || p.image.startsWith("/")) ? (
                    <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : p.imageData ? (
                    <img src={p.imageData} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    p?.image || "P"
                  )}
                </div>
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p?.name || "Product"}</div>
                  <div style={{ fontSize: 11, color: D.muted }}>{p?.sold || 0} sold</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "hsl(var(--accent))" }}>{fmtShort(p?.price || 0)}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${D.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 12, color: D.muted }}>Total sold</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "hsl(var(--accent))" }}>{topProducts.reduce((sum, p) => sum + (p?.sold || 0), 0)}</div>
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === "least") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <BackButton D={D} />
        <PageHeader title="Least Sold Products" subtitle="Your lowest-performing products by units sold" D={D} />
        <div style={{ ...styles.card(D), padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <TrendingDown size={18} color="hsl(var(--destructive))" />
            <div style={{ fontWeight: 700, fontSize: 16 }}>Least Sold Products</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {leastSoldProducts.length > 0 ? leastSoldProducts.map((p, i) => (
              <div key={p?.id || i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px", background: D.bg, borderRadius: 10 }}>
                <span style={{ width: 28, height: 28, borderRadius: 8, background: D.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: D.muted }}>{i + 1}</span>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: p.image && (p.image.startsWith("http") || p.image.startsWith("data:") || p.image.startsWith("/")) ? "transparent" : `${avatarBg(p?.image || "P")}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: avatarBg(p?.image || "P"), overflow: "hidden" }}>
                  {p.image && (p.image.startsWith("http") || p.image.startsWith("data:") || p.image.startsWith("/")) ? (
                    <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : p.imageData ? (
                    <img src={p.imageData} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    p?.image || "P"
                  )}
                </div>
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p?.name || "Product"}</div>
                  <div style={{ fontSize: 11, color: D.muted }}>{p?.sold || 0} sold</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "hsl(var(--destructive))" }}>{fmtShort(p?.price || 0)}</div>
              </div>
            )) : <div style={{ textAlign: "center", padding: "40px 20px", color: D.muted }}>No data available</div>}
          </div>
          {leastSoldProducts.length > 0 && (
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${D.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 12, color: D.muted }}>Total sold (least performers)</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "hsl(var(--destructive))" }}>{leastSoldProducts.reduce((sum, p) => sum + (p?.sold || 0), 0)}</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (viewMode === "cancelled") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <BackButton D={D} />
        <PageHeader title="Most Cancelled Products" subtitle="Products with the highest cancellation rate" D={D} />
        <div style={{ ...styles.card(D), padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <AlertCircle size={18} color="hsl(38 92% 50%)" />
            <div style={{ fontWeight: 700, fontSize: 16 }}>Cancelled Products</div>
          </div>
          
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${D.border}` }}>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: D.muted }}>Product Name</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: D.muted }}>Admin Approval</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: D.muted }}>Tracking ID</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: D.muted }}>Shiprocket Status</th>
                </tr>
              </thead>
              <tbody>
                {cancelledProductsData.length > 0 ? cancelledProductsData.map((p, i) => (
                  <tr key={`cancelled-view-${p.id || i}`} style={{ borderBottom: `1px solid ${D.border}` }}>
                    <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 500 }}>
                      {p.productName || p.name || "Product"}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ 
                        fontSize: 12, 
                        padding: "4px 12px", 
                        borderRadius: 20, 
                        background: p.adminApproval === "Approved" ? "rgba(134,239,172,0.15)" : 
                                   p.adminApproval === "Rejected" ? "rgba(239,68,68,0.1)" : 
                                   "rgba(253,224,71,0.15)",
                        color: p.adminApproval === "Approved" ? "hsl(var(--success))" : 
                               p.adminApproval === "Rejected" ? "hsl(var(--destructive))" : 
                               "hsl(var(--warning))"
                      }}>
                        {p.adminApproval || "Pending"}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: 12, fontFamily: "monospace", color: D.muted }}>
                      {p.trackingId || "—"}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ 
                        fontSize: 12, 
                        padding: "4px 12px", 
                        borderRadius: 20,
                        background: p.shiprocketStatus === "Delivered" ? "rgba(134,239,172,0.15)" : 
                                   p.shiprocketStatus === "In Transit" ? "rgba(147,197,253,0.15)" : 
                                   p.shiprocketStatus === "Returned" ? "rgba(239,68,68,0.1)" : 
                                   "rgba(203,213,225,0.2)",
                        color: p.shiprocketStatus === "Delivered" ? "hsl(var(--success))" : 
                               p.shiprocketStatus === "In Transit" ? "hsl(var(--primary))" : 
                               p.shiprocketStatus === "Returned" ? "hsl(var(--destructive))" : 
                               D.muted
                      }}>
                        {p.shiprocketStatus || "Not Shipped"}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center", padding: "60px 20px" }}>
                      <div style={{ fontSize: 32, marginBottom: 12 }}>✅</div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: D.text, marginBottom: 6 }}>No cancelled products</div>
                      <div style={{ fontSize: 13, color: D.muted }}>All your orders are going through smoothly</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {cancelledProductsData.length > 0 && (
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${D.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 12, color: D.muted }}>Total cancelled entries</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "hsl(38 92% 50%)" }}>{cancelledProductsData.length}</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <PageHeader title="Products" subtitle={`${safeProducts.length} products in your store`} D={D} />
        <button onClick={openAdd} style={styles.goldBtn}><Plus size={15} /> Add Product</button>
      </div>

      <div style={{ ...styles.card(D), padding: "16px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ ...styles.searchBar, background: D.bg, border: `1px solid ${D.border}`, flex: 1, minWidth: 200 }}>
            <Search size={14} color={D.muted} />
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Search products..." 
              style={{ border: "none", background: "transparent", outline: "none", fontSize: 13, color: D.text, width: "100%" }} 
            />
          </div>
          {filterCategories.map(c => (
            <button 
              key={c} 
              onClick={() => setCatFilter(c)} 
              style={{ 
                ...styles.filterBtn, 
                background: catFilter === c ? "hsl(var(--accent))" : D.bg, 
                color: catFilter === c ? "#fff" : D.muted, 
                border: `1px solid ${catFilter === c ? "hsl(var(--accent))" : D.border}` 
              }}
            >
              {c}
            </button>
          ))}
          <button onClick={() => setView(v => v === "table" ? "grid" : "table")} style={styles.iconBtn}>
            <Filter size={16} color={D.muted} />
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Package} title="No products found" sub="Try adjusting your search or filters" />
      ) : view === "table" ? (
        <div style={{ ...styles.card(D), overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${D.border}` }}>
                {["Product", "SKU", "Category", "Price", "Stock", "Sold", "Actions"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: D.muted }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => p && (
                <tr key={`row-${p.id || 'new'}-${i}`} style={{ borderBottom: `1px solid ${D.border}` }}>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 45, height: 45, borderRadius: 8, background: p.image && (p.image.startsWith("http") || p.image.startsWith("data:") || p.image.startsWith("/")) ? "transparent" : `${avatarBg(p.image || "P")}22`, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {p.image && (p.image.startsWith("http") || p.image.startsWith("data:") || p.image.startsWith("/")) ? (
                          <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : p.imageData ? (
                          <img src={p.imageData} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <span style={{ fontSize: 12, fontWeight: 700, color: avatarBg(p.image || "P") }}>{p.image || "P"}</span>
                        )}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{p.name || "Product"}</div>
                        {p.description && (
                          <div style={{ fontSize: 11, color: D.muted, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {p.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 12, color: D.muted }}>
                    {p.sku || "—"}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ fontSize: 12, background: "hsla(var(--accent), 0.1)", color: "hsl(var(--accent))", padding: "3px 10px", borderRadius: 20 }}>
                      {p.category || "General"}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 600 }}>{fmt(p.price || 0)}</td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: (p.stock || 0) < 5 ? "hsl(var(--destructive))" : D.text }}>{p.stock || 0}</td>
                  <td style={{ padding: "14px 16px", fontSize: 13 }}>{p.sold || 0}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => openEdit(p)} style={{ ...styles.iconBtn, background: "hsla(var(--accent), 0.1)", width: 30, height: 30 }}><Edit2 size={13} color="hsl(var(--accent))" /></button>
                      <button onClick={() => deleteProduct(p.id)} style={{ ...styles.iconBtn, background: "rgba(239,68,68,0.1)", width: 30, height: 30 }}><Trash2 size={13} color="hsl(var(--destructive))" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
          {filtered.map((p, i) => p && (
            <div key={`grid-${p.id || 'new'}-${i}`} style={{ ...styles.card(D), padding: 20, transition: "transform 0.2s", display: "flex", flexDirection: "column" }}>
              <div style={{ width: "100%", height: 200, borderRadius: 12, background: p.image && (p.image.startsWith("http") || p.image.startsWith("data:") || p.image.startsWith("/")) ? "transparent" : `${avatarBg(p.image || "P")}22`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 6, overflow: "hidden" }}>
                {p.image && (p.image.startsWith("http") || p.image.startsWith("data:") || p.image.startsWith("/")) ? (
                  <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : p.imageData ? (
                  <img src={p.imageData} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ fontSize: 48, fontWeight: 700, color: avatarBg(p.image || "P") }}>
                    {p.image || "P"}
                  </span>
                )}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>
                  {p.name || "Product"}
                </div>
                
                {p.sku && (
                  <div style={{ fontSize: 11, color: D.muted, marginBottom: 6 }}>
                    SKU: {p.sku}
                  </div>
                )}
                
                {p.description && (
                  <div style={{ fontSize: 12, color: D.muted, marginBottom: 6, lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                    {p.description}
                  </div>
                )}
                
                <div style={{ fontSize: 12, color: D.muted, marginBottom: 8 }}>
                  {p.category || "General"} · Stock: {p.stock || 0}
                </div>
                
                <div style={{ fontSize: 18, fontWeight: 700, color: "hsl(var(--accent))", marginBottom: 16 }}>
                  {fmt(p.price || 0)}
                </div>
              </div>
              
              <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
                <button onClick={() => openEdit(p)} style={{ ...styles.goldBtn, padding: "8px 12px", fontSize: 12, flex: 1 }}>
                  <Edit2 size={12} /> Edit
                </button>
                <button onClick={() => deleteProduct(p.id)} style={{ ...styles.iconBtn, background: "rgba(239,68,68,0.1)", flex: 1, borderRadius: 8 }}>
                  <Trash2 size={13} color="hsl(var(--destructive))" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Top Products Section */}
      {topProducts.length > 0 && (
        <div style={{ ...styles.card(D), padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <TrendingUp size={18} color="hsl(var(--accent))" />
            <div style={{ fontWeight: 700, fontSize: 16 }}>Top Products</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {topProducts.map((p, i) => (
              <div key={`top-${p?.id || 'new'}-${i}`} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px", background: D.bg, borderRadius: 10, transition: "transform 0.2s" }}>
                <span style={{ width: 28, height: 28, borderRadius: 8, background: i === 0 ? "hsl(var(--accent))" : i === 1 ? "#d4af37" : D.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: i < 2 ? "#fff" : D.muted }}>{i + 1}</span>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: p.image && (p.image.startsWith("http") || p.image.startsWith("data:") || p.image.startsWith("/")) ? "transparent" : `${avatarBg(p?.image || "P")}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: avatarBg(p?.image || "P"), overflow: "hidden" }}>
                  {p.image && (p.image.startsWith("http") || p.image.startsWith("data:") || p.image.startsWith("/")) ? (
                    <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : p.imageData ? (
                    <img src={p.imageData} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    p?.image || "P"
                  )}
                </div>
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p?.name || "Product"}</div>
                  <div style={{ fontSize: 11, color: D.muted }}>{p?.sold || 0} sold</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "hsl(var(--accent))" }}>{fmtShort(p?.price || 0)}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${D.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 12, color: D.muted }}>Total sold</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "hsl(var(--accent))" }}>{topProducts.reduce((sum, p) => sum + (p?.sold || 0), 0)}</div>
          </div>
        </div>
      )}

      {/* Least Sold Products Section */}
      <div style={{ ...styles.card(D), padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <TrendingDown size={18} color="hsl(var(--destructive))" />
          <div style={{ fontWeight: 700, fontSize: 16 }}>Least Sold Products</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {leastSoldProducts.length > 0 ? (
            leastSoldProducts.map((p, i) => (
              <div key={`least-${p?.id || 'new'}-${i}`} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px", background: D.bg, borderRadius: 10, transition: "transform 0.2s" }}>
                <span style={{ width: 28, height: 28, borderRadius: 8, background: D.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: D.muted }}>{i + 1}</span>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: p.image && (p.image.startsWith("http") || p.image.startsWith("data:") || p.image.startsWith("/")) ? "transparent" : `${avatarBg(p?.image || "P")}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: avatarBg(p?.image || "P"), overflow: "hidden" }}>
                  {p.image && (p.image.startsWith("http") || p.image.startsWith("data:") || p.image.startsWith("/")) ? (
                    <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : p.imageData ? (
                    <img src={p.imageData} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    p?.image || "P"
                  )}
                </div>
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p?.name || "Product"}</div>
                  <div style={{ fontSize: 11, color: D.muted }}>{p?.sold || 0} sold</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "hsl(var(--destructive))" }}>{fmtShort(p?.price || 0)}</div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: "center", padding: "40px 20px", color: D.muted }}>No data available</div>
          )}
        </div>
        {leastSoldProducts.length > 0 && (
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${D.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 12, color: D.muted }}>Total sold (least performers)</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "hsl(var(--destructive))" }}>{leastSoldProducts.reduce((sum, p) => sum + (p?.sold || 0), 0)}</div>
          </div>
        )}
      </div>

      {/* Cancelled Products Section - Table Format */}
      <div style={{ ...styles.card(D), padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <AlertCircle size={18} color="hsl(38 92% 50%)" />
          <div style={{ fontWeight: 700, fontSize: 16 }}>Cancelled Products</div>
        </div>
        
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${D.border}` }}>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: D.muted }}>Product Name</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: D.muted }}>Admin Approval</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: D.muted }}>Tracking ID</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: D.muted }}>Shiprocket Status</th>
               </tr>
            </thead>
            <tbody>
              {cancelledProductsData.length > 0 ? cancelledProductsData.map((p, i) => (
                <tr key={`cancel-${p.id || 'new'}-${i}`} style={{ borderBottom: `1px solid ${D.border}` }}>
                  <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 500 }}>
                    {p.productName || p.name || "Product"}
                   </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ 
                      fontSize: 12, 
                      padding: "4px 12px", 
                      borderRadius: 20, 
                      background: p.adminApproval === "Approved" ? "rgba(134,239,172,0.15)" : 
                                 p.adminApproval === "Rejected" ? "rgba(239,68,68,0.1)" : 
                                 "rgba(253,224,71,0.15)",
                      color: p.adminApproval === "Approved" ? "hsl(var(--success))" : 
                             p.adminApproval === "Rejected" ? "hsl(var(--destructive))" : 
                             "hsl(var(--warning))"
                    }}>
                      {p.adminApproval || "Pending"}
                    </span>
                   </td>
                  <td style={{ padding: "14px 16px", fontSize: 12, fontFamily: "monospace", color: D.muted }}>
                    {p.trackingId || "—"}
                   </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ 
                      fontSize: 12, 
                      padding: "4px 12px", 
                      borderRadius: 20,
                      background: p.shiprocketStatus === "Delivered" ? "rgba(134,239,172,0.15)" : 
                                 p.shiprocketStatus === "In Transit" ? "rgba(147,197,253,0.15)" : 
                                 p.shiprocketStatus === "Returned" ? "rgba(239,68,68,0.1)" : 
                                 "rgba(203,213,225,0.2)",
                      color: p.shiprocketStatus === "Delivered" ? "hsl(var(--success))" : 
                             p.shiprocketStatus === "In Transit" ? "hsl(var(--primary))" : 
                             p.shiprocketStatus === "Returned" ? "hsl(var(--destructive))" : 
                             D.muted
                    }}>
                      {p.shiprocketStatus || "Not Shipped"}
                    </span>
                   </td>
                 </tr>
              )) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center", padding: "60px 20px" }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>✅</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: D.text, marginBottom: 6 }}>No cancelled products</div>
                    <div style={{ fontSize: 13, color: D.muted }}>All your orders are going through smoothly</div>
                   </td>
                 </tr>
              )}
            </tbody>
           </table>
        </div>
        
        {cancelledProductsData.length > 0 && (
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${D.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 12, color: D.muted }}>Total cancelled entries</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "hsl(38 92% 50%)" }}>{cancelledProductsData.length}</div>
          </div>
        )}
      </div>

      {showModal && !editProduct && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.5)", overflowY: "auto", padding: "40px 20px" }}>
          <div style={{ background: D.bg, margin: "0 auto", maxWidth: 900, borderRadius: 16, padding: 30, position: "relative" }}>
            <button onClick={() => setShowModal(false)} style={{ position: "absolute", top: 20, right: 20, background: D.card, border: `1px solid ${D.border}`, borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 10 }}>
              <X size={16} color={D.text} />
            </button>
            <AddProductPage source="seller" onDisplayAll={() => setShowModal(false)} />
          </div>
        </div>
      )}

      {showModal && editProduct && (
        <Modal title="Edit Product" onClose={() => setShowModal(false)} D={D}>
          {[
            { label: "Product Name", key: "name", type: "text", placeholder: "e.g. 22K Gold Bangles Set" },
            { label: "Price (₹)", key: "price", type: "number", placeholder: "e.g. 42500" },
            { label: "Stock", key: "stock", type: "number", placeholder: "e.g. 10" },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key} style={{ marginBottom: 4 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: D.muted, display: "block", marginBottom: 6 }}>{label}</label>
              <input type={type} value={form[key] || ""} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder} style={{ ...styles.input(D), width: "100%" }} />
            </div>
          ))}
          
          <div style={{ marginBottom: 4 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: D.muted, display: "block", marginBottom: 6 }}>SKU Number</label>
            <input type="text" value={form.sku || ""} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} placeholder="e.g. LJ-GOLD-001" style={{ ...styles.input(D), width: "100%" }} />
          </div>
          
          <div style={{ marginBottom: 4 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: D.muted, display: "block", marginBottom: 6 }}>Product Description</label>
            <textarea value={form.description || ""} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe your product details, features, specifications..." rows="4" style={{ ...styles.input(D), width: "100%", resize: "vertical", fontFamily: "inherit" }} />
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: D.muted }}>Product Variants</label>
              <button onClick={addVariant} style={{ background: "transparent", border: "1px solid hsl(var(--accent))", color: "hsl(var(--accent))", fontSize: 11, padding: "2px 8px", borderRadius: 4, cursor: "pointer" }}>+ Add Variant</button>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(form.variants || []).map((v, i) => (
                <div key={i} style={{ background: i % 2 === 0 ? "rgba(0,0,0,0.02)" : "transparent", padding: 12, borderRadius: 8, border: `1px solid ${D.border}`, position: "relative" }}>
                  <button onClick={() => removeVariant(i)} style={{ position: "absolute", top: 4, right: 4, background: "rgba(239,68,68,0.1)", color: "hsl(var(--destructive))", border: "none", borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 10 }}>×</button>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <div>
                      <label style={{ fontSize: 9, fontWeight: 600, color: D.muted, display: "block", marginBottom: 3 }}>NAME (e.g. Size)</label>
                      <input value={v.variant_name} onChange={e => updateVariant(i, "variant_name", e.target.value)} placeholder="Size" style={{ ...styles.input(D), width: "100%", padding: "4px 8px", fontSize: 11 }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 9, fontWeight: 600, color: D.muted, display: "block", marginBottom: 3 }}>VALUE (e.g. XL)</label>
                      <input value={v.variant_value} onChange={e => updateVariant(i, "variant_value", e.target.value)} placeholder="XL" style={{ ...styles.input(D), width: "100%", padding: "4px 8px", fontSize: 11 }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 9, fontWeight: 600, color: D.muted, display: "block", marginBottom: 3 }}>SKU</label>
                      <input value={v.sku} onChange={e => updateVariant(i, "sku", e.target.value)} placeholder="SKU-XL" style={{ ...styles.input(D), width: "100%", padding: "4px 8px", fontSize: 11 }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 9, fontWeight: 600, color: D.muted, display: "block", marginBottom: 3 }}>PRICE</label>
                      <input type="number" value={v.price} onChange={e => updateVariant(i, "price", e.target.value)} style={{ ...styles.input(D), width: "100%", padding: "4px 8px", fontSize: 11 }} />
                    </div>
                  </div>
                </div>
              ))}
              {(form.variants || []).length === 0 && (
                <div style={{ textAlign: "center", padding: "12px", border: `1px dashed ${D.border}`, borderRadius: 8 }}>
                  <span style={{ fontSize: 11, color: D.muted }}>No variants added</span>
                </div>
              )}
            </div>
          </div>
          
          <div style={{ marginBottom: 4 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: D.muted, display: "block", marginBottom: 6 }}>Product Image</label>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ ...styles.input(D), width: "100%", padding: "7px" }} ref={fileInputRef} />
                <div style={{ fontSize: 11, color: D.muted, marginTop: 4 }}>Supported formats: JPG, PNG, GIF (Max 5MB)</div>
              </div>
              {form.imagePreview && (
                <div style={{ width: 80, height: 80, borderRadius: 8, overflow: "hidden", border: `1px solid ${D.border}`, flexShrink: 0, position: "relative" }}>
                  <img src={form.imagePreview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <button onClick={() => setForm(f => ({ ...f, imagePreview: null, imageData: null }))} style={{ position: "absolute", top: -8, right: -8, background: D.card, borderRadius: "50%", padding: 2, border: `1px solid ${D.border}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", width: 20, height: 20 }}>
                    <X size={12} color={D.muted} />
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div style={{ marginBottom: 8, display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: D.muted, display: "block", marginBottom: 6 }}>Category</label>
              <select value={form.category || availableCategories[0]} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={{ ...styles.input(D), width: "100%" }}>
                {availableCategories.map(c => <option key={c} value={c.toLowerCase()}>{c}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: D.muted, display: "block", marginBottom: 6 }}>Subcategory</label>
              <input type="text" value={form.subcategory || ""} onChange={e => setForm(f => ({ ...f, subcategory: e.target.value }))} placeholder="e.g. Diamond Rings" style={{ ...styles.input(D), width: "100%" }} />
            </div>
          </div>
          
          <div style={{ marginBottom: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: D.muted, display: "block", marginBottom: 6 }}>Product Status</label>
            <select value={form.status || "active"} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={{ ...styles.input(D), width: "100%" }}>
              <option value="active">Active</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button onClick={() => setShowModal(false)} style={{ ...styles.outlineBtn(D), flex: 1 }}>Cancel</button>
            <button onClick={saveProduct} style={{ ...styles.goldBtn, flex: 1, justifyContent: "center" }}>Save Changes</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── ORDERS PAGE ─────────────────────────────────────────────────────────────

function OrdersPage({ orders, D, loading }) {
  const [statusFilter, setStatusFilter] = useState("All");
  const [selected, setSelected] = useState(null);
  const [localOrders, setLocalOrders] = useState(orders);

  const filtered = localOrders.filter(o => statusFilter === "All" || o.status === statusFilter);
  const updateStatus = (id, status) => setLocalOrders(os => os.map(o => o.id === id ? { ...o, status } : o));

  const statuses = ["All", "Pending", "Shipped", "Delivered", "Returned"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader title="Orders" subtitle={`${localOrders.length} total orders`} D={D} />

      <div style={{ display: "flex", gap: 12 }}>
        {statuses.map(s => {
          const count = s === "All" ? localOrders.length : localOrders.filter(o => o.status === s).length;
          return (
            <button key={s} onClick={() => setStatusFilter(s)} style={{ ...styles.card(D), padding: "12px 20px", display: "flex", gap: 8, alignItems: "center", cursor: "pointer", border: statusFilter === s ? "2px solid hsl(var(--accent))" : `2px solid ${D.border}`, flex: 1, justifyContent: "center" }}>
              <span style={{ fontSize: 20, fontWeight: 700, color: statusFilter === s ? "hsl(var(--accent))" : D.text }}>{count}</span>
              <span style={{ fontSize: 12, color: D.muted }}>{s}</span>
            </button>
          );
        })}
      </div>

      {loading ? <Skeleton w="100%" h={300} r={16} /> : (
        <div style={{ ...styles.card(D), overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${D.border}` }}>
                {["Order ID", "Customer", "Product", "Amount", "Status", "Tracking ID", "Date", "Actions"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: D.muted }}>{h}</th>
                ))}
               </tr>
            </thead>
            <tbody>
              {filtered.map((o, i) => {
                const sc = statusColor(o.status);
                return (
                  <tr key={`order-row-${o.id || i}`} style={{ borderBottom: `1px solid ${D.border}` }} onMouseEnter={e => e.currentTarget.style.background = D.bg} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 600, color: "hsl(var(--accent))" }}>{o.id}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ ...styles.avatar, width: 30, height: 30, background: avatarBg(o.customer || "User"), fontSize: 11 }}>{(o.customer || "U").split(" ").map(w => w[0]).join("")}</div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>{o.customer}</div>
                          <div style={{ fontSize: 11, color: D.muted }}>{o.city}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: 12, color: D.muted, maxWidth: 160 }}><span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.product}</span></td>
                    <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 600 }}>{fmtShort(o.amount)}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 5, width: "fit-content", background: sc.bg, color: sc.text, fontSize: 12, padding: "3px 10px", borderRadius: 20 }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: sc.dot, display: "inline-block" }} />{o.status}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: 12, color: D.muted, fontFamily: "monospace" }}>{o.trackingId || "—"}</td>
                    <td style={{ padding: "14px 16px", fontSize: 12, color: D.muted }}>{o.date}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button onClick={() => setSelected(o)} style={{ ...styles.iconBtn, background: D.bg }}><Eye size={13} color={D.muted} /></button>
                        {o.status === "Pending" && <button onClick={() => updateStatus(o.id, "Shipped")} style={{ ...styles.iconBtn, background: "rgba(96,165,250,0.1)" }}><Truck size={13} color="hsl(var(--primary))" /></button>}
                        {o.status === "Shipped" && <button onClick={() => updateStatus(o.id, "Delivered")} style={{ ...styles.iconBtn, background: "rgba(134,239,172,0.1)" }}><Check size={13} color="hsl(var(--success))" /></button>}
                        {o.status === "Returned" && <button onClick={() => updateStatus(o.id, "Pending")} style={{ ...styles.iconBtn, background: "rgba(239,68,68,0.1)" }}><RefreshCw size={13} color="hsl(var(--destructive))" /></button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <Modal title={`Order ${selected.id}`} onClose={() => setSelected(null)} D={D}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[["Customer", selected.customer], ["City", selected.city], ["Product", selected.product], ["Amount", fmt(selected.amount)], ["Tracking ID", selected.trackingId || "—"], ["Date", selected.date]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${D.border}` }}>
                <span style={{ fontSize: 13, color: D.muted }}>{k}</span><span style={{ fontSize: 13, fontWeight: 600 }}>{v}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0" }}>
              <span style={{ fontSize: 13, color: D.muted }}>Status</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: statusColor(selected.status).text }}>{selected.status}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderTop: `1px solid ${D.border}`, marginTop: 8 }}>
              <span style={{ fontSize: 13, color: D.muted }}>Update Status</span>
              <select 
                value={selected.status}
                onChange={(e) => {
                  updateStatus(selected.id, e.target.value);
                  setSelected({...selected, status: e.target.value});
                }}
                style={{ padding: "6px 12px", borderRadius: 6, border: `1px solid ${D.border}`, background: D.bg, color: D.text }}
              >
                <option value="Pending">Pending</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Returned">Returned</option>
              </select>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── ANALYTICS PAGE ──────────────────────────────────────────────────────────

function AnalyticsPage({ D, loading }) {
  const navigate = useNavigate();

  const [dateRange, setDateRange] = useState("weekly");
  const [chartData, setChartData] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [activeChart, setActiveChart] = useState("revenue");

  const [revenueFilter, setRevenueFilter] = useState("weekly");
  const [weeklyData] = useState(genWeeklyData);
  const [yesterdayData] = useState(genYesterdayData);
  const [monthlyData] = useState(genMonthlyData);
  const revenueData = revenueFilter === "weekly" ? weeklyData : revenueFilter === "yesterday" ? yesterdayData : monthlyData;
  const revTotal = (revenueData || []).reduce((s, d) => s + (d?.revenue || 0), 0);
  const prevRevTotal = revenueFilter === "weekly"
    ? revTotal * 0.94
    : revTotal * 0.91;
  const revPct = prevRevTotal !== 0 ? (((revTotal - prevRevTotal) / prevRevTotal) * 100).toFixed(1) : 0;
  const revUp = Number(revPct) > 0;

  const generateData = (filter) => {
    let data = [];
    let total = 0;

    try {
      switch (filter) {
        case "weekly":
          const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
          data = days.map(day => ({
            label: day,
            revenue: Math.floor(Math.random() * 35000 + 15000),
            orders: Math.floor(Math.random() * 25 + 8)
          }));
          break;
        case "monthly":
          data = Array.from({ length: 30 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (29 - i));
            return {
              label: `${date.getMonth() + 1}/${date.getDate()}`,
              revenue: Math.floor(Math.random() * 28000 + 12000),
              orders: Math.floor(Math.random() * 20 + 5)
            };
          });
          break;
        case "yearly":
          const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          data = months.map(month => ({
            label: month,
            revenue: Math.floor(Math.random() * 850000 + 150000),
            orders: Math.floor(Math.random() * 75 + 25)
          }));
          break;
        default:
          data = [];
      }
      total = data.reduce((sum, item) => sum + (item?.revenue || 0), 0);
    } catch (error) {
      console.error("Error generating chart data:", error);
      data = [];
      total = 0;
    }
    
    setChartData(data);
    setTotalRevenue(total);
  };

  useEffect(() => {
    generateData(dateRange);
  }, [dateRange]);

  const chartStyles = {
    chart: { transition: "all 0.3s ease" },
    chartHide: { display: "none" },
    chartShow: { display: "block" },
    toggleBtn: {
      padding: "6px 14px",
      borderRadius: "20px",
      border: `1px solid ${D.border}`,
      background: "transparent",
      cursor: "pointer",
      fontSize: "12px",
      color: D.muted,
      transition: "all 0.2s ease",
    },
    toggleBtnActive: {
      background: "hsl(var(--accent))",
      color: "#fff",
      borderColor: "hsl(var(--accent))",
    },
    toggleGroup: {
      display: "flex",
      gap: "8px",
      marginBottom: "20px",
    },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <button
        onClick={() => navigate("/seller/dashboard")}
        style={{
          ...styles.outlineBtn(D),
          alignSelf: "flex-start",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 13,
        }}
      >
        ← Back to Dashboard
      </button>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <PageHeader title="Analytics & Reports" subtitle={`Track your business performance${totalRevenue ? ` - Total Revenue: ${fmtShort(totalRevenue)}` : ''}`} D={D} />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["weekly", "monthly", "yearly"].map(f => (
            <button key={f} onClick={() => setDateRange(f)} style={{ ...styles.filterBtn, background: dateRange === f ? "hsl(var(--accent))" : D.card, color: dateRange === f ? "#fff" : D.muted, border: `1px solid ${dateRange === f ? "hsl(var(--accent))" : D.border}` }}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={{ ...styles.card(D), padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Revenue Analytics</div>
            {loading ? <Skeleton w={160} h={36} /> : (
              <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                <span style={{ fontSize: 28, fontWeight: 700, color: "hsl(var(--accent))" }}>{fmtShort(revTotal)}</span>
                <span style={{ fontSize: 13, color: revUp ? "hsl(var(--success))" : "hsl(var(--destructive))", display: "flex", alignItems: "center", gap: 3 }}>
                  {revUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {revUp ? "+" : ""}{revPct}% vs previous period
                </span>
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {["weekly", "yesterday", "monthly"].map(f => (
              <button key={f} onClick={() => setRevenueFilter(f)} style={{ ...styles.filterBtn, background: revenueFilter === f ? "hsl(var(--accent))" : D.bg, color: revenueFilter === f ? "#fff" : D.muted, border: `1px solid ${revenueFilter === f ? "hsl(var(--accent))" : D.border}` }}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
        {loading ? <Skeleton w="100%" h={220} r={12} /> : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueData || []} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="analyticsGoldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={D.border} vertical={false} />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: D.muted }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: D.muted }} axisLine={false} tickLine={false} tickFormatter={fmtShort} width={55} />
              <Tooltip content={<CustomTooltip D={D} />} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(var(--accent))" strokeWidth={2.5} fill="url(#analyticsGoldGrad)" dot={false} activeDot={{ r: 5, fill: "hsl(var(--accent))" }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        <div style={{ ...styles.card(D), padding: 24 }}>
          <div style={chartStyles.toggleGroup}>
            <button onClick={() => setActiveChart("revenue")} style={{ ...chartStyles.toggleBtn, ...(activeChart === "revenue" ? chartStyles.toggleBtnActive : {}) }}>Revenue</button>
            <button onClick={() => setActiveChart("orders")} style={{ ...chartStyles.toggleBtn, ...(activeChart === "orders" ? chartStyles.toggleBtnActive : {}) }}>Orders</button>
          </div>

          <div className="chart" style={{ ...chartStyles.chart, ...(activeChart === "revenue" ? chartStyles.chartShow : chartStyles.chartHide) }}>
            {loading ? <Skeleton h={220} r={10} /> : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={D.border} vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: D.muted }} axisLine={false} tickLine={false} interval={dateRange === "monthly" ? 4 : 0} />
                  <YAxis tick={{ fontSize: 11, fill: D.muted }} axisLine={false} tickLine={false} tickFormatter={fmtShort} width={55} />
                  <Tooltip content={<CustomTooltip D={D} />} />
                  <Bar dataKey="revenue" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} fillOpacity={0.85} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", color: D.muted }}>No data available</div>
            )}
          </div>

          <div className="chart" style={{ ...chartStyles.chart, ...(activeChart === "orders" ? chartStyles.chartShow : chartStyles.chartHide) }}>
            {loading ? <Skeleton h={220} r={10} /> : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={D.border} vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: D.muted }} axisLine={false} tickLine={false} interval={dateRange === "monthly" ? 4 : 0} />
                  <YAxis tick={{ fontSize: 11, fill: D.muted }} axisLine={false} tickLine={false} width={55} />
                  <Tooltip content={<CustomTooltip D={D} />} />
                  <Bar dataKey="orders" fill="hsl(217 91% 60%)" radius={[6, 6, 0, 0]} fillOpacity={0.85} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", color: D.muted }}>No data available</div>
            )}
          </div>
        </div>

        <div style={{ ...styles.card(D), padding: 24, display: "flex", flexDirection: "column" }}>
          <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 15 }}>Category Breakdown</div>
          {loading ? <Skeleton h={220} r={10} /> : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={PIE_DATA || []} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" strokeWidth={2} stroke={D.card}>
                    {(PIE_DATA || []).map((d, i) => <Cell key={i} fill={d?.color || "hsl(var(--accent))"} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                {(PIE_DATA || []).map(d => d && (
                  <div key={d.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 10, height: 10, borderRadius: 3, background: d.color, display: "inline-block" }} />
                      <span style={{ fontSize: 12, color: D.muted }}>{d.name}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{d.value}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div style={{ ...styles.card(D), padding: 24 }}>
        <div style={{ fontWeight: 600, marginBottom: 20, fontSize: 15 }}>
          Sales Trend ({dateRange === "weekly" ? "Last 7 Days" : dateRange === "monthly" ? "Last 30 Days" : "Last 12 Months"})
        </div>
        {loading ? <Skeleton h={200} r={10} /> : (
          chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={D.border} vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: D.muted }} axisLine={false} tickLine={false} interval={dateRange === "monthly" ? 4 : 0} />
                <YAxis tick={{ fontSize: 11, fill: D.muted }} axisLine={false} tickLine={false} tickFormatter={fmtShort} width={55} />
                <Tooltip content={<CustomTooltip D={D} />} />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "hsl(var(--accent))" }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: D.muted }}>No data available</div>
          )
        )}
      </div>
    </div>
  );
}

// ─── MESSAGES PAGE ───────────────────────────────────────────────────────────

function MessagesPage({ messages, setMessages, D }) {
  const safeMessages = messages || [];
  const [activeMsg, setActiveMsg] = useState(safeMessages[0] || null);
  const [reply, setReply] = useState("");

  const sendReply = () => {
    if (!reply.trim() || !activeMsg) return;
    setMessages(ms => (ms || []).map(m => m.id === activeMsg.id ? { ...m, replies: [...(m.replies || []), reply], unread: false } : m));
    setActiveMsg(m => ({ ...m, replies: [...(m?.replies || []), reply] }));
    setReply("");
  };

  const markRead = (id) => setMessages(ms => (ms || []).map(m => m.id === id ? { ...m, unread: false } : m));

  if (!safeMessages.length) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <PageHeader title="Messages" subtitle="0 unread messages" D={D} />
        <EmptyState icon={MessageSquare} title="No messages" sub="Your inbox is empty" />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader title="Notifications" subtitle={`${safeMessages.filter(m => m?.unread).length} unread messages`} D={D} />
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 16, height: 520 }}>
        <div style={{ ...styles.card(D), overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "16px", borderBottom: `1px solid ${D.border}`, fontWeight: 600, fontSize: 14 }}>Inbox</div>
          <div style={{ overflowY: "auto", flex: 1 }}>
            {safeMessages.map(m => m && (
              <div key={m.id} onClick={() => { setActiveMsg(m); markRead(m.id); }} style={{ padding: "14px 16px", borderBottom: `1px solid ${D.border}`, cursor: "pointer", background: activeMsg?.id === m.id ? "hsla(var(--accent), 0.08)" : "transparent", borderLeft: activeMsg?.id === m.id ? "3px solid hsl(var(--accent))" : "3px solid transparent" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <div style={{ ...styles.avatar, width: 34, height: 34, background: avatarBg(m.avatar || "U"), fontSize: 12 }}>{m.avatar || "U"}</div>
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{m.customer || "Unknown"}</span>
                      {m.unread && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "hsl(var(--accent))", display: "inline-block" }} />}
                    </div>
                    <div style={{ fontSize: 11, color: D.muted }}>{m.time || ""}</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: D.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.message || ""}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...styles.card(D), display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {activeMsg ? (
            <>
              <div style={{ padding: "16px 20px", borderBottom: `1px solid ${D.border}`, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ ...styles.avatar, width: 40, height: 40, background: avatarBg(activeMsg.avatar || "U"), fontSize: 14 }}>{activeMsg.avatar || "U"}</div>
                <div><div style={{ fontWeight: 600 }}>{activeMsg.customer || "Unknown"}</div><div style={{ fontSize: 12, color: D.muted }}>{activeMsg.time || ""}</div></div>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ alignSelf: "flex-start", maxWidth: "75%" }}>
                  <div style={{ background: D.bg, padding: "12px 16px", borderRadius: "0 16px 16px 16px", fontSize: 13, lineHeight: 1.5 }}>{activeMsg.message || ""}</div>
                </div>
                {(activeMsg.replies || []).map((r, i) => (
                  <div key={i} style={{ alignSelf: "flex-end", maxWidth: "75%" }}>
                    <div style={{ background: "linear-gradient(135deg, hsl(var(--accent)), hsla(var(--accent), 0.7))", color: "#fff", padding: "12px 16px", borderRadius: "16px 0 16px 16px", fontSize: 13, lineHeight: 1.5 }}>{r}</div>
                  </div>
                ))}
              </div>
              <div style={{ padding: "12px 16px", borderTop: `1px solid ${D.border}`, display: "flex", gap: 10 }}>
                <input value={reply} onChange={e => setReply(e.target.value)} onKeyDown={e => e.key === "Enter" && sendReply()} placeholder="Type your reply..." style={{ ...styles.input(D), flex: 1 }} />
                <button onClick={sendReply} style={{ ...styles.goldBtn, padding: "0 20px" }}><Send size={15} /></button>
              </div>
            </>
          ) : <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: D.muted }}>Select a conversation</div>}
        </div>
      </div>
    </div>
  );
}

// ─── PAYMENTS PAGE ───────────────────────────────────────────────────────────

function PaymentsPage({ D, loading }) {
  const payments = generatePayments();
  const total = payments.filter(p => p.status === "Completed").reduce((s, p) => s + p.amount, 0);
  const pending = payments.filter(p => p.status === "Pending").reduce((s, p) => s + p.amount, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader title="Payments" subtitle="Track your earnings and payouts" D={D} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {[
          { label: "Total Earned", value: fmtShort(total), icon: IndianRupee, color: "hsl(var(--accent))", bg: "hsla(var(--accent), 0.1)" },
          { label: "Pending Payout", value: fmtShort(pending), icon: Clock, color: "hsl(38 92% 50%)", bg: "hsla(38, 92%, 50%, 0.1)" },
          { label: "Completed", value: payments.filter(p => p.status === "Completed").length.toString(), icon: Check, color: "hsl(142 71% 45%)", bg: "hsla(142, 71%, 45%, 0.1)" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} style={{ ...styles.card(D), padding: "20px 24px", display: "flex", gap: 14, alignItems: "center" }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon size={22} color={color} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: D.muted, marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{value}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ ...styles.card(D), overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${D.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 600, fontSize: 15 }}>Payment History</span>
          <button style={styles.outlineBtn(D)}><Download size={14} /> Export</button>
        </div>
        {loading ? <div style={{ padding: 20 }}><Skeleton h={200} r={10} /></div> : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${D.border}` }}>
                {["Payment ID", "Date", "Amount", "Orders", "Method", "Status"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: D.muted }}>{h}</th>
                ))}
                </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.id} style={{ borderBottom: `1px solid ${D.border}` }} onMouseEnter={e => e.currentTarget.style.background = D.bg} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 600, color: "hsl(var(--accent))" }}>{p.id}</td>
                  <td style={{ padding: "14px 16px", fontSize: 13 }}>{p.date}</td>
                  <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 600 }}>{fmt(p.amount)}</td>
                  <td style={{ padding: "14px 16px", fontSize: 13 }}>{p.orders} orders</td>
                  <td style={{ padding: "14px 16px", fontSize: 13 }}>{p.method}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ fontSize: 12, background: p.status === "Completed" ? "rgba(134,239,172,0.15)" : "rgba(253,224,71,0.15)", color: p.status === "Completed" ? "hsl(var(--success))" : "hsl(var(--warning))", padding: "3px 10px", borderRadius: 20 }}>{p.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── REVIEWS PAGE ────────────────────────────────────────────────────────────

function ReviewsPage({ reviews, setReviews, D }) {
  const [replyText, setReplyText] = useState({});
  const [replyOpen, setReplyOpen] = useState({});
  const [sortBy, setSortBy] = useState("latest");
  const [filterRating, setFilterRating] = useState(null);
  const [helpfulVotes, setHelpfulVotes] = useState({});
  const [showAddReview, setShowAddReview] = useState(false);
  const [filterWithImages, setFilterWithImages] = useState(false);
  const [selectedProductFilter, setSelectedProductFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState("all");
  const [activeTab, setActiveTab] = useState("reviews");
  const [selectedReviews, setSelectedReviews] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [newReview, setNewReview] = useState({
    productId: "",
    rating: 0,
    title: "",
    description: "",
    images: []
  });

  const products = [
    { id: "P001", name: "Premium Wireless Headphones", image: "/api/placeholder/80/80", price: 199.99, sku: "AUD-HP-001", category: "Electronics" },
    { id: "P002", name: "Ultra-Slim Laptop", image: "/api/placeholder/80/80", price: 899.99, sku: "COM-LP-002", category: "Computers" },
    { id: "P003", name: "Smart Fitness Watch", image: "/api/placeholder/80/80", price: 249.99, sku: "FIT-WT-003", category: "Wearables" },
    { id: "P004", name: "Noise-Cancelling Earbuds", image: "/api/placeholder/80/80", price: 129.99, sku: "AUD-EB-004", category: "Electronics" },
    { id: "P005", name: "Portable Power Bank", image: "/api/placeholder/80/80", price: 49.99, sku: "ACC-PB-005", category: "Accessories" }
  ];

  const userPurchasedProducts = ["P001", "P002", "P003"];

  const aiInsights = {
    sentiment: "disappointed",
    issues: [
      { label: "Quality Issues", percentage: 60, color: "hsl(var(--destructive))" },
      { label: "Durability", percentage: 25, color: "hsl(38 92% 50%)" },
      { label: "Support", percentage: 15, color: "hsl(217 91% 60%)" }
    ]
  };

  const isVerifiedPurchase = (productId) => {
    return userPurchasedProducts.includes(productId);
  };

  const getProduct = (productId) => {
    const product = products.find(p => p.id === productId);
    if (!product) {
      return { id: productId, name: "Product Unavailable", image: null, sku: "N/A", category: "Unknown", isAvailable: false };
    }
    return { ...product, isAvailable: true };
  };

  const handleHelpful = (reviewId) => {
    setHelpfulVotes(prev => ({ ...prev, [reviewId]: (prev[reviewId] || 0) + 1 }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const maxImages = 5;
    const currentImageCount = newReview.images.length;
    const remainingSlots = maxImages - currentImageCount;
    
    if (remainingSlots <= 0) {
      alert(`Maximum ${maxImages} images allowed per review`);
      return;
    }
    
    const filesToUpload = files.slice(0, remainingSlots);
    
    filesToUpload.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`Image ${file.name} is too large. Maximum size is 5MB`);
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewReview(prev => ({ ...prev, images: [...prev.images, reader.result] }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (indexToRemove) => {
    setNewReview(prev => ({ ...prev, images: prev.images.filter((_, index) => index !== indexToRemove) }));
  };

  const submitNewReview = () => {
    if (!newReview.productId || !newReview.rating || !newReview.title || !newReview.description) return;
    
    const newReviewObj = {
      id: Date.now(),
      orderId: `ORD-${Math.floor(Math.random() * 100000)}`,
      productId: newReview.productId,
      customer: "Current User",
      rating: newReview.rating,
      title: newReview.title,
      comment: newReview.description,
      date: new Date().toLocaleDateString(),
      reviewImages: newReview.images,
      helpfulCount: 0,
      verified: isVerifiedPurchase(newReview.productId),
      replied: false,
      reply: null,
      status: "pending"
    };
    
    setReviews(prev => [newReviewObj, ...prev]);
    setShowAddReview(false);
    setNewReview({ productId: "", rating: 0, title: "", description: "", images: [] });
  };

  const filteredReviews = reviews
    .filter(r => {
      if (activeTab === "reviews") return true;
      if (activeTab === "questions") return false;
      return true;
    })
    .filter(r => {
      if (selectedProductFilter !== "all" && r.productId !== selectedProductFilter) return false;
      if (filterWithImages && (!r.reviewImages || r.reviewImages.length === 0)) return false;
      if (filterRating && r.rating !== filterRating) return false;
      if (searchTerm && !(r.comment || "").toLowerCase().includes(searchTerm.toLowerCase()) && !r.title?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (dateRange === "week") {
        const reviewDate = new Date(r.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        if (reviewDate < weekAgo) return false;
      }
      if (dateRange === "month") {
        const reviewDate = new Date(r.date);
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        if (reviewDate < monthAgo) return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch(sortBy) {
        case "latest": return new Date(b.date) - new Date(a.date);
        case "highest": return b.rating - a.rating;
        case "lowest": return a.rating - b.rating;
        default: return 0;
      }
    });

  const handleSelectReview = (reviewId) => {
    setSelectedReviews(prev => {
      const newSelection = prev.includes(reviewId) ? prev.filter(id => id !== reviewId) : [...prev, reviewId];
      setShowBulkActions(newSelection.length > 0);
      return newSelection;
    });
  };

  const handleBulkAction = (action) => {
    console.log(`Bulk action: ${action} on ${selectedReviews.length} reviews`);
    setSelectedReviews([]);
    setShowBulkActions(false);
  };

  const submitReply = (id) => {
    if (!replyText[id]?.trim()) return;
    setReviews(rs => rs.map(r => r.id === id ? { ...r, replied: true, reply: replyText[id] } : r));
    setReplyOpen(s => ({ ...s, [id]: false }));
  };

  const handleProductClick = (productId) => {
    console.log(`Navigate to product: ${productId}`);
    alert(`Product details page would open for product ID: ${productId}`);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: D.text, margin: 0 }}>Review Request</h1>
        </div>
        <button style={styles.goldBtn}>+ Create</button>
      </div>

      <div style={{ display: "flex", gap: 24, borderBottom: `2px solid ${D.border}`, marginBottom: 8 }}>
        <button onClick={() => setActiveTab("reviews")} style={{ padding: "8px 0", fontSize: 14, fontWeight: 600, color: activeTab === "reviews" ? "hsl(var(--accent))" : D.muted, borderBottom: activeTab === "reviews" ? `2px solid hsl(var(--accent))` : "none", background: "none", border: "none", cursor: "pointer" }}>
          My Reviews ({reviews.length})
        </button>
        <button onClick={() => setActiveTab("widget")} style={{ padding: "8px 0", fontSize: 14, fontWeight: 600, color: activeTab === "widget" ? "hsl(var(--accent))" : D.muted, borderBottom: activeTab === "widget" ? `2px solid hsl(var(--accent))` : "none", background: "none", border: "none", cursor: "pointer" }}>
          Review Widget
        </button>
        <button onClick={() => setActiveTab("questions")} style={{ padding: "8px 0", fontSize: 14, fontWeight: 600, color: activeTab === "questions" ? "hsl(var(--accent))" : D.muted, borderBottom: activeTab === "questions" ? `2px solid hsl(var(--accent))` : "none", background: "none", border: "none", cursor: "pointer" }}>
          Question & Answer
        </button>
        <button style={{ marginLeft: "auto", fontSize: 13, color: "hsl(var(--accent))", background: "none", border: "none", cursor: "pointer" }}>+ Add View</button>
      </div>

      <div style={{ ...styles.card(D), padding: "16px 20px", background: "linear-gradient(135deg, hsla(var(--destructive), 0.1) 0%, hsla(var(--accent), 0.05) 100%)", borderLeft: `4px solid hsl(var(--destructive))` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          {/* <span style={{ fontSize: 20 }}></span> */}
          <span style={{ fontSize: 14, fontWeight: 600, color: D.text }}>Customers are disappointed</span>
        </div>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          {aiInsights.issues.map(issue => (
            <div key={issue.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 60, height: 4, background: D.border, borderRadius: 2, overflow: "hidden" }}>
                <div style={{ width: `${issue.percentage}%`, height: "100%", background: issue.color }} />
              </div>
              <span style={{ fontSize: 12, color: D.muted }}>{issue.percentage}% {issue.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <input type="text" placeholder="Search reviews..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ ...styles.input(D), width: "100%" }} />
        </div>
        <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} style={{ ...styles.input(D), width: "auto" }}>
          <option value="all">Date Range: All Time</option>
          <option value="week">Last 7 days</option>
          <option value="month">Last 30 days</option>
        </select>
        <select value={selectedProductFilter} onChange={(e) => setSelectedProductFilter(e.target.value)} style={{ ...styles.input(D), width: "auto", minWidth: 160 }}>
          <option value="all">All Products</option>
          {products.map(product => (
            <option key={product.id} value={product.id}>{product.name}</option>
          ))}
        </select>
        <select value={filterRating || ""} onChange={(e) => setFilterRating(e.target.value ? parseInt(e.target.value) : null)} style={{ ...styles.input(D), width: "auto" }}>
          <option value="">Star Rating</option>
          <option value="5">5 Stars ★★★★★</option>
          <option value="4">4 Stars ★★★★☆</option>
          <option value="3">3 Stars ★★★☆☆</option>
          <option value="2">2 Stars ★★☆☆☆</option>
          <option value="1">1 Star ★☆☆☆☆</option>
        </select>
        <button style={{ ...styles.outlineBtn(D), fontSize: 12 }}>Advanced Filter</button>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ ...styles.input(D), width: "auto" }}>
          <option value="latest">Sort By: Latest</option>
          <option value="highest">Highest Rating</option>
          <option value="lowest">Lowest Rating</option>
        </select>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(450px, 1fr))", gap: 16, marginTop: 8 }}>
        {filteredReviews.length === 0 ? (
          <div style={{ ...styles.card(D), padding: "60px 24px", textAlign: "center", gridColumn: "1/-1" }}>
            {/* <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div> */}
            <div style={{ fontSize: 16, fontWeight: 600, color: D.text, marginBottom: 8 }}>No reviews found</div>
            <button onClick={() => setShowAddReview(true)} style={styles.goldBtn}>Write a Review</button>
          </div>
        ) : (
          filteredReviews.map(r => {
            const product = getProduct(r.productId);
            const hasImages = r.reviewImages && r.reviewImages.length > 0;
            const isSelected = selectedReviews.includes(r.id);
            
            return (
              <div key={r.id} style={{ ...styles.card(D), padding: 0, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 16, left: 16, zIndex: 1 }}>
                  <input type="checkbox" checked={isSelected} onChange={() => handleSelectReview(r.id)} style={{ width: 18, height: 18, cursor: "pointer" }} />
                </div>
                <div style={{ padding: "20px 20px 16px 44px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div style={{ fontSize: 12, color: D.muted }}>Order-{r.orderId || r.id}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <StarRating rating={r.rating} size={14} />
                      <span style={{ fontSize: 11, color: D.muted }}>{r.date}</span>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: 12 }}>
                    <span style={{ fontSize: 11, color: D.muted }}>Item:</span>
                    <div onClick={() => handleProductClick(product.id)} style={{ fontSize: 14, fontWeight: 600, color: "hsl(var(--accent))", cursor: "pointer", marginTop: 2 }}>{product.name}</div>
                  </div>
                  
                  <div style={{ marginBottom: 12 }}>
                    <p style={{ fontSize: 13, color: D.text, lineHeight: 1.5, margin: 0 }}>
                      {(r.comment || "").length > 100 ? `${(r.comment || "").substring(0, 100)}...` : (r.comment || "")}
                    </p>
                  </div>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ ...styles.avatar, width: 32, height: 32, background: avatarBg(r.customer || "User"), fontSize: 12 }}>
                        {(r.customer || "U").split(" ").map(w => w[0]).join("")}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{r.customer}</div>
                        {r.verified && <span style={{ fontSize: 10, color: "hsl(142 71% 45%)" }}>✅ Verified</span>}
                      </div>
                    </div>
                    
                    {hasImages && (
                      <div style={{ display: "flex", gap: 6 }}>
                        {r.reviewImages.slice(0, 3).map((img, idx) => (
                          <img key={idx} src={img} alt={`Product ${idx + 1}`} style={{ width: 48, height: 48, borderRadius: 6, objectFit: "cover", cursor: "pointer", border: `1px solid ${D.border}` }} onClick={() => window.open(img, '_blank')} />
                        ))}
                        {r.reviewImages.length > 3 && (
                          <div style={{ width: 48, height: 48, borderRadius: 6, background: D.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: D.muted }}>
                            +{r.reviewImages.length - 3}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div style={{ display: "flex", gap: 16, marginTop: 16, paddingTop: 12, borderTop: `1px solid ${D.border}` }}>
                    <button style={{ ...styles.outlineBtn(D), fontSize: 12, padding: "4px 12px" }}>Publish</button>
                    <button style={{ ...styles.outlineBtn(D), fontSize: 12, padding: "4px 12px" }}>Archive</button>
                    <button style={{ ...styles.iconBtn, background: D.bg, marginLeft: "auto" }}>⋮</button>
                    <button style={{ ...styles.iconBtn, background: D.bg }}>↗</button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showBulkActions && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: D.cardBg, boxShadow: "0 4px 12px rgba(0,0,0,0.15)", borderRadius: 12, padding: "12px 24px", display: "flex", gap: 16, alignItems: "center", zIndex: 1000, border: `1px solid ${D.border}` }}>
          <span style={{ fontSize: 13, color: D.text }}>{selectedReviews.length} items selected</span>
          <button onClick={() => handleBulkAction("publish")} style={{ ...styles.outlineBtn(D), fontSize: 12, padding: "6px 12px" }}>Publish</button>
          <button onClick={() => handleBulkAction("archive")} style={{ ...styles.outlineBtn(D), fontSize: 12, padding: "6px 12px" }}>Archive</button>
          <button onClick={() => handleBulkAction("like")} style={{ ...styles.outlineBtn(D), fontSize: 12, padding: "6px 12px" }}>Like</button>
          <button onClick={() => handleBulkAction("share")} style={{ ...styles.outlineBtn(D), fontSize: 12, padding: "6px 12px" }}>Share</button>
        </div>
      )}

      {showAddReview && (
        <Modal title="Share Your Experience" onClose={() => setShowAddReview(false)} D={D}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: "block" }}>Select Product *</label>
              <select value={newReview.productId} onChange={(e) => setNewReview({ ...newReview, productId: e.target.value })} style={{ ...styles.input(D), width: "100%" }}>
                <option value="">Choose a product</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.category})</option>
                ))}
              </select>
            </div>
            
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: "block" }}>Rating *</label>
              <div style={{ display: "flex", gap: 4 }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button key={star} onClick={() => setNewReview({ ...newReview, rating: star })} style={{ fontSize: 24, background: "none", border: "none", cursor: "pointer", color: star <= newReview.rating ? "hsl(38 92% 50%)" : "#D1D5DB" }}>★</button>
                ))}
              </div>
            </div>
            
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: "block" }}>Review Title *</label>
              <input type="text" value={newReview.title} onChange={(e) => setNewReview({ ...newReview, title: e.target.value })} placeholder="Summarize your experience" style={styles.input(D)} />
            </div>
            
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: "block" }}>Review Description *</label>
              <textarea rows={4} value={newReview.description} onChange={(e) => setNewReview({ ...newReview, description: e.target.value })} placeholder="Share details about your experience with this product..." style={styles.input(D)} />
            </div>
            
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: "block" }}>Add Photos (Optional - Max 5 images)</label>
              <input type="file" accept="image/*" multiple onChange={handleImageUpload} disabled={newReview.images.length >= 5} style={{ ...styles.input(D), padding: "8px" }} />
              {newReview.images.length > 0 && (
                <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {newReview.images.map((img, idx) => (
                    <div key={idx} style={{ position: "relative" }}>
                      <img src={img} alt={`Preview ${idx + 1}`} style={{ width: 60, height: 60, borderRadius: 6, objectFit: "cover" }} />
                      <button onClick={() => removeImage(idx)} style={{ position: "absolute", top: -6, right: -6, background: "hsl(var(--destructive))", color: "white", border: "none", borderRadius: "50%", width: 20, height: 20, fontSize: 12, cursor: "pointer" }}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
              <button onClick={() => setShowAddReview(false)} style={styles.outlineBtn(D)}>Cancel</button>
              <button onClick={submitNewReview} style={styles.goldBtn}>Submit Review</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── SETTINGS PAGE ───────────────────────────────────────────────────────────

function SettingsPage({ D, dark, setDark }) {
  const [notifPrefs, setNotifPrefs] = useState({ orders: true, payments: true, reviews: false, messages: true });
  const [saved, setSaved] = useState(false);
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    storeName: user?.storeName || "Trendy Drapes",
    fullName: user?.fullName || user?.name || "Seller",
    email: user?.email || "",
    phone: user?.phone || ""
  });

  const save = async () => { 
    try {
      const res = await fetch("/api/seller/settings", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}` 
        },
        body: JSON.stringify({
          storeName: profile.storeName,
          phone: profile.phone,
          notificationPrefs: notifPrefs
        })
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true); 
        setTimeout(() => setSaved(false), 2000); 
      }
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader title="Settings" subtitle="Manage your account & preferences" D={D} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ ...styles.card(D), padding: 24 }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 18, display: "flex", alignItems: "center", gap: 8 }}><User size={16} color="hsl(var(--accent))" /> Profile Settings</div>
          
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: D.muted, display: "block", marginBottom: 6 }}>Store Name</label>
            <input value={profile.storeName} onChange={e => setProfile({...profile, storeName: e.target.value})} style={{ ...styles.input(D), width: "100%" }} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: D.muted, display: "block", marginBottom: 6 }}>Full Name</label>
            <input value={profile.fullName} readOnly style={{ ...styles.input(D), width: "100%", opacity: 0.7 }} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: D.muted, display: "block", marginBottom: 6 }}>Email</label>
            <input value={profile.email} readOnly style={{ ...styles.input(D), width: "100%", opacity: 0.7 }} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: D.muted, display: "block", marginBottom: 6 }}>Phone</label>
            <input value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} style={{ ...styles.input(D), width: "100%" }} />
          </div>
          
          <button onClick={save} style={{ ...styles.goldBtn, marginTop: 8 }}>{saved ? <><Check size={14} /> Saved!</> : "Save Changes"}</button>
        </div>

        <div style={{ ...styles.card(D), padding: 24 }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 18, display: "flex", alignItems: "center", gap: 8 }}><Lock size={16} color="hsl(var(--accent))" /> Security</div>
          {[["Current Password", "password"], ["New Password", "password"], ["Confirm Password", "password"]].map(([l, t]) => (
            <div key={l} style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: D.muted, display: "block", marginBottom: 6 }}>{l}</label>
              <input type={t} placeholder="••••••••" style={{ ...styles.input(D), width: "100%" }} />
            </div>
          ))}
          <button style={{ ...styles.goldBtn, marginTop: 8 }}>Update Password</button>
        </div>

        <div style={{ ...styles.card(D), padding: 24 }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 18, display: "flex", alignItems: "center", gap: 8 }}><Bell size={16} color="hsl(var(--accent))" /> Notification Preferences</div>
          {Object.entries(notifPrefs).map(([k, v]) => (
            <div key={k} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${D.border}` }}>
              <span style={{ fontSize: 14, textTransform: "capitalize" }}>{k} notifications</span>
              <button onClick={() => setNotifPrefs(p => ({ ...p, [k]: !p[k] }))} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                {v ? <ToggleRight size={28} color="hsl(var(--accent))" /> : <ToggleLeft size={28} color={D.muted} />}
              </button>
            </div>
          ))}
        </div>

        <div style={{ ...styles.card(D), padding: 24 }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 18, display: "flex", alignItems: "center", gap: 8 }}><Zap size={16} color="hsl(var(--accent))" /> Appearance</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${D.border}` }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Dark Mode</div>
              <div style={{ fontSize: 12, color: D.muted }}>Toggle dark/light theme</div>
            </div>
            <button onClick={() => setDark(p => !p)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              {dark ? <ToggleRight size={28} color="hsl(var(--accent))" /> : <ToggleLeft size={28} color={D.muted} />}
            </button>
          </div>
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Store Location</div>
            <input defaultValue={SELLER.location} style={{ ...styles.input(D), width: "100%" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SHARED COMPONENTS ───────────────────────────────────────────────────────

const PageHeader = ({ title, subtitle, D }) => (
  <div style={{ marginBottom: 4 }}>
    <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: "hsl(var(--foreground))" }}>{title}</h1>
    <p style={{ fontSize: 13, color: "hsl(var(--muted-foreground))", margin: "4px 0 0" }}>{subtitle}</p>
  </div>
);

const SectionHeader = ({ title, action, D }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
    <span style={{ fontWeight: 600, fontSize: 15 }}>{title}</span>
    {action && <button style={{ fontSize: 12, color: "hsl(var(--accent))", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 2 }}>{action} <ChevronRight size={14} /></button>}
  </div>
);

const StarRating = ({ rating, size = 13 }) => (
  <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
    {[1, 2, 3, 4, 5].map(s => <Star key={s} size={size} fill={s <= Math.round(rating) ? "hsl(var(--accent))" : "none"} color={s <= Math.round(rating) ? "hsl(var(--accent))" : "hsl(var(--muted-foreground))"} />)}
  </div>
);

const EmptyState = ({ icon: Icon, title, sub }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 0", gap: 10 }}>
    <div style={{ width: 64, height: 64, borderRadius: 20, background: "hsla(var(--accent), 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Icon size={28} color="hsl(var(--accent))" />
    </div>
    <div style={{ fontWeight: 600, fontSize: 16 }}>{title}</div>
    <div style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>{sub}</div>
  </div>
);

const Modal = ({ title, onClose, children, D }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
    <div onClick={e => e.stopPropagation()} style={{ ...styles.card(D), width: "100%", maxWidth: 460, padding: 24, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <span style={{ fontWeight: 700, fontSize: 17 }}>{title}</span>
        <button onClick={onClose} style={styles.iconBtn}><X size={18} color="hsl(var(--muted-foreground))" /></button>
      </div>
      {children}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label, D }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: "hsl(var(--card))", border: `1px solid hsl(var(--border))`, borderRadius: 10, padding: "10px 14px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
        <div style={{ fontSize: 11, color: "hsl(var(--muted-foreground))", marginBottom: 4 }}>{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ fontSize: 13, fontWeight: 600, color: p.color || "hsl(var(--accent))" }}>{fmtShort(p.value)}</div>
        ))}
      </div>
    );
  }
  return null;
};

// ─── THEME ────────────────────────────────────────────────────────────────────

const LIGHT = { 
  bg: "hsl(var(--background))", 
  card: "hsl(var(--card))", 
  text: "hsl(var(--foreground))", 
  muted: "hsl(var(--muted-foreground))", 
  border: "hsl(var(--border))", 
  accent: "hsl(var(--accent))",
  sk: "hsl(var(--muted))" 
};
const DARK = { 
  bg: "hsl(var(--background))", 
  card: "hsl(var(--card))", 
  text: "hsl(var(--foreground))", 
  muted: "hsl(var(--muted-foreground))", 
  border: "hsl(var(--border))", 
  accent: "hsl(var(--accent))",
  sk: "hsl(var(--muted))" 
};

// ─── STYLES ──────────────────────────────────────────────────────────────────

const styles = {
  root: { display: "flex", transition: "background 0.3s, color 0.3s", width: "100%", height: "100vh", overflow: "hidden", margin: 0, fontFamily: "var(--font-body)" },
  sidebar: { position: "fixed", left: 0, top: 0, bottom: 0, width: 240, display: "flex", flexDirection: "column", zIndex: 200, transition: "transform 0.3s ease", borderRight: "1px solid hsl(var(--border))" },
  sidebarLogo: { display: "flex", alignItems: "center", gap: 12, padding: "24px 16px", borderBottom: "1px solid hsl(var(--border)/0.5)" },
  logoMark: { width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: "hsl(var(--accent))" },
  navItem: { display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "12px 16px", borderRadius: 0, cursor: "pointer", border: "none", textAlign: "left", transition: "all 0.15s", marginBottom: 0 },
  badge: { background: "hsl(var(--accent))", color: "hsl(var(--accent-foreground))", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 20, minWidth: 18, textAlign: "center" },
  main: { flex: 1, minWidth: 0, width: "calc(100vw - 240px)", marginLeft: 240, overflowY: "auto", height: "100vh", padding: "0px", boxSizing: "border-box" },
  topbar: { position: "sticky", top: 0, zIndex: 100, height: 64, display: "flex", alignItems: "center", padding: "0px", gap: 16, borderBottom: "1px solid hsl(var(--border))" },
  searchBar: { display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 8, flex: 1, maxWidth: 400, background: "hsl(var(--secondary)/0.5)", border: "1px solid hsl(var(--border))" },
  iconBtn: { width: 36, height: 36, borderRadius: 8, background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s" },
  profileBtn: { display: "flex", alignItems: "center", gap: 8, background: "transparent", cursor: "pointer", padding: "4px 10px", borderRadius: 8 },
  dropdown: { position: "absolute", top: "calc(100% + 8px)", borderRadius: 8, zIndex: 200, boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)", overflow: "hidden", border: "1px solid hsl(var(--border))" },
  notifItem: { display: "flex", gap: 10, padding: "12px 14px", alignItems: "flex-start" },
  dropItem: { display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "11px 16px", background: "transparent", border: "none", cursor: "pointer", fontSize: 13, textAlign: "left" },
  avatar: { borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#fff", flexShrink: 0 },
  card: (D) => ({ background: "hsl(var(--card))", borderRadius: 12, border: `1px solid hsl(var(--border))`, boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }),
  goldBtn: { display: "inline-flex", alignItems: "center", gap: 6, background: "hsl(var(--accent))", color: "hsl(var(--accent-foreground))", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "opacity 0.2s" },
  outlineBtn: (D) => ({ display: "inline-flex", alignItems: "center", gap: 6, background: "transparent", color: "hsl(var(--foreground))", border: `1px solid hsl(var(--border))`, borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "background 0.2s" }),
  filterBtn: { padding: "6px 14px", borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "all 0.15s" },
  input: (D) => ({ background: "hsl(var(--card))", border: `1px solid hsl(var(--border))`, borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "hsl(var(--foreground))", outline: "none" }),
};

const CSS = (D) => `
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: var(--font-body); }
  body { margin: 0; background: hsl(var(--background)); color: hsl(var(--foreground)); }
  h1, h2, h3, h4, h5, h6 { font-family: var(--font-display); font-weight: 600; letter-spacing: -0.02em; }
  :root { --sk: hsl(var(--muted)); }
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: hsl(var(--border)); border-radius: 10px; }
  @keyframes skeleton { 0%,100%{opacity:1} 50%{opacity:0.4} }
  button:hover { opacity: 0.9; }
  input:focus, select:focus { border-color: hsl(var(--accent)) !important; box-shadow: 0 0 0 3px hsla(var(--accent), 0.15); }
  select { appearance: none; cursor: pointer; }
`;

const ANIMATIONS = `
  @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  main > div { animation: fadeIn 0.3s ease; }
`;

export default App;