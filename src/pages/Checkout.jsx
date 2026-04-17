import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/utils/api";
import emailjs from "emailjs-com";
import { Lock, ChevronDown, ChevronUp, Tag, Truck, ShieldCheck, CreditCard, Smartphone, Building2, Wallet, CheckCircle2, AlertCircle } from 'lucide-react';

// ── GST rate ──────────────────────────────────────────────────
const GST_RATE = 0.05; // 5%
const COUPONS = {
  TRENDY10:  { type: 'percent', value: 10,  label: '10% off' },
  FIRST50:   { type: 'flat',    value: 50,  label: '₹50 off' },
  SAVE100:   { type: 'flat',    value: 100, label: '₹100 off (orders above ₹999)' },
};

// ── Helpers ───────────────────────────────────────────────────
const fmt = (n) => Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const validate = {
  name:    v => !v.trim() ? 'Full name is required' : v.trim().length < 2 ? 'Enter a valid name' : '',
  email:   v => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? 'Enter a valid email' : '',
  phone:   v => !/^[6-9]\d{9}$/.test(v.replace(/\s/g, '')) ? 'Enter a valid 10-digit mobile number' : '',
  pincode: v => !/^\d{6}$/.test(v.trim()) ? 'Enter a valid 6-digit pincode' : '',
  door:    v => !v.trim() ? 'Door / flat number is required' : '',
  street:  v => !v.trim() ? 'Street / area is required' : '',
  city:    v => !v.trim() ? 'City is required' : '',
  state:   v => !v.trim() ? 'State is required' : '',
  card:    v => !/^\d{16}$/.test(v.replace(/\s/g, '')) ? 'Enter a valid 16-digit card number' : '',
  expiry:  v => !/^(0[1-9]|1[0-2])\/\d{2}$/.test(v) ? 'Format: MM/YY' : '',
  cvv:     v => !/^\d{3,4}$/.test(v) ? 'Enter 3 or 4 digit CVV' : '',
  upi:     v => !/^[\w.\-+]+@[\w]+$/.test(v.trim()) ? 'Enter a valid UPI ID (e.g. name@upi)' : '',
};

const STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh','Puducherry'];

// ── Email Helper ──────────────────────────────────────────────
const sendOrderEmail = (delivery, items, totals, orderId) => {
  const itemListHTML = items.map(item => `
    <div class="item">
      <span>${item.product.name} x ${item.quantity}</span>
      <span>₹${item.product.price * item.quantity}</span>
    </div>
  `).join("");

  const templateParams = {
    name: delivery.name,
    email: delivery.email,
    phone: delivery.phone,
    door: delivery.door,
    street: delivery.street,
    city: delivery.city,
    state: delivery.state,
    pincode: delivery.pincode,
    order_id: orderId,
    items: itemListHTML,
    subtotal: totals.subtotal,
    delivery: totals.delivery,
    platform_fee: totals.platformFee,
    gst: totals.gst,
    total: totals.total,
    brand_name: "Trendy Drapes",
    email_subject: "Order Confirmation - Trendy Drapes",
    email_header: "Order Received - Trendy Drapes",
    email_footer: "Thank you for shopping with Trendy Drapes! Visit us again soon."
  };

 emailjs.send(
    import.meta.env.VITE_EMAILJS_SERVICE_ID,
    import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
    templateParams,
    import.meta.env.VITE_EMAILJS_PUBLIC_KEY
  )
  .then(() => console.log("Email sent"))
  .catch(err => console.log(err));
};

