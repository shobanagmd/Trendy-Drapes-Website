const DEFAULT_PRODUCTS = [
  { id: 1, sku: "TD-E-001", name: "Wireless Earbuds Pro", category: "Electronics", seller: "TechZone", price: 3499, mrp: 5499, stock: 450, sold: 2840, rating: 4.6, status: "Active", image: "🎧", description: "Premium wireless earbuds with noise cancellation", dateCreated: "2026-01-15" },
  { id: 2, sku: "TD-F-002", name: "Cotton Kurta Set (Women)", category: "Fashion", seller: "FashionHub", price: 1899, mrp: 2999, stock: 1200, sold: 3200, rating: 4.3, status: "Active", image: "👗", description: "Comfortable cotton kurta set for women", dateCreated: "2026-01-20" },
  { id: 3, sku: "TD-E-003", name: "Smart Watch X200", category: "Electronics", seller: "GadgetWorld", price: 7499, mrp: 10999, stock: 320, sold: 1850, rating: 4.7, status: "Active", image: "⌚", description: "Advanced smart watch with fitness tracking", dateCreated: "2026-02-05" },
  { id: 4, sku: "TD-B-004", name: "Premium Face Serum", category: "Beauty", seller: "BeautyFirst", price: 1499, mrp: 2499, stock: 2800, sold: 4100, rating: 4.4, status: "Active", image: "✨", description: "Luxurious face serum for glowing skin", dateCreated: "2026-02-18" },
  { id: 5, sku: "TD-S-005", name: "Yoga Mat Premium", category: "Sports", seller: "FitGear", price: 1999, mrp: 3499, stock: 680, sold: 1560, rating: 4.5, status: "Active", image: "🧘", description: "Non-slip premium yoga mat", dateCreated: "2026-03-01" },
  { id: 6, sku: "TD-H-006", name: "Stainless Steel Bottle", category: "Home & Kitchen", seller: "HomeEssentials", price: 899, mrp: 1599, stock: 0, sold: 890, rating: 4.1, status: "Out of Stock", image: "🍶", description: "Durable stainless steel water bottle", dateCreated: "2026-03-10" },
  { id: 7, sku: "TD-F-007", name: "Running Shoes Air Max", category: "Fashion", seller: "ShoePalace", price: 4499, mrp: 6999, stock: 540, sold: 2100, rating: 4.8, status: "Active", image: "👟", description: "High-performance running shoes", dateCreated: "2026-03-15" },
  { id: 8, sku: "TD-E-008", name: "Bluetooth Speaker Mini", category: "Electronics", seller: "TechZone", price: 2499, mrp: 3999, stock: 12, sold: 1340, rating: 4.2, status: "Low Stock", image: "🔊", description: "Portable bluetooth speaker with great sound", dateCreated: "2026-03-25" },
];

export const getAllProducts = () => {
  try {
    const stored = localStorage.getItem("products");
    return stored ? JSON.parse(stored) : DEFAULT_PRODUCTS;
  } catch {
    return DEFAULT_PRODUCTS;
  }
};

export const saveProduct = (formData) => {
  const products = getAllProducts();
  const nextId = products.length > 0 ? Math.max(...products.map((p) => Number(p.id) || 0), 0) + 1 : 1;
  const newProduct = {
    ...formData,
    id: String(nextId),
    sold: 0,
    rating: 0,
    image: formData.image || formData.images?.[0] || "📦",
    stock: parseInt(formData.stock) || 0,
    dateCreated: new Date().toISOString().split('T')[0],
    sku: formData.sku || `TD-NEW-${nextId}`,
  };
  products.push(newProduct);
  localStorage.setItem("products", JSON.stringify(products));
  return newProduct;
};

export const deleteProduct = (id) => {
  const products = getAllProducts();
  const filtered = products.filter((p) => p.id !== id);
  localStorage.setItem("products", JSON.stringify(filtered));
};

export const updateProduct = (id, updatedData) => {
  const products = getAllProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index !== -1) {
    products[index] = { ...products[index], ...updatedData };
    localStorage.setItem("products", JSON.stringify(products));
  }
};
