/**
 * ─────────────────────────────────────────────────────────────────
 *  SellerAuthPage.jsx  —  /seller
 *
 *  NEW FILE. Does not modify any existing component.
 *  Renders the Login / Register toggle for the Seller Dashboard.
 *  On success → navigates to /seller/dashboard
 *  Uses localStorage keys: "isLoggedIn", "user"  (shared with both apps)
 * ─────────────────────────────────────────────────────────────────
 */

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

/* ── Design tokens: matches Aurum jewellery brand palette ───────── */
const G = {
  gold: "#C9A84C",
  goldLight: "#E8C97A",
  goldDim: "rgba(201,168,76,0.18)",
  bg: "#080706",
  card: "#111009",
  border: "rgba(201,168,76,0.14)",
  borderFocus: "rgba(201,168,76,0.55)",
  text: "#F0EBE0",
  muted: "#7A6E5E",
  error: "#D46060",
  errorBg: "rgba(212,96,96,0.08)",
  success: "#6BB88A",
  successBg: "rgba(107,184,138,0.08)",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

  .seller-auth-root {
    min-height: 100vh;
    background: ${G.bg};
    display: flex;
    align-items: stretch;
    font-family: 'DM Sans', 'Segoe UI', sans-serif;
    overflow: hidden;
  }

  /* ── Left decorative panel ── */
  .seller-auth-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 4rem 5rem;
    position: relative;
    background: linear-gradient(160deg, #0E0B06 0%, #080706 60%, #0A0806 100%);
    border-right: 1px solid ${G.border};
  }

  .seller-auth-panel::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 600px 500px at 20% 40%, rgba(201,168,76,0.05) 0%, transparent 70%),
      radial-gradient(ellipse 400px 300px at 80% 80%, rgba(201,168,76,0.03) 0%, transparent 70%);
    pointer-events: none;
  }

  .seller-auth-panel-logo {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 2.6rem;
    font-weight: 300;
    font-style: italic;
    color: ${G.gold};
    letter-spacing: 0.06em;
    margin-bottom: 0.25rem;
    line-height: 1;
  }

  .seller-auth-panel-sub {
    font-size: 0.62rem;
    letter-spacing: 0.35em;
    text-transform: uppercase;
    color: ${G.muted};
    margin-bottom: 4rem;
  }

  .seller-auth-panel-headline {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: clamp(2.2rem, 4vw, 3.5rem);
    font-weight: 300;
    color: ${G.text};
    line-height: 1.15;
    letter-spacing: 0.01em;
    margin-bottom: 1.25rem;
  }

  .seller-auth-panel-headline em {
    font-style: italic;
    color: ${G.gold};
  }

  .seller-auth-panel-body {
    font-size: 0.82rem;
    color: ${G.muted};
    line-height: 1.8;
    max-width: 340px;
    margin-bottom: 3rem;
    letter-spacing: 0.03em;
  }

  .seller-auth-panel-stats {
    display: flex;
    gap: 2.5rem;
  }

  .seller-auth-stat-number {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 1.9rem;
    font-weight: 300;
    color: ${G.gold};
    line-height: 1;
  }

  .seller-auth-stat-label {
    font-size: 0.6rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: ${G.muted};
    margin-top: 0.3rem;
  }

  .seller-auth-panel-line {
    position: absolute;
    bottom: 3rem;
    left: 5rem;
    right: 5rem;
    height: 1px;
    background: linear-gradient(90deg, transparent, ${G.goldDim}, transparent);
  }

  /* ── Right form panel ── */
  .seller-auth-form-wrap {
    width: 480px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 3.5rem 3.5rem;
    background: ${G.card};
    position: relative;
  }

  .seller-auth-form-wrap::before {
    content: '';
    position: absolute;
    top: 0; bottom: 0; left: 0;
    width: 1px;
    background: linear-gradient(180deg, transparent 0%, ${G.goldDim} 30%, ${G.goldDim} 70%, transparent 100%);
  }

  /* ── Tab toggle ── */
  .seller-auth-tabs {
    display: flex;
    background: rgba(255,255,255,0.03);
    border: 1px solid ${G.border};
    border-radius: 6px;
    padding: 3px;
    margin-bottom: 2.25rem;
  }

  .seller-auth-tab {
    flex: 1;
    padding: 0.65rem 0;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.22s ease;
    background: transparent;
    color: ${G.muted};
  }

  .seller-auth-tab--active {
    background: linear-gradient(135deg, ${G.gold}, ${G.goldLight});
    color: #0A0A0A;
    box-shadow: 0 2px 10px rgba(201,168,76,0.25);
  }

  /* ── Form heading ── */
  .seller-auth-form-title {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 1.75rem;
    font-weight: 300;
    color: ${G.text};
    letter-spacing: 0.02em;
    margin-bottom: 0.35rem;
    line-height: 1.2;
  }

  .seller-auth-form-hint {
    font-size: 0.72rem;
    color: ${G.muted};
    letter-spacing: 0.05em;
    margin-bottom: 1.75rem;
  }

  /* ── Alert banners ── */
  .seller-auth-alert {
    border-radius: 6px;
    padding: 0.7rem 1rem;
    font-size: 0.75rem;
    line-height: 1.5;
    margin-bottom: 1.25rem;
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    letter-spacing: 0.03em;
  }

  .seller-auth-alert--error {
    background: ${G.errorBg};
    border: 1px solid rgba(212,96,96,0.25);
    color: ${G.error};
  }

  .seller-auth-alert--success {
    background: ${G.successBg};
    border: 1px solid rgba(107,184,138,0.25);
    color: ${G.success};
  }

  /* ── Input fields ── */
  .seller-field {
    margin-bottom: 1.15rem;
  }

  .seller-field-label {
    display: block;
    font-size: 0.62rem;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: ${G.muted};
    margin-bottom: 0.45rem;
  }

  .seller-field-wrap {
    position: relative;
  }

  .seller-field-input {
    width: 100%;
    background: rgba(255,255,255,0.03);
    border: 1px solid ${G.border};
    border-radius: 6px;
    padding: 0.7rem 0.9rem;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.82rem;
    color: ${G.text};
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    box-sizing: border-box;
    letter-spacing: 0.03em;
  }

  .seller-field-input::placeholder { color: ${G.muted}; }

  .seller-field-input:focus {
    border-color: ${G.gold};
    box-shadow: 0 0 0 3px rgba(201,168,76,0.1);
    background: rgba(201,168,76,0.02);
  }

  .seller-field-input--error {
    border-color: rgba(212,96,96,0.5) !important;
  }

  .seller-field-error {
    font-size: 0.68rem;
    color: ${G.error};
    margin-top: 0.35rem;
    letter-spacing: 0.04em;
  }

  .seller-field-eye {
    position: absolute;
    right: 0.8rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: ${G.muted};
    font-size: 0.7rem;
    letter-spacing: 0.08em;
    padding: 0;
    font-family: inherit;
    transition: color 0.2s;
  }
  .seller-field-eye:hover { color: ${G.gold}; }

  /* ── Submit button ── */
  .seller-auth-submit {
    width: 100%;
    margin-top: 0.5rem;
    padding: 0.85rem;
    background: linear-gradient(135deg, ${G.gold} 0%, ${G.goldLight} 100%);
    color: #0A0A0A;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: opacity 0.18s, transform 0.18s, box-shadow 0.18s;
    box-shadow: 0 4px 18px rgba(201,168,76,0.2);
  }

  .seller-auth-submit:hover {
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: 0 6px 24px rgba(201,168,76,0.3);
  }

  .seller-auth-submit:active { transform: translateY(0); }

  .seller-auth-submit:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    transform: none;
  }

  /* ── Divider ── */
  .seller-auth-divider {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin: 1.5rem 0;
  }
  .seller-auth-divider::before,
  .seller-auth-divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${G.border};
  }
  .seller-auth-divider span {
    font-size: 0.62rem;
    color: ${G.muted};
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  /* ── Back to shop link ── */
  .seller-auth-back {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.68rem;
    color: ${G.muted};
    text-decoration: none;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    transition: color 0.2s;
  }
  .seller-auth-back:hover { color: ${G.gold}; }

  /* ── Mobile ── */
  @media (max-width: 820px) {
    .seller-auth-panel { display: none; }
    .seller-auth-form-wrap {
      width: 100%;
      padding: 2.5rem 2rem;
      min-height: 100vh;
      justify-content: center;
    }
  }
`;

/* ── Reusable input field ──────────────────────────────────────── */
function Field({ label, type = "text", value, onChange, placeholder, error, autoFocus }) {
  const [show, setShow] = useState(false);
  const isPwd = type === "password";
  return (
    <div className="seller-field">
      <label className="seller-field-label">{label}</label>
      <div className="seller-field-wrap">
        <input
          type={isPwd && show ? "text" : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={`seller-field-input${error ? " seller-field-input--error" : ""}`}
        />
        {isPwd && (
          <button type="button" className="seller-field-eye" onClick={() => setShow(s => !s)}>
            {show ? "Hide" : "Show"}
          </button>
        )}
      </div>
      {error && <div className="seller-field-error">⚠ {error}</div>}
    </div>
  );
}

/* ── LOGIN form ────────────────────────────────────────────────── */
function LoginForm({ onSwitch }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (ev) => {
    ev.preventDefault();
    const errs = {};
    if (!form.email.trim()) errs.email = "Email is required";
    if (!form.password) errs.password = "Password is required";
    if (Object.keys(errs).length) { setErrors(errs); return; }

    // Look up users from localStorage
    let users = [];
    try { users = JSON.parse(localStorage.getItem("sellerUsers") || "[]"); } catch {}

    const user = users.find(u => u.email.toLowerCase() === form.email.trim().toLowerCase());

    if (!user) {
      setAlert({ type: "error", msg: "User not found. Please register first." });
      return;
    }
    if (user.password !== form.password) {
      setAlert({ type: "error", msg: "Invalid credentials. Please check your password." });
      return;
    }

    // ── Success: write shared auth state ────────────────────────
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("user", JSON.stringify({ fullName: user.fullName, email: user.email }));
    navigate("/seller/dashboard", { replace: true });
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="seller-auth-form-title">Welcome back</div>
      <div className="seller-auth-form-hint">Sign in to your Seller Center account</div>

      {alert && (
        <div className={`seller-auth-alert seller-auth-alert--${alert.type}`}>
          {alert.type === "error" ? "✕" : "✓"} {alert.msg}
        </div>
      )}

      <Field label="Email Address" type="email" value={form.email} onChange={set("email")} placeholder="your@email.com" error={errors.email} autoFocus />
      <Field label="Password" type="password" value={form.password} onChange={set("password")} placeholder="Your password" error={errors.password} />

      <button type="submit" className="seller-auth-submit">Sign In to Dashboard</button>

      <div className="seller-auth-divider"><span>or</span></div>

      <div style={{ textAlign: "center", fontSize: "0.72rem", color: G.muted, letterSpacing: "0.05em" }}>
        No account?{" "}
        <button type="button" onClick={onSwitch} style={{ background: "none", border: "none", color: G.gold, cursor: "pointer", fontWeight: 600, fontSize: "0.72rem", fontFamily: "inherit", padding: 0, letterSpacing: "0.05em" }}>
          Create one
        </button>
      </div>
    </form>
  );
}

/* ── REGISTER form ─────────────────────────────────────────────── */
function RegisterForm({ onSwitch }) {
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (ev) => {
    ev.preventDefault();
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = "Full name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email address";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 6) errs.password = "Minimum 6 characters required";
    if (!form.confirm) errs.confirm = "Please confirm your password";
    else if (form.password !== form.confirm) errs.confirm = "Passwords do not match";
    if (Object.keys(errs).length) { setErrors(errs); return; }

    let users = [];
    try { users = JSON.parse(localStorage.getItem("sellerUsers") || "[]"); } catch {}

    if (users.find(u => u.email.toLowerCase() === form.email.trim().toLowerCase())) {
      setErrors({ email: "This email is already registered. Please sign in." });
      return;
    }

    users.push({ fullName: form.fullName.trim(), email: form.email.trim().toLowerCase(), password: form.password });
    localStorage.setItem("sellerUsers", JSON.stringify(users));

    setAlert({ type: "success", msg: "Account created! Redirecting to sign in…" });
    setTimeout(() => onSwitch(), 1800);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="seller-auth-form-title">Create account</div>
      <div className="seller-auth-form-hint">Join the Aurum Seller Center</div>

      {alert && (
        <div className={`seller-auth-alert seller-auth-alert--${alert.type}`}>
          {alert.type === "error" ? "✕" : "✓"} {alert.msg}
        </div>
      )}

      <Field label="Full Name" value={form.fullName} onChange={set("fullName")} placeholder="Your full name" error={errors.fullName} autoFocus />
      <Field label="Email Address" type="email" value={form.email} onChange={set("email")} placeholder="your@email.com" error={errors.email} />
      <Field label="Password" type="password" value={form.password} onChange={set("password")} placeholder="Min. 6 characters" error={errors.password} />
      <Field label="Confirm Password" type="password" value={form.confirm} onChange={set("confirm")} placeholder="Repeat your password" error={errors.confirm} />

      <button type="submit" className="seller-auth-submit">Create Account</button>

      <div className="seller-auth-divider"><span>or</span></div>

      <div style={{ textAlign: "center", fontSize: "0.72rem", color: G.muted, letterSpacing: "0.05em" }}>
        Already registered?{" "}
        <button type="button" onClick={onSwitch} style={{ background: "none", border: "none", color: G.gold, cursor: "pointer", fontWeight: 600, fontSize: "0.72rem", fontFamily: "inherit", padding: 0, letterSpacing: "0.05em" }}>
          Sign in
        </button>
      </div>
    </form>
  );
}

/* ── Page root ─────────────────────────────────────────────────── */
export default function SellerAuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");

  // If already logged in, skip straight to dashboard
  useEffect(() => {
    if (localStorage.getItem("isLoggedIn") === "true") {
      navigate("/seller/dashboard", { replace: true });
    }
  }, [navigate]);

  return (
    <>
      <style>{css}</style>
      <div className="seller-auth-root">

        {/* ── Left decorative panel ── */}
        <div className="seller-auth-panel">
          <div className="seller-auth-panel-logo">Aurum</div>
          <div className="seller-auth-panel-sub">Seller Center — Est. 1924</div>

          <h1 className="seller-auth-panel-headline">
            Grow your<br />
            jewellery <em>business</em><br />
            with us.
          </h1>
          <p className="seller-auth-panel-body">
            Manage your inventory, track orders, analyse revenue trends,
            and connect with thousands of discerning buyers — all from
            one beautifully crafted dashboard.
          </p>

          <div className="seller-auth-panel-stats">
            <div>
              <div className="seller-auth-stat-number">50K+</div>
              <div className="seller-auth-stat-label">Active Buyers</div>
            </div>
            <div>
              <div className="seller-auth-stat-number">₹18L+</div>
              <div className="seller-auth-stat-label">Monthly GMV</div>
            </div>
            <div>
              <div className="seller-auth-stat-number">4.8★</div>
              <div className="seller-auth-stat-label">Seller Rating</div>
            </div>
          </div>

          <div className="seller-auth-panel-line" />
        </div>

        {/* ── Right form panel ── */}
        <div className="seller-auth-form-wrap">
          {/* Back to shop */}
          <div style={{ marginBottom: "2rem" }}>
            <Link to="/" className="seller-auth-back">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Back to Aurum Shop
            </Link>
          </div>

          {/* Tab toggle */}
          <div className="seller-auth-tabs">
            <button
              type="button"
              className={`seller-auth-tab${mode === "login" ? " seller-auth-tab--active" : ""}`}
              onClick={() => setMode("login")}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`seller-auth-tab${mode === "register" ? " seller-auth-tab--active" : ""}`}
              onClick={() => setMode("register")}
            >
              Register
            </button>
          </div>

          {mode === "login"
            ? <LoginForm onSwitch={() => setMode("register")} />
            : <RegisterForm onSwitch={() => setMode("login")} />
          }

          <div style={{ marginTop: "2rem", fontSize: "0.62rem", color: G.muted, textAlign: "center", letterSpacing: "0.08em" }}>
            Your data is stored securely and never shared
          </div>
        </div>
      </div>
    </>
  );
}
