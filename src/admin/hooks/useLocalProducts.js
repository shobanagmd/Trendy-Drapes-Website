import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "trendy_products";
const DELETED_KEY = "trendy_deletedProducts";

// ── Image compression helper ──────────────────────────────────────────────────
// Resizes a base64 image to max 800×800 at 0.72 quality → reduces from ~2MB to ~80KB
const compressImage = (base64, maxSize = 800, quality = 0.72) =>
  new Promise((resolve) => {
    // If it's not a base64 data URL (e.g. already a URL string), return as-is
    if (!base64 || !base64.startsWith("data:image")) {
      resolve(base64);
      return;
    }
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      // Scale down if larger than maxSize
      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => resolve(base64); // fallback: use original
    img.src = base64;
  });

// ── Storage size helper ───────────────────────────────────────────────────────
const getStorageUsedKB = () => {
  let total = 0;
  for (const key of Object.keys(localStorage)) {
    total += (localStorage.getItem(key) || "").length * 2; // 2 bytes per char (UTF-16)
  }
  return Math.round(total / 1024);
};

// ── Safe localStorage setter with quota guard ─────────────────────────────────
const safeSetItem = (key, value) => {
  try {
    localStorage.setItem(key, value);
    return { ok: true };
  } catch (e) {
    if (e.name === "QuotaExceededError" || e.code === 22) {
      return { ok: false, reason: "quota" };
    }
    return { ok: false, reason: "unknown", error: e };
  }
};

// ── Read helpers ──────────────────────────────────────────────────────────────
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

// ── Hook ──────────────────────────────────────────────────────────────────────
export const useLocalProducts = () => {
  const [localProducts,   setLocalProducts]   = useState(getLocalProducts);
  const [deletedProducts, setDeletedProducts] = useState(getDeletedProducts);

  // Sync across tabs/components
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

  // ── addProduct — compresses images first, then stores ───────────────────────
  const addProduct = useCallback(async (product) => {
    const current = getLocalProducts();

    // Block duplicate IDs
    if (current.some((p) => p.id === product.id)) {
      return { ok: false, reason: "duplicate" };
    }

    // Compress every image in the images array + the primary image field
    let compressedImages = [];
    if (Array.isArray(product.images) && product.images.length > 0) {
      compressedImages = await Promise.all(product.images.map((img) => compressImage(img)));
    }
    const compressedPrimary = compressedImages[0] || (await compressImage(product.image)) || product.image;

    const productToSave = {
      ...product,
      image:  compressedPrimary,
      images: compressedImages.length > 0 ? compressedImages : [compressedPrimary],
    };

    const updated = [...current, productToSave];
    const result  = safeSetItem(STORAGE_KEY, JSON.stringify(updated));

    if (!result.ok && result.reason === "quota") {
      // Storage full — tell caller clearly
      return { ok: false, reason: "quota", usedKB: getStorageUsedKB() };
    }

    if (!result.ok) {
      return { ok: false, reason: "unknown" };
    }

    setLocalProducts(updated);
    window.dispatchEvent(new Event("localProductsUpdated"));
    return { ok: true };
  }, []);

  // ── removeProduct ────────────────────────────────────────────────────────────
  const removeProduct = useCallback((id) => {
    const current = getLocalProducts();
    const deleted = getDeletedProducts();
    const updated        = current.filter((p) => p.id !== id);
    const updatedDeleted = [...deleted, id];
    safeSetItem(STORAGE_KEY, JSON.stringify(updated));
    safeSetItem(DELETED_KEY, JSON.stringify(updatedDeleted));
    setLocalProducts(updated);
    setDeletedProducts(updatedDeleted);
    window.dispatchEvent(new Event("localProductsUpdated"));
  }, []);

  // ── clearAllProducts (utility for storage cleanup) ───────────────────────────
  const clearAllProducts = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(DELETED_KEY);
    setLocalProducts([]);
    setDeletedProducts([]);
    window.dispatchEvent(new Event("localProductsUpdated"));
  }, []);

  return { localProducts, deletedProducts, addProduct, removeProduct, clearAllProducts };
};