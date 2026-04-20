import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [checked, setChecked] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    // Wait for AuthContext to restore session from localStorage if it exists
    const hasSession = localStorage.getItem("isLoggedIn") === "true";
    if (hasSession && !user) return; 

    if (!user || role !== "seller") {
      navigate("/", { replace: true });
    } else {
      const onboardingDone = user.onboardingCompleted === true;
      const isHeaderOnboarding = window.location.pathname.includes("/seller/onboarding");
      
      // Strict check: only redirect if we are CERTAIN onboarding is not done
      if (onboardingDone === false && !isHeaderOnboarding) {
        navigate("/seller/onboarding", { replace: true });
      } else {
        setAllowed(true);
      }
    }
    setChecked(true);
  }, [user, role, navigate]);

  if (!checked) return null; // brief flash guard
  if (!allowed) return null;
  return children;
}