// ── Step indicator ────────────────────────────────────────────
const StepBar = ({ step }) => (
  <div className="flex items-center justify-center gap-0 p-8 sm:p-10 bg-white border-b border-[#ecdec8] mb-10">
    {['Delivery', 'Payment', 'Confirm'].map((s, i) => (
      <React.Fragment key={s}>
        <div className={`flex items-center gap-3 text-[0.9rem] font-semibold tracking-wider transition-colors ${
          step === i + 1 ? 'text-[#c47c1a]' : step > i + 1 ? 'text-[#4caf50]' : 'text-[#bba98a]'
        }`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[0.85rem] font-bold shrink-0 transition-all duration-300 ${
            step === i + 1 ? 'bg-[#c47c1a] text-white shadow-[0_0_0_4px_rgba(196,124,26,0.15)] ring-1 ring-[#c47c1a]' : 
            step > i + 1 ? 'bg-[#4caf50] text-white' : 'bg-[#fdf8f2] text-[#bba98a] border border-[#ecdec8]'
          }`}>
            {step > i + 1 ? <CheckCircle2 size={18} /> : i + 1}
          </div>
          <span className="hidden sm:inline font-display">{s}</span>
        </div>
        {i < 2 && (
          <div className={`w-16 sm:w-24 h-[1.5px] mx-3 transition-colors duration-500 ${step > i + 1 ? 'bg-[#4caf50]' : 'bg-[#ecdec8]'}`} />
        )}
      </React.Fragment>
    ))}
  </div>
);

// ── Section wrapper ───────────────────────────────────────────
const Section = ({ title, children }) => (
  <div className="bg-white rounded-[24px] p-8 sm:p-10 border border-[#ecdec8] shadow-[0_10px_40px_rgba(180,120,0,0.06)] ring-1 ring-[#ecdec8]/40 mb-8 transition-all hover:shadow-[0_15px_50px_rgba(180,120,0,0.09)]">
    <h3 className="font-display text-[1rem] font-bold text-[#7a4f1e] tracking-[0.2em] mb-8 pb-4 border-b border-[#f3e6d3] uppercase">
      {title}
    </h3>
    {children}
  </div>
);

// ── Field ─────────────────────────────────────────────────────
const Field = ({ label, error, children }) => (
  <div className="mb-6 last:mb-0">
    <label className="block text-[0.8rem] font-bold text-[#9a7850] tracking-[0.15em] uppercase mb-2.5 ml-1">{label}</label>
    {children}
    {error && (
      <span className="flex items-center gap-1.5 text-[0.75rem] font-medium text-red-500 mt-2 ml-1">
        <AlertCircle size={14} /> {error}
      </span>
    )}
  </div>
);

// ════════════════════════════════════════════════════════════
//  ORDER SUMMARY (right column)
// ════════════════════════════════════════════════════════════
const OrderSummary = ({ cartItems, couponCode, setCouponCode, couponApplied, setCouponApplied, couponError, setCouponError }) => {
  const [open, setOpen] = useState(true);
  const [inputCode, setInputCode] = useState(couponCode);

  const subtotal  = cartItems.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const savings   = cartItems.reduce((s, i) => s + ((i.product.originalPrice ?? i.product.price) - i.product.price) * i.quantity, 0);
  const delivery  = 49;
  const platformFee = 19;
  const gst       = subtotal * GST_RATE;

  let couponDisc = 0;
  if (couponApplied && COUPONS[couponApplied]) {
    const c = COUPONS[couponApplied];
    if (c.type === 'percent') couponDisc = subtotal * c.value / 100;
    else if (c.type === 'flat') {
      if (couponApplied === 'SAVE100' && subtotal < 999) couponDisc = 0;
      else couponDisc = c.value;
    }
  }

  const total = subtotal + delivery + platformFee + gst - couponDisc;

  const handleApplyCoupon = () => {
    const code = inputCode.trim().toUpperCase();
    if (!code) { setCouponError('Enter a coupon code'); return; }
    if (!COUPONS[code]) { setCouponError('Invalid coupon code'); setCouponApplied(''); return; }
    if (code === 'SAVE100' && subtotal < 999) { setCouponError('Minimum order ₹999 required for SAVE100'); setCouponApplied(''); return; }
    setCouponApplied(code);
    setCouponCode(code);
    setCouponError('');
  };

  const handleRemoveCoupon = () => {
    setCouponApplied('');
    setCouponCode('');
    setInputCode('');
    setCouponError('');
  };

  return (
    <div className="bg-white rounded-[24px] border border-[#ecdec8] shadow-[0_15px_45px_rgba(180,120,0,0.08)] sticky top-8 overflow-hidden transition-all">
      <div className="flex justify-between items-center px-6 py-6 font-display text-[1.1rem] font-bold text-[#7a4f1e] tracking-tight bg-[#fdf9f4] border-b border-[#ecdec8] cursor-pointer select-none" onClick={() => setOpen(o => !o)}>
        <span className="flex items-center gap-2">Order Summary <span className="w-5 h-5 rounded-full bg-[#f3e6d3] text-[#7a4f1e] text-[0.65rem] flex items-center justify-center">{cartItems.length}</span></span>
        {open ? <ChevronUp size={20} className="text-[#bba98a]" /> : <ChevronDown size={20} className="text-[#bba98a]" />}
      </div>

      {open && (
        <>
          {/* Items */}
          <div className="p-6 flex flex-col gap-5 border-b border-[#ecdec8] max-h-[340px] overflow-y-auto custom-scrollbar">
            {cartItems.map(item => (
              <div key={item.id} className="flex items-center gap-5 group">
                <div className="relative shrink-0 overflow-hidden rounded-xl border border-[#ecdec8] bg-[#fdf8f2]">
                  <img src={item.product.images[0]} alt={item.product.name} className="w-16 h-20 object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={e => e.target.style.display = 'none'} />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#c47c1a] text-white rounded-full text-[0.68rem] font-black flex items-center justify-center shadow-md">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[0.88rem] font-bold text-[#2d1f0e] leading-tight mb-1 truncate">{item.product.name}</p>
                  <p className="text-[0.72rem] text-[#9a7850] font-medium tracking-wide uppercase opacity-70">{item.product.category}</p>
                  <p className="text-[0.8rem] font-semibold text-[#c47c1a] mt-1.5 sm:hidden">₹{fmt(item.product.price * item.quantity)}</p>
                </div>
                <span className="hidden sm:block text-[0.95rem] font-black text-[#2d1f0e] shrink-0 tracking-tighter">₹{fmt(item.product.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          {/* Coupon */}
          <div className="p-6 border-b border-[#ecdec8] bg-[#fefaf4]">
            <div className="flex items-center gap-3 text-[#7a4f1e] mb-3">
              <Tag size={18} className="text-[#c47c1a]" />
              <span className="text-[0.85rem] font-bold tracking-tight">Apply Promo Code</span>
            </div>
            <div className="flex gap-2.5">
              {couponApplied ? (
                <div className="flex items-center justify-between flex-1 bg-white border-[1.5px] border-[#4caf50]/30 rounded-xl px-4 py-3">
                  <div className="flex flex-col">
                    <span className="text-[0.8rem] font-black text-[#2d7a2d] tracking-wide">{couponApplied}</span>
                    <span className="text-[0.65rem] text-[#4caf50] font-bold uppercase tracking-widest">Discount Applied</span>
                  </div>
                  <button className="text-[0.7rem] font-black text-[#d9534f] uppercase tracking-widest hover:underline bg-transparent border-none cursor-pointer" onClick={handleRemoveCoupon}>Remove</button>
                </div>
              ) : (
                <>
                  <input className="flex-1 px-4 py-3 border-[1.5px] border-[#e0cdb0] rounded-xl font-body text-[0.9rem] text-[#2d1f0e] bg-white outline-none focus:border-[#c47c1a] focus:ring-4 focus:ring-[#c47c1a]/10 transition-all placeholder:text-[#bba98a]" placeholder="Ex: TRENDY10"
                    value={inputCode} onChange={e => { setInputCode(e.target.value.toUpperCase()); setCouponError(''); }} />
                  <button className="px-6 py-3 bg-[#2a1800] text-[#f0c060] border-none rounded-xl font-display text-[0.8rem] font-bold tracking-widest cursor-pointer transition-all hover:bg-[#1e1000] active:scale-95" onClick={handleApplyCoupon}>APPLY</button>
                </>
              )}
            </div>
            {couponError && <p className="text-[0.72rem] font-bold text-[#d9534f] mt-2.5 flex items-center gap-1.5"><AlertCircle size={14} /> {couponError}</p>}
          </div>

          {/* Price rows */}
          <div className="p-6 flex flex-col gap-3 bg-white">
            <div className="flex justify-between text-[0.92rem] font-medium text-[#5a3a1a]/80">
              <span className="font-display tracking-[0.05em]">Subtotal</span>
              <span className="font-bold text-[#2d1f0e]">₹{fmt(subtotal)}</span>
            </div>
            
            {savings > 0 && (
              <div className="flex justify-between text-[0.92rem] font-bold text-[#2d7a2d]">
                <span className="font-display tracking-[0.05em]">Product Savings</span>
                <span>−₹{fmt(savings)}</span>
              </div>
            )}
            
            {couponDisc > 0 && (
              <div className="flex justify-between text-[0.92rem] font-bold text-[#2d7a2d]">
                <span className="font-display tracking-[0.05em]">Coupon Savings</span>
                <span>−₹{fmt(couponDisc)}</span>
              </div>
            )}

            <div className="flex justify-between text-[0.92rem] font-medium text-[#5a3a1a]/80">
              <span className="font-display tracking-[0.05em]">Delivery Fee</span>
              <span className={delivery === 0 ? "text-[#4caf50] uppercase text-[0.75rem] font-black" : "font-bold text-[#2d1f0e]"}>{delivery === 0 ? "FREE" : `₹${fmt(delivery)}`}</span>
            </div>

            <div className="flex justify-between text-[0.92rem] font-medium text-[#5a3a1a]/80">
              <span className="font-display tracking-[0.05em]">Platform Fee</span>
              <span className="font-bold text-[#2d1f0e]">₹{fmt(platformFee)}</span>
            </div>

            <div className="flex justify-between text-[0.92rem] font-medium text-[#5a3a1a]/80">
              <span className="font-display tracking-[0.05em]">Tax (GST 5%)</span>
              <span className="font-bold text-[#2d1f0e]">₹{fmt(gst)}</span>
            </div>

            <div className="h-px bg-[#f3e6d3] my-3" />
            
            <div className="flex justify-between text-[1.25rem] font-black text-[#1e1000] tracking-tighter">
              <span className="font-display uppercase tracking-widest text-[0.8rem] self-center text-[#7a4f1e]">Grand Total</span>
              <span>₹{fmt(total)}</span>
            </div>

            {(savings + couponDisc) > 0 && (
              <div className="mt-4 bg-[#e8f5e9]/60 text-[#2d7a2d] text-[0.78rem] font-bold p-3.5 rounded-xl text-center border border-[#4caf50]/20 flex items-center justify-center gap-2">
                <span className="text-lg">✨</span> You're saving ₹{fmt(savings + couponDisc)} on this order!
              </div>
            )}
          </div>

          {/* Trust */}
          <div className="flex items-center justify-center gap-6 p-6 bg-[#fdf9f4] text-[0.72rem] text-[#9a7850] font-bold tracking-widest uppercase">
            <span className="flex flex-col items-center gap-2 text-center">
              <div className="p-2 bg-white rounded-full text-[#c47c1a] shadow-sm"><ShieldCheck size={18} /></div>
              SECURE
            </span>
            <span className="flex flex-col items-center gap-2 text-center">
              <div className="p-2 bg-white rounded-full text-[#c47c1a] shadow-sm"><Truck size={18} /></div>
              EXPRESS
            </span>
            <span className="flex flex-col items-center gap-2 text-center">
              <div className="p-2 bg-white rounded-full text-[#c47c1a] shadow-sm"><Lock size={18} /></div>
              PRIVATE
            </span>
          </div>
        </>
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════════════
//  STEP 1 — DELIVERY DETAILS
// ════════════════════════════════════════════════════════════
const DeliveryStep = ({ data, setData, onNext, user }) => {
  const [errors, setErrors] = useState({});

  // Pre-fill from AuthContext but avoid placeholders
  useEffect(() => {
    const isPlaceholder = (n) => !n || ['user', 'customer', 'trendy drapes user', 'trendy user'].includes(n.toLowerCase().trim());

    setData(d => ({
      ...d,
      name:  d.name  || (!isPlaceholder(user?.name) ? user?.name : ''),
      email: d.email || user?.email || '',
    }));
  }, [user]);

  const set = (k, v) => {
    setData(d => ({ ...d, [k]: v }));
    if (errors[k]) setErrors(e => ({ ...e, [k]: '' }));
  };

  const handleNext = () => {
    const fields = ['name', 'email', 'phone', 'door', 'street', 'city', 'state', 'pincode', 'address_type'];
    const newErr = {};
    fields.forEach(f => {
      const err = validate[f]?.(data[f] || '');
      if (err) newErr[f] = err;
    });
    if (Object.keys(newErr).length) { setErrors(newErr); return; }
    onNext();
  };

  const inp = (k, props = {}) => (
    <input
      className={`w-full bg-[#fdf8f2] border-[1.5px] border-[#e0cdb0] rounded-[14px] px-4 py-3.5 font-body text-[0.92rem] text-[#2d1f0e] outline-none transition-all focus:border-[#c47c1a] focus:ring-4 focus:ring-[#c47c1a]/10 focus:bg-white placeholder:text-[#bba98a]/60 ${errors[k] ? 'border-red-400 bg-red-50/50' : ''}`}
      value={data[k] || ''}
      onChange={e => set(k, e.target.value)}
      {...props}
    />
  );

  return (
    <div className="flex flex-col gap-6">
      <Section title="Contact Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Full Name *" error={errors.name}>
            {inp('name', { placeholder: 'Ex: Ramesh Kumar' })}
          </Field>
          <Field label="Email Address *" error={errors.email}>
            {inp('email', { type: 'email', placeholder: 'Ex: you@email.com' })}
          </Field>
        </div>
        <Field label="Mobile Number *" error={errors.phone}>
          {inp('phone', { type: 'tel', placeholder: '9876543210', maxLength: 10 })}
        </Field>
      </Section>

      <Section title="Delivery Address">
        <Field label="Door / Flat Number *" error={errors.door}>
          {inp('door', { placeholder: 'Ex: No. 12, 3rd Floor' })}
        </Field>
        <Field label="Street / Area / Landmark *" error={errors.street}>
          {inp('street', { placeholder: 'Ex: Anna Nagar, Near Park' })}
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="City *" error={errors.city}>
            {inp('city', { placeholder: 'Ex: Chennai' })}
          </Field>
          <Field label="Pincode *" error={errors.pincode}>
            {inp('pincode', { placeholder: 'Ex: 600001', maxLength: 6 })}
          </Field>
        </div>
        <Field label="State *" error={errors.state}>
          <div className="relative group">
            <select
              className={`w-full appearance-none bg-[#fdf8f2] border-[1.5px] border-[#e0cdb0] rounded-[14px] px-4 py-3.5 font-body text-[0.92rem] text-[#2d1f0e] outline-none transition-all focus:border-[#c47c1a] focus:ring-4 focus:ring-[#c47c1a]/10 focus:bg-white cursor-pointer ${errors.state ? 'border-red-400 bg-red-50/50' : ''}`}
              value={data.state || ''}
              onChange={e => set('state', e.target.value)}
            >
              <option value="">Select State</option>
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#bba98a] pointer-events-none group-hover:text-[#c47c1a] transition-colors" size={18} />
          </div>
        </Field>

        <Field label="Address Type *">
          <div className="flex gap-3 mt-1">
            {['Home', 'Work'].map(type => (
              <button
                key={type}
                type="button"
                className={`flex-1 py-3 rounded-xl font-body text-[0.85rem] font-bold tracking-wider transition-all border-[1.5px] ${
                  (data.address_type || 'Home') === type 
                    ? 'bg-[#1e1000] border-[#1e1000] text-[#f0c060] shadow-md shadow-[#1e1000]/20' 
                    : 'bg-[#fdf8f2] border-[#e0cdb0] text-[#7a4f1e] hover:border-[#c47c1a] opacity-80'
                }`}
                onClick={() => set('address_type', type)}
              >
                {type.toUpperCase()}
              </button>
            ))}
          </div>
        </Field>
      </Section>

      <button
  className="w-full py-4 bg-gradient-to-r from-[#1e1000] via-[#c47c1a] to-[#7a4f1e]
  border-none rounded-[18px]
  text-[#f0c060] font-display text-[1rem] font-semibold tracking-[0.2em]
  uppercase cursor-pointer
  shadow-[0_18px_45px_rgba(30,15,0,0.25)]
  ring-1 ring-[#c47c1a]/25
  transition-all duration-300
  hover:shadow-[0_25px_60px_rgba(30,15,0,0.35)]
  hover:scale-[1.01] hover:-translate-y-0.5
  active:scale-[0.98] mt-6"
  onClick={handleNext}
>
  Continue to Payment
</button>
    </div>
  );
};

// ════════════════════════════════════════════════════════════
//  STEP 2 — PAYMENT
// ════════════════════════════════════════════════════════════
const PaymentStep = ({ onNext, onBack }) => {
  const [method, setMethod] = useState('card');
  const [card,   setCard]   = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [upi,    setUpi]    = useState('');
  const [net,    setNet]    = useState('');
  const [errors, setErrors] = useState({});

  const setC = (k, v) => {
    setCard(d => ({ ...d, [k]: v }));
    if (errors[k]) setErrors(e => ({ ...e, [k]: '' }));
  };

  const formatCardNum = v => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const formatExpiry  = v => {
    const d = v.replace(/\D/g, '').slice(0, 4);
    return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  const handleNext = () => {
    const newErr = {};
    if (method === 'card') {
      const cardErr   = validate.card(card.number);
      const expiryErr = validate.expiry(card.expiry);
      const cvvErr    = validate.cvv(card.cvv);
      if (cardErr)   newErr.number = cardErr;
      if (expiryErr) newErr.expiry = expiryErr;
      if (cvvErr)    newErr.cvv    = cvvErr;
      if (!card.name.trim()) newErr.cardName = 'Cardholder name is required';
    } else if (method === 'upi') {
      const upiErr = validate.upi(upi);
      if (upiErr) newErr.upi = upiErr;
    } else if (method === 'netbanking') {
      if (!net) newErr.net = 'Please select a bank';
    }
    if (Object.keys(newErr).length) { setErrors(newErr); return; }
    onNext();
  };

  const banks = ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra Bank', 'Bank of Baroda', 'Punjab National Bank', 'Canara Bank'];

  const PayMethod = ({ id, icon, label }) => (
    <button
      className={`flex flex-col items-center gap-1.5 p-3 px-4 bg-[#fdf8f2] border-[1.5px] border-[#e0cdb0] rounded-xl cursor-pointer font-body text-[0.75rem] font-bold text-[#7a4f1e] min-w-[72px] transition-all hover:border-[#c47c1a] hover:bg-[#fef9f2] ${
        method === id ? 'border-[#c47c1a] bg-[#fff8ec] text-[#c47c1a] shadow-[0_0_0_3px_rgba(196,124,26,0.12)]' : ''
      }`}
      onClick={() => { setMethod(id); setErrors({}); }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="flex flex-col gap-6">
      <Section title="Select Payment Method">
        <div className="flex gap-3.5 flex-wrap mb-1">
          <PayMethod id="card"       icon={<CreditCard size={20} />}  label="Card" />
          <PayMethod id="upi"        icon={<Smartphone size={20} />}  label="UPI" />
          <PayMethod id="netbanking" icon={<Building2 size={20} />}   label="Net Banking" />
          <PayMethod id="wallet"     icon={<Wallet size={20} />}      label="Wallet" />
          <PayMethod id="cod"        icon={<Truck size={20} />}       label="COD" />
        </div>
      </Section>

      {/* CARD */}
      {method === 'card' && (
        <Section title="Card Details">
          <div className="bg-gradient-to-br from-[#1e1000] to-[#3a2008] rounded-2x p-7 pb-6 mb-7 min-h-[140px] relative shadow-[0_15px_35px_rgba(0,0,0,0.3)] ring-1 ring-white/10 overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
            <div className="w-11 h-8 bg-gradient-to-br from-[#f0c060] to-[#c49030] rounded-md mb-7 shadow-sm" />
            <p className="font-mono text-[1.25rem] text-white/95 tracking-[0.2em] mb-4.5 m-0 uppercase drop-shadow-md">{card.number || '•••• •••• •••• ••••'}</p>
            <div className="flex justify-between text-[0.75rem] text-white/60 tracking-[0.1em] font-bold uppercase">
              <span>{card.name || 'HOLDER NAME'}</span>
              <span>{card.expiry || 'MM/YY'}</span>
            </div>
          </div>
          <Field label="Card Number *" error={errors.number}>
            <input className={`w-full bg-[#fdf8f2] border-[1.5px] border-[#e0cdb0] rounded-[14px] px-4 py-3.5 font-body text-[0.92rem] text-[#2d1f0e] outline-none transition-all focus:border-[#c47c1a] focus:ring-4 focus:ring-[#c47c1a]/10 focus:bg-white placeholder:text-[#bba98a]/60 ${errors.number ? 'border-red-400 bg-red-50/50' : ''}`}
              placeholder="0000 0000 0000 0000" maxLength={19}
              value={card.number} onChange={e => setC('number', formatCardNum(e.target.value))} />
          </Field>
          <Field label="Cardholder Name *" error={errors.cardName}>
            <input className={`w-full bg-[#fdf8f2] border-[1.5px] border-[#e0cdb0] rounded-[14px] px-4 py-3.5 font-body text-[0.92rem] text-[#2d1f0e] outline-none transition-all focus:border-[#c47c1a] focus:ring-4 focus:ring-[#c47c1a]/10 focus:bg-white placeholder:text-[#bba98a]/60 ${errors.cardName ? 'border-red-400 bg-red-50/50' : ''}`}
              placeholder="AS PRINTED ON CARD" value={card.name}
              onChange={e => setC('name', e.target.value.toUpperCase())} />
          </Field>
          <div className="grid grid-cols-2 gap-5">
            <Field label="Expiry Date *" error={errors.expiry}>
              <input className={`w-full bg-[#fdf8f2] border-[1.5px] border-[#e0cdb0] rounded-[14px] px-4 py-3.5 font-body text-[0.92rem] text-[#2d1f0e] outline-none transition-all focus:border-[#c47c1a] focus:ring-4 focus:ring-[#c47c1a]/10 focus:bg-white placeholder:text-[#bba98a]/60 ${errors.expiry ? 'border-red-400 bg-red-50/50' : ''}`}
                placeholder="MM/YY" maxLength={5}
                value={card.expiry} onChange={e => setC('expiry', formatExpiry(e.target.value))} />
            </Field>
            <Field label="CVV *" error={errors.cvv}>
              <input className={`w-full bg-[#fdf8f2] border-[1.5px] border-[#e0cdb0] rounded-[14px] px-4 py-3.5 font-body text-[0.92rem] text-[#2d1f0e] outline-none transition-all focus:border-[#c47c1a] focus:ring-4 focus:ring-[#c47c1a]/10 focus:bg-white placeholder:text-[#bba98a]/60 ${errors.cvv ? 'border-red-400 bg-red-50/50' : ''}`}
                placeholder="•••" maxLength={4} type="password"
                value={card.cvv} onChange={e => setC('cvv', e.target.value.replace(/\D/g, ''))} />
            </Field>
          </div>
          <div className="flex gap-2.5 mt-5">
            <div className="px-3 py-1.5 rounded-lg text-[0.7rem] font-black tracking-widest bg-white border border-[#ecdec8] text-[#1a1f72] shadow-sm">VISA</div>
            <div className="px-3 py-1.5 rounded-lg text-[0.7rem] font-black tracking-widest bg-white border border-[#ecdec8] text-[#eb001b] shadow-sm">MASTERCARD</div>
            <div className="px-3 py-1.5 rounded-lg text-[0.7rem] font-black tracking-widest bg-white border border-[#ecdec8] text-[#f26522] shadow-sm">RUPAY</div>
          </div>
        </Section>
      )}

      {/* UPI */}
      {method === 'upi' && (
        <Section title="UPI Payment">
          <div className="flex gap-2.5 mb-6 flex-wrap">
            {['Google Pay', 'PhonePe', 'Paytm', 'BHIM UPI'].map(app => (
              <button key={app} className="px-5 py-2.5 border-[1.5px] border-[#e0cdb0] rounded-xl bg-[#fdf8f2] font-body text-[0.85rem] font-black text-[#7a4f1e] cursor-pointer transition-all hover:border-[#c47c1a] hover:bg-white hover:shadow-md active:scale-95">{app}</button>
            ))}
          </div>
          <Field label="UPI ID *" error={errors.upi}>
            <input className={`w-full bg-[#fdf8f2] border-[1.5px] border-[#e0cdb0] rounded-[14px] px-4 py-3.5 font-body text-[0.92rem] text-[#2d1f0e] outline-none transition-all focus:border-[#c47c1a] focus:ring-4 focus:ring-[#c47c1a]/10 focus:bg-white placeholder:text-[#bba98a]/60 ${errors.upi ? 'border-red-400 bg-red-50/50' : ''}`}
              placeholder="Ex: yourname@upi" value={upi}
              onChange={e => { setUpi(e.target.value); if (errors.upi) setErrors(er => ({ ...er, upi: '' })); }} />
          </Field>
          <p className="text-[0.78rem] text-[#9a7850] mt-3 font-medium flex items-center gap-2 italic opacity-80 border-l-2 border-[#c47c1a]/30 pl-3">You will receive a payment request on your mobile app after placing the order.</p>
        </Section>
      )}

      {/* NET BANKING */}
      {method === 'netbanking' && (
        <Section title="Select Your Bank">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {banks.map(b => (
              <button key={b} className={`p-4 px-5 border-[1.5px] border-[#e0cdb0] rounded-xl bg-[#fdf8f2] font-body text-[0.88rem] font-bold text-[#5a3a1a] cursor-pointer text-left transition-all hover:border-[#c47c1a] hover:bg-white hover:shadow-md ${net === b ? 'border-[#c47c1a] bg-white ring-2 ring-[#c47c1a]/20 text-[#c47c1a]' : 'opacity-80'}`}
                onClick={() => { setNet(b); setErrors(e => ({ ...e, net: '' })); }}>
                {b}
              </button>
            ))}
          </div>
          {errors.net && <p className="text-red-500 text-[0.75rem] flex items-center gap-1.5 mt-4 tracking-wide font-black ml-1"><AlertCircle size={14} /> {errors.net}</p>}
        </Section>
      )}

      <div className="flex gap-5 items-center mt-8">
        <button className="px-8 py-5 bg-white border-[1.5px] border-[#e0cdb0] rounded-[20px] text-[#7a4f1e] font-display text-[0.9rem] font-black tracking-widest cursor-pointer transition-all duration-300 hover:bg-[#fdf9f4] hover:border-[#c47c1a] active:scale-95" onClick={onBack}>BACK</button>
        <button className="flex-1 py-6 bg-gradient-to-r from-[#1e1000] via-[#c47c1a] to-[#7a4f1e] border-none rounded-[20px] text-[#f0c060] font-display text-[1.12rem] font-black tracking-[0.3em] uppercase cursor-pointer shadow-[0_25px_60px_rgba(30,15,0,0.35)] ring-1 ring-[#c47c1a]/30 transition-all duration-500 hover:shadow-[0_35px_80px_rgba(30,15,0,0.45)] hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.98]" onClick={handleNext}>
          Review Order
        </button>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════
//  STEP 3 — CONFIRM
// ════════════════════════════════════════════════════════════
const ConfirmStep = ({ delivery, cartItems, couponApplied, onBack, onPlace }) => {
  const subtotal   = cartItems.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const savings    = cartItems.reduce((s, i) => s + ((i.product.originalPrice ?? i.product.price) - i.product.price) * i.quantity, 0);
  const deliveryFee = 49;
  const platformFee = 19;
  const gst        = subtotal * GST_RATE;
  let couponDisc   = 0;
  if (couponApplied && COUPONS[couponApplied]) {
    const c = COUPONS[couponApplied];
    couponDisc = c.type === 'percent' ? subtotal * c.value / 100 : c.value;
  }
  const total = subtotal + deliveryFee + platformFee + gst - couponDisc;

  return (
    <div className="flex flex-col gap-6">
      <Section title="Delivery Address">
        <div className="bg-[#fdf8f2] rounded-2xl p-6 sm:p-7 text-[1rem] leading-[1.8] text-[#3a2510] border-2 border-[#ecdec8] shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#c47c1a] opacity-50" />
          <p className="font-black text-[1.1rem] text-[#1e1000] mb-3 tracking-tight flex items-center gap-2">
            <CheckCircle2 size={20} className="text-[#4caf50]" /> {delivery.name}
          </p>
          <div className="space-y-1 ml-7 opacity-90 font-medium">
            <p className="m-0">{delivery.door}, {delivery.street}</p>
            <p className="m-0">{delivery.city} — {delivery.pincode}</p>
            <p className="m-0">{delivery.state}</p>
            <div className="h-px bg-[#ecdec8] my-4" />
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-[0.85rem] font-bold text-[#7a4f1e]">
              <span className="flex items-center gap-2">📱 {delivery.phone}</span>
              <span className="flex items-center gap-2">✉️ {delivery.email}</span>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Final Order Items">
        <div className="flex flex-col gap-1">
          {cartItems.map(item => (
            <div key={item.id} className="flex justify-between items-center py-3.5 border-b border-[#f3e6d3] text-[#3a2510] last:border-b-0 group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg overflow-hidden border border-[#ecdec8]">
                  <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[0.9rem] font-bold group-hover:text-[#c47c1a] transition-colors">{item.product.name}</span>
                  <span className="text-[0.7rem] font-black text-[#bba98a] tracking-widest uppercase">Qty: {item.quantity}</span>
                </div>
              </div>
              <span className="font-black text-[0.95rem] tracking-tighter text-[#1e1000]">₹{fmt(item.product.price * item.quantity)}</span>
            </div>
          ))}
        </div>
      </Section>

      <div className="flex gap-5 items-center mt-8">
        <button className="px-8 py-5 bg-white border-[1.5px] border-[#e0cdb0] rounded-[20px] text-[#7a4f1e] font-display text-[0.9rem] font-black tracking-widest cursor-pointer transition-all duration-300 hover:bg-[#fdf9f4] hover:border-[#c47c1a] active:scale-95" onClick={onBack}>BACK</button>
        <button className="flex-1 py-6 bg-gradient-to-r from-[#1e5c1e] via-[#2d7a2d] to-[#1e5c1e] border-none rounded-[20px] text-white font-display text-[1.12rem] font-black tracking-[0.2em] uppercase cursor-pointer shadow-[0_25px_60px_rgba(30,80,30,0.2)] transition-all duration-500 hover:shadow-[0_35px_80px_rgba(30,80,30,0.3)] hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.98]" onClick={onPlace}>
          <Lock size={20} className="translate-y-[-2px] mr-2 inline-block" /> PAY & PLACE ORDER · ₹{fmt(total)}
        </button>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════
//  SUCCESS
// ════════════════════════════════════════════════════════════
const OrderSuccess = ({ orderId, name }) => {
  const navigate = useNavigate();
  return (
    <div className="max-w-[540px] mx-auto my-20 text-center animate-fade-in">
      <div className="bg-white rounded-[32px] p-10 sm:p-14 shadow-[0_20px_60px_rgba(180,120,0,0.12)] border border-[#ecdec8] ring-1 ring-[#ecdec8]/50 relative overflow-hidden">
        {/* Subtle background element */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#fdf9f4] rounded-full blur-3xl opacity-50" />
        
        <div className="relative z-10">
          <div className="w-20 h-20 bg-[#4caf50]/10 text-[#4caf50] rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner ring-1 ring-[#4caf50]/20">
            <CheckCircle2 size={40} />
          </div>
          
          <h2 className="font-display text-[1.8rem] font-bold text-[#1e1000] m-0 mb-3 tracking-tight">Order Placed!</h2>
          <p className="text-[1rem] text-[#5a3a1a] m-0 mb-8 leading-relaxed">
            Thank you, <span className="font-bold text-[#c47c1a]">{name}</span>.<br />
            Your luxury collection is being prepared for dispatch.
          </p>
          
          <div className="flex flex-col items-center gap-2 mb-10">
            <span className="text-[0.7rem] font-black text-[#bba98a] tracking-[0.2em] uppercase">Order Reference</span>
            <div className="bg-[#fdf8f2] border border-[#ecdec8] rounded-xl px-6 py-3 text-[1.1rem] text-[#7a4f1e] font-black tracking-widest shadow-sm">
              {orderId}
            </div>
          </div>
          
          <p className="text-[0.85rem] text-[#9a7850] mb-10 font-medium italic opacity-80 border-t border-[#f3e6d3] pt-6 flex items-center justify-center gap-2">
            <ShieldCheck size={16} /> A confirmation email has been sent to your inbox.
          </p>
          
          <button className="w-full py-5.5 bg-gradient-to-r from-[#1e1000] via-[#c47c1a] to-[#7a4f1e] border-none rounded-[16px] text-[#f0c060] font-display text-[1.1rem] font-black tracking-[0.25em] uppercase cursor-pointer transition-all duration-500 hover:shadow-xl hover:-translate-y-1 active:scale-[0.98]" onClick={() => navigate('/')}>
            CONTINUE SHOPPING
          </button>
        </div>
      </div>
      
      <p className="mt-8 text-[0.75rem] font-black text-[#bba98a] tracking-widest uppercase">Trendy Drapes Luxury Experience</p>
    </div>
  );
};

// ════════════════════════════════════════════════════════════
//  MAIN Checkout
// ════════════════════════════════════════════════════════════
const Checkout = () => {
  const { items, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step,          setStep]          = useState(1);
  const [delivery,      setDelivery]      = useState({ address_type: 'Home' });
  const [couponCode,    setCouponCode]    = useState('');
  const [couponApplied, setCouponApplied] = useState('');
  const [couponError,   setCouponError]   = useState('');
  const [orderId,       setOrderId]       = useState('');
  const [placed,        setPlaced]        = useState(false);

  useEffect(() => {
    if (items.length === 0 && !placed) navigate('/cart');
  }, [items, placed]);

  const handlePlace = async () => {
    const id = 'ORD-' + Date.now().toString().slice(-8);

    const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
    const deliveryFee = 49;
    const platformFee = 19;
    const gst = subtotal * GST_RATE;
    let couponDisc = 0;
    if (couponApplied && COUPONS[couponApplied]) {
      const c = COUPONS[couponApplied];
      couponDisc = c.type === 'percent' ? subtotal * (c.value / 100) : c.value;
    }
    const total = subtotal + deliveryFee + platformFee + gst - couponDisc;

    const orderData = {
      orderId: id,
      customerEmail: delivery.email,
      customerName: delivery.name,
      customerPhone: delivery.phone,
      shippingAddress: delivery,
      subtotal: Number(subtotal),
      tax_amount: Number(gst),
      shipping_charge: Number(deliveryFee),
      discount_amount: Number(couponDisc),
      total_amount: Number(total),
      items: items.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        price: Number(item.product.price),
        size: item.size
      }))
    };

    try {
      const response = await apiFetch("/api/orders", {
        method: "POST",
        body: JSON.stringify(orderData)
      });

      const result = await response.json();
      if (result.success) {
        sendOrderEmail(delivery, items, { subtotal, delivery: deliveryFee, platformFee, gst, total }, id);
        setOrderId(id);
        clearCart();
        setPlaced(true);
      } else {
        alert("Failed to save order: " + (result.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Order error:", err);
      alert("Error placing order. Please try again.");
    }
  };

  if (placed) {
    return (
      <div className="min-h-screen bg-[#faf6f0] font-body text-[#2d1f0e] pb-16">
        <OrderSuccess orderId={orderId} name={delivery.name || 'Customer'} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf6f0] font-body text-[#2d1f0e] pb-16 transition-colors duration-1000">
      {/* Premium Header */}
      <div className="flex items-center justify-between bg-[#1e1000] px-6 sm:px-12 py-4 font-display text-[#f0c060] text-[1rem] tracking-[0.2em] shadow-xl sticky top-0 z-50 border-b border-[#c47c1a]/20">
        <div className="flex-1 font-black group cursor-default">
          TRENDY DRAPES <span className="hidden sm:inline opacity-50 font-medium ml-2">— SECURE CHECKOUT</span>
        </div>
        <div className="flex items-center gap-2 font-body text-[0.7rem] font-bold text-[#f0c060] tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/10 uppercase">
          <ShieldCheck size={16} className="text-[#4caf50]" /> Verified SSL
        </div>
      </div>

      <StepBar step={step} />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10 max-w-[1260px] mx-auto mt-10 px-6 sm:px-8">
        {/* LEFT — form steps */}
        <div className="order-2 lg:order-1 animate-fade-in">
          {step === 1 && (
            <DeliveryStep
              data={delivery}
              setData={setDelivery}
              onNext={() => { setStep(2); window.scrollTo({top:0, behavior:'smooth'}); }}
              user={user}
            />
          )}
          {step === 2 && (
            <PaymentStep
              onNext={() => { setStep(3); window.scrollTo({top:0, behavior:'smooth'}); }}
              onBack={() => { setStep(1); window.scrollTo({top:0, behavior:'smooth'}); }}
            />
          )}
          {step === 3 && (
            <ConfirmStep
              delivery={delivery}
              cartItems={items}
              couponApplied={couponApplied}
              onBack={() => { setStep(2); window.scrollTo({top:0, behavior:'smooth'}); }}
              onPlace={handlePlace}
            />
          )}
        </div>

        {/* RIGHT — order summary */}
        <div className="order-1 lg:order-2 animate-fade-in [animation-delay:200ms]">
          <OrderSummary
            cartItems={items}
            couponCode={couponCode}
            setCouponCode={setCouponCode}
            couponApplied={couponApplied}
            setCouponApplied={setCouponApplied}
            couponError={couponError}
            setCouponError={setCouponError}
          />
        </div>
      </div>
      
      {/* Footer Branding */}
      <div className="max-w-[1260px] mx-auto px-8 mt-16 text-center">
        <p className="text-[0.75rem] font-bold text-[#bba98a] tracking-widest uppercase flex items-center justify-center gap-3">
          <span className="w-12 h-px bg-[#ecdec8]" />
          Secured by Razorpay & Stripe
          <span className="w-12 h-px bg-[#ecdec8]" />
        </p>
      </div>
    </div>
  );
};

export default Checkout;