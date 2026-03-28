import { User, Package, Heart, MapPin, LogOut } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { icon: Package, label: "My Orders", desc: "Track, return or buy again", link: "" },
    { icon: Heart, label: "Wishlist", desc: "Your saved items", link: "/wishlist" },
    { icon: MapPin, label: "Addresses", desc: "Manage your delivery addresses", link: "" },
    { icon: User, label: "Profile Details", desc: "Edit your personal information", link: "" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-1">
        <h2 className="font-display text-3xl font-semibold text-foreground mb-8">My Account</h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-card border border-border p-6 text-center">
              <div className="w-20 h-20 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
                <User size={32} className="text-muted-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground">{user?.name || "Welcome"}</h3>
              <p className="font-body text-sm text-muted-foreground mt-1">{user?.email || "guest@trendydrapes.com"}</p>
              <button
                onClick={handleLogout}
                className="mt-4 w-full py-2.5 border border-border text-sm font-body text-foreground hover:bg-secondary transition-colors flex items-center justify-center gap-2"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-3">
            {menuItems.map((item) => {
              const cls = "flex items-center gap-4 p-5 border border-border bg-card hover:bg-secondary transition-colors cursor-pointer";
              const content = (
                <>
                  <div className="w-10 h-10 bg-secondary flex items-center justify-center flex-shrink-0">
                    <item.icon size={20} className="text-foreground" />
                  </div>
                  <div>
                    <h4 className="font-body text-sm font-semibold text-foreground">{item.label}</h4>
                    <p className="font-body text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </>
              );
              if (item.link) {
                return <Link key={item.label} to={item.link} className={cls}>{content}</Link>;
              }
              return <div key={item.label} className={cls}>{content}</div>;
            })}

          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
