import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Heart, ShoppingBag, Truck, RotateCcw, Shield, ChevronLeft, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";
import { useLocalProducts } from "@/hooks/useLocalProducts";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

const MOCK_REVIEWS = [
  { id: 1, name: "Priya S.", rating: 5, text: "Absolutely gorgeous! The fabric quality is amazing and the color is even more vibrant in person.", date: "2025-12-15" },
  { id: 2, name: "Ananya R.", rating: 4, text: "Beautiful saree, received it well packed. Slightly different shade than expected but still lovely.", date: "2025-11-28" },
  { id: 3, name: "Meera K.", rating: 5, text: "Perfect for my sister's wedding. Got so many compliments! Will definitely buy again.", date: "2025-10-10" },
];

const StarRating = ({ rating, size = 16 }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star key={s} size={size} className={s <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"} />
    ))}
  </div>
);

const ProductDetail = () => {
  const { id } = useParams();
  const { localProducts, deletedProducts } = useLocalProducts();

  const allProducts = useMemo(() => {
    const filteredStatic = products.filter((p) => !deletedProducts.includes(p.id));
    return [...filteredStatic, ...localProducts];
  }, [localProducts, deletedProducts]);

  const product = useMemo(() => allProducts.find((p) => p.id === id), [id, allProducts]);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("Free Size");
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviews, setReviews] = useState(MOCK_REVIEWS);
  const { addToCart, toggleWishlist, isInWishlist } = useCart();

  // Similar products: same category, exclude current
  const similarProducts = useMemo(() => {
    if (!product) return [];
    return allProducts
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, 6);
  }, [product, allProducts]);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="font-display text-2xl text-foreground">Product not found</h2>
            <Link to="/" className="font-body text-sm text-accent mt-4 inline-block">← Back to shop</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const wishlisted = isInWishlist(product.id);
  const images = product.images?.length ? product.images : [product.image];
  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : 0;

  const handleAddToCart = () => {
    addToCart(product, selectedSize);
    toast.success("Added to cart!", { description: product.name });
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return;
    const newReview = {
      id: Date.now(),
      name: "You",
      rating: reviewRating,
      text: reviewText.trim(),
      date: new Date().toISOString().split("T")[0],
    };
    setReviews((prev) => [newReview, ...prev]);
    setReviewText("");
    setReviewRating(5);
    toast.success("Review submitted!");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-4">
        <Link to="/collections" className="flex items-center gap-1 text-xs font-body text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft size={14} /> Back to Collections
        </Link>
      </div>

      <div className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-[3/4] overflow-hidden bg-secondary">
              <img src={images[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
            </div>
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-28 overflow-hidden border-2 transition-colors ${selectedImage === i ? "border-accent" : "border-border"}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <h1 className="font-display text-2xl lg:text-3xl font-semibold text-foreground leading-tight">{product.name}</h1>

            {/* Rating summary */}
            <div className="flex items-center gap-3">
              <StarRating rating={Math.round(avgRating)} />
              <span className="font-body text-sm text-muted-foreground">{avgRating} ({reviews.length} reviews)</span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="font-display text-3xl font-semibold text-foreground">₹{product.price.toLocaleString("en-IN")}</span>
              <span className="font-body text-lg text-muted-foreground line-through">₹{product.originalPrice.toLocaleString("en-IN")}</span>
              <span className="font-body text-sm text-rose font-semibold">{product.discount}% OFF</span>
            </div>

            <p className="font-body text-sm text-muted-foreground leading-relaxed">{product.description}</p>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-3 py-4 border-y border-border">
              {product.fabric && <div><span className="text-xs text-muted-foreground font-body">Fabric</span><p className="text-sm font-body font-medium text-foreground">{product.fabric}</p></div>}
              {product.work && <div><span className="text-xs text-muted-foreground font-body">Work</span><p className="text-sm font-body font-medium text-foreground">{product.work}</p></div>}
              {product.color && <div><span className="text-xs text-muted-foreground font-body">Color</span><p className="text-sm font-body font-medium text-foreground">{product.color}</p></div>}
              {product.pattern && <div><span className="text-xs text-muted-foreground font-body">Pattern</span><p className="text-sm font-body font-medium text-foreground">{product.pattern}</p></div>}
            </div>

            {/* Size */}
            <div>
              <p className="filter-section-title">Size</p>
              <div className="flex gap-2">
                {(product.sizes || ["Free Size"]).map((size) => (
                  <button key={size} onClick={() => setSelectedSize(size)}
                    className={`px-6 py-2.5 text-sm font-body border transition-colors ${selectedSize === size ? "border-accent bg-accent text-accent-foreground" : "border-border text-foreground hover:border-accent"}`}
                  >{size}</button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-4 font-body text-sm font-semibold tracking-wider uppercase hover:opacity-90 transition-opacity">
                <ShoppingBag size={18} /> Add to Cart
              </button>
              <button onClick={() => toggleWishlist(product.id)}
                className={`px-5 py-4 border transition-colors ${wishlisted ? "border-rose bg-rose/10 text-rose" : "border-border text-foreground hover:border-accent"}`}>
                <Heart size={20} className={wishlisted ? "fill-current" : ""} />
              </button>
            </div>

            <Link to="/checkout" onClick={() => addToCart(product, selectedSize)}
              className="block w-full py-4 bg-accent text-accent-foreground font-body text-sm font-semibold tracking-wider uppercase hover:opacity-90 transition-opacity text-center">
              Buy Now
            </Link>

            {/* Delivery info */}
            <div className="space-y-3 pt-4">
              <div className="flex items-center gap-3 text-sm font-body text-muted-foreground"><Truck size={18} /> Free delivery on orders above ₹4,999</div>
              <div className="flex items-center gap-3 text-sm font-body text-muted-foreground"><RotateCcw size={18} /> Easy 15-day return & exchange</div>
              <div className="flex items-center gap-3 text-sm font-body text-muted-foreground"><Shield size={18} /> 100% authentic handcrafted product</div>
            </div>
          </div>
        </div>

        {/* Ratings & Reviews Section */}
        <div className="mt-16 border-t border-border pt-10">
          <h2 className="font-display text-2xl font-semibold text-foreground mb-8">Ratings & Reviews</h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Review summary */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-display text-5xl font-bold text-foreground">{avgRating}</span>
                <div>
                  <StarRating rating={Math.round(avgRating)} size={20} />
                  <p className="font-body text-sm text-muted-foreground mt-1">{reviews.length} reviews</p>
                </div>
              </div>

              {/* Add review form */}
              <form onSubmit={handleSubmitReview} className="space-y-3 pt-4 border-t border-border">
                <p className="font-body text-sm font-medium text-foreground">Write a Review</p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} type="button" onClick={() => setReviewRating(s)}>
                      <Star size={20} className={s <= reviewRating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"} />
                    </button>
                  ))}
                </div>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your experience..."
                  className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm font-body placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <button type="submit"
                  className="px-6 py-2.5 bg-primary text-primary-foreground font-body text-sm font-semibold tracking-wider uppercase hover:opacity-90 transition-opacity">
                  Submit Review
                </button>
              </form>
            </div>

            {/* Review list */}
            <div className="lg:col-span-2 space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-border pb-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                        <span className="font-body text-xs font-semibold text-foreground">{review.name[0]}</span>
                      </div>
                      <span className="font-body text-sm font-medium text-foreground">{review.name}</span>
                    </div>
                    <span className="font-body text-xs text-muted-foreground">{review.date}</span>
                  </div>
                  <StarRating rating={review.rating} size={14} />
                  <p className="font-body text-sm text-muted-foreground mt-2 leading-relaxed">{review.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <div className="mt-16 border-t border-border pt-10">
            <h2 className="font-display text-2xl font-semibold text-foreground mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-7">
              {similarProducts.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;
