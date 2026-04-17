import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/utils/api";
import { BACKEND_URL } from "@/utils/paths";

const formatImageUrl = (url) => {
  if (!url) return "📦";
  if (url.startsWith("/uploads/")) return `${BACKEND_URL}${url}`;
  return url;
};

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
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiFetch("/api/products");
      const data = await res.json();
      
      if (data.success) {
        // Map backend products to the expected frontend format
        const dbProducts = data.products.map(p => ({
          id: p.product_id, // Use UUID directly
          rawId: p.product_id,
          source: p.seller_id ? 'seller' : 'admin',
          sku: p.sku,
          name: p.name,
          seller: p.seller_id ? (p.seller_name || 'Seller') : 'Trendy Drapes Official',
          category: p.category_name || "Uncategorized",
          subCategory: p.sub_category,
          price: Number(p.price),
          originalPrice: Number(p.mrp) || Number(p.price),
          mrp: Number(p.mrp),
          discount: p.mrp > 0 ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0,
          stock: p.stock_quantity || 0,
          description: p.description,
          image: formatImageUrl(p.main_image),
          images: (p.images || []).map(img => formatImageUrl(img.image_url || img)),
          fabric: p.fabric,
          color: p.color,
          work: p.work,
          pattern: p.pattern,
          sizes: p.sizes || [],
          readyToShip: p.ready_to_ship,
          featured: p.featured,
          isNew: true
        }));

        setLocalProducts(dbProducts);
      }
    } catch (err) {
      console.error("Fetch products error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    
    const handler = () => fetchProducts();
    window.addEventListener("localProductsUpdated", handler);
    return () => window.removeEventListener("localProductsUpdated", handler);
  }, [fetchProducts]);

  const addProduct = useCallback(async (product, imageFiles = [], source = 'seller') => {
    try {
      const formData = new FormData();
      
      formData.append("sku", product.sku);
      formData.append("name", product.name);
      if (source === 'seller') {
        formData.append("sellerEmail", product.seller || "");
      }
      formData.append("category", product.category);
      formData.append("subCategory", product.subCategory);
      formData.append("price", product.price);
      formData.append("mrp", product.mrp);
      formData.append("stock", product.stock);
      formData.append("description", product.description);
      formData.append("fabric", product.fabric);
      formData.append("color", product.color);
      formData.append("work", product.work);
      formData.append("pattern", product.pattern);
      formData.append("readyToShip", product.readyToShip);
      formData.append("featured", product.featured);
      
      if (Array.isArray(product.sizes)) {
        product.sizes.forEach(size => formData.append("sizes", size));
      }

      if (imageFiles && imageFiles.length > 0) {
        imageFiles.forEach(file => formData.append("images", file));
      }

      const endpoint = source === 'admin' ? "/api/admin/products" : "/api/seller/products";
      const response = await apiFetch(endpoint, {
        method: "POST",
        body: formData
      });

      const result = await response.json();
      if (result.success) {
        await fetchProducts();
        window.dispatchEvent(new Event("localProductsUpdated"));
        return { ok: true, product: result.product };
      }
      return { ok: false, error: result.message };
    } catch (err) {
      console.error("Add product error:", err);
      return { ok: false, error: err.message };
    }
  }, [fetchProducts]);

  const removeProduct = useCallback(async (id) => {
    try {
      const endpoint = `/api/products/${id}`; // Simplified uniform endpoint

      const response = await apiFetch(endpoint, {
        method: "DELETE"
      });
      const result = await response.json();
      if (result.success) {
        setLocalProducts(prev => prev.filter(p => p.id !== id));
        window.dispatchEvent(new Event("localProductsUpdated"));
        return { ok: true };
      }
      return { ok: false, error: result.message };
    } catch (err) {
      console.error("Remove product error:", err);
      return { ok: false, error: err.message };
    }
  }, []);

  const editProduct = useCallback(async (id, product, imageFiles = [], existingImages = []) => {
    try {
      const endpoint = `/api/products/${id}`;

      const formData = new FormData();
      formData.append("sku", product.sku);
      formData.append("name", product.name);
      formData.append("sellerEmail", product.seller || "");
      formData.append("category", product.category);
      formData.append("subCategory", product.subCategory);
      formData.append("price", product.price);
      formData.append("mrp", product.mrp);
      formData.append("stock", product.stock);
      formData.append("description", product.description);
      formData.append("fabric", product.fabric);
      formData.append("color", product.color);
      formData.append("work", product.work);
      formData.append("pattern", product.pattern);
      formData.append("readyToShip", product.readyToShip);
      formData.append("featured", product.featured);
      
      // Clean up existing images: remove the backend prefix if present
      const cleanedExisting = existingImages.map(img => {
        if (typeof img === 'string' && img.startsWith(BACKEND_URL)) {
          return img.replace(BACKEND_URL, "");
        }
        return img;
      });
      formData.append("existingImages", JSON.stringify(cleanedExisting));
      
      if (Array.isArray(product.sizes)) {
        product.sizes.forEach(size => formData.append("sizes", size));
      }

      if (imageFiles && imageFiles.length > 0) {
        imageFiles.forEach(file => formData.append("images", file));
      }

      const response = await apiFetch(endpoint, {
        method: "PUT",
        body: formData
      });

      const result = await response.json();
      if (result.success) {
        await fetchProducts();
        window.dispatchEvent(new Event("localProductsUpdated"));
        return { ok: true, product: result.product };
      }
      return { ok: false, error: result.message };
    } catch (err) {
      console.error("Edit product error:", err);
      return { ok: false, error: err.message };
    }
  }, [fetchProducts]);

  return { localProducts, addProduct, removeProduct, editProduct, loading, refresh: fetchProducts };
};
