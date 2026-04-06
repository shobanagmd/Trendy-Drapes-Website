import { Link } from "react-router-dom";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

const Cart = () => {
  const { items, updateQuantity, removeFromCart, cartTotal, toggleWishlist, isInWishlist } = useCart();

  const handleRemoveToWishlist = (productId) => {
    if (!isInWishlist(productId)) {
      toggleWishlist(productId);
    }
    removeFromCart(productId);
    toast.success("Item moved to Wishlist");
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
      <div className="container mx-auto px-4 py-8">
        <h2 className="font-display text-3xl font-semibold text-foreground mb-8">Shopping Bag ({items.length})</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const imgSrc = item.product.images?.[0] || item.product.image || "/placeholder.svg";
              return (
                <div key={item.product.id} className="flex gap-4 border border-border p-4 bg-card">
                  <Link to={`/product/${item.product.id}`} className="w-24 h-32 flex-shrink-0 overflow-hidden bg-secondary">
                    <img src={imgSrc} alt={item.product.name} className="w-full h-full object-cover" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <Link to={`/product/${item.product.id}`} className="font-body text-sm text-foreground line-clamp-2 hover:text-accent transition-colors">
                        {item.product.name}
                      </Link>
                      <button onClick={() => handleRemoveToWishlist(item.product.id)} className="p-1 text-muted-foreground hover:text-foreground">
                        <X size={16} />
                      </button>
                    </div>
                    <p className="font-body text-xs text-muted-foreground mt-1">Size: {item.size}</p>
                    <p className="font-body font-semibold text-sm text-foreground mt-2">₹{item.product.price.toLocaleString("en-IN")}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <button
                        onClick={() => {
                          if (item.quantity > 1) updateQuantity(item.product.id, item.quantity - 1);
                        }}
                        className={`w-8 h-8 border border-border flex items-center justify-center hover:bg-secondary ${item.quantity <= 1 ? "opacity-40 cursor-not-allowed" : ""}`}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="font-body text-sm w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="w-8 h-8 border border-border flex items-center justify-center hover:bg-secondary">
                        <Plus size={14} />
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemoveToWishlist(item.product.id)}
                      className="mt-3 font-body text-xs text-destructive hover:text-destructive/80 underline underline-offset-2 transition-colors"
                    >
                      Remove from Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-1">
            <div className="border border-border p-6 bg-card sticky top-32">
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">Order Summary</h3>
              <div className="space-y-3 border-b border-border pb-4 mb-4">
                <div className="flex justify-between text-sm font-body">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">₹{cartTotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-sm font-body">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span className="text-foreground">₹49</span>
                </div>
                <div className="flex justify-between text-sm font-body">
                  <span className="text-muted-foreground">Platform Fee</span>
                  <span className="text-foreground">₹19</span>
                </div>
              </div>
              <div className="flex justify-between font-body font-semibold text-foreground mb-6">
                <span>Total</span>
                <span>₹{(cartTotal + 49 + 19).toLocaleString("en-IN")}</span>
              </div>
              <Link to="/checkout" className="block w-full py-4 bg-accent text-accent-foreground font-body text-sm font-semibold tracking-wider uppercase hover:opacity-90 transition-opacity text-center">
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
