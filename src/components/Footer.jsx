import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-primary text-primary-foreground mt-16">
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="font-display text-xl font-semibold mb-4">Trendy Drapes</h3>
          <p className="text-sm opacity-80 font-body leading-relaxed">
            Curating the finest handcrafted sarees and ethnic wear since 2024. Every drape tells a story of tradition and elegance.
          </p>
        </div>
        <div>
          <h4 className="font-body text-xs tracking-widest uppercase font-semibold mb-4">Shop</h4>
          <ul className="space-y-2 text-sm opacity-80 font-body">
            <li><Link to="/collections" className="hover:opacity-100 transition-opacity">Sarees</Link></li>
            <li><Link to="/collections?category=Lehengas" className="hover:opacity-100 transition-opacity">Lehengas</Link></li>
            <li><Link to="/collections?category=Indo-Western" className="hover:opacity-100 transition-opacity">Indo-Western</Link></li>
            <li><Link to="/collections?category=Jewellery" className="hover:opacity-100 transition-opacity">Jewellery</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-body text-xs tracking-widest uppercase font-semibold mb-4">Company</h4>
          <ul className="space-y-2 text-sm opacity-80 font-body">
            <li><Link to="/about" className="hover:opacity-100 transition-opacity">About Us</Link></li>
            <li><Link to="/contact" className="hover:opacity-100 transition-opacity">Contact Us</Link></li>
            <li><Link to="/privacy" className="hover:opacity-100 transition-opacity">Privacy Policy</Link></li>
            <li><Link to="/profile" className="hover:opacity-100 transition-opacity">My Account</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-body text-xs tracking-widest uppercase font-semibold mb-4">Connect</h4>
          <ul className="space-y-2 text-sm opacity-80 font-body">
            <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-100 transition-opacity">Instagram</a></li>
            <li><a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-100 transition-opacity">Facebook</a></li>
            <li><a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-100 transition-opacity">Pinterest</a></li>
            <li><a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="hover:opacity-100 transition-opacity">WhatsApp</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/20 mt-10 pt-6 text-center text-xs opacity-60 font-body">
        © 2026 Trendy Drapes. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
