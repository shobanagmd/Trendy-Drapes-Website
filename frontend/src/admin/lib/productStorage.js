const DEFAULT_PRODUCTS = [
  { id: 1, name: "Wireless Earbuds Pro", category: "Electronics", seller: "TechZone", price: "$49.99", mrp: "$79.99", stock: 450, sold: 2840, rating: 4.6, status: "Active", image: "🎧", description: "Premium wireless earbuds with noise cancellation" },
  { id: 2, name: "Cotton Kurta Set (Women)", category: "Fashion", seller: "FashionHub", price: "$24.99", mrp: "$39.99", stock: 1200, sold: 3200, rating: 4.3, status: "Active", image: "👗", description: "Comfortable cotton kurta set for women" },
  { id: 3, name: "Smart Watch X200", category: "Electronics", seller: "GadgetWorld", price: "$99.99", mrp: "$149.99", stock: 320, sold: 1850, rating: 4.7, status: "Active", image: "⌚", description: "Advanced smart watch with fitness tracking" },
  { id: 4, name: "Premium Face Serum", category: "Beauty", seller: "BeautyFirst", price: "$19.99", mrp: "$29.99", stock: 2800, sold: 4100, rating: 4.4, status: "Active", image: "✨", description: "Luxurious face serum for glowing skin" },
  { id: 5, name: "Yoga Mat Premium", category: "Sports", seller: "FitGear", price: "$29.99", mrp: "$44.99", stock: 680, sold: 1560, rating: 4.5, status: "Active", image: "🧘", description: "Non-slip premium yoga mat" },
  { id: 6, name: "Stainless Steel Bottle", category: "Home & Kitchen", seller: "HomeEssentials", price: "$14.99", mrp: "$24.99", stock: 0, sold: 890, rating: 4.1, status: "Out of Stock", image: "🍶", description: "Durable stainless steel water bottle" },
  { id: 7, name: "Running Shoes Air Max", category: "Fashion", seller: "ShoePalace", price: "$59.99", mrp: "$89.99", stock: 540, sold: 2100, rating: 4.8, status: "Active", image: "👟", description: "High-performance running shoes" },
  { id: 8, name: "Bluetooth Speaker Mini", category: "Electronics", seller: "TechZone", price: "$34.99", mrp: "$54.99", stock: 12, sold: 1340, rating: 4.2, status: "Low Stock", image: "🔊", description: "Portable bluetooth speaker with great sound" },
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
  // Preserve the uploaded image: use formData.image, or first in images array, or fallback icon
  const imageValue = formData.image
    || (Array.isArray(formData.images) && formData.images.length > 0 ? formData.images[0] : null)
    || "📦";
  const newProduct = {
    ...formData,
    id: Math.max(...products.map((p) => p.id), 0) + 1,
    sold: 0,
    rating: 0,
    image: imageValue,
    stock: parseInt(formData.stock),
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