import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute, AdminRoute } from "@/components/ProtectedRoute";

// User pages
import Home from "./pages/Home";
import Index from "./pages/Index";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";
import Sales from "./pages/sales";

// Admin pages & layout
import { DashboardLayout } from "@/admin/components/DashboardLayout";
import DashboardHome from "@/admin/pages/DashboardHome";
import ProductsPage from "@/admin/pages/ProductsPage";
import AddProductPage from "@/admin/pages/AddProductPage";
import OrdersPage from "@/admin/pages/OrdersPage";
import FinancePage from "@/admin/pages/FinancePage";
import ReportsPage from "@/admin/pages/ReportsPage";
import ProfilePage from "@/admin/pages/ProfilePage";
import SupportPage from "@/admin/pages/SupportPage";
import SettingsPage from "@/admin/pages/SettingsPage";
import VendorPage from "@/admin/pages/VendorPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public */}
              <Route path="/login" element={<Login />} />

              {/* Protected user routes */}
              <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/collections" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/product/:id" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
              <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
              <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path="/order-success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
              <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
              <Route path="/contact" element={<ProtectedRoute><Contact /></ProtectedRoute>} />
              <Route path="/privacy" element={<ProtectedRoute><Privacy /></ProtectedRoute>} />
              <Route path="/sale" element={<ProtectedRoute><Sales /></ProtectedRoute>} />

              {/* Admin login - public route */}
              <Route path="/admin-login" element={<AdminLogin />} />

              {/* Admin dashboard routes */}
              <Route path="/admin" element={<AdminRoute><DashboardLayout /></AdminRoute>}>
                <Route index element={<DashboardHome />} />
                <Route path="products" element={<ProductsPage />} />
                <Route path="products/add" element={<AddProductPage />} />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="finance" element={<FinancePage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="support" element={<SupportPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="vendor" element={<VendorPage />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;