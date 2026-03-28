import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const OrderSuccess = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <Navbar />
    <div className="flex-1 flex items-center justify-center py-20">
      <div className="text-center space-y-4 max-w-md px-4">
        <CheckCircle size={64} className="mx-auto text-accent" />
        <h1 className="font-display text-3xl font-semibold text-foreground">Order Placed!</h1>
        <p className="font-body text-sm text-muted-foreground">
          Thank you for shopping with Trendy Drapes. Your order has been placed successfully. We'll send you a confirmation email shortly.
        </p>
        <Link
          to="/"
          className="inline-block bg-primary text-primary-foreground px-8 py-3 font-body text-sm tracking-wider uppercase mt-4"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
    <Footer />
  </div>
);

export default OrderSuccess;
