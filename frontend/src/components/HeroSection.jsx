import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg";
import s1 from "@/assets/h1.jpg";
import s3 from "@/assets/h2.jpg";
import saree6 from "@/assets/saree-6.jpg";

const slides = [
  {
    image: heroBanner,
    subtitle: "New Collection 2026",
    title: <>The Art of <br /><span className="text-gold-light italic">Timeless</span> Elegance</>,
    description: "Discover our curated collection of handcrafted sarees, where tradition meets contemporary luxury.",
  },
  {
    image: s1,
    subtitle: "Bridal Season",
    title: <>Celebrate Your <br /><span className="text-gold-light italic">Special</span> Day</>,
    description: "Explore our exclusive bridal collection featuring handwoven masterpieces for your most cherished moments.",
  },
  {
    image: s3,
    subtitle: "Designer Edit",
    title: <>Modern <br /><span className="text-gold-light italic">Glamour</span> Redefined</>,
    description: "Statement sarees with sequin, mirror work & contemporary designs for the bold and beautiful.",
  },
  {
    image: saree6,
    subtitle: "Festive Collection",
    title: <>Tradition Meets <br /><span className="text-gold-light italic">Luxury</span></>,
    description: "Rich velvet and silk sarees with heavy embroidery for weddings and grand celebrations.",
  },
];

const HeroSection = () => {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent((p) => (p + 1) % slides.length), []);
  const prev = useCallback(() => setCurrent((p) => (p - 1 + slides.length) % slides.length), []);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const scrollToProducts = () => {
    document.getElementById("trending-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const slide = slides[current];

  return (
    <section className="relative h-[70vh] lg:h-[85vh] overflow-hidden">
      {slides.map((s, i) => (
        <img
          key={i}
          src={s.image}
          alt={`Slide ${i + 1}`}
          className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-700 ${i === current ? "opacity-100" : "opacity-0"}`}
          width={1920}
          height={800}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/40 to-transparent" />
      <div className="absolute inset-0 flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-xl space-y-6">
            <p className="font-body text-xs tracking-[0.3em] uppercase text-gold-light">
              {slide.subtitle}
            </p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-primary-foreground leading-tight">
              {slide.title}
            </h1>
            <p className="font-body text-sm md:text-base text-primary-foreground/80 max-w-md">
              {slide.description}
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/collections"
                className="px-8 py-3.5 bg-accent text-accent-foreground font-body text-sm font-semibold tracking-wider uppercase hover:opacity-90 transition-opacity"
              >
                Shop Now
              </Link>
              <button
                onClick={scrollToProducts}
                className="px-8 py-3.5 border border-primary-foreground/50 text-primary-foreground font-body text-sm font-semibold tracking-wider uppercase hover:bg-primary-foreground/10 transition-colors"
              >
                Explore Collection
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Arrows */}
      <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-card/30 backdrop-blur-sm rounded-full hover:bg-card/60 transition-colors">
        <ChevronLeft size={24} className="text-primary-foreground" />
      </button>
      <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-card/30 backdrop-blur-sm rounded-full hover:bg-card/60 transition-colors">
        <ChevronRight size={24} className="text-primary-foreground" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${i === current ? "bg-gold-light w-8" : "bg-primary-foreground/50"}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
