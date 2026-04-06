import { createContext, useContext, useState, useCallback } from "react";

const AuthContext = createContext(undefined);

const USER_KEY = "trendy_user";
const ADMIN_KEY = "trendy_isAdmin";
const REGISTERED_USERS_KEY = "trendy_registered_users";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const data = localStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  });

  const [isAdmin, setIsAdmin] = useState(() => {
    try {
      return localStorage.getItem(ADMIN_KEY) === "true";
    } catch {
      return false;
    }
  });
  
  const [role, setRole] = useState(() => {
    try {
      return localStorage.getItem("role") || null;
    } catch {
      return null;
    }
  });

  // Get all registered users from localStorage
  const getRegisteredUsers = useCallback(() => {
    try {
      const data = localStorage.getItem(REGISTERED_USERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }, []);

  // Register a new user — must be done before login
  const register = useCallback((email, password, name) => {
    const users = getRegisteredUsers();
    const exists = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return { success: false, message: "An account with this email already exists. Please login." };
    }
    const newUser = { email: email.toLowerCase(), password, name: name || "User" };
    const updated = [...users, newUser];
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(updated));
    return { success: true, message: "Account created successfully! Please login to continue." };
  }, [getRegisteredUsers]);

  // Login — handles admin, seller, and regular users
  const login = useCallback((email, password) => {
    // 1. Admin Check
    if (email.toLowerCase() === "admin@gmail.com" && password === "admin@123") {
      const adminData = { email: "admin@gmail.com", name: "Admin" };
      localStorage.setItem(USER_KEY, JSON.stringify(adminData));
      localStorage.setItem("role", "admin");
      localStorage.setItem(ADMIN_KEY, "true");
      localStorage.setItem("isLoggedIn", "true");
      setUser(adminData);
      setRole("admin");
      setIsAdmin(true);
      return { success: true, role: "admin" };
    }

    // 2. Seller Check
    if (email.toLowerCase() === "seller@gmail.com" && password === "seller@123") {
      const sellerData = { email: "seller@gmail.com", name: "Seller" };
      localStorage.setItem(USER_KEY, JSON.stringify(sellerData));
      localStorage.setItem("role", "seller");
      localStorage.setItem(ADMIN_KEY, "false");
      localStorage.setItem("isLoggedIn", "true");
      setUser(sellerData);
      setRole("seller");
      setIsAdmin(false);
      return { success: true, role: "seller" };
    }

    // 3. Regular User Check
    const users = getRegisteredUsers();
    const found = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!found) {
      return { success: false, message: "Invalid email or password. Please check and try again." };
    }
    const userData = { email: found.email, name: found.name };
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    localStorage.setItem("role", "user");
    localStorage.setItem(ADMIN_KEY, "false");
    localStorage.setItem("isLoggedIn", "true");
    setUser(userData);
    setRole("user");
    setIsAdmin(false);
    return { success: true, role: "user" };
  }, [getRegisteredUsers]);

  const logout = useCallback(() => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ADMIN_KEY);
    localStorage.removeItem("role");
    localStorage.removeItem("isLoggedIn");
    setUser(null);
    setRole(null);
    setIsAdmin(false);
  }, []);

  const adminLogin = useCallback((username, password) => {
    // Allow both 'admin' and 'admin@gmail.com' for the admin login form
    if ((username === "admin" || username === "admin@gmail.com") && password === "admin@123") {
      const adminData = { email: "admin@gmail.com", name: "Admin" };
      localStorage.setItem(USER_KEY, JSON.stringify(adminData));
      localStorage.setItem(ADMIN_KEY, "true");
      localStorage.setItem("role", "admin");
      localStorage.setItem("isLoggedIn", "true");
      setUser(adminData);
      setIsAdmin(true);
      setRole("admin");
      return true;
    }
    return false;
  }, []);

  const adminLogout = useCallback(() => {
    logout(); // Use centralized logout
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, isAdmin, role, setRole, setIsAdmin, setUser, login, logout, register, adminLogin, adminLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
