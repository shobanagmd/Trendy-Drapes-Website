import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import emailjs from "emailjs-com";
import { getLocalProducts } from "@/hooks/useLocalProducts";
import { products } from "@/data/products";

const CART_KEY = "cart";
const WISHLIST_KEY = "wishlist";

const getStoredCart = () => {
  try {
    const data = localStorage.getItem(CART_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return parsed.map(item => ({ ...item, addedAt: item.addedAt || Date.now() }));
  } catch {
    return [];
  }
};

const getStoredWishlist = () => {
  try {
    const data = localStorage.getItem(WISHLIST_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const CartContext = createContext(undefined);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(getStoredCart);
  const [wishlist, setWishlist] = useState(getStoredWishlist);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  // Listen for storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setItems(getStoredCart());
      setWishlist(getStoredWishlist());
    };
    const handleProductDeleted = () => {
      const currentLocalProducts = getLocalProducts();
      const currentLocalIds = new Set(currentLocalProducts.map(p => p.id));
      const staticIds = new Set(products.map(p => p.id));
      
      const isProductAlive = (id) => staticIds.has(id) || currentLocalIds.has(id);

      // Remove from cart if product is deleted
      setItems((prev) => prev.filter((item) => isProductAlive(item.product.id)));
      // Remove from wishlist if product is deleted
      setWishlist((prev) => prev.filter((id) => isProductAlive(id)));
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("cartUpdated", handleStorageChange);
    window.addEventListener("wishlistUpdated", handleStorageChange);
    window.addEventListener("localProductsUpdated", handleProductDeleted);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("cartUpdated", handleStorageChange);
      window.removeEventListener("wishlistUpdated", handleStorageChange);
      window.removeEventListener("localProductsUpdated", handleProductDeleted);
    };
  }, []);

  // Check for expired items (15 days)
  useEffect(() => {
    const checkExpiries = () => {
      const FIFTEEN_DAYS = 15 * 24 * 60 * 60 * 1000;
      const now = Date.now();
      
      setItems(prev => {
        let hasChanges = false;
        const validItems = [];
        
        for (const item of prev) {
          if (item.addedAt && (now - item.addedAt > FIFTEEN_DAYS)) {
            hasChanges = true;
            
            const templateParams = {
              name: "Trendy Drapes User",
              email: "support@trendydrapes.com", 
              phone: "N/A", door: "N/A", street: "N/A", city: "N/A", state: "N/A", pincode: "N/A",
              order_id: "CART-EXPIRY",
              items: `<div class="item"><span>${item.product.name}</span><span>Removed from cart after 15 days</span></div>`,
              subtotal: "0", delivery: "0", gst: "0", total: "0",
              brand_name: "Trendy Drapes",
              email_subject: "Cart Expiry Notification",
              email_header: "Product Removed",
              email_footer: "Product removed from cart after 15 days"
            };
            
            emailjs.send(
              "service_wyf5asp",
              "template_3rtoxp9",
              templateParams,
              "MThP-R8Y7Yn3mNaVK"
            ).catch(err => console.log("EmailJS Error:", err));
            
          } else {
            validItems.push(item);
          }
        }
        
        return hasChanges ? validItems : prev;
      });
    };
    
    checkExpiries();
    const interval = setInterval(checkExpiries, 60 * 60 * 1000); // Check every hour
    return () => clearInterval(interval);
  }, []);

  const addToCart = useCallback((product, size = "Free Size") => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1, size, addedAt: Date.now() }];
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.product.id !== productId));
    } else {
      setItems((prev) =>
        prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i))
      );
    }
  }, []);

  const toggleWishlist = useCallback((productId) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  }, []);

  const isInWishlist = useCallback(
    (productId) => wishlist.includes(productId),
    [wishlist]
  );

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const wishlistCount = wishlist.length;
  const cartTotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  const clearCart = useCallback(() => setItems([]), []);

  return (
    <CartContext.Provider
      value={{
        items, wishlist, addToCart, removeFromCart, updateQuantity,
        toggleWishlist, isInWishlist, cartCount, wishlistCount, cartTotal, clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
