import saree1 from "@/assets/saree-1.jpg";
import saree2 from "@/assets/saree-2.jpg";
import saree3 from "@/assets/saree-3.jpg";
import saree4 from "@/assets/saree-4.jpg";
import saree5 from "@/assets/saree-5.jpg";
import saree6 from "@/assets/saree-6.jpg";
import saree7 from "@/assets/saree-7.jpg";
import saree8 from "@/assets/saree-8.jpg";
import saree9 from "@/assets/saree-9.jpg";
import saree10 from "@/assets/saree-10.jpg";
import saree11 from "@/assets/saree-11.jpg";
import saree12 from "@/assets/saree-12.jpg";
import bridal1 from "@/assets/bridal-1.jpg";
import bridal2 from "@/assets/bridal-2.jpg";
import lehenga1 from "@/assets/lehenga-1.jpg";
import lehenga2 from "@/assets/lehenga-2.jpg";
import indowestern1 from "@/assets/indowestern-1.jpg";
import indowestern2 from "@/assets/indowestern-2.jpg";
import jewellery1 from "@/assets/jewellery-1.jpg";
import jewellery2 from "@/assets/jewellery-2.jpg";
import jewelery3 from "@/assets/jewelery-3.jpg";
import jewellery4 from "@/assets/jewellery-4.jpg";
import jewellery5 from "@/assets/jewellery-5.jpg";
import jewellery6 from "@/assets/jewellery-6.jpg";
import jewellery7 from "@/assets/jewellery-7.jpg";
import jewellery8 from "@/assets/jewellery-8.jpg";
import iwe3 from "@/assets/iw-3.jpg";
import iwe4 from "@/assets/iw-4.jpg";
import iwe6 from "@/assets/iw-6.jpg";
import iwe7 from "@/assets/iw-7.jpg";
import iwe8 from "@/assets/iw-8.jpg";
import iwe9 from "@/assets/iw-9.jpg";
import l3 from "@/assets/l-3.jpg";
import l4 from "@/assets/l-4.jpg";
import l5 from "@/assets/l-5.jpg";
import l6 from "@/assets/l-6.jpg";
import l7 from "@/assets/l-7.jpg";
import l8 from "@/assets/l-8.jpg";
import b1 from "@/assets/b-1.jpg";
import b4 from "@/assets/b-4.jpg";
import b5 from "@/assets/b-5.jpg";
import b6 from "@/assets/b-6.jpg";
import b7 from "@/assets/b-7.jpg";
import b8 from "@/assets/b-8.jpg";
import b9 from "@/assets/b-9.jpg";
import b10 from "@/assets/b-10.jpg";

export const products = [];


export const categories = [
  "Sarees", "Bridal", "Lehengas", "Indo-Western", "Jewellery", "Sale"
];

