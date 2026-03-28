import { Link } from "react-router-dom";
import { Heart, ShoppingBag } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { products } from "@/data/products";
import { useLocalProducts } from "@/hooks/useLocalProducts";
import { toast } from "sonner";

const Wishlist = () => {
  const { wishlist, toggleWishlist, addToCart } = useCart();
  const { localProducts, deletedProducts } = useLocalProducts();
  const filteredStatic = products.filter((p) => !deletedProducts.includes(p.id));
  const allProducts = [...filteredStatic, ...localProducts];
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
      <div className="container mx-auto px-4 py-8">
        <h2 className="font-display text-3xl font-semibold text-foreground mb-8">My Wishlist ({wishlistProducts.length})</h2>
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
                  <h3 className="font-body text-sm line-clamp-2 text-foreground">{product.name}</h3>
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
                className="w-full mt-2 py-2.5 border border-border text-foreground font-body text-xs tracking-wider uppercase hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingBag size={14} /> Add to Cart
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
