import { useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";
import { useLocalProducts } from "@/hooks/useLocalProducts";

const Sales = () => {
  const { localProducts, deletedProducts } = useLocalProducts();

  // Merge static + admin-added products, remove deleted ones
  const allProducts = useMemo(() => {
    const filteredStatic = products.filter((p) => !deletedProducts.includes(p.id));
    const staticIds = new Set(filteredStatic.map((p) => p.id));
    const merged = [
      ...filteredStatic,
      ...localProducts.filter((p) => !staticIds.has(p.id)),
    ];
    // Sort by discount descending — highest discount first
    return merged.sort((a, b) => (b.discount || 0) - (a.discount || 0));
  }, [localProducts, deletedProducts]);

  // Stats for the banner
  const maxDiscount = allProducts.length > 0
    ? Math.max(...allProducts.map((p) => p.discount || 0))
    : 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Sale Hero Banner */}
      <section className="bg-primary py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-gold-light mb-2">
            Limited Time Offer
          </p>
          <h1 className="font-display text-4xl lg:text-5xl font-semibold text-primary-foreground mb-3">
            Grand Sale
          </h1>
          <p className="font-body text-sm text-primary-foreground/70 max-w-md mx-auto mb-4">
            Shop across all categories — Sarees, Bridal, Lehengas, Indo-Western &amp; Jewellery.
            Up to <span className="text-gold-light font-semibold">{maxDiscount}% off</span> on
            premium ethnic wear.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 border border-gold-light/40 rounded-sm">
            <span className="font-body text-xs text-gold-light tracking-widest uppercase">
              Use Code: TRENDY20
            </span>
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <p className="text-xs font-body text-muted-foreground tracking-wider">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          {" / "}
          <span className="text-foreground">Sale</span>
        </p>
      </div>

      {/* Page Header */}
      <div className="container mx-auto px-4 mb-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl lg:text-4xl font-semibold text-foreground">
              All Products on Sale
            </h2>
            <p className="font-body text-sm text-muted-foreground mt-1">
              {allProducts.length} Products — Sorted by best discount
            </p>
          </div>
          {/* Category quick links */}
          <div className="hidden md:flex items-center gap-3 flex-wrap justify-end">
            {["Sarees", "Bridal", "Lehengas", "Indo-Western", "Jewellery"].map((cat) => (
              <Link
                key={cat}
                to={`/collections?category=${cat}`}
                className="font-body text-xs tracking-wider uppercase text-muted-foreground hover:text-accent border border-border px-3 py-1.5 transition-colors hover:border-accent"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 flex-1 pb-16">
        {allProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-display text-2xl text-muted-foreground">No products available</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {allProducts.map((product, i) => (
              <div
                key={`${product.id}-${i}`}
                className="animate-fade-in"
                style={{ animationDelay: `${Math.min(i * 40, 400)}ms` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Sales;