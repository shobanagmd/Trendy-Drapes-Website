
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
      setReady(true);
    }
  }, [navigate]);

  // Render nothing until auth check is complete to prevent flash
  if (!ready) return null;
  return children;
}
