import { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { Search, Heart, ShoppingBag, User, Menu, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { products } from "@/data/products";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Sarees", to: "/collections" },
  { label: "Bridal", to: "/collections?category=Bridal" },
  { label: "Lehengas", to: "/collections?category=Lehengas" },
  { label: "Indo-Western", to: "/collections?category=Indo-Western" },
  { label: "Jewellery", to: "/collections?category=Jewellery" },
  { label: "Sale", to: "/sale" },
];

// Rotating announcement messages
const announcements = [
  "🔥 Festive Sale Live — Up to 50% OFF on All Categories",
  "🚚 Free Shipping on Orders Above ₹4,999 | Use Code: TRENDY20",
  "💍 Bridal Collection — Flat 34% OFF + Extra 20% with BRIDE20",
  "✨ New Arrivals Every Week — Shop the Latest Ethnic Wear",
  "🏷️ Limited Time: Extra 20% OFF Sitewide | Code: TRENDY20",
];

const AnnouncementBar = () => {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out, swap, fade in
      setVisible(false);
      setTimeout(() => {
        setIdx((prev) => (prev + 1) % announcements.length);
        setVisible(true);
      }, 400);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-primary text-primary-foreground text-center py-2 text-xs tracking-widest font-body uppercase overflow-hidden">
      <span
        style={{
          display: "inline-block",
          transition: "opacity 0.4s ease, transform 0.4s ease",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(-6px)",
        }}
      >
        {announcements[idx]}
      </span>
    </div>
  );
};

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { cartCount, wishlistCount } = useCart();

  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.fabric && p.fabric.toLowerCase().includes(q)) ||
        (p.color && p.color.toLowerCase().includes(q)) ||
        (p.subCategory && p.subCategory.toLowerCase().includes(q)) ||
        (p.work && p.work.toLowerCase().includes(q))
    );
  }, [query]);

  return (
    <>
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        {/* ── Rotating announcement bar ── */}
        <AnnouncementBar />

        <div className="container mx-auto px-4">
          <div className="flex flex-wrap lg:flex-nowrap items-center justify-between py-3 lg:py-0 lg:h-20 gap-x-4">
            <div className="flex items-center gap-2 lg:gap-0">
              <button
                className="lg:hidden p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>

              <Link to="/" className="flex-shrink-0">
                <h1 className="font-display text-2xl lg:text-3xl font-semibold tracking-wide">
                  Trendy Drapes
                </h1>
              </Link>
            </div>

            {/* Unified Inline Search Bar */}
            <div className="order-last lg:order-none w-full lg:flex-1 lg:max-w-2xl mt-3 lg:mt-0 relative z-50" ref={searchRef}>
              <div className={`flex items-center gap-2 border px-4 py-2.5 transition-all shadow-sm rounded-lg ${searchFocused ? 'border-accent bg-background ring-2 ring-accent/20' : 'border-border bg-secondary/30 hover:bg-background hover:border-border/80'}`}>
                <Search size={18} className="text-muted-foreground shrink-0" />
                <input
                  type="text"
                  placeholder="Search sarees, fabrics, colors..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  className="flex-1 bg-transparent border-none outline-none text-sm font-body text-foreground placeholder:text-muted-foreground w-full"
                />
                {query && (
                  <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground shrink-0 p-1">
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Dropdown Results */}
              {searchFocused && query.trim() && (
                <div className="absolute top-[calc(100%+0.5rem)] left-0 right-0 max-h-[65vh] overflow-y-auto bg-card border border-border shadow-xl rounded-xl z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  {results.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="font-body text-sm font-medium text-foreground">No products found for "{query}"</p>
                      <p className="font-body text-xs text-muted-foreground mt-1">Try checking for typos or using broader terms.</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="px-3 py-2 flex items-center justify-between border-b border-border/50 mb-2">
                        <span className="font-body text-xs text-muted-foreground font-medium uppercase tracking-wider">Products</span>
                        <span className="font-body text-[10px] bg-secondary px-2 py-0.5 rounded-full text-foreground">{results.length} result{results.length !== 1 ? "s" : ""}</span>
                      </div>
                      {results.map((product) => (
                        <Link
                          key={product.id}
                          to={`/product/${product.id}`}
                          onClick={() => {
                            setSearchFocused(false);
                            setQuery("");
                          }}
                          className="flex items-center gap-4 p-2.5 rounded-lg hover:bg-secondary transition-colors group"
                        >
                          <div className="w-12 h-16 rounded-md overflow-hidden bg-secondary flex-shrink-0 border border-border/50">
                            <img
                              src={product.images?.[0] || product.image}
                              alt={product.name}
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-body text-sm font-medium text-foreground line-clamp-1 group-hover:text-accent transition-colors">{product.name}</h4>
                            <p className="font-body text-[11px] text-muted-foreground mt-0.5 inline-flex items-center gap-1.5">
                              {product.fabric && <span>{product.fabric}</span>}
                              {product.fabric && product.color && <span>&bull;</span>}
                              {product.color && <span>{product.color}</span>}
                            </p>
                            <p className="font-body text-sm font-semibold text-foreground mt-1 tracking-tight">
                              ₹{product.price.toLocaleString("en-IN")}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 lg:gap-5 flex-shrink-0">
              <Link to="/wishlist" className="p-1.5 hover:text-accent transition-colors relative">
                <Heart size={20} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <Link to="/cart" className="p-1.5 hover:text-accent transition-colors relative">
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link to="/profile" className="p-1.5 hover:text-accent transition-colors">
                <User size={20} />
              </Link>
            </div>
          </div>

          <nav className="hidden lg:flex items-center justify-center gap-6 py-3 border-t lg:border-t-0 border-border">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="nav-link-luxury text-foreground hover:text-accent py-1"
                style={{ fontSize: "0.7rem" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {mobileMenuOpen && (
          <nav className="lg:hidden border-t border-border bg-card animate-slide-down">
            <div className="container mx-auto px-4 py-4 space-y-3">
              {navLinks.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className="block nav-link-luxury text-foreground hover:text-accent py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </header>
    </>
  );
};

export default Navbar;