export const filterOptions = {
  price: [
    { label: "Under ₹5,000",       min: 0,     max: 5000     },
    { label: "₹5,000 - ₹10,000",   min: 5000,  max: 10000    },
    { label: "₹10,000 - ₹20,000",  min: 10000, max: 20000    },
    { label: "₹20,000 - ₹50,000",  min: 20000, max: 50000    },
    { label: "Above ₹50,000",       min: 50000, max: Infinity },
  ],
  discount: ["10% and above", "20% and above", "30% and above", "40% and above", "50% and above"],

  // ── Per-category structure (used by FilterSidebar when a category is active) ──
  byCategory: {
    Sarees: {
      subCategories: ["Silk Sarees", "Cotton Sarees", "Georgette Sarees", "Chiffon Sarees", "Designer Sarees"],
      fabrics:       ["Silk", "Cotton", "Georgette", "Chiffon", "Organza"],
      works:         ["Zari Work", "Embroidery", "Stone Work", "Thread Work", "Mirror Work"],
      patterns:      ["Floral", "Paisley", "Printed", "Striped", "Checked"],
    },
    Lehengas: {
      subCategories: ["Bridal Lehenga", "Party Wear Lehenga", "Designer Lehenga", "A-Line Lehenga", "Circular Lehenga"],
      fabrics:       ["Silk", "Velvet", "Net", "Georgette", "Satin"],
      works:         ["Heavy Embroidery", "Zari Work", "Sequins Work", "Mirror Work", "Thread Work"],
      patterns:      ["Floral", "Embroidered", "Printed", "Traditional Motifs", "Abstract"],
    },
    Bridal: {
      subCategories: ["Bridal Sarees", "Bridal Lehenga", "Bridal Gowns", "Reception Outfits", "Engagement Outfits"],
      fabrics:       ["Silk", "Velvet", "Net", "Organza", "Satin"],
      works:         ["Heavy Zari", "Embroidery", "Stone Work", "Sequins", "Kundan Work"],
      patterns:      ["Traditional", "Embroidered", "Floral", "Rich Motifs", "Designer Patterns"],
    },
    "Indo-Western": {
      subCategories: ["Indo-Western Gowns", "Crop Top Sets", "Jacket Style Outfits", "Dhoti Style Outfits", "Fusion Wear"],
      fabrics:       ["Georgette", "Crepe", "Silk Blend", "Satin", "Net"],
      works:         ["Light Embroidery", "Sequins Work", "Digital Print", "Thread Work", "Minimal Work"],
      patterns:      ["Abstract", "Printed", "Fusion Patterns", "Floral", "Contemporary"],
    },
    Jewellery: {
      subCategories: ["Necklace Sets", "Choker Sets", "Earrings", "Bangles", "Maang Tikka"],
      fabrics:       ["Gold Plated", "Silver", "Kundan", "Artificial", "Pearl"],
      works:         ["Stone Work", "Kundan Work", "Beaded Work", "Meenakari", "Antique Finish"],
      patterns:      ["Traditional", "Temple Design", "Bridal", "Contemporary", "Minimal"],
    },
  },

  // ── Flat lists (used when no category filter is active — e.g. Sale page) ──
  subCategories: [
    "Silk Sarees", "Cotton Sarees", "Georgette Sarees", "Chiffon Sarees", "Designer Sarees",
    "Bridal Lehenga", "Party Wear Lehenga", "Designer Lehenga", "A-Line Lehenga", "Circular Lehenga",
    "Bridal Sarees", "Bridal Gowns", "Reception Outfits", "Engagement Outfits",
    "Indo-Western Gowns", "Crop Top Sets", "Jacket Style Outfits", "Dhoti Style Outfits", "Fusion Wear",
    "Necklace Sets", "Choker Sets", "Earrings", "Bangles", "Maang Tikka",
  ],
  sizes:    ["Free Size", "S", "M", "L", "XL"],
  colors:   ["Red", "Navy Blue", "Green", "Pink", "Purple", "Maroon", "Blue", "Orange", "Black", "White", "Yellow", "Gold", "Silver"],
  fabrics:  ["Silk", "Cotton", "Georgette", "Chiffon", "Organza", "Velvet", "Net", "Satin", "Crepe", "Silk Blend", "Gold Plated", "Silver", "Kundan", "Artificial", "Pearl"],
  works:    ["Zari Work", "Embroidery", "Stone Work", "Thread Work", "Mirror Work", "Heavy Embroidery", "Zari Work", "Sequins Work", "Heavy Zari", "Kundan Work", "Light Embroidery", "Digital Print", "Minimal Work", "Beaded Work", "Meenakari", "Antique Finish"],
  patterns: ["Floral", "Paisley", "Printed", "Striped", "Checked", "Embroidered", "Traditional Motifs", "Abstract", "Traditional", "Rich Motifs", "Designer Patterns", "Fusion Patterns", "Contemporary", "Temple Design", "Bridal", "Minimal"],
};

export const sortOptions = [
  { label: "Trending",           value: "trending"    },
  { label: "New Arrivals",       value: "new"         },
  { label: "Price: Low to High", value: "price-asc"   },
  { label: "Price: High to Low", value: "price-desc"  },
  { label: "Discount",           value: "discount"    },
];