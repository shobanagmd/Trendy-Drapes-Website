

import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SellerDashboard from "./src/SellerDashboard"; // adjust path if needed

export default function SellerDashboardWrapper() {
  const navigate = useNavigate();
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleCapture = (e) => {
      let el = e.target;
      while (el && el !== container) {
        if (el.tagName === "BUTTON" && el.textContent?.trim() === "Sign Out") {
          e.stopPropagation(); // prevent the dashboard's own handler
          logout();
          return;
        }
        el = el.parentElement;
      }
    };

    // Use capture phase so we run before any dashboard event listeners
    container.addEventListener("click", handleCapture, true);
    return () => container.removeEventListener("click", handleCapture, true);
  }, []);

  const logout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
    navigate("/seller", { replace: true });
  };

  return (
    <div ref={containerRef} style={{ width: "100%", minHeight: "100vh" }}>
      <SellerDashboard />
    </div>
  );
}
