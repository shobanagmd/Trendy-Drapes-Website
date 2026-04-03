import { useState } from "react";
import { Bell, X, Mail, Phone, LogOut, Menu, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";

export function DashboardHeader({ onMenuClick }) {
  const navigate = useNavigate();
  const { adminLogout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const notifications = [
    { id: 1, title: "Order Delivered", message: "Order #ORD-78451 delivered successfully", time: "12 min ago", type: "success" },
    { id: 2, title: "Low Stock Alert", message: "Smart Watch X200 has only 320 units left", time: "1 hr ago", type: "warning" },
    { id: 3, title: "New Order", message: "Order #ORD-78452 received from Priya Patel", time: "2 hrs ago", type: "info" },
  ];

  const getProfileData = () => {
    const saved = localStorage.getItem("adminProfile");
    return saved
      ? JSON.parse(saved)
      : { fullName: "Admin Director", email: "admin@trendydrapes.com", phone: "+91 98765-43210", role: "Super Admin" };
  };

  const profile = getProfileData();

  const handleLogout = () => {
    adminLogout();
    navigate("/profile");
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-card/80 backdrop-blur-sm px-4 lg:px-5">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="lg:hidden p-2 hover:bg-secondary rounded-lg transition-colors">
          <Menu className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      <div className="flex items-center gap-2 relative">
        <button onClick={() => navigate("/")} className="p-2 hover:bg-secondary rounded-lg transition-colors" title="Back to Store">
          <Home className="h-4 w-4 text-muted-foreground" />
        </button>
        <ThemeToggle />
        <button onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }} className="relative p-2 hover:bg-secondary rounded-lg transition-colors">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
        </button>
        <button onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }} className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-[11px] font-bold hover:opacity-90 transition-opacity">
          AD
        </button>

        {showNotifications && (
          <div className="absolute right-0 top-12 w-80 bg-card rounded-lg border shadow-lg z-50">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-sm">Notifications</h3>
              <button onClick={() => setShowNotifications(false)} className="p-1 hover:bg-secondary rounded"><X className="h-4 w-4" /></button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.map((notif) => (
                <div key={notif.id} className="p-3 border-b hover:bg-secondary/50 transition-colors cursor-pointer">
                  <div className="flex gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      notif.type === "success" ? "bg-green-100 text-green-600" : notif.type === "warning" ? "bg-yellow-100 text-yellow-600" : "bg-blue-100 text-blue-600"
                    }`}>
                      {notif.type === "success" ? "✓" : notif.type === "warning" ? "!" : "i"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-card-foreground">{notif.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{notif.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{notif.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showProfile && (
          <div className="absolute right-0 top-12 w-72 bg-card rounded-lg border shadow-lg z-50">
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">AD</div>
                <div>
                  <p className="font-semibold text-sm text-card-foreground">{profile.fullName}</p>
                  <p className="text-xs text-muted-foreground">{profile.role}</p>
                </div>
              </div>
              <div className="border-t pt-3 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-card-foreground">{profile.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-card-foreground">{profile.phone}</span>
                </div>
              </div>
              <div className="border-t pt-3">
                <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-secondary rounded transition-colors">
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
