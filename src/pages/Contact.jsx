import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { Mail, Phone, MapPin } from "lucide-react";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill all fields");
      return;
    }
    toast.success("Message sent! We'll get back to you soon.");
    setForm({ name: "", email: "", message: "" });
  };

  const inputCls = "w-full px-4 py-3 border border-border bg-card text-sm font-body text-foreground focus:outline-none focus:ring-1 focus:ring-accent";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12 flex-1">
        <h1 className="font-display text-4xl font-semibold text-foreground mb-8 text-center">Contact Us</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-4xl mx-auto">
          <div className="space-y-6">
            <p className="font-body text-sm text-muted-foreground">We'd love to hear from you. Send us a message and we'll respond.</p>
            <div className="space-y-4">
              {[
                { icon: Mail, text: "care@trendydrapes.com" },
                { icon: Phone, text: "+91 98765 43210" },
                { icon: MapPin, text: "Mumbai, Maharashtra, India" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <Icon size={18} className="text-accent flex-shrink-0" />
                  <span className="font-body text-sm text-foreground">{text}</span>
                </div>
              ))}
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input name="name" placeholder="Your Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
            <input name="email" type="email" placeholder="Your Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} />
            <textarea placeholder="Your Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={5} className={inputCls + " resize-none"} />
            <button type="submit" className="w-full py-3.5 bg-primary text-primary-foreground font-body text-sm font-semibold tracking-wider uppercase hover:opacity-90 transition-opacity">
              Send Message
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Contact;
