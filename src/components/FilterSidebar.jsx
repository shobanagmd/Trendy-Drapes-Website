import { useState } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { filterOptions } from "@/data/products";

const colorMap = {
  Red: "#DC2626", "Navy Blue": "#1E3A5F", Green: "#065F46", Pink: "#EC4899",
  Purple: "#7C3AED", Maroon: "#7F1D1D", Blue: "#0EA5E9", Orange: "#EA580C",
  Black: "#1A1A1A", White: "#F5F5F5", Yellow: "#EAB308",
};

const FilterSection = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border py-4">
      <button onClick={() => setOpen(!open)} className="flex items-center justify-between w-full text-left">
        <span className="filter-section-title mb-0">{title}</span>
        {open ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
      </button>
      {open && <div className="mt-3 space-y-2">{children}</div>}
    </div>
  );
};

const FilterSidebar = ({ filters, onFilterChange, isOpen, onClose }) => {

  // ── Single-select helper for the NEW single-select filters ──────────
  // Clicking the already-selected value deselects it; clicking a new one replaces.
  const handleSingleSelect = (key, value) => {
    const current = filters[key] || [];
    const next = current.includes(value) ? [] : [value];
    onFilterChange({ ...filters, [key]: next });
  };

  // ── Price: unchanged ────────────────────────────────────────────────
  const handlePriceSelect = (minVal) => {
    const next = filters.priceRange.includes(minVal) ? [] : [minVal];
    onFilterChange({ ...filters, priceRange: next });
  };

  // ── Discount: unchanged ─────────────────────────────────────────────
  const handleDiscountSelect = (d) => {
    const next = filters.discount.includes(d) ? [] : [d];
    onFilterChange({ ...filters, discount: next });
  };

  const content = (
    <div className="space-y-0">

      {/* ── PRICE (unchanged) ── */}
      <FilterSection title="Price">
        {filterOptions.price.map((p) => (
          <label key={p.label} className="flex items-center gap-2 cursor-pointer text-sm font-body text-foreground">
            <input
              type="radio"
              name="priceFilter"
              checked={filters.priceRange.includes(p.min)}
              onChange={() => handlePriceSelect(p.min)}
              className="accent-accent"
            />
            {p.label}
          </label>
        ))}
        {filters.priceRange.length > 0 && (
          <button onClick={() => onFilterChange({ ...filters, priceRange: [] })} className="text-xs text-accent hover:underline mt-1">
            Clear Price
          </button>
        )}
      </FilterSection>

      {/* ── DISCOUNT (unchanged) ── */}
      <FilterSection title="Discount">
        {filterOptions.discount.map((d) => (
          <label key={d} className="flex items-center gap-2 cursor-pointer text-sm font-body text-foreground">
            <input
              type="radio"
              name="discountFilter"
              checked={filters.discount.includes(d)}
              onChange={() => handleDiscountSelect(d)}
              className="accent-accent"
            />
            {d}
          </label>
        ))}
        {filters.discount.length > 0 && (
          <button onClick={() => onFilterChange({ ...filters, discount: [] })} className="text-xs text-accent hover:underline mt-1">
            Clear Discount
          </button>
        )}
      </FilterSection>

      {/* ── SUBCATEGORY → single-select radio ── */}
      <FilterSection title="Sub Category">
        {filterOptions.subCategories.map((s) => (
          <label key={s} className="flex items-center gap-2 cursor-pointer text-sm font-body text-foreground">
            <input
              type="radio"
              name="subCategoryFilter"
              checked={(filters.subCategories || []).includes(s)}
              onChange={() => handleSingleSelect("subCategories", s)}
              className="accent-accent"
            />
            {s}
          </label>
        ))}
        {(filters.subCategories || []).length > 0 && (
          <button onClick={() => onFilterChange({ ...filters, subCategories: [] })} className="text-xs text-accent hover:underline mt-1">
            Clear Sub Category
          </button>
        )}
      </FilterSection>

      {/* ── COLOR → single-select radio (color swatches) ── */}
      <FilterSection title="Color">
        <div className="flex flex-wrap gap-2">
          {filterOptions.colors.map((c) => (
            <button
              key={c}
              onClick={() => handleSingleSelect("colors", c)}
              className={`w-7 h-7 rounded-full border-2 transition-all ${
                (filters.colors || []).includes(c) ? "border-accent scale-110 ring-2 ring-accent ring-offset-1" : "border-border"
              }`}
              style={{ backgroundColor: colorMap[c] || "#ccc" }}
              title={c}
            />
          ))}
        </div>
        {(filters.colors || []).length > 0 && (
          <button onClick={() => onFilterChange({ ...filters, colors: [] })} className="text-xs text-accent hover:underline mt-2">
            Clear Color
          </button>
        )}
      </FilterSection>

      {/* ── FABRIC → single-select radio ── */}
      <FilterSection title="Fabric">
        {filterOptions.fabrics.map((f) => (
          <label key={f} className="flex items-center gap-2 cursor-pointer text-sm font-body text-foreground">
            <input
              type="radio"
              name="fabricFilter"
              checked={(filters.fabrics || []).includes(f)}
              onChange={() => handleSingleSelect("fabrics", f)}
              className="accent-accent"
            />
            {f}
          </label>
        ))}
        {(filters.fabrics || []).length > 0 && (
          <button onClick={() => onFilterChange({ ...filters, fabrics: [] })} className="text-xs text-accent hover:underline mt-1">
            Clear Fabric
          </button>
        )}
      </FilterSection>

      {/* ── WORK → single-select radio ── */}
      <FilterSection title="Work">
        {filterOptions.works.map((w) => (
          <label key={w} className="flex items-center gap-2 cursor-pointer text-sm font-body text-foreground">
            <input
              type="radio"
              name="workFilter"
              checked={(filters.works || []).includes(w)}
              onChange={() => handleSingleSelect("works", w)}
              className="accent-accent"
            />
            {w}
          </label>
        ))}
        {(filters.works || []).length > 0 && (
          <button onClick={() => onFilterChange({ ...filters, works: [] })} className="text-xs text-accent hover:underline mt-1">
            Clear Work
          </button>
        )}
      </FilterSection>

      {/* ── PRINTS & PATTERNS → single-select radio ── */}
      <FilterSection title="Prints & Patterns" defaultOpen={false}>
        {filterOptions.patterns.map((p) => (
          <label key={p} className="flex items-center gap-2 cursor-pointer text-sm font-body text-foreground">
            <input
              type="radio"
              name="patternFilter"
              checked={(filters.patterns || []).includes(p)}
              onChange={() => handleSingleSelect("patterns", p)}
              className="accent-accent"
            />
            {p}
          </label>
        ))}
        {(filters.patterns || []).length > 0 && (
          <button onClick={() => onFilterChange({ ...filters, patterns: [] })} className="text-xs text-accent hover:underline mt-1">
            Clear Pattern
          </button>
        )}
      </FilterSection>

    </div>
  );

  return (
    <>
      <aside className="hidden lg:block w-64 flex-shrink-0 pr-8">
        <h2 className="font-display text-lg font-semibold mb-4 text-foreground">Filters</h2>
        {content}
      </aside>
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/40" onClick={onClose} />
          <div className="absolute top-0 left-0 bottom-0 w-80 bg-card overflow-y-auto p-6 animate-slide-down">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold text-foreground">Filters</h2>
              <button onClick={onClose}><X size={20} /></button>
            </div>
            {content}
          </div>
        </div>
      )}
    </>
  );
};

export default FilterSidebar;