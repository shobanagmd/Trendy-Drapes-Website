import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import emailjs from "emailjs-com";
import { Lock, ChevronDown, ChevronUp, Tag, Truck, ShieldCheck, CreditCard, Smartphone, Building2, Wallet, CheckCircle2, AlertCircle } from 'lucide-react';
import './CheckoutPage.css';

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
    gst: totals.gst,
    total: totals.total,
    brand_name: "Trendy Drapes",
    email_subject: "Order Confirmation - Trendy Drapes",
    email_header: "Order Received - Trendy Drapes",
    email_footer: "Thank you for shopping with Trendy Drapes! Visit us again soon."
  };

  emailjs.send(
    "service_wyf5asp",
    "template_3rtoxp9",
    templateParams,
    "MThP-R8Y7Yn3mNaVK"
  )
  .then(() => console.log("Email sent"))
  .catch(err => console.log(err));
};

// ── Step indicator ────────────────────────────────────────────
const StepBar = ({ step }) => (
  <div className="chk-steps">
    {['Delivery', 'Payment', 'Confirm'].map((s, i) => (
      <React.Fragment key={s}>
        <div className={`chk-step ${step === i + 1 ? 'active' : step > i + 1 ? 'done' : ''}`}>
          <div className="chk-step-dot">{step > i + 1 ? <CheckCircle2 size={14} /> : i + 1}</div>
          <span>{s}</span>
        </div>
        {i < 2 && <div className={`chk-step-line ${step > i + 1 ? 'done' : ''}`} />}
      </React.Fragment>
    ))}
  </div>
);

// ── Section wrapper ───────────────────────────────────────────
const Section = ({ title, children }) => (
  <div className="chk-section">
    <h3 className="chk-section-title">{title}</h3>
    {children}
  </div>
);

