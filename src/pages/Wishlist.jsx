import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
/* import { products } from "@/data/products"; */
import { useLocalProducts } from "@/hooks/useLocalProducts";
import { toast } from "sonner";

const Wishlist = () => {
  const { wishlist, toggleWishlist, addToCart } = useCart();
  const { localProducts: allProducts } = useLocalProducts();
  const [expandedItems, setExpandedItems] = useState({});

  const toggleExpand = (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedItems((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const wishlistProducts = allProducts.filter((p) => wishlist.includes(p.id));

  if (wishlistProducts.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Heart size={48} className="mx-auto text-muted-foreground" />
            <h2 className="font-display text-2xl text-foreground">Your wishlist is empty</h2>
            <Link to="/" className="inline-block bg-primary text-primary-foreground px-8 py-3 font-body text-sm tracking-wider uppercase">
              Explore Sarees
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
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h2 className="font-display text-xl font-black text-primary uppercase tracking-widest mb-8 border-b border-border pb-4">My Wishlist ({wishlistProducts.length})</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 lg:gap-7">
          {wishlistProducts.map((product) => (
            <div key={product.id} className="group">
              <Link to={`/product/${product.id}`} className="block">
                <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
                  <img src={product.images?.[0] || product.image} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
                  <button
                    onClick={(e) => { e.preventDefault(); toggleWishlist(product.id); }}
                    className="absolute top-3 right-3 p-2 bg-card/80 backdrop-blur-sm rounded-full"
                  >
                    <Heart size={18} className="fill-rose text-rose" />
                  </button>
                </div>
                <div className="pt-4 px-1 space-y-2">
                  <div className="flex items-start gap-2">
                    <h3 className={`font-body text-base text-foreground transition-all duration-300 ${expandedItems[product.id] ? "whitespace-normal overflow-visible" : "truncate"}`}>
                      {product.name}
                    </h3>
                    {product.name?.length > 45 && (
                      <button
                        type="button"
                        onClick={(e) => toggleExpand(e, product.id)}
                        className="text-[10px] text-primary hover:text-primary/80 font-bold uppercase tracking-tighter shrink-0 mt-1"
                      >
                        {expandedItems[product.id] ? "Less" : "More"}
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-body font-semibold text-sm text-foreground">₹{product.price.toLocaleString("en-IN")}</span>
                    <span className="font-body text-xs text-muted-foreground line-through">₹{product.originalPrice.toLocaleString("en-IN")}</span>
                    {product.discount > 0 && (
                      <span className="font-body text-xs text-rose font-medium">({product.discount}% OFF)</span>
                    )}
                  </div>
                </div>
              </Link>
              <button
                onClick={() => {
                  addToCart(product);
                  toggleWishlist(product.id);
                  toast.success("Moved to cart!");
                }}
                className="w-full mt-2 py-3 border border-border text-primary font-display text-[9px] font-black tracking-[0.2em] uppercase hover:bg-primary hover:text-white transition-all duration-300 flex items-center justify-center gap-2 rounded-lg"
              >
                <ShoppingBag size={12} /> Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Wishlist;
