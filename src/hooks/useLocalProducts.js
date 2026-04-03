import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "products";

const DEFAULT_SKUS = ["TD-E-001", "TD-F-002", "TD-E-003", "TD-B-004", "TD-S-005", "TD-H-006", "TD-F-007", "TD-E-008"];

export const getLocalProducts = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return parsed.filter((p) => !DEFAULT_SKUS.includes(p.sku));
  } catch {
    return [];
  }
};

export const useLocalProducts = () => {
  const [localProducts, setLocalProducts] = useState(getLocalProducts);

  // Listen for storage changes from other tabs/components
  useEffect(() => {
    const handler = () => setLocalProducts(getLocalProducts());
    window.addEventListener("storage", handler);
    window.addEventListener("localProductsUpdated", handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("localProductsUpdated", handler);
    };
  }, []);

  const addProduct = useCallback((product) => {
    const current = getLocalProducts();
    // Prevent duplicates by id
    if (current.some((p) => p.id === product.id)) return false;
    const updated = [...current, product];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setLocalProducts(updated);
    window.dispatchEvent(new Event("localProductsUpdated"));
    return true;
  }, []);

  const removeProduct = useCallback((id) => {
    const current = getLocalProducts();
    const updated = current.filter((p) => p.id !== id);
    // Explicitly set empty array if all deleted
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setLocalProducts(updated);
    window.dispatchEvent(new Event("localProductsUpdated"));
  }, []);

  return { localProducts, addProduct, removeProduct };
};
