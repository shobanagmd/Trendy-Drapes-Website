import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

export const AdminRoute = ({ children }) => {
  const { user, role } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role !== "admin") return <Navigate to="/" replace />;
  return children;
};

export const SellerRoute = ({ children }) => {
  const { user, role } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role !== "seller") return <Navigate to="/" replace />;
  return children;
};
