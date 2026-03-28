import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import CategoryGrid from "@/components/CategoryGrid";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";


const Home = () => {
  const trending = products.filter((p) => p.discount >= 30).slice(0, 8);
  const newArrivals = products.filter((p) => p.isNew).slice(0, 8);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <HeroSection />
      <CategoryGrid />

      {/* Trending Section */}
      <section id="trending-section" className="container mx-auto px-4 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="font-body text-xs tracking-[0.3em] uppercase text-muted-foreground mb-2">Curated For You</p>
            <h2 className="font-display text-3xl lg:text-4xl font-semibold text-foreground">Trending Now</h2>
          </div>
          <Link
            to="/collections"
            className="font-body text-sm font-medium text-accent hover:text-accent/80 tracking-wider uppercase transition-colors"
          >
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {trending.map((product, i) => (
            <div key={product.id} className="animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>

      {/* Banner */}
      <section className="bg-primary py-16">
        <div className="container mx-auto px-4 text-center">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-gold-light mb-3">Limited Time</p>
          <h2 className="font-display text-3xl lg:text-4xl font-semibold text-primary-foreground mb-4">
            Bridal Season Sale
          </h2>
          <p className="font-body text-sm text-primary-foreground/70 max-w-md mx-auto mb-6">
            Up to 40% off on our exclusive bridal collection. Use code BRIDE40 at checkout.
          </p>
          <Link
            to="/collections?category=Bridal"
            className="inline-block px-10 py-3.5 bg-accent text-accent-foreground font-body text-sm font-semibold tracking-wider uppercase hover:opacity-90 transition-opacity"
          >
            Shop Bridal
          </Link>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="font-body text-xs tracking-[0.3em] uppercase text-muted-foreground mb-2">Just In</p>
            <h2 className="font-display text-3xl lg:text-4xl font-semibold text-foreground">New Arrivals</h2>
          </div>
          <Link
            to="/collections?sort=new"
            className="font-body text-sm font-medium text-accent hover:text-accent/80 tracking-wider uppercase transition-colors"
          >
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {newArrivals.map((product, i) => (
            <div key={product.id} className="animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border py-12">
        <div className="container mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {[
            { title: "Free Shipping", desc: "On orders above ₹4,999" },
            { title: "Easy Returns", desc: "15-day hassle-free returns" },
            { title: "Authentic Craft", desc: "100% handcrafted products" },
            { title: "Secure Payment", desc: "Multiple payment options" },
          ].map((f) => (
            <div key={f.title}>
              <h4 className="font-display text-lg font-semibold text-foreground">{f.title}</h4>
              <p className="font-body text-xs text-muted-foreground mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
