
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SellerProtectedRoute({ children }) {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!loggedIn) {
      navigate("/seller", { replace: true });
    } else {
      const onboardingDone = localStorage.getItem("td_onboarding_done") === "true";
      const isHeaderOnboarding = window.location.pathname.includes("/seller/onboarding");
      
      if (!onboardingDone && !isHeaderOnboarding) {
        navigate("/seller/onboarding", { replace: true });
      } else {
        setReady(true);
      }
    }
  }, [navigate]);

  // Render nothing until auth check is complete to prevent flash
  if (!ready) return null;
  return children;
}
