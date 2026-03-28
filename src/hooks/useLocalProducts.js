import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "products";
const DELETED_KEY = "deletedProducts";

export const getLocalProducts = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const getDeletedProducts = () => {
  try {
    const data = localStorage.getItem(DELETED_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const useLocalProducts = () => {
  const [localProducts, setLocalProducts] = useState(getLocalProducts);
  const [deletedProducts, setDeletedProducts] = useState(getDeletedProducts);

  // Listen for storage changes from other tabs/components
  useEffect(() => {
    const handler = () => {
      setLocalProducts(getLocalProducts());
      setDeletedProducts(getDeletedProducts());
    };
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
    const deleted = getDeletedProducts();
    const updated = current.filter((p) => p.id !== id);
    const updatedDeleted = [...deleted, id];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    localStorage.setItem(DELETED_KEY, JSON.stringify(updatedDeleted));
    setLocalProducts(updated);
    setDeletedProducts(updatedDeleted);
    window.dispatchEvent(new Event("localProductsUpdated"));
  }, []);

  return { localProducts, deletedProducts, addProduct, removeProduct };
};
