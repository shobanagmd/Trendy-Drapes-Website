import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { SlidersHorizontal, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import FilterSidebar from "@/components/FilterSidebar";
import { products, sortOptions, filterOptions } from "@/data/products";
import { useLocalProducts } from "@/hooks/useLocalProducts";

const ITEMS_PER_PAGE = 8;
const TOTAL_PAGES = 9;

const Index = () => {
  const { localProducts, deletedProducts } = useLocalProducts();
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");
  const sortParam = searchParams.get("sort");

  const [sortBy, setSortBy] = useState(sortParam || "trending");
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    priceRange: [],
    discount: [],
    subCategories: [],
    colors: [],
    fabrics: [],
    works: [],
    patterns: [],
  });

  // Reset page when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryParam]);

  // Determine active category
  const activeCategory = categoryParam || "Sarees";
  const pageTitle = activeCategory === "Sale" ? "Sale" : activeCategory;

  // Merge static products with localStorage products
  const allProducts = useMemo(() => {
    const filteredStatic = products.filter((p) => !deletedProducts.includes(p.id));
    const staticIds = new Set(filteredStatic.map((p) => p.id));
    const merged = [...filteredStatic, ...localProducts.filter((p) => !staticIds.has(p.id))];
    return merged;
  }, [localProducts, deletedProducts]);

  // Filter by category
  const filtered = useMemo(() => {
    let result = [...allProducts];

    if (activeCategory === "Sale") {
      // Sale: show all products with discount >= 30
      result = result.filter((p) => p.discount >= 30);
    } else {
      result = result.filter((p) => p.category?.trim() === activeCategory);
    }

    // Price range filter
    if (filters.priceRange.length > 0) {
      const priceRanges = filterOptions.price.filter((p) => filters.priceRange.includes(p.min));
      result = result.filter((product) =>
        priceRanges.some((range) => product.price >= range.min && product.price <= range.max)
      );
    }

    // Discount filter
    if (filters.discount.length > 0) {
      const minDiscount = Math.max(...filters.discount.map((d) => parseInt(d)));
      result = result.filter((p) => p.discount >= minDiscount);
    }

    if (filters.subCategories.length > 0) {
      result = result.filter((p) => filters.subCategories.includes(p.subCategory));
    }
    if (filters.colors.length > 0) {
      result = result.filter((p) => filters.colors.includes(p.color));
    }
    if (filters.fabrics.length > 0) {
      result = result.filter((p) => filters.fabrics.includes(p.fabric));
    }
    if (filters.works.length > 0) {
      result = result.filter((p) => filters.works.includes(p.work));
    }
    if (filters.patterns.length > 0) {
      result = result.filter((p) => filters.patterns.includes(p.pattern));
    }

    switch (sortBy) {
      case "price-asc": result.sort((a, b) => a.price - b.price); break;
      case "price-desc": result.sort((a, b) => b.price - a.price); break;
      case "new": result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)); break;
      case "discount": result.sort((a, b) => b.discount - a.discount); break;
    }

    return result;
  }, [filters, sortBy, allProducts, activeCategory]);

  // Duplicate products to fill pages
  const expandedProducts = useMemo(() => {
    if (filtered.length === 0) return [];
    const totalNeeded = TOTAL_PAGES * ITEMS_PER_PAGE;
    const expanded = [];
    for (let i = 0; i < totalNeeded; i++) {
      const original = filtered[i % filtered.length];
      expanded.push({
        ...original,
        _key: `${original.id}-page-${Math.floor(i / filtered.length)}-${i}`,
      });
    }
    return expanded;
  }, [filtered]);

  const totalPages = Math.min(TOTAL_PAGES, Math.ceil(expandedProducts.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = expandedProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const categoryDescriptions = {
    Sarees: "Handpicked luxury sarees for every occasion",
    Bridal: "Exquisite bridal wear for your special day",
    Lehengas: "Stunning lehengas for celebrations and festivities",
    "Indo-Western": "Modern fusion outfits blending tradition with style",
    Jewellery: "Traditional & contemporary jewellery collections",
    Sale: "Best deals on premium ethnic wear",
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <p className="text-xs font-body text-muted-foreground tracking-wider">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link> / Collections / <span className="text-foreground">{pageTitle}</span>
        </p>
      </div>

      {/* Page Header */}
      <div className="container mx-auto px-4 mb-6">
        <h2 className="font-display text-3xl lg:text-4xl font-semibold text-foreground">{pageTitle}</h2>
        <p className="font-body text-sm text-muted-foreground mt-2">
          {filtered.length} Products — {categoryDescriptions[activeCategory] || "Browse our collection"}
        </p>
      </div>

      {/* Toolbar */}
      <div className="container mx-auto px-4 mb-6">
        <div className="flex items-center justify-between border-y border-border py-3">
          <button
            onClick={() => setFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 text-sm font-body font-medium text-foreground"
          >
            <SlidersHorizontal size={16} /> Filters
          </button>

          <div className="relative ml-auto">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center gap-2 text-sm font-body font-medium text-foreground"
            >
              Sort: {sortOptions.find((s) => s.value === sortBy)?.label}
              <ChevronDown size={14} />
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-full mt-2 bg-card border border-border shadow-lg z-20 min-w-[180px] animate-slide-down">
                {sortOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { setSortBy(opt.value); setSortOpen(false); }}
                    className={`block w-full text-left px-4 py-2.5 text-sm font-body transition-colors ${
                      sortBy === opt.value ? "bg-secondary text-accent font-medium" : "text-foreground hover:bg-secondary"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 flex-1">
        <div className="flex gap-0">
          <FilterSidebar
            filters={filters}
            onFilterChange={(f) => { setFilters(f); setCurrentPage(1); }}
            isOpen={filterOpen}
            onClose={() => setFilterOpen(false)}
          />

          <div className="flex-1">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-7">
              {paginatedProducts.map((product, i) => (
                <div key={product._key || product.id} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            {paginatedProducts.length === 0 && (
              <div className="text-center py-20">
                <p className="font-display text-2xl text-muted-foreground">No products available</p>
                <p className="font-body text-sm text-muted-foreground mt-2">Try adjusting your filters</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12 mb-8">
                <button
                  onClick={() => { if (currentPage > 1) { setCurrentPage(currentPage - 1); window.scrollTo({ top: 0, behavior: "smooth" }); } }}
                  disabled={currentPage === 1}
                  className="w-10 h-10 flex items-center justify-center border border-border text-foreground hover:bg-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className={`w-10 h-10 text-sm font-body transition-colors ${
                      currentPage === page
                        ? "bg-primary text-primary-foreground"
                        : "border border-border text-foreground hover:bg-secondary"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => { if (currentPage < totalPages) { setCurrentPage(currentPage + 1); window.scrollTo({ top: 0, behavior: "smooth" }); } }}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 flex items-center justify-center border border-border text-foreground hover:bg-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Index;
