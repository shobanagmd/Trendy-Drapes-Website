import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Upload, X, Plus } from "lucide-react";
import { useLocalProducts } from "@/hooks/useLocalProducts";
import { useToast } from "@/hooks/use-toast";

const categoryOptions = ["Sarees", "Bridal", "Lehengas", "Indo-Western", "Jewellery"];

const subcategoryOptions = {
  Sarees:         ["Banarasi", "Kanjivaram", "Chiffon", "Silk", "Cotton"],
  Bridal:         ["Wedding Lehenga", "Bridal Saree", "Reception Gown", "Engagement Outfit", "Bridal Dupatta"],
  Lehengas:       ["Bridal Lehenga", "Party Wear", "Festive", "A-Line", "Flared"],
  "Indo-Western": ["Gown", "Fusion Saree", "Crop Top Lehenga", "Dhoti Set", "Cape Dress"],
  Jewellery:      ["Necklace Set", "Earrings", "Bangles", "Maang Tikka", "Anklet"],
};

const fabricOptions = {
  Sarees:         ["Silk", "Cotton", "Georgette", "Chiffon", "Banarasi Silk"],
  Bridal:         ["Velvet", "Silk", "Net", "Satin", "Organza"],
  Lehengas:       ["Net", "Silk", "Velvet", "Georgette", "Art Silk"],
  "Indo-Western": ["Crepe", "Georgette", "Satin", "Cotton Blend", "Lycra"],
  Jewellery:      [],
};

const workOptions = {
  Sarees:         ["Zari", "Embroidery", "Sequins", "Printed", "Hand Painted"],
  Bridal:         ["Zardozi", "Stone Work", "Kundan", "Resham", "Gota Patti"],
  Lehengas:       ["Mirror Work", "Thread Work", "Sequins", "Embroidery", "Zari"],
  "Indo-Western": ["Embroidery", "Printed", "Sequins", "Lace", "Applique"],
  Jewellery:      ["Kundan", "Meenakari", "Temple", "Polki", "Antique"],
};

const patternOptions = {
  Sarees:         ["Woven", "Floral", "Paisley", "Geometric", "Traditional"],
  Bridal:         ["Embellished", "Floral", "Traditional", "Paisley", "Abstract"],
  Lehengas:       ["Floral", "Geometric", "Paisley", "Solid", "Abstract"],
  "Indo-Western": ["Solid", "Printed", "Abstract", "Geometric", "Striped"],
  Jewellery:      ["Traditional", "Contemporary", "Floral", "Geometric", "Temple"],
};

const colorOptions = ["Red", "Blue", "Green", "Yellow", "Pink", "Purple", "Orange", "Black", "White", "Gold", "Silver", "Maroon", "Navy", "Teal", "Peach", "Beige"];
const sizeOptions   = ["Free Size", "XS", "S", "M", "L", "XL", "XXL", "Custom"];

const selectClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default function AddProductPage() {
  const navigate = useNavigate();
  const { addProduct, clearAllProducts } = useLocalProducts();
  const { toast } = useToast();

  const [form, setForm] = useState({
    name: "", sku: "", seller: "", category: "Sarees", subCategory: "", price: "", mrp: "", stock: "",
    description: "", fabric: "", color: "", work: "", pattern: "",
    sizes: ["Free Size"], images: [], readyToShip: false, featured: false,
  });
  const [errors,     setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleCategoryChange = (e) => {
    handleChange(e);
    setForm((p) => ({ ...p, subCategory: "", fabric: "", work: "", pattern: "" }));
  };

  const toggleSize = (size) => {
    setForm((p) => ({
      ...p,
      sizes: p.sizes.includes(size) ? p.sizes.filter((s) => s !== size) : [...p.sizes, size],
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((p) => ({ ...p, images: [...p.images, reader.result] }));
        if (errors.images) setErrors((p) => ({ ...p, images: "" }));
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removeImage = (index) => {
    setForm((p) => ({ ...p, images: p.images.filter((_, i) => i !== index) }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim())                               errs.name        = "Required";
    if (!form.sku.trim())                                errs.sku         = "Required";
    if (!form.seller.trim())                             errs.seller      = "Required";
    if (!form.subCategory)                               errs.subCategory = "Required";
    if (!form.price || Number(form.price) <= 0)          errs.price       = "Required";
    if (!form.mrp   || Number(form.mrp)   <= 0)          errs.mrp         = "Required";
    if (Number(form.price) > Number(form.mrp))           errs.price       = "Price must be ≤ MRP";
    if (!form.stock && form.stock !== "0")               errs.stock       = "Required";
    if (form.images.length === 0)                        errs.images      = "At least one image required";
    if (!form.description.trim())                        errs.description = "Required";
    if (form.category !== "Jewellery" && !form.fabric)   errs.fabric      = "Required";
    if (!form.color)                                     errs.color       = "Required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || submitting) return;

    setSubmitting(true);

    const price    = Number(form.price);
    const mrp      = Number(form.mrp);
    const discount = mrp > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0;

    const product = {
      id:            `local-${Date.now()}`,
      sku:           form.sku.trim() || `SKU-${Date.now()}`,
      name:          form.name.trim(),
      seller:        form.seller.trim(),
      category:      form.category,
      subCategory:   form.subCategory,
      price,
      originalPrice: mrp,
      mrp,
      stock:         Number(form.stock),
      description:   form.description.trim(),
      image:         form.images[0],
      images:        form.images,
      discount,
      fabric:        form.fabric,
      color:         form.color,
      work:          form.work    || "None",
      pattern:       form.pattern || "Solid",
      sizes:         form.sizes,
      readyToShip:   form.readyToShip,
      featured:      form.featured,
      isNew:         true,
      isExclusive:   false,
      tags:          [],
    };

    // addProduct is now async (compresses images before storing)
    const result = await addProduct(product);

    setSubmitting(false);

    if (result.ok) {
      toast({ title: "✅ Product added!", description: `${product.name} has been added successfully.` });
      navigate("/admin/products");
      return;
    }

    if (result.reason === "duplicate") {
      toast({ title: "Duplicate product", description: "A product with this ID already exists.", variant: "destructive" });
      return;
    }

    if (result.reason === "quota") {
      // Storage is full — offer to clear old products
      const confirmClear = window.confirm(
        `⚠️ Storage is full (${result.usedKB} KB used).\n\n` +
        `This happens because product images are stored in the browser.\n\n` +
        `Click OK to clear previously added products and try again, or Cancel to keep them.`
      );
      if (confirmClear) {
        clearAllProducts();
        toast({ title: "Storage cleared", description: "Previous products removed. Please add the product again." });
      } else {
        toast({
          title: "Storage full",
          description: "Try using smaller images (under 500KB each) or clear browser storage.",
          variant: "destructive",
        });
      }
      return;
    }

    toast({ title: "Error", description: "Could not save product. Please try again.", variant: "destructive" });
  };

  const currentSubcategories = subcategoryOptions[form.category] || [];

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate("/admin/products")} className="p-2 hover:bg-secondary rounded-lg">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-foreground">Add New Product</h1>
          <p className="text-sm text-muted-foreground">Create a new product listing for the store</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="border border-border rounded-lg p-5 space-y-4 bg-card">
          <h3 className="text-base font-semibold text-foreground">Basic Information</h3>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Product Name *</label>
            <Input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Red Silk Banarasi Saree" />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">SKU *</label>
              <Input name="sku" value={form.sku} onChange={handleChange} placeholder="e.g. TD-SAREE-001" />
              {errors.sku && <p className="text-xs text-destructive mt-1">{errors.sku}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Seller Name *</label>
              <Input name="seller" value={form.seller} onChange={handleChange} placeholder="e.g. Trendy Drapes Store" />
              {errors.seller && <p className="text-xs text-destructive mt-1">{errors.seller}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Category *</label>
              <select name="category" value={form.category} onChange={handleCategoryChange} className={selectClass}>
                {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Subcategory *</label>
              <select name="subCategory" value={form.subCategory} onChange={handleChange} className={selectClass}>
                <option value="">Select subcategory</option>
                {currentSubcategories.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.subCategory && <p className="text-xs text-destructive mt-1">{errors.subCategory}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Description *</label>
            <textarea
              name="description" value={form.description} onChange={handleChange} rows={3}
              placeholder="Describe the product..."
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            {errors.description && <p className="text-xs text-destructive mt-1">{errors.description}</p>}
          </div>
        </div>

        {/* Pricing */}
        <div className="border border-border rounded-lg p-5 space-y-4 bg-card">
          <h3 className="text-base font-semibold text-foreground">Pricing & Inventory</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Price (₹) *</label>
              <Input name="price" type="number" min="0" value={form.price} onChange={handleChange} placeholder="12999" />
              {errors.price && <p className="text-xs text-destructive mt-1">{errors.price}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">MRP (₹) *</label>
              <Input name="mrp" type="number" min="0" value={form.mrp} onChange={handleChange} placeholder="18999" />
              {errors.mrp && <p className="text-xs text-destructive mt-1">{errors.mrp}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Stock *</label>
              <Input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} placeholder="50" />
              {errors.stock && <p className="text-xs text-destructive mt-1">{errors.stock}</p>}
            </div>
          </div>
          {form.price && form.mrp && Number(form.mrp) > 0 && (
            <div className="bg-secondary rounded-md px-4 py-2.5">
              <span className="text-sm text-muted-foreground">Discount: </span>
              <span className="text-sm font-semibold text-accent">
                {Math.round(((Number(form.mrp) - Number(form.price)) / Number(form.mrp)) * 100)}% OFF
              </span>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="border border-border rounded-lg p-5 space-y-4 bg-card">
          <h3 className="text-base font-semibold text-foreground">Product Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {form.category !== "Jewellery" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Fabric *</label>
                <select name="fabric" value={form.fabric} onChange={handleChange} className={selectClass}>
                  <option value="">Select fabric</option>
                  {(fabricOptions[form.category] || []).map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
                {errors.fabric && <p className="text-xs text-destructive mt-1">{errors.fabric}</p>}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Color *</label>
              <select name="color" value={form.color} onChange={handleChange} className={selectClass}>
                <option value="">Select color</option>
                {colorOptions.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.color && <p className="text-xs text-destructive mt-1">{errors.color}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Work</label>
              <select name="work" value={form.work} onChange={handleChange} className={selectClass}>
                <option value="">Select work type</option>
                {(workOptions[form.category] || []).map((w) => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Pattern</label>
              <select name="pattern" value={form.pattern} onChange={handleChange} className={selectClass}>
                <option value="">Select pattern</option>
                {(patternOptions[form.category] || []).map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Available Sizes</label>
            <div className="flex flex-wrap gap-2">
              {sizeOptions.map((size) => (
                <button key={size} type="button" onClick={() => toggleSize(size)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    form.sizes.includes(size)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-border hover:bg-secondary"
                  }`}>
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="border border-border rounded-lg p-5 space-y-4 bg-card">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground">Product Images *</h3>
            <p className="text-xs text-muted-foreground">Images are auto-compressed before saving</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {form.images.map((img, i) => (
              <div key={i} className="relative w-24 h-28 rounded-md overflow-hidden border border-border bg-secondary group">
                <img src={img} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <label className="w-24 h-28 rounded-md border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-secondary/50 transition-colors">
              <Upload className="w-5 h-5 text-muted-foreground mb-1" />
              <span className="text-[10px] text-muted-foreground">Add Image</span>
              <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
            </label>
          </div>
          {errors.images && <p className="text-xs text-destructive mt-1">{errors.images}</p>}
        </div>

        {/* Options */}
        <div className="border border-border rounded-lg p-5 space-y-4 bg-card">
          <h3 className="text-base font-semibold text-foreground">Options</h3>
          <div className="flex flex-col sm:flex-row gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="readyToShip" checked={form.readyToShip} onChange={handleChange}
                className="w-4 h-4 rounded border-input text-primary focus:ring-primary" />
              <span className="text-sm text-foreground">Ready to Ship</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange}
                className="w-4 h-4 rounded border-input text-primary focus:ring-primary" />
              <span className="text-sm text-foreground">Featured Product</span>
            </label>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting
            ? <><span className="animate-spin mr-2 inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />Saving & compressing images...</>
            : <><Plus className="w-4 h-4 mr-2" />Add Product</>
          }
        </Button>
      </form>
    </div>
  );
}