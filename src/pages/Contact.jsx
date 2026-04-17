import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { 
  Mail, 
  Phone, 
  MapPin, 
  MessageSquare, 
  Clock, 
  ExternalLink, 
  CheckCircle2, 
  ArrowRight,
  HelpCircle,
  Truck,
  RotateCcw,
  ShieldCheck
} from "lucide-react";
import { Link } from "react-router-dom";

const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    reason: "",
    message: ""
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const reasons = [
    { value: "Order Issue", template: "Hi, I have an issue with my order. My order ID is ______. Please assist me." },
    { value: "Return / Refund", template: "Hi, I would like to request a return/refund for my order. Please guide me through the process." },
    { value: "Shipping Delay", template: "Hi, my order seems delayed. Can you please provide an update on the delivery status?" },
    { value: "Product Inquiry", template: "Hi, I would like more details about a product listed on your website." },
    { value: "Payment Issue", template: "Hi, I faced an issue while making a payment. Please assist me." },
    { value: "Others", template: "" }
  ];

  const handleReasonChange = (reasonValue) => {
    const selectedReason = reasons.find(r => r.value === reasonValue);
    setForm(prev => ({
      ...prev,
      reason: reasonValue,
      message: selectedReason?.template || ""
    }));
    if (errors.reason) {
      setErrors(prev => ({ ...prev, reason: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!form.reason) newErrors.reason = "Please select a reason";
    if (!form.message.trim()) newErrors.message = "Message is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      setTimeout(() => {
        setIsSubmitted(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 500);
    } else {
      toast.error("Please fix the errors in the form.");
    }
  };

  const inputCls = (error) => `
    w-full px-4 py-3.5 rounded-xl border transition-all duration-300 bg-background font-body text-sm
    ${error 
      ? "border-destructive ring-1 ring-destructive/20 focus:border-destructive" 
      : "border-border hover:border-accent/40 focus:border-accent focus:ring-4 focus:ring-accent/10"}
    outline-none placeholder:text-muted-foreground/50
  `;

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex flex-col bg-background selection:bg-accent selection:text-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center container mx-auto px-4 py-20">
          <div className="max-w-md w-full bg-card border border-border p-10 rounded-[32px] shadow-2xl shadow-black/[0.03] text-center space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-accent/10 text-accent mx-auto rounded-full flex items-center justify-center mb-2">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="font-display text-3xl font-bold text-foreground">Message Sent!</h2>
            <p className="font-body text-muted-foreground leading-relaxed">
              Thank you! We have received your message and will get back to you within 24 hours.
            </p>
            <button 
              onClick={() => setIsSubmitted(false)}
              className="inline-flex items-center gap-2 font-body text-sm font-bold text-accent hover:text-accent/80 transition-colors uppercase tracking-widest pt-4"
            >
              Back to Contact Form <ArrowRight size={16} />
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-accent selection:text-white">
      <Navbar />
      
      <div className="flex-1 container mx-auto px-4 py-16 lg:py-20 max-w-5xl">
        {/* ── Header ── */}
        <div className="text-center mb-16 space-y-4">
          <h1 className="font-display text-4xl lg:text-5xl font-bold text-foreground relative inline-block group">
            Get in Touch
            <span className="absolute -bottom-2 left-0 w-12 h-1 bg-accent/30 group-hover:w-full transition-all duration-700"></span>
          </h1>
          <p className="font-body text-muted-foreground max-w-xl mx-auto text-sm lg:text-base leading-relaxed">
            Have a question or need assistance? Our team is here to help you experience the finest handcrafted elegance.
          </p>
        </div>

        {/* ── Section 1: Centered Contact Form ── */}
        <div className="max-w-3xl mx-auto mb-24">
          <div className="bg-card border border-border p-8 lg:p-12 rounded-[40px] shadow-2xl shadow-black/[0.03]">
            <div className="mb-10 text-center">
              <h3 className="font-display text-3xl font-bold text-foreground mb-2">Send a Message</h3>
              <p className="font-body text-sm text-muted-foreground">Fill out the form below and we'll connect with you shortly.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground ml-1">Full Name *</label>
                  <input 
                    name="name" 
                    placeholder="e.g. Jane Doe" 
                    value={form.name} 
                    onChange={(e) => setForm({ ...form, name: e.target.value })} 
                    className={inputCls(errors.name)} 
                  />
                  {errors.name && <p className="text-[10px] text-destructive font-bold ml-1">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground ml-1">Email Address *</label>
                  <input 
                    name="email" 
                    type="email" 
                    placeholder="e.g. hello@website.com" 
                    value={form.email} 
                    onChange={(e) => setForm({ ...form, email: e.target.value })} 
                    className={inputCls(errors.email)} 
                  />
                  {errors.email && <p className="text-[10px] text-destructive font-bold ml-1">{errors.email}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground ml-1">Phone Number (Optional)</label>
                  <input 
                    name="phone" 
                    placeholder="e.g. +91 98765 43210" 
                    value={form.phone} 
                    onChange={(e) => setForm({ ...form, phone: e.target.value })} 
                    className={inputCls()} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground ml-1">Reason for Contact *</label>
                  <select 
                    value={form.reason}
                    onChange={(e) => handleReasonChange(e.target.value)}
                    className={inputCls(errors.reason)}
                  >
                    <option value="" disabled>Select a reason...</option>
                    {reasons.map(r => (
                      <option key={r.value} value={r.value}>{r.value}</option>
                    ))}
                  </select>
                  {errors.reason && <p className="text-[10px] text-destructive font-bold ml-1">{errors.reason}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground ml-1">Your Message *</label>
                <textarea 
                  placeholder={form.reason === "Others" ? "Please describe your issue in detail..." : "Your message here..."} 
                  value={form.message} 
                  onChange={(e) => setForm({ ...form, message: e.target.value })} 
                  rows={5} 
                  className={inputCls(errors.message) + " resize-none"} 
                />
                {errors.message && <p className="text-[10px] text-destructive font-bold ml-1">{errors.message}</p>}
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  className="group relative w-full py-5 bg-primary text-primary-foreground font-body text-[11px] font-black tracking-[0.3em] uppercase overflow-hidden transition-all hover:shadow-2xl hover:shadow-primary/20 active:scale-95 rounded-2xl"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    Send Message <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </span>
                  <div className="absolute inset-0 bg-accent translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ── Section 2: Two-Column Info & Help ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 mb-24">
          
          {/* Left: Our Concierge */}
          <div className="space-y-8 animate-in slide-in-from-left duration-700">
            <h3 className="font-display text-2xl lg:text-3xl font-bold text-foreground">Our Concierge</h3>
            <div className="space-y-6">
              {[
                { icon: Mail, label: "Email", text: "care@trendydrapes.com", link: "mailto:care@trendydrapes.com" },
                { icon: Phone, label: "Phone", text: "+91 98765 43210", link: "tel:+919876543210" },
                { icon: MapPin, label: "Address", text: "Mumbai, Maharashtra, India", link: null },
                { icon: Clock, label: "Working Hours", text: "Mon–Sat, 9 AM – 6 PM", link: null },
              ].map(({ icon: Icon, label, text, link }, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-secondary/80 flex items-center justify-center shrink-0 group-hover:bg-accent group-hover:text-white transition-all duration-300">
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold mb-0.5">{label}</p>
                    {link ? (
                      <a href={link} className="text-base font-medium text-foreground hover:text-accent transition-colors">{text}</a>
                    ) : (
                      <span className="text-base font-medium text-foreground">{text}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {/* WhatsApp Link Integrated Here optionally */}
            <div className="pt-4">
              <a 
                 href="https://wa.me/919876543210" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="inline-flex items-center gap-2 text-sm font-bold text-[#25D366] hover:opacity-80 transition-opacity"
              >
                <MessageSquare size={18} /> Chat with a Specialist
              </a>
            </div>
          </div>

          {/* Right: Need Help */}
          <div className="space-y-8 animate-in slide-in-from-right duration-700">
            <h3 className="font-display text-2xl lg:text-3xl font-bold text-foreground">Need Help?</h3>
            <div className="grid grid-cols-1 gap-4">
              {[
                { label: "Track Your Order", to: "/orders", icon: Truck },
                { label: "Returns & Refunds", to: "/privacy", icon: RotateCcw },
                { label: "Shipping Info", to: "/privacy", icon: ShieldCheck },
                { label: "Frequently Asked Questions", to: "/about", icon: HelpCircle }
              ].map((item, i) => (
                <Link 
                  key={i} 
                  to={item.to} 
                  className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-accent/40 group transition-all bg-card/40"
                >
                  <div className="flex items-center gap-4">
                    <item.icon size={18} className="text-accent" />
                    <span className="text-sm font-medium font-body text-foreground/80 group-hover:text-accent">{item.label}</span>
                  </div>
                  <ArrowRight size={14} className="text-muted-foreground group-hover:text-accent transform group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── Section 3: Centered Map (Fixed Width) ── */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h4 className="font-display text-xl font-bold text-foreground flex items-center justify-center gap-2">
              <MapPin size={20} className="text-accent" /> Find Our Studio
            </h4>
          </div>
          <div className="w-full aspect-[21/9] rounded-[40px] overflow-hidden border border-border relative grayscale hover:grayscale-0 transition-all duration-1000 shadow-2xl shadow-black/[0.05]">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d120638.15610815467!2d72.74838321!3d19.08252234!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c6306644edc1%3A0x139ae535091807ea!2sMumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1712750000000!5m2!1sen!2sin" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>

      </div>
      
      <Footer />
    </div>
  );
};

export default Contact;
