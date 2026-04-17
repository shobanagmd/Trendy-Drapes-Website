/**
 * ─────────────────────────────────────────────────────────────────
 *  seller/src/App.jsx  (UPDATED — adds /seller/onboarding route)
 *
 *  REPLACE the existing file at: src/seller/src/App.jsx
 *
 *  Changes from original:
 *   • Added import for SellerOnboarding
 *   • Added <Route path="onboarding" element={<ProtectedRoute><SellerOnboarding /></ProtectedRoute>} />
 *   • Default redirect now checks td_onboarding_done before going to dashboard
 * ─────────────────────────────────────────────────────────────────
 */

import { Routes, Route, Navigate } from "react-router-dom";
import DashboardWrapper from "./DashboardWrapper";
import ProtectedRoute from "./ProtectedRoute";
import SellerOnboarding from "../pages/SellerOnboarding";
import { useAuth } from "../../contexts/AuthContext";

/**
 * Smart default redirect:
 * - Not logged in        → ProtectedRoute handles → /seller (auth page)
 * - Logged in, no onboarding → /seller/onboarding
 * - Logged in, onboarding done → /seller/dashboard
 */
function SmartRedirect() {
  const { user } = useAuth();
  
  // Wait for user data to be restored from localStorage
  if (localStorage.getItem("isLoggedIn") === "true" && !user) {
    return null; // Or a loading spinner
  }
  
  const onboardingDone = user?.onboardingCompleted === true;
  return <Navigate to={onboardingDone ? "dashboard" : "onboarding"} replace />;
}

function App() {
  return (
    <Routes>
      {/* Default: smart redirect based on onboarding status */}
      <Route path="/" element={<SmartRedirect />} />

      {/* ── Onboarding (protected — must be logged in) ── */}
      <Route
        path="onboarding"
        element={
          <ProtectedRoute>
            <SellerOnboarding />
          </ProtectedRoute>
        }
      />

      {/* ── Dashboard and all sub-pages ── */}
      <Route
        path="dashboard"
        element={
          <ProtectedRoute>
            <DashboardWrapper />
          </ProtectedRoute>
        }
      />

      {["products", "orders", "analytics", "notifications", "payments", "reviews", "settings"].map(path => (
        <Route
          key={path}
          path={path}
          element={
            <ProtectedRoute>
              <DashboardWrapper />
            </ProtectedRoute>
          }
        />
      ))}

      {/* Catch-all → smart redirect */}
      <Route path="*" element={<SmartRedirect />} />
    </Routes>
  );
}

export default App;