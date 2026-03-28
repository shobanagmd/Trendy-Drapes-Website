import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocalProducts } from "@/hooks/useLocalProducts";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Lock, ShieldCheck, Upload, X, Plus } from "lucide-react";

const categoryOptions = ["Sarees", "Lehengas", "Indo-Western", "Bridal", "Jewellery", "Kids", "Men", "Women"];
const subcategoryOptions = {
  Sarees: ["Designer", "Banarasi", "Kanjivaram", "Chiffon", "Georgette", "Cotton", "Silk", "Tussar", "Patola", "Chanderi"],
  Lehengas: ["Bridal", "Party Wear", "Festive", "Designer"],
  "Indo-Western": ["Gowns", "Fusion", "Contemporary"],
  Bridal: ["Wedding", "Reception", "Engagement"],
  Jewellery: ["Necklace", "Earrings", "Bangles", "Maang Tikka"],
  Kids: ["Girls", "Boys"],
  Men: ["Kurta", "Sherwani"],
  Women: ["Salwar Suit", "Kurti", "Dress"],
};
const fabricOptions = ["Silk", "Cotton", "Georgette", "Chiffon", "Net", "Velvet", "Satin", "Linen", "Organza", "Crepe", "Banarasi Silk", "Art Silk"];
const colorOptions = ["Red", "Blue", "Green", "Yellow", "Pink", "Purple", "Orange", "Black", "White", "Gold", "Silver", "Maroon", "Navy", "Teal", "Peach", "Beige"];
const workOptions = ["Embroidery", "Zari", "Sequins", "Mirror Work", "Thread Work", "Stone Work", "Printed", "Hand Painted", "Resham", "Kutch Work", "Gota Patti", "None"];
const patternOptions = ["Embellished", "Solid", "Printed", "Woven", "Floral", "Geometric", "Paisley", "Striped", "Checkered", "Abstract", "Traditional"];
const sizeOptions = ["Free Size", "XS", "S", "M", "L", "XL", "XXL", "Custom"];

const AdminLoginForm = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username || !password) { setError("Please fill all fields"); return; }
    const ok = onLogin(username, password);
    if (!ok) setError("Invalid credentials");
  };

  return (
    <div className="flex-1 flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Lock className="w-7 h-7 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-semibold text-foreground">Admin Login</h1>
          <p className="font-body text-sm text-muted-foreground mt-1">Sign in to manage products</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-body text-sm font-medium text-foreground mb-1.5">Username</label>
            <Input value={username} onChange={(e) => { setUsername(e.target.value); setError(""); }} placeholder="admin" />
          </div>
          <div>
            <label className="block font-body text-sm font-medium text-foreground mb-1.5">Password</label>
            <Input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }} placeholder="••••••••" />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button type="submit" className="w-full">Sign In</Button>
        </form>
      </div>
    </div>
  );
};

