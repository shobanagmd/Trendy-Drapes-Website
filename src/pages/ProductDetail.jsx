import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Heart, ShoppingBag, Truck, RotateCcw, Shield, ChevronLeft, X, ZoomIn, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";
import { useLocalProducts } from "@/hooks/useLocalProducts";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

// ─────────────────────────────────────────────────────────────────────────────
// Mock reviews data
// ─────────────────────────────────────────────────────────────────────────────
const MOCK_REVIEWS = [
  { id: 1, name: "Priya S.",  rating: 5, text: "Absolutely gorgeous! The fabric quality is amazing and the color is even more vibrant in person.", date: "2025-12-15" },
  { id: 2, name: "Ananya R.", rating: 4, text: "Beautiful saree, received it well packed. Slightly different shade than expected but still lovely.", date: "2025-11-28" },
  { id: 3, name: "Meera K.",  rating: 5, text: "Perfect for my sister's wedding. Got so many compliments! Will definitely buy again.", date: "2025-10-10" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Star rating display component
// ─────────────────────────────────────────────────────────────────────────────
const StarRating = ({ rating, size = 16 }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star key={s} size={size} className={s <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"} />
    ))}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Amazon-style zoom component
// Image on left with lens square, magnified preview panel on right
// ─────────────────────────────────────────────────────────────────────────────
const ZOOM_FACTOR = 2.5;
const MAX_IMG_H   = 560;

const AmazonZoom = ({ src, alt }) => {
  const imgRef     = useRef(null);
  const wrapperRef = useRef(null);

  const [imgRect,   setImgRect]   = useState({ w: 0, h: 0 });
  const [lensSize,  setLensSize]  = useState({ w: 0, h: 0 });
  const [hovered,   setHovered]   = useState(false);
  const [lens,      setLens]      = useState({ x: 0, y: 0 });
  const [bgPos,     setBgPos]     = useState({ x: 50, y: 50 });
  const [imgLoaded, setImgLoaded] = useState(false);

  const onImgLoad = useCallback(() => {
    const img = imgRef.current;
    if (!img) return;
    const r = img.getBoundingClientRect();
    setImgRect({ w: r.width, h: r.height });
    setLensSize({ w: r.width / ZOOM_FACTOR, h: r.height / ZOOM_FACTOR });
    setImgLoaded(true);
  }, []);

  useEffect(() => {
    if (!imgLoaded) return;
    const update = () => {
      const img = imgRef.current;
      if (!img) return;
      const r = img.getBoundingClientRect();
      setImgRect({ w: r.width, h: r.height });
      setLensSize({ w: r.width / ZOOM_FACTOR, h: r.height / ZOOM_FACTOR });
    };
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [imgLoaded]);

  const handleMouseMove = useCallback((e) => {
    const img = imgRef.current;
    if (!img || !imgLoaded) return;
    const r  = img.getBoundingClientRect();
    const iw = r.width, ih = r.height;
    const lw = iw / ZOOM_FACTOR, lh = ih / ZOOM_FACTOR;
    let lx = (e.clientX - r.left) - lw / 2;
    let ly = (e.clientY - r.top)  - lh / 2;
    lx = Math.max(0, Math.min(lx, iw - lw));
    ly = Math.max(0, Math.min(ly, ih - lh));
    setLens({ x: lx, y: ly });
    setBgPos({ x: ((lx + lw / 2) / iw) * 100, y: ((ly + lh / 2) / ih) * 100 });
  }, [imgLoaded]);

  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 24 }}>
      {/* Left: image + lens */}
      <div
        ref={wrapperRef}
        style={{ position: "relative", flexShrink: 0, cursor: hovered ? "crosshair" : "default", lineHeight: 0 }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onMouseMove={handleMouseMove}
      >
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          onLoad={onImgLoad}
          style={{ display: "block", height: MAX_IMG_H, width: "auto", maxWidth: "42vw", objectFit: "contain" }}
        />
        {hovered && imgLoaded && lensSize.w > 0 && (
          <div style={{
            position: "absolute", top: lens.y, left: lens.x,
            width: lensSize.w, height: lensSize.h,
            border: "2px solid rgba(255,255,255,0.9)",
            background: "rgba(255,255,255,0.08)",
            pointerEvents: "none", boxSizing: "border-box", zIndex: 5,
          }} />
        )}
      </div>

      {/* Right: zoom preview panel */}
      <div style={{
        width:      imgLoaded && imgRect.w > 0 ? imgRect.w : MAX_IMG_H * 0.75,
        height:     imgLoaded && imgRect.h > 0 ? imgRect.h : MAX_IMG_H,
        flexShrink: 0, overflow: "hidden", borderRadius: 4,
        border: hovered && imgLoaded ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(255,255,255,0.06)",
        backgroundImage:    `url(${src})`,
        backgroundRepeat:   "no-repeat",
        backgroundSize:     `${ZOOM_FACTOR * 100}% ${ZOOM_FACTOR * 100}%`,
        backgroundPosition: `${bgPos.x}% ${bgPos.y}%`,
        backgroundColor:    "#111",
        pointerEvents:      "none",
        alignSelf:          "flex-start",
        opacity:    hovered && imgLoaded ? 1 : 0,
        transition: "opacity 0.18s ease",
        position:   "relative",
      }}>
        {(!hovered || !imgLoaded) && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>
              Hover image to zoom
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Lightbox modal with Amazon zoom inside
// Layout: [←]  [image + zoom panel]  [→]
// ─────────────────────────────────────────────────────────────────────────────
const ImageModal = ({ images, startIndex, onClose }) => {
  const [active, setActive] = useState(startIndex);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const prev = () => setActive((a) => (a - 1 + images.length) % images.length);
  const next = () => setActive((a) => (a + 1) % images.length);

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.94)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
      onClick={onClose}
    >
      {/* Close button — fixed top-right */}
      <button
        onClick={onClose}
        aria-label="Close preview"
        style={{
          position: "fixed", top: 16, right: 20, zIndex: 200,
          display: "flex", alignItems: "center", justifyContent: "center",
          width: 44, height: 44, borderRadius: "50%",
          background: "rgba(255,255,255,0.12)", border: "1.5px solid rgba(255,255,255,0.35)",
          cursor: "pointer", color: "#fff", backdropFilter: "blur(4px)", transition: "background 0.2s",
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.25)"}
        onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
      >
        <X size={22} />
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 0 }} onClick={(e) => e.stopPropagation()}>
        {/* Prev arrow */}
        <div style={{ width: 56, display: "flex", justifyContent: "center", flexShrink: 0 }}>
          {images.length > 1 && (
            <button onClick={prev} aria-label="Previous"
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "50%", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}>
              <ChevronLeft size={22} />
            </button>
          )}
        </div>

        {/* Centre: zoom + thumbnails + counter */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <AmazonZoom src={images[active]} alt={`Product view ${active + 1}`} />

          {images.length > 1 && (
            <div style={{ display: "flex", gap: 8 }}>
              {images.map((img, i) => (
                <button key={i} onClick={() => setActive(i)}
                  style={{ width: 52, height: 68, overflow: "hidden", flexShrink: 0, border: `2px solid ${active === i ? "#fff" : "rgba(255,255,255,0.22)"}`, borderRadius: 2, cursor: "pointer", background: "none", padding: 0 }}>
                  <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </button>
              ))}
            </div>
          )}

          <p style={{ fontFamily: "inherit", fontSize: 11, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", margin: 0 }}>
            {String(active + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
          </p>
        </div>

        {/* Next arrow */}
        <div style={{ width: 56, display: "flex", justifyContent: "center", flexShrink: 0 }}>
          {images.length > 1 && (
            <button onClick={next} aria-label="Next"
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "50%", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}>
              <ChevronLeft size={22} style={{ transform: "rotate(180deg)" }} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main ProductDetail — zoom lightbox + reviews + similar products
// ─────────────────────────────────────────────────────────────────────────────
const ProductDetail = () => {
  const { id } = useParams();
  const { localProducts, deletedProducts } = useLocalProducts();

  const allProducts = useMemo(() => {
    const filteredStatic = products.filter((p) => !deletedProducts.includes(p.id));
    return [...filteredStatic, ...localProducts];
  }, [localProducts, deletedProducts]);

  const product = useMemo(() => allProducts.find((p) => p.id === id), [id, allProducts]);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize,  setSelectedSize]  = useState("Free Size");
  const [lightboxOpen,  setLightboxOpen]  = useState(false);
  const [isHovered,     setIsHovered]     = useState(false);
  const [reviews,       setReviews]       = useState(MOCK_REVIEWS);
  const [reviewText,    setReviewText]    = useState("");
  const [reviewRating,  setReviewRating]  = useState(5);

  const { addToCart, toggleWishlist, isInWishlist } = useCart();

  const openLightbox  = useCallback(() => setLightboxOpen(true),  []);
  const closeLightbox = useCallback(() => setLightboxOpen(false), []);

  // Similar products: same category, exclude current
  const similarProducts = useMemo(() => {
    if (!product) return [];
    return allProducts
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, 4);
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
  const images     = product.images?.length ? product.images : [product.image];
  const avgRating  = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  const handleAddToCart = () => {
    addToCart(product, selectedSize);
    toast.success("Added to cart!", { description: product.name });
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return;
    setReviews((prev) => [{
      id: Date.now(), name: "You", rating: reviewRating,
      text: reviewText.trim(), date: new Date().toISOString().split("T")[0],
    }, ...prev]);
    setReviewText("");
    setReviewRating(5);
    toast.success("Review submitted!");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <Link to="/collections" className="flex items-center gap-1 text-xs font-body text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft size={14} /> Back to Collections
        </Link>
      </div>

      <div className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">

          {/* ── Images panel ── */}
          <div className="space-y-4">
            {/* Main image: hover scales, click opens lightbox */}
            <div
              className="aspect-[3/4] overflow-hidden bg-secondary relative group cursor-zoom-in"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={openLightbox}
            >
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500"
                style={{ transform: isHovered ? "scale(1.06)" : "scale(1)" }}
              />
              <div
                className="absolute inset-0 flex items-center justify-center transition-opacity duration-300"
                style={{ opacity: isHovered ? 1 : 0, background: "rgba(0,0,0,0.12)" }}
              >
                <div className="flex items-center gap-2 px-4 py-2 bg-card/80 backdrop-blur-sm">
                  <ZoomIn size={16} className="text-foreground" />
                  <span className="font-body text-xs text-foreground tracking-wider uppercase">Click to zoom</span>
                </div>
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImage(i)}
                    className={`w-20 h-28 overflow-hidden border-2 transition-colors ${selectedImage === i ? "border-accent" : "border-border hover:border-accent/50"}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Details panel ── */}
          <div className="space-y-6">
            <h1 className="font-display text-2xl lg:text-3xl font-semibold text-foreground leading-tight">
              {product.name}
            </h1>

            {/* Rating summary inline */}
            <div className="flex items-center gap-3">
              <StarRating rating={Math.round(Number(avgRating))} />
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
              {product.fabric  && <div><span className="text-xs text-muted-foreground font-body">Fabric</span><p className="text-sm font-body font-medium text-foreground">{product.fabric}</p></div>}
              {product.work    && <div><span className="text-xs text-muted-foreground font-body">Work</span><p className="text-sm font-body font-medium text-foreground">{product.work}</p></div>}
              {product.color   && <div><span className="text-xs text-muted-foreground font-body">Color</span><p className="text-sm font-body font-medium text-foreground">{product.color}</p></div>}
              {product.pattern && <div><span className="text-xs text-muted-foreground font-body">Pattern</span><p className="text-sm font-body font-medium text-foreground">{product.pattern}</p></div>}
            </div>

            {/* Size selector */}
            <div>
              <p className="filter-section-title">Size</p>
              <div className="flex gap-2 flex-wrap">
                {(product.sizes || ["Free Size"]).map((size) => (
                  <button key={size} onClick={() => setSelectedSize(size)}
                    className={`px-6 py-2.5 text-sm font-body border transition-colors ${selectedSize === size ? "border-accent bg-accent text-accent-foreground" : "border-border text-foreground hover:border-accent"}`}>
                    {size}
                  </button>
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

        {/* ── Ratings & Reviews Section ── */}
        <div className="mt-16 border-t border-border pt-10">
          <h2 className="font-display text-2xl font-semibold text-foreground mb-8">Ratings & Reviews</h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: overall score + write review form */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-display text-5xl font-bold text-foreground">{avgRating}</span>
                <div>
                  <StarRating rating={Math.round(Number(avgRating))} size={20} />
                  <p className="font-body text-sm text-muted-foreground mt-1">{reviews.length} reviews</p>
                </div>
              </div>

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

            {/* Right: review list */}
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

        {/* ── Similar Products ── */}
        {similarProducts.length > 0 && (
          <div className="mt-16 border-t border-border pt-10">
            <h2 className="font-display text-2xl font-semibold text-foreground mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-7">
              {similarProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />

      {/* Lightbox with Amazon zoom — rendered outside main flow */}
      {lightboxOpen && (
        <ImageModal images={images} startIndex={selectedImage} onClose={closeLightbox} />
      )}
    </div>
  );
};

export default ProductDetail;