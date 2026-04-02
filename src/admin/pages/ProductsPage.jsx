import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Package, Star, Eye, Edit, Trash2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getAllProducts, deleteProduct } from "@/lib/productStorage";

const categoryStock = [
  { name: "Electronics", products: 3420, active: 3180 },
  { name: "Fashion", products: 4200, active: 3950 },
  { name: "Home", products: 2100, active: 1980 },
  { name: "Beauty", products: 1800, active: 1720 },
  { name: "Sports", products: 1320, active: 1210 },
];

const statusStyle = {
  Active: "badge-success", "Low Stock": "badge-warning", "Out of Stock": "badge-danger", Inactive: "badge-neutral",
};

export default function ProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Load products from localStorage
    setProducts(getAllProducts());
  }, []);

  // Determine status based on stock
  const getStatus = (product) => {
    if (product.stock === 0) return "Out of Stock";
    if (product.stock < 50) return "Low Stock";
    return "Active";
  };

  // Format products
  const filtered = products.map(p => ({ ...p, status: getStatus(p) }));

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteProduct(id);
      setProducts(getAllProducts());
    }
  };

  const handleView = (product) => {
    alert(`Viewing: ${product.name}\n\nCategory: ${product.category}\nSeller: ${product.seller}\nPrice: ${product.price}\nStock: ${product.stock}\n\n${product.description}`);
  };

  const handleEdit = (product) => {
    // For now, show a simple edit dialog. In a real app, you'd navigate to an edit page
    const newName = prompt("Edit product name:", product.name);
    if (newName && newName !== product.name) {
      const newPrice = prompt("Edit price:", product.price);
      const newStock = prompt("Edit stock:", product.stock.toString());
      if (newPrice && newStock) {
        const newSeller = prompt("Edit seller name:", product.seller || "");
        const updatedProducts = products.map(p =>
          p.id === product.id
            ? { ...p, name: newName, price: newPrice, stock: parseInt(newStock), seller: newSeller || p.seller }
            : p
        );
        setProducts(updatedProducts);
        localStorage.setItem("products", JSON.stringify(updatedProducts));
        alert("Product updated successfully!");
      }
    }
  };

  return (
    <div className="space-y-5">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">Manage product catalog, inventory, and listings</p>
        </div>
        <Button onClick={() => navigate("/admin/products/add")}><Plus className="h-4 w-4 mr-2" />Add Product</Button>
      </div>

      {/* Category Stock Chart */}
      <div className="chart-card">
        <h3 className="chart-title">Products by Category</h3>
        <p className="chart-subtitle mb-3">Total vs active listings per category</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={categoryStock} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(220, 9%, 46%)" />
            <YAxis tick={{ fontSize: 11 }} stroke="hsl(220, 9%, 46%)" />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Bar dataKey="products" name="Total" fill="hsl(220, 14%, 80%)" radius={[3, 3, 0, 0]} />
            <Bar dataKey="active" name="Active" fill="hsl(25, 95%, 53%)" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>



      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-[25%] text-left">Product</th>
                <th className="w-[12%] text-left">Category</th>
                <th className="w-[15%] text-left">Seller</th>
                <th className="w-[10%] text-right">Price</th>
                <th className="w-[8%] text-right">Stock</th>
                <th className="w-[8%] text-right">Sold</th>
                <th className="w-[8%] text-center">Rating</th>
                <th className="w-[10%] text-center">Status</th>
                <th className="w-[12%] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      {/* Show actual image if it looks like a URL or base64, else show emoji/icon */}
                      {p.image && (p.image.startsWith("http") || p.image.startsWith("data:") || p.image.startsWith("/")) ? (
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-12 h-12 object-cover rounded-md border border-border flex-shrink-0"
                          onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.nextSibling.style.display = "flex"; }}
                        />
                      ) : (
                        <span className="w-12 h-12 rounded-md border border-border bg-secondary flex items-center justify-center text-lg flex-shrink-0">
                          {p.image || <Package className="h-5 w-5 text-muted-foreground" />}
                        </span>
                      )}
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium text-card-foreground text-sm truncate" title={p.name}>{p.name}</span>
                        <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-tight">{p.sku || `NO-SKU-${p.id}`}</span>
                      </div>
                    </div>
                  </td>
                  <td className="text-muted-foreground text-left">{p.category}</td>
                  <td className="text-card-foreground text-left">{p.seller}</td>
                  <td className="text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-medium text-card-foreground">₹{Number(p.price || 0).toLocaleString("en-IN")}</span>
                      <span className="text-[10px] text-muted-foreground line-through">₹{Number(p.mrp || 0).toLocaleString("en-IN")}</span>
                    </div>
                  </td>
                  <td className="text-card-foreground text-right">{p.stock.toLocaleString()}</td>
                  <td className="text-card-foreground text-right">₹{Number(p.price ?? 0).toLocaleString("en-IN")}</td>
                  <td>
                    <div className="flex items-center justify-center gap-1">
                      <Star className="h-3 w-3 text-warning fill-warning" />
                      <span className="text-xs font-medium text-card-foreground">{p.rating}</span>
                    </div>
                  </td>
                  <td className="text-center"><span className={statusStyle[p.status]}>{p.status}</span></td>
                  <td>
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleView(p)} className="rounded p-1.5 hover:bg-secondary transition-colors" title="View"><Eye className="h-4 w-4 text-muted-foreground" /></button>
                      <button onClick={() => handleEdit(p)} className="rounded p-1.5 hover:bg-secondary transition-colors" title="Edit"><Edit className="h-4 w-4 text-muted-foreground" /></button>
                      <button onClick={() => handleDelete(p.id)} className="rounded p-1.5 hover:bg-secondary transition-colors" title="Delete"><Trash2 className="h-4 w-4 text-destructive" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}