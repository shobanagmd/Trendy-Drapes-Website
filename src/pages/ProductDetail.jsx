import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingBag, Truck, RotateCcw, Shield, ChevronLeft, ChevronRight, X, ZoomIn, Star, Image as ImageIcon, Video } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
/* import { products } from "@/data/products"; */
import { useLocalProducts } from "@/hooks/useLocalProducts";
import { useCart } from "@/contexts/CartContext";
import { formatImageUrl } from "@/utils/imageUtils";
import { toast } from "sonner";
import { apiFetch } from "@/utils/api";

const isVideoMedia = (url) => typeof url === "string" && url.match(/\.(mp4|webm|ogg)$/i);

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
          src={formatImageUrl(src)}
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
        backgroundImage:    `url(${formatImageUrl(src)})`,
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
          {isVideoMedia(images[active]) ? (
             <video src={formatImageUrl(images[active])} autoPlay loop muted playsInline style={{ height: MAX_IMG_H, maxWidth: "80vw" }} />
          ) : (
             <AmazonZoom src={formatImageUrl(images[active])} alt={`Product view ${active + 1}`} />
          )}

          {images.length > 1 && (
            <div style={{ display: "flex", gap: 8 }}>
              {images.map((img, i) => (
                <button key={i} onClick={() => setActive(i)}
                  style={{ width: 52, height: 68, overflow: "hidden", flexShrink: 0, border: `2px solid ${active === i ? "#fff" : "rgba(255,255,255,0.22)"}`, borderRadius: 2, cursor: "pointer", background: "none", padding: 0 }}>
                  {isVideoMedia(img) ? (
                    <video src={formatImageUrl(img)} className="w-full h-full object-cover" muted />
                  ) : (
                    <img src={formatImageUrl(img)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  )}
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
  const navigate = useNavigate();
  const { localProducts } = useLocalProducts();

  const allProducts = useMemo(() => {
    return localProducts.map(p => ({
      ...p,
      image: formatImageUrl(p.image),
      images: p.images?.map(formatImageUrl)
    }));
  }, [localProducts]);

  const canonicalProduct = useMemo(() => allProducts.find((p) => String(p.id) === String(id)), [id, allProducts]);

  const similarProducts = useMemo(() => {
    if (!canonicalProduct) return [];
    return allProducts
      .filter((p) => p.category === canonicalProduct.category && p.id !== canonicalProduct.id)
      .slice(0, 4);
  }, [canonicalProduct, allProducts]);

  const variants = useMemo(() => {
    if (!canonicalProduct) return [];
    return [canonicalProduct, ...similarProducts].slice(0, 5);
  }, [canonicalProduct, similarProducts]);

  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  
  useEffect(() => {
    setSelectedVariantIndex(0);
    window.scrollTo(0, 0);
  }, [id]);

  const product = variants[selectedVariantIndex] || canonicalProduct;

  const handleVariantSelect = (index) => {
    setSelectedVariantIndex(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const [selectedImage, setSelectedImage] = useState(0);
  useEffect(() => setSelectedImage(0), [selectedVariantIndex]);

  const images = useMemo(() => {
    if (!product) return [];
    let baseImages = product.images?.length ? product.images : [product.image];
    return baseImages.filter(Boolean);
  }, [product]);
  const [selectedSize,  setSelectedSize]  = useState("Free Size");
  const [lightboxOpen,  setLightboxOpen]  = useState(false);
  const [isHovered,     setIsHovered]     = useState(false);
  const [bgPos,         setBgPos]         = useState({ x: 50, y: 50 });
  const [reviewRating, setReviewRating] = useState(5);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [avgRating, setAvgRating] = useState(0);

  // Media upload for reviews
  const [reviewMedia, setReviewMedia] = useState([]);
  const [reviewMediaPreviews, setReviewMediaPreviews] = useState([]);
  const fileInputRef = useRef(null);

  const fetchReviews = async () => {
    if (!product) return;
    try {
      setLoadingReviews(true);
      const productId = product.id;
      const res = await apiFetch(`/api/products/${productId}/reviews`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
        
        if (data.reviews && data.reviews.length > 0) {
          const total = data.reviews.reduce((acc, r) => acc + Number(r.rating), 0);
          setAvgRating((total / data.reviews.length).toFixed(1));
        } else {
          setAvgRating("0.0");
        }
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [product]);

  const [reviewText,    setReviewText]    = useState("");
  
  // Media upload states for Reviews
  const [reviewLightboxOpen,  setReviewLightboxOpen]  = useState(false);
  const [lightboxImages,      setLightboxImages]      = useState([]);
  const [lightboxStartIndex,  setLightboxStartIndex]  = useState(0);

  const { addToCart, toggleWishlist, isInWishlist } = useCart();

  const openLightbox  = useCallback(() => setLightboxOpen(true),  []);
  const closeLightbox = useCallback(() => setLightboxOpen(false), []);

  const handleMouseMoveMainImage = useCallback((e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setBgPos({ x, y });
  }, []);

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    if (reviewMedia.length + files.length > 5) {
      toast.error("Maximum 5 files allowed");
      return;
    }

    const newMedia = [...reviewMedia, ...files];
    setReviewMedia(newMedia);

    const newPreviews = files.map(file => ({
      url: URL.createObjectURL(file),
      type: file.type
    }));
    setReviewMediaPreviews([...reviewMediaPreviews, ...newPreviews]);
  };

  const removeMedia = (index) => {
    const newMedia = [...reviewMedia];
    newMedia.splice(index, 1);
    setReviewMedia(newMedia);

    const newPreviews = [...reviewMediaPreviews];
    URL.revokeObjectURL(newPreviews[index].url);
    newPreviews.splice(index, 1);
    setReviewMediaPreviews(newPreviews);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    try {
      const productId = product.id;
      const formData = new FormData();
      formData.append("productId", productId);
      formData.append("rating", reviewRating);
      formData.append("comment", reviewText.trim());
      formData.append("title", "");
      
      reviewMedia.forEach((file) => {
        formData.append("media", file);
      });

      const res = await apiFetch("/api/reviews", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        toast.success("Review submitted!");
        setReviewText("");
        setReviewRating(5);
        setReviewMedia([]);
        setReviewMediaPreviews([]);
        fetchReviews();
      } else {
        const error = await res.json();
        toast.error(error.message || "Failed to submit review");
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      toast.error("Connection error");
    }
  };

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

  const isVideoMedia = (url) => typeof url === "string" && url.match(/\.(mp4|webm|ogg)$/i);

  const handleAddToCart = async () => {
    const success = await addToCart(product, selectedSize);
    if (success) toast.success("Added to Cart");
  };

  const handleBuyNow = async () => {
    const success = await addToCart(product, selectedSize);
    if (success) {
      navigate("/checkout");
    }
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
          <div className="flex flex-col md:flex-row gap-4 lg:gap-6">
            
            {/* Vertical Thumbnails */}
            {images.length > 1 && (
              <div className="hidden md:flex flex-col gap-3 w-16 lg:w-20 shrink-0">
                {images.slice(0, 5).map((img, i) => (
                  <button key={`v-thumb-${i}`} onClick={() => setSelectedImage(i)}
                    className={`relative w-full aspect-[3/4] overflow-hidden rounded-md transition-all duration-300 border-2 cursor-pointer ${selectedImage === i ? "border-primary opacity-100 shadow-sm shadow-primary/10" : "border-transparent opacity-50 hover:opacity-100 text-muted-foreground hover:border-border"}`}>
                    {isVideoMedia(img) ? (
                      <video src={img} className="w-full h-full object-cover" muted />
                    ) : (
                      <img src={img} alt={`Thumbnail ${i+1}`} className="w-full h-full object-cover" />
                    )}
                  </button>
                ))}
              </div>
            )}

            <div className="flex-1 space-y-6 lg:space-y-8">
              <div
                className={`aspect-[4/5] md:aspect-[3/4] overflow-hidden bg-secondary relative group ${!isVideoMedia(images[selectedImage]) ? "cursor-zoom-in" : ""} rounded-lg ${(isHovered && !isVideoMedia(images[selectedImage])) ? 'bg-cover bg-no-repeat' : ''}`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onMouseMove={handleMouseMoveMainImage}
                onClick={openLightbox}
                style={(isHovered && images[selectedImage] && !isVideoMedia(images[selectedImage])) ? {
                  backgroundImage: `url(${images[selectedImage]})`,
                  backgroundPosition: `${bgPos.x}% ${bgPos.y}%`,
                  backgroundSize: '200%'
                } : {}}
              >
                {isVideoMedia(images[selectedImage]) ? (
                  <video src={images[selectedImage]} className="w-full h-full object-cover" autoPlay loop muted playsInline />
                ) : (
                  <img
                    src={images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover transition-opacity duration-300"
                    style={{ opacity: isHovered ? 0 : 1 }}
                  />
                )}

                <div
                  className="absolute inset-x-0 inset-y-1/2 flex justify-between px-4 -translate-y-1/2 pointer-events-none z-20"
                  style={{ opacity: isHovered ? 1 : 0, transition: "opacity 0.3s" }}
                >
                  {images.length > 1 && (
                    <button 
                      className="w-10 h-10 rounded-full bg-background/90 backdrop-blur-md shadow-sm border border-border flex items-center justify-center text-foreground hover:bg-background hover:scale-105 pointer-events-auto transition-all cursor-pointer"
                      onClick={(e) => { e.stopPropagation(); setSelectedImage((prev) => (prev - 1 + images.length) % images.length); }}
                    >
                      <ChevronLeft size={20} className="mr-0.5" />
                    </button>
                  )}
                  {images.length > 1 && (
                    <button 
                      className="w-10 h-10 rounded-full bg-background/90 backdrop-blur-md shadow-sm border border-border flex items-center justify-center text-foreground hover:bg-background hover:scale-105 pointer-events-auto transition-all cursor-pointer"
                      onClick={(e) => { e.stopPropagation(); setSelectedImage((prev) => (prev + 1) % images.length); }}
                    >
                      <ChevronRight size={20} className="ml-0.5" />
                    </button>
                  )}
                </div>

                <div
                  className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center justify-center transition-opacity duration-300 pointer-events-none z-10"
                  style={{ opacity: isHovered && images.length === 1 ? 1 : 0 }}
                >
                  <div className="flex items-center gap-2 px-4 py-2 bg-background/90 rounded-full backdrop-blur-sm shadow-sm border border-border">
                    <ZoomIn size={14} className="text-foreground" />
                    <span className="font-body text-[10px] font-bold text-foreground tracking-widest uppercase">Zoom</span>
                  </div>
                </div>
              </div>

              {variants.length > 1 && (
                <div className="pt-2">
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold mb-3">Color Variants</p>
                  <div className="flex flex-wrap gap-4">
                    {variants.map((v, i) => (
                      <button key={`c-thumb-${i}`} onClick={() => handleVariantSelect(i)}
                        className={`relative w-12 h-12 rounded-full overflow-hidden transition-all duration-300 border-2 shadow-sm cursor-pointer p-0.5 outline-none ${selectedVariantIndex === i ? "border-primary ring-2 ring-primary/20 scale-110" : "border-border opacity-70 hover:opacity-100 hover:border-foreground"}`}>
                        <div className="w-full h-full rounded-full overflow-hidden">
                          {isVideoMedia(v.images?.[0] || v.image) ? (
                            <video src={v.images?.[0] || v.image} className="w-full h-full object-cover" muted />
                          ) : (
                            <img src={v.images?.[0] || v.image} alt={v.color || `Variant ${i+1}`} className="w-full h-full object-cover" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Details panel ── */}
          <div className="space-y-6">
            <h1 className="font-display text-2xl lg:text-3xl font-semibold text-foreground leading-tight">
              {product.name}
            </h1>

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

            <div className="grid grid-cols-2 gap-x-6 gap-y-4 py-6 border-y border-border/60">
              {product.seller && (
                <div className="col-span-2 pb-2 border-b border-border/30 mb-2">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1 block">Sold By</span>
                  <p className="text-base font-display font-semibold text-accent flex items-center gap-2 italic">
                    {product.seller}
                    <span className="inline-flex h-1.5 w-1.5 rounded-full bg-success"></span>
                  </p>
                </div>
              )}
              {product.fabric  && <div className="space-y-0.5"><span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Fabric</span><p className="text-sm font-body font-medium text-foreground">{product.fabric}</p></div>}
              {product.work    && <div className="space-y-0.5"><span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Work</span><p className="text-sm font-body font-medium text-foreground">{product.work}</p></div>}
              {product.color   && <div className="space-y-0.5"><span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Color</span><p className="text-sm font-body font-medium text-foreground">{product.color}</p></div>}
              {product.pattern && <div className="space-y-0.5"><span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Pattern</span><p className="text-sm font-body font-medium text-foreground">{product.pattern}</p></div>}
            </div>

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

            <button onClick={handleBuyNow}
              className="block w-full py-4 bg-accent text-accent-foreground font-body text-sm font-semibold tracking-wider uppercase hover:opacity-90 transition-opacity text-center">
              Buy Now
            </button>

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
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-display text-5xl font-bold text-foreground">{avgRating}</span>
                <div>
                  <StarRating rating={Math.round(Number(avgRating))} size={20} />
                  <p className="font-body text-sm text-muted-foreground mt-1">{reviews.length} reviews</p>
                </div>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-4 pt-4 border-t border-border">
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
                  className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm font-body placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                />

                <div className="space-y-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleMediaChange}
                    multiple
                    accept="image/*,video/*"
                    className="hidden"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-md text-xs font-body hover:bg-secondary transition-colors"
                    >
                      <ImageIcon size={14} /> Add Images/Videos
                    </button>
                  </div>

                  {reviewMediaPreviews.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {reviewMediaPreviews.map((p, i) => (
                        <div key={i} className="relative w-16 h-16 rounded-md overflow-hidden border border-border group">
                          {p.type.startsWith("video/") ? (
                            <video src={p.url} className="w-full h-full object-cover" />
                          ) : (
                            <img src={p.url} alt="Preview" className="w-full h-full object-cover" />
                          )}
                          <button
                            type="button"
                            onClick={() => removeMedia(i)}
                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={14} className="text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <button type="submit"
                  className="px-6 py-2.5 bg-primary text-primary-foreground font-body text-sm font-semibold tracking-wider uppercase hover:opacity-90 transition-opacity w-full sm:w-auto mt-2">
                  Submit Review
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 space-y-6">
              {loadingReviews ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-border rounded-lg">
                  <p className="font-body text-sm text-muted-foreground italic">No reviews yet. Be the first to share your experience!</p>
                </div>
              ) : (
                reviews.map((review) => (
                  <div key={review.review_id} className="border-b border-border pb-5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                          <span className="font-body text-xs font-semibold text-foreground">{(review.customer_name || "User")[0]}</span>
                        </div>
                        <span className="font-body text-sm font-medium text-foreground">{review.customer_name || "Anonymous User"}</span>
                        {review.order_id && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-success/10 text-success uppercase tracking-tighter">
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <span className="font-body text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</span>
                    </div>
                    <StarRating rating={review.rating} size={14} />
                    <p className="font-body text-sm text-foreground mt-2 leading-relaxed">{review.comment}</p>
                    
                    {review.media && review.media.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {review.media.map((m, idx) => (
                          <div 
                            key={idx} 
                            className="w-20 h-28 lg:w-24 lg:h-32 rounded-md overflow-hidden border border-border/40 cursor-pointer hover:border-accent transition-colors"
                            onClick={() => {
                              // If we want to use the lightbox for review media as well
                              // For now, let's just show them.
                            }}
                          >
                            {m.type?.startsWith("video/") ? (
                              <video src={formatImageUrl(m.url)} className="w-full h-full object-cover" controls={false} />
                            ) : (
                              <img src={formatImageUrl(m.url)} alt="Review media" className="w-full h-full object-cover" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

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

      {lightboxOpen && (
        <ImageModal images={images} startIndex={selectedImage} onClose={closeLightbox} />
      )}
    </div>
  );
};

export default ProductDetail;