const ProductForm = ({ onSubmit }) => {
  const [form, setForm] = useState({
    name: "", category: "Sarees", subCategory: "", price: "", mrp: "", stock: "",
    description: "", fabric: "", color: "", work: "", pattern: "",
    sizes: ["Free Size"], tags: [], images: [], readyToShip: false, featured: false,
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
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
    if (!form.name.trim()) errs.name = "Required";
    if (!form.subCategory) errs.subCategory = "Required";
    if (!form.price || Number(form.price) <= 0) errs.price = "Required";
    if (!form.mrp || Number(form.mrp) <= 0) errs.mrp = "Required";
    if (Number(form.price) > Number(form.mrp)) errs.price = "Price must be ≤ MRP";
    if (!form.stock && form.stock !== "0") errs.stock = "Required";
    if (form.images.length === 0) errs.images = "At least one image required";
    if (!form.description.trim()) errs.description = "Required";
    if (!form.fabric) errs.fabric = "Required";
    if (!form.color) errs.color = "Required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const price = Number(form.price);
    const mrp = Number(form.mrp);
    const discount = mrp > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0;
    onSubmit({
      id: `local-${Date.now()}`,
      name: form.name.trim(),
      category: form.category,
      subCategory: form.subCategory,
      price, originalPrice: mrp, mrp,
      stock: Number(form.stock),
      description: form.description.trim(),
      image: form.images[0],
      images: form.images,
      discount, tags: form.tags,
      fabric: form.fabric,
      color: form.color,
      work: form.work || "None",
      pattern: form.pattern || "Solid",
      sizes: form.sizes,
      readyToShip: form.readyToShip,
      featured: form.featured,
      isNew: true,
      isExclusive: false,
    });
    setForm({
      name: "", category: "Sarees", subCategory: "", price: "", mrp: "", stock: "",
      description: "", fabric: "", color: "", work: "", pattern: "",
      sizes: ["Free Size"], tags: [], images: [], readyToShip: false, featured: false,
    });
  };

  const currentSubcategories = subcategoryOptions[form.category] || [];

  const selectClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="border border-border rounded-lg p-5 space-y-4">
        <h3 className="font-display text-lg font-semibold text-foreground">Basic Information</h3>
        <div>
          <label className="block font-body text-sm font-medium text-foreground mb-1.5">Product Name *</label>
          <Input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Red Silk Banarasi Saree" />
          {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-body text-sm font-medium text-foreground mb-1.5">Category *</label>
            <select name="category" value={form.category} onChange={(e) => { handleChange(e); setForm((p) => ({ ...p, subCategory: "" })); }} className={selectClass}>
              {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block font-body text-sm font-medium text-foreground mb-1.5">Subcategory *</label>
            <select name="subCategory" value={form.subCategory} onChange={handleChange} className={selectClass}>
              <option value="">Select subcategory</option>
              {currentSubcategories.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            {errors.subCategory && <p className="text-xs text-destructive mt-1">{errors.subCategory}</p>}
          </div>
        </div>

        <div>
          <label className="block font-body text-sm font-medium text-foreground mb-1.5">Description *</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Describe the product..."
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          {errors.description && <p className="text-xs text-destructive mt-1">{errors.description}</p>}
        </div>
      </div>

      {/* Pricing */}
      <div className="border border-border rounded-lg p-5 space-y-4">
        <h3 className="font-display text-lg font-semibold text-foreground">Pricing & Inventory</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-body text-sm font-medium text-foreground mb-1.5">Price (₹) *</label>
            <Input name="price" type="number" min="0" value={form.price} onChange={handleChange} placeholder="12999" />
            {errors.price && <p className="text-xs text-destructive mt-1">{errors.price}</p>}
          </div>
          <div>
            <label className="block font-body text-sm font-medium text-foreground mb-1.5">MRP (₹) *</label>
            <Input name="mrp" type="number" min="0" value={form.mrp} onChange={handleChange} placeholder="18999" />
            {errors.mrp && <p className="text-xs text-destructive mt-1">{errors.mrp}</p>}
          </div>
          <div>
            <label className="block font-body text-sm font-medium text-foreground mb-1.5">Stock *</label>
            <Input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} placeholder="50" />
            {errors.stock && <p className="text-xs text-destructive mt-1">{errors.stock}</p>}
          </div>
        </div>
        {form.price && form.mrp && Number(form.mrp) > 0 && (
          <div className="bg-secondary rounded-md px-4 py-2.5">
            <span className="font-body text-sm text-muted-foreground">Discount: </span>
            <span className="font-body text-sm font-semibold text-accent">
              {Math.round(((Number(form.mrp) - Number(form.price)) / Number(form.mrp)) * 100)}% OFF
            </span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="border border-border rounded-lg p-5 space-y-4">
        <h3 className="font-display text-lg font-semibold text-foreground">Product Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-body text-sm font-medium text-foreground mb-1.5">Fabric *</label>
            <select name="fabric" value={form.fabric} onChange={handleChange} className={selectClass}>
              <option value="">Select fabric</option>
              {fabricOptions.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
            {errors.fabric && <p className="text-xs text-destructive mt-1">{errors.fabric}</p>}
          </div>
          <div>
            <label className="block font-body text-sm font-medium text-foreground mb-1.5">Color *</label>
            <select name="color" value={form.color} onChange={handleChange} className={selectClass}>
              <option value="">Select color</option>
              {colorOptions.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.color && <p className="text-xs text-destructive mt-1">{errors.color}</p>}
          </div>
          <div>
            <label className="block font-body text-sm font-medium text-foreground mb-1.5">Work</label>
            <select name="work" value={form.work} onChange={handleChange} className={selectClass}>
              <option value="">Select work type</option>
              {workOptions.map((w) => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>
          <div>
            <label className="block font-body text-sm font-medium text-foreground mb-1.5">Pattern</label>
            <select name="pattern" value={form.pattern} onChange={handleChange} className={selectClass}>
              <option value="">Select pattern</option>
              {patternOptions.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block font-body text-sm font-medium text-foreground mb-1.5">Available Sizes</label>
          <div className="flex flex-wrap gap-2">
            {sizeOptions.map((size) => (
              <button key={size} type="button" onClick={() => toggleSize(size)}
                className={`px-3 py-1.5 rounded-full text-xs font-body font-medium border transition-colors ${
                  form.sizes.includes(size) ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground border-border hover:bg-secondary"
                }`}>
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="border border-border rounded-lg p-5 space-y-4">
        <h3 className="font-display text-lg font-semibold text-foreground">Product Images *</h3>
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
            <span className="text-[10px] font-body text-muted-foreground">Add Image</span>
            <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
          </label>
        </div>
        {errors.images && <p className="text-xs text-destructive mt-1">{errors.images}</p>}
      </div>

      {/* Options */}
      <div className="border border-border rounded-lg p-5 space-y-4">
        <h3 className="font-display text-lg font-semibold text-foreground">Options</h3>
        <div className="flex flex-col sm:flex-row gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="readyToShip" checked={form.readyToShip} onChange={handleChange}
              className="w-4 h-4 rounded border-input text-primary focus:ring-primary" />
            <span className="font-body text-sm text-foreground">Ready to Ship</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange}
              className="w-4 h-4 rounded border-input text-primary focus:ring-primary" />
            <span className="font-body text-sm text-foreground">Featured Product</span>
          </label>
        </div>
      </div>

      <Button type="submit" className="w-full">
        <Plus className="w-4 h-4 mr-2" /> Add Product
      </Button>
    </form>
  );
};

const AddProduct = () => {
  const navigate = useNavigate();
  const { addProduct } = useLocalProducts();
  const { isAdmin, login, logout } = useAdminAuth();
  const { toast } = useToast();

  const handleAddProduct = (product) => {
    const ok = addProduct(product);
    if (ok) {
      toast({ title: "Product added!", description: `${product.name} has been added.` });
    } else {
      toast({ title: "Duplicate", description: "Product already exists.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      {!isAdmin ? (
        <AdminLoginForm onLogin={login} />
      ) : (
        <div className="container mx-auto px-4 py-8 flex-1 max-w-3xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-accent" />
              <h1 className="font-display text-3xl font-semibold text-foreground">Add Product</h1>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={() => navigate("/collections")}>View Collections</Button>
              <Button variant="outline" size="sm" onClick={() => navigate("/profile")}>My Account</Button>
              <Button variant="destructive" size="sm" onClick={logout}><LogOut className="w-4 h-4 mr-1" /> Logout</Button>
            </div>
          </div>
          <ProductForm onSubmit={handleAddProduct} />
        </div>
      )}
      <Footer />
    </div>
  );
};

export default AddProduct;
