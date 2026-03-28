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

  // Login — only allowed if user has registered first
  const login = useCallback((email, password) => {
    const users = getRegisteredUsers();
    const found = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!found) {
      return { success: false, message: "Invalid email or password. Please check and try again." };
    }
    const userData = { email: found.email, name: found.name };
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
    return { success: true };
  }, [getRegisteredUsers]);

  const logout = useCallback(() => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ADMIN_KEY);
    setUser(null);
    setIsAdmin(false);
  }, []);

  const adminLogin = useCallback((username, password) => {
    if (username === "admin" && password === "admin123") {
      localStorage.setItem(ADMIN_KEY, "true");
      setIsAdmin(true);
      return true;
    }
    return false;
  }, []);

  const adminLogout = useCallback(() => {
    localStorage.removeItem(ADMIN_KEY);
    setIsAdmin(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, logout, register, adminLogin, adminLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
