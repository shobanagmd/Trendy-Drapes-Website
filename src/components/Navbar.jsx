import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Heart, ShoppingBag, User, Menu, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import SearchModal from "@/components/SearchModal";

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
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { cartCount, wishlistCount } = useCart();

  return (
    <>
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        {/* ── Rotating announcement bar ── */}
        <AnnouncementBar />

        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 lg:h-20">
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

            <div className="flex items-center gap-3 lg:gap-5">
              <button
                onClick={() => setSearchOpen(true)}
                className="p-1.5 hover:text-accent transition-colors"
              >
                <Search size={20} />
              </button>
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

          <nav className="hidden lg:flex items-center justify-center gap-6 pb-3">
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

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default Navbar;