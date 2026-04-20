import { Link } from "react-router-dom";
import saree1 from "@/assets/saree-1.jpg";
import categoryBridal from "@/assets/category-bridal.jpg";
import categoryLehenga from "@/assets/category-lehenga.jpg";
import categoryIndowestern from "@/assets/category-indowestern.jpg";
import categoryJewellery from "@/assets/category-jewellery.jpg";

const categories = [
  { name: "Sarees", image: saree1, link: "/collections" },
  { name: "Bridal", image: categoryBridal, link: "/collections?category=Bridal" },
  { name: "Lehengas", image: categoryLehenga, link: "/collections?category=Lehengas" },
  { name: "Indo-Western", image: categoryIndowestern, link: "/collections?category=Indo-Western" },
  { name: "Jewellery", image: categoryJewellery, link: "/collections?category=Jewellery" },
];

const CategoryGrid = () => (
  <section className="container mx-auto px-4 py-16">
    <div className="text-center mb-10">
      <p className="font-body text-xs tracking-[0.3em] uppercase text-muted-foreground mb-2">Browse By</p>
      <h2 className="font-display text-3xl lg:text-4xl font-semibold text-foreground">Shop Categories</h2>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {categories.map((cat) => (
        <Link
          key={cat.name}
          to={cat.link}
          className="group relative aspect-[3/4] overflow-hidden"
        >
          <img
            src={cat.image}
            alt={cat.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
            width={640}
            height={800}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
            <h3 className="font-display text-lg lg:text-xl font-semibold text-primary-foreground">
              {cat.name}
            </h3>
            <span className="font-body text-xs text-primary-foreground/70 tracking-wider uppercase group-hover:text-gold-light transition-colors">
              Shop Now →
            </span>
          </div>
        </Link>
      ))}
    </div>
  </section>
);

export default CategoryGrid;
