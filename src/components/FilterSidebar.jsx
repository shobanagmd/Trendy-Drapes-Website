import { useState } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { filterOptions } from "@/data/products";

const colorMap = {
  Red: "#DC2626", "Navy Blue": "#1E3A5F", Green: "#065F46", Pink: "#EC4899",
  Purple: "#7C3AED", Maroon: "#7F1D1D", Blue: "#0EA5E9", Orange: "#EA580C",
  Black: "#1A1A1A", White: "#F5F5F5", Yellow: "#EAB308",
};

const FilterSection = ({
  title,
  children,
  defaultOpen = true,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border py-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-left"
      >
        <span className="filter-section-title mb-0">{title}</span>
        {open ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
      </button>
      {open && <div className="mt-3 space-y-2">{children}</div>}
    </div>
  );
};

const FilterSidebar = ({ filters, onFilterChange, isOpen, onClose }) => {
  const toggleArrayFilter = (key, value) => {
    const arr = filters[key] || [];
    const next = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
    onFilterChange({ ...filters, [key]: next });
  };

  const content = (
    <div className="space-y-0">
      <FilterSection title="Price">
        {filterOptions.price.map((p) => (
          <label key={p.label} className="flex items-center gap-2 cursor-pointer text-sm font-body text-foreground">
            <input
              type="checkbox"
              checked={filters.priceRange.includes(p.min)}
              onChange={() => {
                const next = filters.priceRange.includes(p.min)
                  ? filters.priceRange.filter((v) => v !== p.min)
                  : [...filters.priceRange, p.min];
                onFilterChange({ ...filters, priceRange: next });
              }}
              className="accent-accent"
            />
            {p.label}
          </label>
        ))}
      </FilterSection>

      <FilterSection title="Discount">
        {filterOptions.discount.map((d) => (
          <label key={d} className="flex items-center gap-2 cursor-pointer text-sm font-body text-foreground">
            <input type="checkbox" checked={filters.discount.includes(d)} onChange={() => toggleArrayFilter("discount", d)} className="accent-accent" />
            {d}
          </label>
        ))}
      </FilterSection>

      <FilterSection title="Sub Category">
        {filterOptions.subCategories.map((s) => (
          <label key={s} className="flex items-center gap-2 cursor-pointer text-sm font-body text-foreground">
            <input type="checkbox" checked={filters.subCategories.includes(s)} onChange={() => toggleArrayFilter("subCategories", s)} className="accent-accent" />
            {s}
          </label>
        ))}
      </FilterSection>

      <FilterSection title="Color">
        <div className="flex flex-wrap gap-2">
          {filterOptions.colors.map((c) => (
            <button
              key={c}
              onClick={() => toggleArrayFilter("colors", c)}
              className={`w-7 h-7 rounded-full border-2 transition-all ${
                filters.colors.includes(c) ? "border-accent scale-110" : "border-border"
              }`}
              style={{ backgroundColor: colorMap[c] || "#ccc" }}
              title={c}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Fabric">
        {filterOptions.fabrics.map((f) => (
          <label key={f} className="flex items-center gap-2 cursor-pointer text-sm font-body text-foreground">
            <input type="checkbox" checked={filters.fabrics.includes(f)} onChange={() => toggleArrayFilter("fabrics", f)} className="accent-accent" />
            {f}
          </label>
        ))}
      </FilterSection>

      <FilterSection title="Work">
        {filterOptions.works.map((w) => (
          <label key={w} className="flex items-center gap-2 cursor-pointer text-sm font-body text-foreground">
            <input type="checkbox" checked={filters.works.includes(w)} onChange={() => toggleArrayFilter("works", w)} className="accent-accent" />
            {w}
          </label>
        ))}
      </FilterSection>

      <FilterSection title="Prints & Patterns" defaultOpen={false}>
        {filterOptions.patterns.map((p) => (
          <label key={p} className="flex items-center gap-2 cursor-pointer text-sm font-body text-foreground">
            <input type="checkbox" checked={filters.patterns.includes(p)} onChange={() => toggleArrayFilter("patterns", p)} className="accent-accent" />
            {p}
          </label>
        ))}
      </FilterSection>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0 pr-8">
        <h2 className="font-display text-lg font-semibold mb-4 text-foreground">Filters</h2>
        {content}
      </aside>

      {/* Mobile drawer */}
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
