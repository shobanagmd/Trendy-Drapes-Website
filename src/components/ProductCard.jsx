import { useState } from "react";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useLocalProducts } from "@/hooks/useLocalProducts";
import { products as staticProducts } from "@/data/products";
import { toast } from "sonner";

const ProductCard = ({ product }) => {
  const [hovered, setHovered] = useState(false);
  const [nameExpanded, setNameExpanded] = useState(false);
  const { toggleWishlist, isInWishlist, addToCart, removeFromCart } = useCart();
  const { isAdmin } = useAdminAuth();
  const { removeProduct } = useLocalProducts();
  const wishlisted = isInWishlist(product.id);
  const shouldShowMore = product.name?.length > 45;

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this product?")) {
      removeProduct(product.id);
      removeFromCart(product.id);
      toggleWishlist(product.id);
      toast.success("Product Removed");
    }
  };

  return (
    <div
      className="group product-card-hover"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link to={`/product/${product.id}`} className="block">
        {/* Image container */}
        <div className="relative overflow-hidden aspect-[3/4] bg-secondary">
          <img
            src={hovered && product.images?.[1] ? product.images[1] : (product.images?.[0] || product.image)}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />

          {/* Out of Stock overlay */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
              <span className="font-body text-sm font-semibold text-destructive bg-background/80 px-4 py-2 rounded">Out of Stock</span>
            </div>
          )}

          {/* Wishlist button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            className="absolute top-3 right-3 p-2 bg-card/80 backdrop-blur-sm rounded-full transition-all duration-300 hover:bg-card"
          >
            <Heart
              size={18}
              className={wishlisted ? "fill-rose text-rose" : "text-foreground"}
            />
          </button>

          {/* Delete button for admin */}
          {isAdmin && (
            <button
              onClick={handleDelete}
              className="absolute top-3 right-14 p-2 bg-destructive/80 backdrop-blur-sm rounded-full transition-all duration-300 hover:bg-destructive"
            >
              <Trash2 size={18} className="text-destructive-foreground" />
            </button>
          )}
        </div>

        {/* Info */}
        <div className="pt-4 pb-4 px-1 space-y-2">
          <div className="flex items-start gap-2">
            <h3
              className={`font-body text-sm leading-snug text-foreground group-hover:text-accent transition-colors ${nameExpanded ? "whitespace-normal overflow-visible" : "truncate"}`}
              title={product.name}
            >
              {product.name}
            </h3>
            {shouldShowMore && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setNameExpanded((value) => !value);
                }}
                className="text-xs text-primary hover:text-primary/80 font-semibold focus:outline-none"
              >
                {nameExpanded ? "Less" : "More"}
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 pt-1">
            <span className="font-body font-semibold text-sm text-foreground">
              ₹{product.price.toLocaleString("en-IN")}
            </span>
            {product.originalPrice > product.price && (
              <>
                <span className="font-body text-xs text-muted-foreground line-through">
                  ₹{product.originalPrice.toLocaleString("en-IN")}
                </span>
                <span className="font-body text-xs text-rose font-medium">
                  ({product.discount}% OFF)
                </span>
              </>
            )}
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToCart(product);
              toast.success("Added to Cart");
            }}
            className="w-full mt-2 py-2.5 bg-primary text-primary-foreground font-body text-xs tracking-wider uppercase hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <ShoppingBag size={14} /> Add to Cart
          </button>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
