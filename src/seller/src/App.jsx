// // export default App
// import SellerDashboard from "./SellerDashboard";

// function App() {
//   return <SellerDashboard />;
// }

// export default App;
import { Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./AuthPage";
import DashboardWrapper from "./DashboardWrapper";
import ProtectedRoute from "./ProtectedRoute";
function App() {
  return (
    <Routes>
      {/* Default redirect to dashboard */}
      <Route path="/" element={<Navigate to="dashboard" replace />} />

      {/* Protected dashboard entry point */}
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

      {/* Convenience redirect */}
      <Route path="login" element={<Navigate to="/" replace />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
}

export default App;