// ── Field ─────────────────────────────────────────────────────
const Field = ({ label, error, children }) => (
  <div className="chk-field">
    <label className="chk-label">{label}</label>
    {children}
    {error && <span className="chk-error"><AlertCircle size={12} /> {error}</span>}
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
  const delivery  = subtotal >= 499 ? 0 : 49;
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

  const total = subtotal + delivery + gst - couponDisc;

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
    <div className="chk-summary">
      <div className="chk-summary-header" onClick={() => setOpen(o => !o)}>
        <span>Order Summary ({cartItems.length} item{cartItems.length > 1 ? 's' : ''})</span>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </div>

      {open && (
        <>
          {/* Items */}
          <div className="chk-summary-items">
            {cartItems.map(item => (
              <div key={item.product.id} className="chk-sum-item">
                <div className="chk-sum-img-wrap">
                  <img src={item.product.images[0]} alt={item.product.name} className="chk-sum-img"
                    onError={e => e.target.style.display = 'none'} />
                  <span className="chk-sum-qty">{item.quantity}</span>
                </div>
                <div className="chk-sum-info">
                  <p className="chk-sum-name">{item.product.name}</p>
                  <p className="chk-sum-cat">{item.product.category}</p>
                </div>
                <span className="chk-sum-price">₹{fmt(item.product.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          {/* Coupon */}
          <div className="chk-coupon-wrap">
            <div className="chk-coupon-row">
              <Tag size={15} />
              {couponApplied ? (
                <div className="chk-coupon-applied">
                  <span className="chk-coupon-tag">{couponApplied} applied ✓</span>
                  <button className="chk-coupon-remove" onClick={handleRemoveCoupon}>Remove</button>
                </div>
              ) : (
                <>
                  <input className="chk-coupon-input" placeholder="Enter coupon code"
                    value={inputCode} onChange={e => { setInputCode(e.target.value.toUpperCase()); setCouponError(''); }} />
                  <button className="chk-coupon-btn" onClick={handleApplyCoupon}>Apply</button>
                </>
              )}
            </div>
            {couponError && <p className="chk-coupon-error">{couponError}</p>}
            <p className="chk-coupon-hint">Try: TRENDY10 · FIRST50 · SAVE100</p>
          </div>

          {/* Price rows */}
          <div className="chk-price-rows">
            <div className="chk-price-row">
              <span>Subtotal ({cartItems.reduce((n, i) => n + i.quantity, 0)} items)</span>
              <span>₹{fmt(subtotal)}</span>
            </div>
            {savings > 0 && (
              <div className="chk-price-row green">
                <span>Product Discount</span>
                <span>−₹{fmt(savings)}</span>
              </div>
            )}
            {couponDisc > 0 && (
              <div className="chk-price-row green">
                <span>Coupon ({couponApplied})</span>
                <span>−₹{fmt(couponDisc)}</span>
              </div>
            )}
            <div className="chk-price-row">
              <span>Delivery</span>
              <span>{delivery === 0 ? <span className="chk-free">FREE</span> : `₹${delivery}`}</span>
            </div>
            <div className="chk-price-row">
              <span>GST (5%)</span>
              <span>+₹{fmt(gst)}</span>
            </div>
            <div className="chk-price-divider" />
            <div className="chk-price-row total">
              <span>Total Payable</span>
              <span>₹{fmt(total)}</span>
            </div>
            {(savings + couponDisc) > 0 && (
              <div className="chk-savings-tag">
                🎉 You're saving ₹{fmt(savings + couponDisc)} on this order!
              </div>
            )}
          </div>

          {/* Trust */}
          <div className="chk-trust-row">
            <span><ShieldCheck size={14} /> Secure Payment</span>
            <span><Truck size={14} /> Fast Delivery</span>
            <span><Lock size={14} /> Safe & Private</span>
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

  // Pre-fill from AuthContext
  useEffect(() => {
    setData(d => ({
      ...d,
      name:  d.name  || user?.name  || '',
      email: d.email || user?.email || '',
    }));
  }, [user]);

  const set = (k, v) => {
    setData(d => ({ ...d, [k]: v }));
    if (errors[k]) setErrors(e => ({ ...e, [k]: '' }));
  };

  const handleNext = () => {
    const fields = ['name', 'email', 'phone', 'door', 'street', 'city', 'state', 'pincode'];
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
      className={`chk-input ${errors[k] ? 'error' : ''}`}
      value={data[k] || ''}
      onChange={e => set(k, e.target.value)}
      {...props}
    />
  );

  return (
    <div className="chk-step-body">
      <Section title="Contact Information">
        <div className="chk-grid-2">
          <Field label="Full Name *" error={errors.name}>
            {inp('name', { placeholder: 'Ramesh Kumar' })}
          </Field>
          <Field label="Email Address *" error={errors.email}>
            {inp('email', { type: 'email', placeholder: 'you@email.com' })}
          </Field>
        </div>
        <Field label="Mobile Number *" error={errors.phone}>
          {inp('phone', { type: 'tel', placeholder: '9876543210', maxLength: 10 })}
        </Field>
      </Section>

      <Section title="Delivery Address">
        <Field label="Door / Flat Number *" error={errors.door}>
          {inp('door', { placeholder: 'No. 12, 3rd Floor' })}
        </Field>
        <Field label="Street / Area / Landmark *" error={errors.street}>
          {inp('street', { placeholder: 'Anna Nagar, Near Park' })}
        </Field>
        <div className="chk-grid-2">
          <Field label="City *" error={errors.city}>
            {inp('city', { placeholder: 'Chennai' })}
          </Field>
          <Field label="Pincode *" error={errors.pincode}>
            {inp('pincode', { placeholder: '600001', maxLength: 6 })}
          </Field>
        </div>
        <Field label="State *" error={errors.state}>
          <select
            className={`chk-input ${errors.state ? 'error' : ''}`}
            value={data.state || ''}
            onChange={e => set('state', e.target.value)}
          >
            <option value="">Select State</option>
            {STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
      </Section>

      <button className="chk-next-btn" onClick={handleNext}>
        Continue to Payment →
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
      className={`chk-pay-method ${method === id ? 'active' : ''}`}
      onClick={() => { setMethod(id); setErrors({}); }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="chk-step-body">
      <Section title="Select Payment Method">
        <div className="chk-pay-methods">
          <PayMethod id="card"       icon={<CreditCard size={18} />}  label="Card" />
          <PayMethod id="upi"        icon={<Smartphone size={18} />}  label="UPI" />
          <PayMethod id="netbanking" icon={<Building2 size={18} />}   label="Net Banking" />
          <PayMethod id="wallet"     icon={<Wallet size={18} />}      label="Wallet" />
          <PayMethod id="cod"        icon={<Truck size={18} />}       label="Cash on Delivery" />
        </div>
      </Section>

      {/* CARD */}
      {method === 'card' && (
        <Section title="Card Details">
          <div className="chk-card-preview">
            <div className="chk-card-chip" />
            <p className="chk-card-num-preview">{card.number || '•••• •••• •••• ••••'}</p>
            <div className="chk-card-bottom">
              <span>{card.name || 'CARDHOLDER NAME'}</span>
              <span>{card.expiry || 'MM/YY'}</span>
            </div>
          </div>
          <Field label="Card Number *" error={errors.number}>
            <input className={`chk-input ${errors.number ? 'error' : ''}`}
              placeholder="1234 5678 9012 3456" maxLength={19}
              value={card.number} onChange={e => setC('number', formatCardNum(e.target.value))} />
          </Field>
          <Field label="Cardholder Name *" error={errors.cardName}>
            <input className={`chk-input ${errors.cardName ? 'error' : ''}`}
              placeholder="As on card" value={card.name}
              onChange={e => setC('name', e.target.value.toUpperCase())} />
          </Field>
          <div className="chk-grid-2">
            <Field label="Expiry Date *" error={errors.expiry}>
              <input className={`chk-input ${errors.expiry ? 'error' : ''}`}
                placeholder="MM/YY" maxLength={5}
                value={card.expiry} onChange={e => setC('expiry', formatExpiry(e.target.value))} />
            </Field>
            <Field label="CVV *" error={errors.cvv}>
              <input className={`chk-input ${errors.cvv ? 'error' : ''}`}
                placeholder="•••" maxLength={4} type="password"
                value={card.cvv} onChange={e => setC('cvv', e.target.value.replace(/\D/g, ''))} />
            </Field>
          </div>
          <div className="chk-card-types">
            <span className="chk-card-type visa">VISA</span>
            <span className="chk-card-type mc">MC</span>
            <span className="chk-card-type rupay">RuPay</span>
            <span className="chk-card-type amex">AMEX</span>
          </div>
        </Section>
      )}

      {/* UPI */}
      {method === 'upi' && (
        <Section title="UPI Payment">
          <div className="chk-upi-apps">
            {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map(app => (
              <button key={app} className="chk-upi-app-btn">{app}</button>
            ))}
          </div>
          <Field label="UPI ID *" error={errors.upi}>
            <input className={`chk-input ${errors.upi ? 'error' : ''}`}
              placeholder="yourname@upi" value={upi}
              onChange={e => { setUpi(e.target.value); if (errors.upi) setErrors(er => ({ ...er, upi: '' })); }} />
          </Field>
          <p className="chk-upi-note">Enter your UPI ID and a payment request will be sent to your UPI app</p>
        </Section>
      )}

      {/* NET BANKING */}
      {method === 'netbanking' && (
        <Section title="Select Your Bank">
          <div className="chk-bank-grid">
            {banks.map(b => (
              <button key={b} className={`chk-bank-btn ${net === b ? 'active' : ''}`}
                onClick={() => { setNet(b); setErrors(e => ({ ...e, net: '' })); }}>
                {b}
              </button>
            ))}
          </div>
          {errors.net && <p className="chk-error" style={{marginTop:'8px'}}><AlertCircle size={12} /> {errors.net}</p>}
        </Section>
      )}

      {/* WALLET */}
      {method === 'wallet' && (
        <Section title="Select Wallet">
          <div className="chk-bank-grid">
            {['Paytm Wallet', 'Amazon Pay', 'Mobikwik', 'Freecharge', 'Airtel Money', 'JioMoney'].map(w => (
              <button key={w} className={`chk-bank-btn ${net === w ? 'active' : ''}`}
                onClick={() => setNet(w)}>
                {w}
              </button>
            ))}
          </div>
        </Section>
      )}

      {/* COD */}
      {method === 'cod' && (
        <Section title="Cash on Delivery">
          <div className="chk-cod-info">
            <p>💰 Pay in cash when your order arrives at your doorstep.</p>
            <p>Note: COD is available for orders up to ₹5,000.</p>
          </div>
        </Section>
      )}

      <div className="chk-btn-row">
        <button className="chk-back-btn" onClick={onBack}>← Back</button>
        <button className="chk-next-btn" onClick={handleNext}>Review Order →</button>
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
  const deliveryFee = subtotal >= 499 ? 0 : 49;
  const gst        = subtotal * GST_RATE;
  let couponDisc   = 0;
  if (couponApplied && COUPONS[couponApplied]) {
    const c = COUPONS[couponApplied];
    couponDisc = c.type === 'percent' ? subtotal * c.value / 100 : c.value;
  }
  const total = subtotal + deliveryFee + gst - couponDisc;

  return (
    <div className="chk-step-body">
      <Section title="Delivery Address">
        <div className="chk-confirm-box">
          <p className="chk-confirm-name">{delivery.name}</p>
          <p>{delivery.door}, {delivery.street}</p>
          <p>{delivery.city} — {delivery.pincode}</p>
          <p>{delivery.state}</p>
          <p>📱 {delivery.phone} &nbsp;|&nbsp; ✉️ {delivery.email}</p>
        </div>
      </Section>

      <Section title="Order Items">
        {cartItems.map(item => (
          <div key={item.product.id} className="chk-confirm-item">
            <span>{item.product.name} × {item.quantity}</span>
            <span>₹{fmt(item.product.price * item.quantity)}</span>
          </div>
        ))}
      </Section>

      <Section title="Price Breakdown">
        <div className="chk-confirm-box">
          <div className="chk-confirm-row"><span>Subtotal</span><span>₹{fmt(subtotal)}</span></div>
          {savings > 0 && <div className="chk-confirm-row green"><span>Product Discount</span><span>−₹{fmt(savings)}</span></div>}
          {couponDisc > 0 && <div className="chk-confirm-row green"><span>Coupon ({couponApplied})</span><span>−₹{fmt(couponDisc)}</span></div>}
          <div className="chk-confirm-row"><span>Delivery</span><span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span></div>
          <div className="chk-confirm-row"><span>GST (5%)</span><span>+₹{fmt(gst)}</span></div>
          <div className="chk-confirm-divider" />
          <div className="chk-confirm-row total"><span>Total Payable</span><span>₹{fmt(total)}</span></div>
        </div>
      </Section>

      <div className="chk-btn-row">
        <button className="chk-back-btn" onClick={onBack}>← Back</button>
        <button className="chk-place-btn" onClick={onPlace}>
          <Lock size={16} /> Place Order · ₹{fmt(total)}
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
    <div className="chk-success">
      <div className="chk-success-icon">🎉</div>
      <h2>Order Placed Successfully!</h2>
      <p className="chk-success-sub">Thank you, <strong>{name}</strong>! Your order has been confirmed.</p>
      <div className="chk-order-id">Order ID: <strong>{orderId}</strong></div>
      <p className="chk-success-note">You will receive a confirmation email shortly.</p>
      <div className="chk-success-btns">
        <button className="chk-next-btn" onClick={() => navigate('/')}>Continue Shopping</button>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════
//  MAIN CheckoutPage
// ════════════════════════════════════════════════════════════
const CheckoutPage = () => {
  const { items, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step,          setStep]          = useState(1);
  const [delivery,      setDelivery]      = useState({});
  const [couponCode,    setCouponCode]    = useState('');
  const [couponApplied, setCouponApplied] = useState('');
  const [couponError,   setCouponError]   = useState('');
  const [orderId,       setOrderId]       = useState('');
  const [placed,        setPlaced]        = useState(false);

  useEffect(() => {
    if (items.length === 0 && !placed) navigate('/cart');
  }, [items, placed]);

  const handlePlace = () => {
    const id = 'ORD-' + Date.now().toString().slice(-8);

    // Calculate totals for email
    const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
    const deliveryFee = subtotal >= 499 ? 0 : 49;
    const gst = subtotal * GST_RATE;
    let couponDisc = 0;
    if (couponApplied && COUPONS[couponApplied]) {
      const c = COUPONS[couponApplied];
      couponDisc = c.type === 'percent' ? subtotal * (c.value / 100) : c.value;
    }
    const total = subtotal + deliveryFee + gst - couponDisc;

    sendOrderEmail(delivery, items, { subtotal, delivery: deliveryFee, gst, total }, id);

    setOrderId(id);
    clearCart();
    setPlaced(true);
  };

  if (placed) {
    return (
      <div className="chk-page">
        <OrderSuccess orderId={orderId} name={delivery.name || 'Customer'} />
      </div>
    );
  }

  return (
    <div className="chk-page">
      <div className="chk-top-bar">
        <div className="chk-brand"> Trendy Drapes — Secure Checkout</div>
        <div className="chk-secure"><Lock size={14} /> SSL Secured</div>
      </div>

      <StepBar step={step} />

      <div className="chk-layout">
        {/* LEFT — form steps */}
        <div className="chk-left">
          {step === 1 && (
            <DeliveryStep
              data={delivery}
              setData={setDelivery}
              onNext={() => setStep(2)}
              user={user}
            />
          )}
          {step === 2 && (
            <PaymentStep
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && (
            <ConfirmStep
              delivery={delivery}
              cartItems={items}
              couponApplied={couponApplied}
              onBack={() => setStep(2)}
              onPlace={handlePlace}
            />
          )}
        </div>

        {/* RIGHT — order summary */}
        <div className="chk-right">
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
    </div>
  );
};

export default CheckoutPage;