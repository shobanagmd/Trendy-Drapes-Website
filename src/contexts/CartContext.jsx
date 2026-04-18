import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react";
import { apiFetch } from "@/utils/api";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import emailjs from "emailjs-com";

const CART_KEY = "guest_cart";
const WISHLIST_KEY = "guest_wishlist";

const CartContext = createContext(undefined);

export const CartProvider = ({ children }) => {
  const { user, role } = useAuth();
  const [items, setItems] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load guest data initially
  const getGuestCart = () => {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    } catch {
      return [];
    }
  };
  
  const getGuestWishlist = () => {
    try {
      return JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]");
    } catch {
      return [];
    }
  };

  const fetchBackendData = useCallback(async () => {
    if (!user || role !== 'user') return;
    try {
      setLoading(true);
      const [cartRes, wishRes] = await Promise.all([
        apiFetch("/api/cart"),
        apiFetch("/api/wishlist")
      ]);
      
      if (cartRes.ok && wishRes.ok) {
        const cartData = await cartRes.json();
        const wishData = await wishRes.json();
        
        // Map backend cart to frontend format, filtering out orphaned items
        const formattedItems = cartData.cart
          .filter(item => item.name) // Ensure product still exists
          .map(item => ({
            product: {
              id: item.product_id,
              name: item.name,
              price: Number(item.current_price || item.price),
              image: item.main_image,
              images: [item.main_image]
            },
            quantity: item.quantity,
            size: item.size,
            id: item.cart_item_id // DB ID
          }));
        
        setItems(formattedItems);
        setWishlist(wishData.wishlist);
      }
    } catch (err) {
      console.error("Fetch cart error:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Sync Guest Cart to DB on Login
  const syncGuestToDB = useCallback(async () => {
    const guestCart = getGuestCart();
    const guestWish = getGuestWishlist();

    if (guestCart.length > 0) {
      for (const item of guestCart) {
        await apiFetch("/api/cart", {
          method: "POST",
          body: JSON.stringify({ product_id: item.product.id, quantity: item.quantity, size: item.size })
        });
      }
      localStorage.removeItem(CART_KEY);
    }

    if (guestWish.length > 0) {
      for (const pid of guestWish) {
        await apiFetch("/api/wishlist/toggle", {
          method: "POST",
          body: JSON.stringify({ product_id: pid })
        });
      }
      localStorage.removeItem(WISHLIST_KEY);
    }
    
    fetchBackendData();
  }, [fetchBackendData]);

  useEffect(() => {
    if (user && role === 'user') {
      syncGuestToDB();
    } else if (!user) {
      setItems(getGuestCart());
      setWishlist(getGuestWishlist());
      setLoading(false);
    } else {
      // Non-user logged in (admin/seller) - clear frontend items to avoid confusion
      setItems([]);
      setWishlist([]);
      setLoading(false);
    }
  }, [user, role, syncGuestToDB]);

  const sendAddToCartEmail = useCallback((user, product, size) => {
    if (!user || !user.email) return;

    const templateParams = {
      name: user.name || user.full_name || "Customer",
      email: user.email,
      to_email: user.email,
      product_name: product.name,
      product_price: `₹${product.price}`,
      product_size: size,
      brand_name: "Trendy Drapes",
    };

    emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_CART_TEMPLATE_ID,
      templateParams,
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    )
    .then(() => console.log("Add to Cart email sent"))
    .catch(err => console.error("Error sending Add to Cart email:", err));
  }, []);

  const addToCart = useCallback(async (product, size = "Free Size") => {
    if (user) {
      try {
        const res = await apiFetch("/api/cart", {
          method: "POST",
          body: JSON.stringify({ product_id: product.id, quantity: 1, size })
        });
        if (res.ok) {
          await fetchBackendData();
          sendAddToCartEmail(user, product, size);
          return true;
        }
        return false;
      } catch (err) {
        toast.error("Cart sync failed");
        return false;
      }
    } else {
      // Guest mode
      const alreadyInCartIdx = items.findIndex((i) => i.product.id === product.id && i.size === size);
      
      if (alreadyInCartIdx !== -1) {
        const updated = [...items];
        updated[alreadyInCartIdx].quantity += 1;
        setItems(updated);
        localStorage.setItem(CART_KEY, JSON.stringify(updated));
        toast.success("Quantity updated in Cart");
        return true;
      }

      const newItem = {
        product,
        quantity: 1,
        size,
        id: `guest-${Date.now()}`
      };
      
      const updated = [...items, newItem];
      setItems(updated);
      localStorage.setItem(CART_KEY, JSON.stringify(updated));
      toast.success("Added to Cart");
      return true;
    }
  }, [user, items, fetchBackendData]);

  const removeFromCart = useCallback(async (productId, size = null) => {
    if (user) {
      const url = size ? `/api/cart/${productId}?size=${encodeURIComponent(size)}` : `/api/cart/${productId}`;
      const res = await apiFetch(url, { method: "DELETE" });
      if (res.ok) fetchBackendData();
    } else {
      setItems(prev => {
        const next = prev.filter(i => !(i.product.id === productId && (size === null || i.size === size)));
        localStorage.setItem(CART_KEY, JSON.stringify(next));
        return next;
      });
    }
  }, [user, fetchBackendData]);

  const updateQuantity = useCallback(async (productId, quantity, size = "Free Size") => {
    if (quantity <= 0) return removeFromCart(productId, size);
    
    if (user) {
      const res = await apiFetch(`/api/cart/${productId}`, {
        method: "PUT",
        body: JSON.stringify({ quantity, size })
      });
      if (res.ok) fetchBackendData();
    } else {
      setItems(prev => {
        const next = prev.map(i => (i.product.id === productId && i.size === size) ? { ...i, quantity } : i);
        localStorage.setItem(CART_KEY, JSON.stringify(next));
        return next;
      });
    }
  }, [user, fetchBackendData, removeFromCart]);

  const toggleWishlist = useCallback(async (productId) => {
    if (user) {
      const res = await apiFetch("/api/wishlist/toggle", {
        method: "POST",
        body: JSON.stringify({ product_id: productId })
      });
      if (res.ok) fetchBackendData();
    } else {
      setWishlist(prev => {
        const next = prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId];
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(next));
        return next;
      });
    }
  }, [user, fetchBackendData]);

  const isInWishlist = useCallback((productId) => wishlist.includes(productId), [wishlist]);
  const cartCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const cartTotal = useMemo(() => items.reduce((sum, i) => sum + (Number(i.product.price) || 0) * i.quantity, 0), [items]);

  const clearCart = useCallback(async () => {
    if (user) {
      for (const item of items) {
        await apiFetch(`/api/cart/${item.product.id}`, { method: "DELETE" });
      }
      fetchBackendData();
    } else {
      setItems([]);
      localStorage.removeItem(CART_KEY);
    }
  }, [user, items, fetchBackendData]);

  return (
    <CartContext.Provider
      value={{
        items, wishlist, addToCart, removeFromCart, updateQuantity,
        toggleWishlist, isInWishlist, cartCount, wishlistCount: wishlist.length, cartTotal, clearCart, loading
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
