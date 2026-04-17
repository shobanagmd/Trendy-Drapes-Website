import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SellerDashboard from "./SellerDashboard";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardWrapper() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const ref = useRef(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const handleClick = (e) => {
      // Walk up from clicked element to find a button
      let el = e.target;
      while (el && el !== container) {
        if (el.tagName === "BUTTON") {
          const text = el.textContent?.trim();
          if (text === "Sign Out") {
            e.preventDefault();
            e.stopPropagation();
            handleLogout();
            return;
          }
        }
        el = el.parentElement;
      }
    };

    // Use capture phase so we intercept before the dashboard's own handlers
    container.addEventListener("click", handleClick, true);
    return () => container.removeEventListener("click", handleClick, true);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      <SellerDashboard />
    </div>
  );
}
