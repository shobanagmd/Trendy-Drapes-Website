import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn) {
      navigate("/", { replace: true });
    } else {
      setAllowed(true);
    }
    setChecked(true);
  }, [navigate]);

  if (!checked) return null; // brief flash guard
  if (!allowed) return null;
  return children;
}
