import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

const Checkout = () => {
  const { items, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", email: "", phone: "", address: "", city: "", pincode: "", state: "",
  });
  const shipping = cartTotal >= 4999 ? 0 : 299;
  const total = cartTotal + shipping;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const required = ["name", "email", "phone", "address", "city", "pincode", "state"];
    for (const key of required) {
      if (!form[key].trim()) {
        toast.error(`Please enter your ${key}`);
        return;
      }
    }
    clearCart();
    toast.success("Order placed successfully!");
    navigate("/order-success");
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-center">
          <div>
            <h2 className="font-display text-2xl text-foreground">Your cart is empty</h2>
            <Link to="/collections" className="inline-block mt-4 bg-primary text-primary-foreground px-8 py-3 font-body text-sm tracking-wider uppercase">
              Shop Now
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const inputCls = "w-full px-4 py-3 border border-border bg-card text-sm font-body text-foreground focus:outline-none focus:ring-1 focus:ring-accent";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Link to="/cart" className="flex items-center gap-1 text-xs font-body text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ChevronLeft size={14} /> Back to Cart
        </Link>
        <h2 className="font-display text-3xl font-semibold text-foreground mb-8">Checkout</h2>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-display text-xl font-semibold text-foreground">Shipping Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="name" placeholder="Full Name" value={form.name} onChange={handleChange} className={inputCls} />
                <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} className={inputCls} />
                <input name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} className={inputCls} />
                <input name="pincode" placeholder="Pincode" value={form.pincode} onChange={handleChange} className={inputCls} />
              </div>
              <input name="address" placeholder="Full Address" value={form.address} onChange={handleChange} className={inputCls} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="city" placeholder="City" value={form.city} onChange={handleChange} className={inputCls} />
                <input name="state" placeholder="State" value={form.state} onChange={handleChange} className={inputCls} />
              </div>
            </div>

            <div>
              <div className="border border-border p-6 bg-card sticky top-32">
                <h3 className="font-display text-lg font-semibold text-foreground mb-4">Order Summary</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex gap-3">
                      <img src={item.product.images[0]} alt="" className="w-12 h-16 object-cover flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-body text-xs text-foreground line-clamp-1">{item.product.name}</p>
                        <p className="font-body text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        <p className="font-body text-sm font-semibold text-foreground">₹{(item.product.price * item.quantity).toLocaleString("en-IN")}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 border-t border-border pt-4">
                  <div className="flex justify-between text-sm font-body">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{cartTotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-sm font-body">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-accent font-medium">{shipping === 0 ? "Free" : `₹${shipping}`}</span>
                  </div>
                  <div className="flex justify-between font-body font-semibold text-foreground pt-2 border-t border-border">
                    <span>Total</span>
                    <span>₹{total.toLocaleString("en-IN")}</span>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-4 bg-accent text-accent-foreground font-body text-sm font-semibold tracking-wider uppercase hover:opacity-90 transition-opacity mt-6"
                >
                  Place Order
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default Checkout;
