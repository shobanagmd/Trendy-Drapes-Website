import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Upload, X, Plus } from "lucide-react";
import { apiFetch } from "@/utils/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const categoryOptions = ["Sarees", "Bridal", "Lehengas", "Indo-Western", "Jewellery"];

// ── Exactly matches filterOptions.byCategory in products.js ──────────────────
const subcategoryOptions = {
  Sarees:         ["Silk Sarees", "Cotton Sarees", "Georgette Sarees", "Chiffon Sarees", "Designer Sarees"],
  Bridal:         ["Bridal Sarees", "Bridal Lehenga", "Bridal Gowns", "Reception Outfits", "Engagement Outfits"],
  Lehengas:       ["Bridal Lehenga", "Party Wear Lehenga", "Designer Lehenga", "A-Line Lehenga", "Circular Lehenga"],
  "Indo-Western": ["Indo-Western Gowns", "Crop Top Sets", "Jacket Style Outfits", "Dhoti Style Outfits", "Fusion Wear"],
  Jewellery:      ["Necklace Sets", "Choker Sets", "Earrings", "Bangles", "Maang Tikka"],
};

const fabricOptions = {
  Sarees:         ["Silk", "Cotton", "Georgette", "Chiffon", "Organza"],
  Bridal:         ["Silk", "Velvet", "Net", "Organza", "Satin"],
  Lehengas:       ["Silk", "Velvet", "Net", "Georgette", "Satin"],
  "Indo-Western": ["Georgette", "Crepe", "Silk Blend", "Satin", "Net"],
  Jewellery:      ["Gold Plated", "Silver", "Kundan", "Artificial", "Pearl"],
};

const workOptions = {
  Sarees:         ["Zari Work", "Embroidery", "Stone Work", "Thread Work", "Mirror Work"],
  Bridal:         ["Heavy Zari", "Embroidery", "Stone Work", "Sequins", "Kundan Work"],
  Lehengas:       ["Heavy Embroidery", "Zari Work", "Sequins Work", "Mirror Work", "Thread Work"],
  "Indo-Western": ["Light Embroidery", "Sequins Work", "Digital Print", "Thread Work", "Minimal Work"],
  Jewellery:      ["Stone Work", "Kundan Work", "Beaded Work", "Meenakari", "Antique Finish"],
};

const patternOptions = {
  Sarees:         ["Floral", "Paisley", "Printed", "Striped", "Checked"],
  Bridal:         ["Traditional", "Embroidered", "Floral", "Rich Motifs", "Designer Patterns"],
  Lehengas:       ["Floral", "Embroidered", "Printed", "Traditional Motifs", "Abstract"],
  "Indo-Western": ["Abstract", "Printed", "Fusion Patterns", "Floral", "Contemporary"],
  Jewellery:      ["Traditional", "Temple Design", "Bridal", "Contemporary", "Minimal"],
};

const colorOptions = ["Red", "Blue", "Green", "Yellow", "Pink", "Purple", "Orange", "Black", "White", "Gold", "Silver", "Maroon", "Navy", "Teal", "Peach", "Beige"];
const sizeOptions   = ["Free Size", "XS", "S", "M", "L", "XL", "XXL", "Custom"];

const selectClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default function AddProductPage() {
  const navigate = useNavigate();
  const { role, user } = useAuth();
  const { toast } = useToast();

  const [categories, setCategories] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [form, setForm] = useState({
    name: "", category_id: "", subCategory: "", sku: "", price: "", mrp: "", stock: "",
    description: "", fabric: "", color: "", work: "", pattern: "",
    sizes: ["Free Size"], images: [], readyToShip: false, featured: false,
    weight: "", length: "", breadth: "", height: "", brand: "",
    deliveryCharge: "0", addCharge: "0", is_active: true, seller_id: ""
  });
  const [imagePreviews, setImagePreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const catRes = await apiFetch("/api/categories");
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData.categories);
        }

        if (role === 'admin') {
          const selRes = await apiFetch("/api/sellers");
          if (selRes.ok) {
            const selData = await selRes.json();
            setSellers(selData.sellers);
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, [role]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleCategoryChange = (e) => {
    handleChange(e);
    setForm((p) => ({ ...p, subCategory: "", fabric: "", work: "", pattern: "" }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (form.images.length + files.length > 10) {
      toast({ title: "Too many images", description: "Max 10 images allowed", variant: "destructive" });
      return;
    }

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((p) => [...p, reader.result]);
      };
      reader.readAsDataURL(file);
    });

    setForm((p) => ({ ...p, images: [...p.images, ...files] }));
    if (errors.images) setErrors((p) => ({ ...p, images: "" }));
    e.target.value = "";
  };

  const removeImage = (index) => {
    setForm((p) => ({ ...p, images: p.images.filter((_, i) => i !== index) }));
    setImagePreviews((p) => p.filter((_, i) => i !== index));
  };

  const toggleSize = (size) => {
    setForm((p) => ({
      ...p,
      sizes: p.sizes.includes(size) ? p.sizes.filter((s) => s !== size) : [...p.sizes, size],
    }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim())                               errs.name        = "Required";
    if (!form.category_id)                               errs.category_id = "Required";
    if (!form.subCategory)                               errs.subCategory = "Required";
    if (!form.price || Number(form.price) <= 0)          errs.price       = "Required";
    if (!form.mrp   || Number(form.mrp)   <= 0)          errs.mrp         = "Required";
    if (Number(form.price) > Number(form.mrp))           errs.price       = "Price must be ≤ MRP";
    if (!form.stock && form.stock !== "0")               errs.stock       = "Required";
    if (form.images.length === 0)                        errs.images      = "At least one image required";
    if (!form.description.trim())                        errs.description = "Required";
    if (!form.color)                                     errs.color       = "Required";
    if (role === 'admin' && !form.seller_id)             errs.seller_id   = "Required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || submitting) return;

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("category_id", form.category_id);
      formData.append("subCategory", form.subCategory);
      formData.append("sku", form.sku || `SKU-${Date.now()}`);
      formData.append("price", form.price);
      formData.append("mrp", form.mrp);
      formData.append("stock_quantity", form.stock);
      formData.append("weight", form.weight || 0);
      formData.append("length", form.length || 0);
      formData.append("breadth", form.breadth || 0);
      formData.append("height", form.height || 0);
      formData.append("brand", form.brand);
      formData.append("fabric", form.fabric);
      formData.append("color", form.color);
      formData.append("work", form.work);
      formData.append("pattern", form.pattern);
      formData.append("ready_to_ship", form.readyToShip);
      formData.append("featured", form.featured);
      formData.append("delivery_charge", form.deliveryCharge);
      formData.append("additional_charge", form.addCharge);
      formData.append("is_active", form.is_active);
      
      if (role === 'admin') {
        formData.append("seller_id", form.seller_id);
      }

      // Sizes are sent as JSON string or multi-part
      formData.append("sizes", JSON.stringify(form.sizes));

      // Images
      form.images.forEach((file) => {
        formData.append("images", file);
      });

      const res = await apiFetch("/api/products", {
        method: "POST",
        body: formData
      });

      if (res.ok) {
        toast({ title: "✅ Product added!", description: `${form.name} has been added to the database.` });
        navigate("/admin/products");
      } else {
        const errorData = await res.json();
        toast({ title: "Error", description: errorData.message || "Failed to add product", variant: "destructive" });
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Connection error. Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };


  const selectedCategory = categories.find(c => c.category_id === form.category_id);
  const currentSubcategories = selectedCategory ? (subcategoryOptions[selectedCategory.name] || []) : [];

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
              <label className="block text-sm font-medium text-foreground mb-1.5">Category *</label>
              <select name="category_id" value={form.category_id} onChange={handleCategoryChange} className={selectClass}>
                <option value="">Select category</option>
                {categories.map((c) => <option key={c.category_id} value={c.category_id}>{c.name}</option>)}
              </select>
              {errors.category_id && <p className="text-xs text-destructive mt-1">{errors.category_id}</p>}
            </div>
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

        {/* Shipping & Dimensions */}
        <div className="border border-border rounded-lg p-5 space-y-4 bg-card">
          <h3 className="text-base font-semibold text-foreground">Shipping & Dimensions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Weight (kg)</label>
              <Input name="weight" type="number" step="0.01" value={form.weight} onChange={handleChange} placeholder="0.5" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Length (cm)</label>
              <Input name="length" type="number" value={form.length} onChange={handleChange} placeholder="30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Breadth (cm)</label>
              <Input name="breadth" type="number" value={form.breadth} onChange={handleChange} placeholder="20" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Height (cm)</label>
              <Input name="height" type="number" value={form.height} onChange={handleChange} placeholder="5" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Delivery Charge (₹)</label>
              <Input name="deliveryCharge" type="number" value={form.deliveryCharge} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Additional Charge (₹)</label>
              <Input name="addCharge" type="number" value={form.addCharge} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* Brand & SKU */}
        <div className="border border-border rounded-lg p-5 space-y-4 bg-card">
          <h3 className="text-base font-semibold text-foreground">Brand & Identity</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Brand Name</label>
              <Input name="brand" value={form.brand} onChange={handleChange} placeholder="e.g. Trendy Drapes Exclusive" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">SKU (Stock Keeping Unit)</label>
              <Input name="sku" value={form.sku} onChange={handleChange} placeholder="e.g. TD-SILK-001" />
            </div>
          </div>
        </div>

        {/* Seller Selection (Admin Only) */}
        {role === 'admin' && (
          <div className="border border-border rounded-lg p-5 space-y-4 bg-card">
            <h3 className="text-base font-semibold text-foreground">Seller Assignment</h3>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Select Seller *</label>
              <select name="seller_id" value={form.seller_id} onChange={handleChange} className={selectClass}>
                <option value="">Select a seller</option>
                {sellers.map((s) => (
                  <option key={s.seller_id} value={s.seller_id}>
                    {s.full_name} ({s.store_name || 'No Store Name'})
                  </option>
                ))}
              </select>
              {errors.seller_id && <p className="text-xs text-destructive mt-1">{errors.seller_id}</p>}
            </div>
          </div>
        )}


        {/* Product Details */}
        <div className="border border-border rounded-lg p-5 space-y-4 bg-card">
          <h3 className="text-base font-semibold text-foreground">Product Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {selectedCategory?.name !== "Jewellery" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Fabric *</label>
                <select name="fabric" value={form.fabric} onChange={handleChange} className={selectClass}>
                  <option value="">Select fabric</option>
                  {(fabricOptions[selectedCategory?.name] || []).map((f) => <option key={f} value={f}>{f}</option>)}
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
                {(workOptions[selectedCategory?.name] || []).map((w) => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Pattern</label>
              <select name="pattern" value={form.pattern} onChange={handleChange} className={selectClass}>
                <option value="">Select pattern</option>
                {(patternOptions[selectedCategory?.name] || []).map((p) => <option key={p} value={p}>{p}</option>)}
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
            {imagePreviews.map((img, i) => (
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
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange}
                className="w-4 h-4 rounded border-input text-primary focus:ring-primary" />
              <span className="text-sm text-foreground">Is Active (Visible on site)</span>
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