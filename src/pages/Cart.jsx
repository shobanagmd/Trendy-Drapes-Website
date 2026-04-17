import { Link } from "react-router-dom";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

const Cart = () => {
  const { items, updateQuantity, removeFromCart, cartTotal, toggleWishlist, isInWishlist } = useCart();

    const handleRemoveToWishlist = (productId, size) => {
    if (!isInWishlist(productId)) {
      toggleWishlist(productId);
    }
    removeFromCart(productId, size);
    toast.success("Item removed and moved to Wishlist");
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <ShoppingBag size={48} className="mx-auto text-muted-foreground" />
            <h2 className="font-display text-2xl text-foreground">Your cart is empty</h2>
            <Link to="/collections" className="inline-block bg-primary text-primary-foreground px-8 py-3 font-body text-sm tracking-wider uppercase">
              Continue Shopping
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h2 className="font-display text-xl font-black text-primary uppercase tracking-widest mb-8 border-b border-border pb-4">Shopping Bag ({items.length})</h2>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            {items.map((item) => {
              const imgSrc = item.product.images?.[0] || item.product.image || "/placeholder.svg";
              return (
                <div key={`${item.product.id}-${item.size}`} className="flex gap-4 border border-border p-4 bg-white rounded-xl shadow-sm hover:border-primary/30 transition-all">
                  <Link to={`/product/${item.product.id}`} className="w-20 h-28 flex-shrink-0 overflow-hidden bg-secondary/50 rounded-lg">
                    <img src={imgSrc} alt={item.product.name} className="w-full h-full object-cover" />
                  </Link>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <Link to={`/product/${item.product.id}`} className="font-display text-sm font-black uppercase tracking-wider text-primary truncate hover:text-primary/70 transition-colors">
                          {item.product.name}
                        </Link>
                        <button onClick={() => removeFromCart(item.product.id, item.size)} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                          <X size={14} />
                        </button>
                      </div>
                      <p className="font-body text-xs text-muted-foreground mt-0.5">Size: {item.size}</p>
                      <p className="font-display font-black text-sm text-foreground mt-2 tracking-tighter">₹{item.product.price.toLocaleString("en-IN")}</p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (item.quantity > 1) updateQuantity(item.product.id, item.quantity - 1, item.size);
                          }}
                          className={`w-6 h-6 border border-border flex items-center justify-center hover:bg-secondary rounded ${item.quantity <= 1 ? "opacity-30 cursor-not-allowed" : ""}`}
                        >
                          <Minus size={10} />
                        </button>
                        <span className="font-body text-xs w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.size)} className="w-6 h-6 border border-border flex items-center justify-center hover:bg-secondary rounded">
                          <Plus size={10} />
                        </button>
                      </div>
                      <button
                        onClick={() => handleRemoveToWishlist(item.product.id, item.size)}
                        className="font-display text-[10px] font-bold text-red-600 hover:text-red-700 border-b border-red-200 pb-0.5 tracking-widest uppercase transition-colors"
                      >
                        Remove from Cart
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="w-full">
            <div className="border border-border p-6 bg-white rounded-2xl shadow-sm">
              <h3 className="font-display text-sm font-black uppercase tracking-widest text-primary mb-6 border-b border-border pb-2">Order Summary</h3>
              <div className="space-y-3 pb-4 mb-4">
                <div className="flex justify-between text-xs font-medium tracking-tight">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">₹{cartTotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-xs font-medium tracking-tight">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span className="text-foreground">₹49</span>
                </div>
                <div className="flex justify-between text-xs font-medium tracking-tight">
                  <span className="text-muted-foreground">Platform Fee</span>
                  <span className="text-foreground">₹19</span>
                </div>
              </div>
              <div className="flex justify-between font-display text-base font-black text-primary uppercase tracking-tighter mb-8 border-t border-border pt-4">
                <span>Total Amount</span>
                <span>₹{(cartTotal + 49 + 19).toLocaleString("en-IN")}</span>
              </div>
              <Link to="/checkout" className="block w-full py-4 bg-primary text-white font-display text-xs font-black tracking-[0.2em] uppercase hover:bg-primary/90 transition-all text-center rounded-xl shadow-lg shadow-primary/20">
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Cart;
