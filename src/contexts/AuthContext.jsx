import { createContext, useContext, useState, useEffect } from "react";
import { apiFetch } from "@/utils/api";


// ─── HARDCODED CREDENTIALS ────────────────────────────────────────────────────
const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "admin@123";

const SELLER_EMAIL = "seller@gmail.com";
const SELLER_PASSWORD = "seller@123";

// ─── CONTEXT ──────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // "admin" | "seller" | "user"
  const [isAdmin, setIsAdmin] = useState(false);

  // Restore session on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (token) {
          const res = await apiFetch("/api/user/me");
          if (res.ok) {
            const data = await res.json();
            setSession(data.user, data.user.role, token);
          } else {
            logout(); // Token expired or invalid
          }
        }
      } catch (err) {
        console.error("Auth init error:", err);
      }
    };
    initAuth();
  }, []);

  // ── login ──────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    try {
      const res = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        setSession(data.user, data.role, data.token, data.onboardingCompleted);
        return { success: true, role: data.role };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: "Connection error" };
    }
  };

  // ── register ───────────────────────────────────────────────────────────────
  const register = async (email, password, name, role = "user") => {
    try {
      const res = await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password, role })
      });
      const data = await res.json();
      if (data.success) {
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: "Connection error" };
    }
  };

  // ── logout ─────────────────────────────────────────────────────────────────
  const logout = () => {
    setUser(null);
    setRole(null);
    setIsAdmin(false);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_role");
    localStorage.removeItem("isLoggedIn");
  };

  // ── adminLogin ─────────────────────────────────────────────────────────────
  const adminLogin = (email, password) => login(email, password);

  // ── completeOnboarding ─────────────────────────────────────────────────────
  const completeOnboarding = async (formData) => {
    try {
      const res = await apiFetch("/api/seller/complete-onboarding", {
        method: "POST",
        body: formData,
      });

      // Check if response is JSON
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Non-JSON response received:", text);
        return { success: false, message: `Server error: Unexpected response format (${res.status})` };
      }

      const data = await res.json();
      if (data.success) {
        // Update local state with functional setter to ensure we have latest data
        setUser(prev => {
          const updated = { ...prev, onboardingCompleted: true };
          localStorage.setItem("auth_user", JSON.stringify(updated));
          return updated;
        });
        return { success: true };
      }
      return data;
    } catch (err) {
      console.error(err);
      return { success: false, message: "Server error" };
    }
  };

  // ─── Private Helpers ───────────────────────────────────────────────────────
  const setSession = (userObj, roleStr, token = null, onboardingCompleted = null) => {
    const userData = { ...userObj };
    if (onboardingCompleted !== null) {
      userData.onboardingCompleted = onboardingCompleted;
    }
    
    setUser(userData);
    setRole(roleStr);
    setIsAdmin(roleStr === "admin");
    localStorage.setItem("auth_user", JSON.stringify(userData));
    localStorage.setItem("auth_role", roleStr);
    if (token) localStorage.setItem("auth_token", token);
    localStorage.setItem("isLoggedIn", "true");
  };

  const _getRegisteredUsers = () => {
    try {
      return JSON.parse(localStorage.getItem("registered_users") || "[]");
    } catch {
      return [];
    }
  };

  const _saveRegisteredUsers = (users) => {
    localStorage.setItem("registered_users", JSON.stringify(users));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        role,
        setRole,
        isAdmin,
        setIsAdmin,
        login,
        register,
        logout,
        adminLogin,
        setSession,
        completeOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};