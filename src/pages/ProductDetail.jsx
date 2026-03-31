import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Heart, ShoppingBag, Truck, RotateCcw, Shield, ChevronLeft, X, ZoomIn } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { products } from "@/data/products";
import { useLocalProducts } from "@/hooks/useLocalProducts";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

// ─────────────────────────────────────────────────────────────────────────────
// Amazon-style zoom
// - Image renders at its natural aspect ratio inside a max-height constraint
// - Zoom panel matches the EXACT rendered pixel dimensions of the image
// - Lens square scales with the zoom factor so it maps perfectly
// ─────────────────────────────────────────────────────────────────────────────
const ZOOM_FACTOR = 2.5;   // magnification level
const MAX_IMG_H   = 560;   // max image height in px inside the lightbox

const AmazonZoom = ({ src, alt }) => {
  const imgRef     = useRef(null);
  const wrapperRef = useRef(null);

  // Actual rendered dimensions of the <img> element (set once image loads)
  const [imgRect,   setImgRect]   = useState({ w: 0, h: 0 });
  // Lens size adapts to zoom factor: lens = panel_size / zoom_factor
  // Since panel == imgRect, lens = imgRect.w / ZOOM_FACTOR (approx)
  const [lensSize,  setLensSize]  = useState({ w: 0, h: 0 });

  const [hovered,   setHovered]   = useState(false);
  const [lens,      setLens]      = useState({ x: 0, y: 0 });
  const [bgPos,     setBgPos]     = useState({ x: 50, y: 50 });
  const [imgLoaded, setImgLoaded] = useState(false);

  // After image loads, read its actual rendered size
  const onImgLoad = useCallback(() => {
    const img = imgRef.current;
    if (!img) return;
    // getBoundingClientRect gives rendered size
    const r = img.getBoundingClientRect();
    const w = r.width;
    const h = r.height;
    setImgRect({ w, h });
    // Lens covers (1/ZOOM_FACTOR) of the image dimension
    setLensSize({ w: w / ZOOM_FACTOR, h: h / ZOOM_FACTOR });
    setImgLoaded(true);
  }, []);

  // Re-measure on window resize
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
    const r = img.getBoundingClientRect();
    const iw = r.width;
    const ih = r.height;
    const lw = iw / ZOOM_FACTOR;
    const lh = ih / ZOOM_FACTOR;

    // Cursor position relative to image top-left
    let cx = e.clientX - r.left;
    let cy = e.clientY - r.top;

    // Lens top-left — clamped so lens stays inside image
    let lx = cx - lw / 2;
    let ly = cy - lh / 2;
    lx = Math.max(0, Math.min(lx, iw - lw));
    ly = Math.max(0, Math.min(ly, ih - lh));

    setLens({ x: lx, y: ly });

    // background-position: what fraction along the image is the lens centre?
    // Using lens top-left + half lens size gives lens centre
    const px = ((lx + lw / 2) / iw) * 100;
    const py = ((ly + lh / 2) / ih) * 100;
    setBgPos({ x: px, y: py });
  }, [imgLoaded]);

  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 24 }}>

      {/* ── LEFT: image + lens overlay ── */}
      <div
        ref={wrapperRef}
        style={{
          position:   "relative",
          flexShrink: 0,
          cursor:     hovered ? "crosshair" : "default",
          lineHeight: 0,   // removes inline gap under img
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onMouseMove={handleMouseMove}
      >
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          onLoad={onImgLoad}
          style={{
            display:   "block",
            height:    MAX_IMG_H,
            width:     "auto",          // natural width — no squishing
            maxWidth:  "42vw",
            objectFit: "contain",
          }}
        />

        {/* Lens rectangle — proportional to image, covers 1/ZOOM_FACTOR area */}
        {hovered && imgLoaded && lensSize.w > 0 && (
          <div
            style={{
              position:      "absolute",
              top:           lens.y,
              left:          lens.x,
              width:         lensSize.w,
              height:        lensSize.h,
              border:        "2px solid rgba(255,255,255,0.9)",
              background:    "rgba(255,255,255,0.08)",
              pointerEvents: "none",
              boxSizing:     "border-box",
              zIndex:        5,
            }}
          />
        )}
      </div>

      {/* ── RIGHT: zoom panel — exactly matches rendered image dimensions ── */}
      <div
        style={{
          // Match the exact rendered image size so proportions are identical
          width:      imgLoaded && imgRect.w > 0 ? imgRect.w : MAX_IMG_H * 0.75,
          height:     imgLoaded && imgRect.h > 0 ? imgRect.h : MAX_IMG_H,
          flexShrink: 0,
          overflow:   "hidden",
          borderRadius: 4,
          border:     hovered && imgLoaded
                        ? "1px solid rgba(255,255,255,0.2)"
                        : "1px solid rgba(255,255,255,0.06)",

          // The zoomed image: background-size = ZOOM_FACTOR × 100% of the panel
          // background-position tracks the lens centre
          backgroundImage:    `url(${src})`,
          backgroundRepeat:   "no-repeat",
          backgroundSize:     `${ZOOM_FACTOR * 100}% ${ZOOM_FACTOR * 100}%`,
          backgroundPosition: `${bgPos.x}% ${bgPos.y}%`,
          backgroundColor:    "#111",
          pointerEvents:      "none",
          alignSelf:          "flex-start",
          // Fade in/out
          opacity:   hovered && imgLoaded ? 1 : 0,
          transition: "opacity 0.18s ease",
          position:   "relative",
        }}
      >
        {/* "Hover to zoom" label — visible before hovering */}
        {(!hovered || !imgLoaded) && (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            opacity: 1,
          }}>
            <span style={{
              fontSize: 11, letterSpacing: "0.18em",
              textTransform: "uppercase", color: "rgba(255,255,255,0.25)",
            }}>
              Hover image to zoom
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Lightbox modal
// Layout:  [←]  [AmazonZoom: image + zoom panel]  [→]
// X button fixed to viewport top-right — always visible
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
    // Full-screen dark backdrop — click outside to close
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.94)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}
      onClick={onClose}
    >
      {/* ── X button — fixed to viewport top-right, always on top ── */}
      <button
        onClick={onClose}
        aria-label="Close preview"
        style={{
          position: "fixed", top: 16, right: 20, zIndex: 200,
          display: "flex", alignItems: "center", justifyContent: "center",
          width: 44, height: 44, borderRadius: "50%",
          background: "rgba(255,255,255,0.12)",
          border: "1.5px solid rgba(255,255,255,0.35)",
          cursor: "pointer", color: "#fff",
          backdropFilter: "blur(4px)",
          transition: "background 0.2s",
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.25)"}
        onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
      >
        <X size={22} />
      </button>

      {/* ── Inner content — stop click from closing ── */}
      <div
        style={{ display: "flex", alignItems: "center", gap: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Prev arrow — in its own fixed-width column, LEFT of image */}
        <div style={{ width: 56, display: "flex", justifyContent: "center", flexShrink: 0 }}>
          {images.length > 1 && (
            <button
              onClick={prev}
              aria-label="Previous image"
              style={{
                background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "50%", width: 40, height: 40,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "#fff",
              }}
            >
              <ChevronLeft size={22} />
            </button>
          )}
        </div>

        {/* Centre: AmazonZoom (image on left + zoom panel on right) */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <AmazonZoom
            src={images[active]}
            alt={`Product view ${active + 1}`}
          />

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div style={{ display: "flex", gap: 8 }}>
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  style={{
                    width: 52, height: 68, overflow: "hidden", flexShrink: 0,
                    border: `2px solid ${active === i ? "#fff" : "rgba(255,255,255,0.22)"}`,
                    borderRadius: 2, cursor: "pointer", background: "none", padding: 0,
                  }}
                >
                  <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </button>
              ))}
            </div>
          )}

          {/* Counter */}
          <p style={{
            fontFamily: "inherit", fontSize: 11, letterSpacing: "0.2em",
            color: "rgba(255,255,255,0.35)", margin: 0,
          }}>
            {String(active + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
          </p>
        </div>

        {/* Next arrow — in its own fixed-width column, RIGHT of zoom panel */}
        <div style={{ width: 56, display: "flex", justifyContent: "center", flexShrink: 0 }}>
          {images.length > 1 && (
            <button
              onClick={next}
              aria-label="Next image"
              style={{
                background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "50%", width: 40, height: 40,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "#fff",
              }}
            >
              <ChevronLeft size={22} style={{ transform: "rotate(180deg)" }} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main ProductDetail page  —  unchanged except imports
// ─────────────────────────────────────────────────────────────────────────────
const ProductDetail = () => {
  const { id } = useParams();
  const { localProducts, deletedProducts } = useLocalProducts();

  const product = useMemo(() => {
    const filteredStatic = products.filter((p) => !deletedProducts.includes(p.id));
    const all = [...filteredStatic, ...localProducts];
    return all.find((p) => p.id === id);
  }, [id, localProducts, deletedProducts]);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize]   = useState("Free Size");
  const [lightboxOpen, setLightboxOpen]   = useState(false);
  const [isHovered, setIsHovered]         = useState(false);

  const { addToCart, toggleWishlist, isInWishlist } = useCart();

  const openLightbox  = useCallback(() => setLightboxOpen(true),  []);
  const closeLightbox = useCallback(() => setLightboxOpen(false), []);

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

  const handleAddToCart = () => {
    addToCart(product, selectedSize);
    toast.success("Added to cart!", { description: product.name });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-4">
        <Link to="/collections" className="flex items-center gap-1 text-xs font-body text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft size={14} /> Back to Sarees
        </Link>
      </div>

      <div className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">

          {/* ── Images panel ── */}
          <div className="space-y-4">

            {/* Main image card — simple hover scale + click opens lightbox */}
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
              {/* Hint overlay */}
              <div
                className="absolute inset-0 flex items-center justify-center transition-opacity duration-300"
                style={{ opacity: isHovered ? 1 : 0, background: "rgba(0,0,0,0.12)" }}
              >
                <div className="flex items-center gap-2 px-4 py-2 bg-card/80 backdrop-blur-sm">
                  <ZoomIn size={16} className="text-foreground" />
                  <span className="font-body text-xs text-foreground tracking-wider uppercase">
                    Click to zoom
                  </span>
                </div>
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-28 overflow-hidden border-2 transition-colors ${
                      selectedImage === i ? "border-accent" : "border-border hover:border-accent/50"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Details panel (completely unchanged) ── */}
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-2xl lg:text-3xl font-semibold text-foreground leading-tight">
                {product.name}
              </h1>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="font-display text-3xl font-semibold text-foreground">
                ₹{product.price.toLocaleString("en-IN")}
              </span>
              <span className="font-body text-lg text-muted-foreground line-through">
                ₹{product.originalPrice.toLocaleString("en-IN")}
              </span>
              <span className="font-body text-sm text-rose font-semibold">
                {product.discount}% OFF
              </span>
            </div>

            <p className="font-body text-sm text-muted-foreground leading-relaxed">
              {product.description}
            </p>

            <div className="grid grid-cols-2 gap-3 py-4 border-y border-border">
              {product.fabric  && <div><span className="text-xs text-muted-foreground font-body">Fabric</span> <p className="text-sm font-body font-medium text-foreground">{product.fabric}</p></div>}
              {product.work    && <div><span className="text-xs text-muted-foreground font-body">Work</span>   <p className="text-sm font-body font-medium text-foreground">{product.work}</p></div>}
              {product.color   && <div><span className="text-xs text-muted-foreground font-body">Color</span>  <p className="text-sm font-body font-medium text-foreground">{product.color}</p></div>}
              {product.pattern && <div><span className="text-xs text-muted-foreground font-body">Pattern</span><p className="text-sm font-body font-medium text-foreground">{product.pattern}</p></div>}
            </div>

            <div>
              <p className="filter-section-title">Size</p>
              <div className="flex gap-2">
                {(product.sizes || ["Free Size"]).map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-6 py-2.5 text-sm font-body border transition-colors ${
                      selectedSize === size
                        ? "border-accent bg-accent text-accent-foreground"
                        : "border-border text-foreground hover:border-accent"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-4 font-body text-sm font-semibold tracking-wider uppercase hover:opacity-90 transition-opacity"
              >
                <ShoppingBag size={18} /> Add to Cart
              </button>
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`px-5 py-4 border transition-colors ${
                  wishlisted ? "border-rose bg-rose/10 text-rose" : "border-border text-foreground hover:border-accent"
                }`}
              >
                <Heart size={20} className={wishlisted ? "fill-current" : ""} />
              </button>
            </div>

            <Link
              to="/checkout"
              onClick={() => addToCart(product, selectedSize)}
              className="block w-full py-4 bg-accent text-accent-foreground font-body text-sm font-semibold tracking-wider uppercase hover:opacity-90 transition-opacity text-center"
            >
              Buy Now
            </Link>

            <div className="space-y-3 pt-4">
              <div className="flex items-center gap-3 text-sm font-body text-muted-foreground">
                <Truck size={18} /> Free delivery on orders above ₹4,999
              </div>
              <div className="flex items-center gap-3 text-sm font-body text-muted-foreground">
                <RotateCcw size={18} /> Easy 15-day return & exchange
              </div>
              <div className="flex items-center gap-3 text-sm font-body text-muted-foreground">
                <Shield size={18} /> 100% authentic handcrafted product
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {lightboxOpen && (
        <ImageModal
          images={images}
          startIndex={selectedImage}
          onClose={closeLightbox}
        />
      )}
    </div>
  );
};

export default ProductDetail;