import { useState, useMemo, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useLocalProducts } from "@/hooks/useLocalProducts";

const SearchModal = ({ isOpen, onClose }) => {
  const { localProducts: products } = useLocalProducts();
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === "Escape") onClose(); };
    if (isOpen) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.fabric && p.fabric.toLowerCase().includes(q)) ||
        (p.color && p.color.toLowerCase().includes(q)) ||
        (p.subCategory && p.subCategory.toLowerCase().includes(q)) ||
        (p.work && p.work.toLowerCase().includes(q))
    );
  }, [query, products]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-w-2xl mx-auto mt-20 mx-4 bg-card border border-border shadow-2xl animate-slide-down">
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <Search size={20} className="text-muted-foreground flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search sarees, fabrics, colors..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent font-body text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <button onClick={onClose} className="p-1 hover:text-accent transition-colors">
            <X size={18} />
          </button>
        </div>

        {query.trim() && (
          <div className="max-h-[60vh] overflow-y-auto p-4">
            {results.length === 0 ? (
              <p className="font-body text-sm text-muted-foreground text-center py-8">
                No products found for "{query}"
              </p>
            ) : (
              <div className="space-y-2">
                <p className="font-body text-xs text-muted-foreground mb-3">
                  {results.length} result{results.length !== 1 ? "s" : ""}
                </p>
                {results.map((product) => (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    onClick={onClose}
                    className="flex items-center gap-4 p-3 hover:bg-secondary transition-colors"
                  >
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-14 h-18 object-cover flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="font-body text-sm text-foreground line-clamp-1">{product.name}</h4>
                      <p className="font-body text-xs text-muted-foreground">{product.fabric} · {product.color}</p>
                      <p className="font-body text-sm font-semibold text-foreground mt-1">
                        ₹{product.price.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {!query.trim() && (
          <div className="p-6 text-center">
            <p className="font-body text-sm text-muted-foreground">
              Start typing to search our collection
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {["Silk", "Banarasi", "Bridal", "Red", "Designer"].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className="px-3 py-1.5 border border-border text-xs font-body text-foreground hover:bg-secondary transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchModal;
