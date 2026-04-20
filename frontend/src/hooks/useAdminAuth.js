import { useState, useCallback } from "react";

const ADMIN_KEY = "isAdmin";
const ADMIN_USER = "admin";
const ADMIN_PASS = "admin123";

export const useAdminAuth = () => {
  const [isAdmin, setIsAdmin] = useState(() => {
    try {
      return localStorage.getItem(ADMIN_KEY) === "true";
    } catch {
      return false;
    }
  });

  const login = useCallback((username, password) => {
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      localStorage.setItem(ADMIN_KEY, "true");
      setIsAdmin(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(ADMIN_KEY);
    setIsAdmin(false);
  }, []);

  return { isAdmin, login, logout };
};
