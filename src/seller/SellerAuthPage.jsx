/**
 * ─────────────────────────────────────────────────────────────────
 *  SellerAuthPage.jsx  —  /seller  (UPDATED for Trendy Drapes)
 *
 *  REPLACE the existing file at: src/seller/SellerAuthPage.jsx
 *
 *  Changes from original:
 *   • Brand renamed: "Aurum" → "Trendy Drapes"
 *   • Dark gold palette → Warm cream/ivory light-mode palette
 *   • Fonts kept: Cormorant Garamond + now uses Jost (from index.css)
 *   • After login: checks td_onboarding_done → routes to onboarding or dashboard
 *   • After register: sets td_onboarding_done = false → routes to onboarding
 *   • Stats updated to Trendy Drapes context (sarees / fabric)
 * ─────────────────────────────────────────────────────────────────
 */

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { apiFetch } from "@/utils/api";

/* ── Trendy Drapes brand palette ─────────────────────────────── */
const G = {
  // Backgrounds
  bg:          "#FAF8F4",
  bgAlt:       "#F5F1EA",
  surface:     "#FFFFFF",
  panel:       "#F0EBE0",

  // Gold
  gold:        "#C9A84C",
  goldLight:   "#E2C97A",
  goldDark:    "#A07C2A",
  goldBg:      "rgba(201,168,76,0.09)",
  goldBorder:  "rgba(201,168,76,0.32)",
  goldFocus:   "rgba(201,168,76,0.55)",

  // Text
  text:        "#1C1A16",
  textMid:     "#4A4438",
  muted:       "#9A8E7C",

  // Borders
  border:      "#E8E0D0",
  borderDark:  "#D4C8B0",

  // States
  error:       "#C0392B",
  errorBg:     "rgba(192,57,43,0.06)",
  success:     "#2E7D52",
  successBg:   "rgba(46,125,82,0.07)",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Jost:wght@300;400;500;600;700&display=swap');

  .td-auth-root {
    min-height: 100vh;
    background: ${G.bg};
    display: flex;
    align-items: stretch;
    font-family: 'Jost', 'Segoe UI', sans-serif;
    overflow: hidden;
  }

  /* ── Left panel ── */
  .td-auth-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 4rem 5rem;
    position: relative;
    background: linear-gradient(160deg, #EDE8DC 0%, #E8E1D2 50%, #DDD4BF 100%);
    border-right: 1px solid ${G.border};
    overflow: hidden;
  }

  .td-auth-panel::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 500px 400px at 15% 30%, rgba(201,168,76,0.12) 0%, transparent 70%),
      radial-gradient(ellipse 350px 300px at 85% 75%, rgba(201,168,76,0.08) 0%, transparent 70%);
    pointer-events: none;
  }

  /* Decorative fabric pattern */
  .td-auth-panel::after {
    content: '';
    position: absolute;
    right: -60px; top: 50%;
    transform: translateY(-50%);
    width: 280px; height: 280px;
    border-radius: 50%;
    border: 1px solid rgba(201,168,76,0.15);
    pointer-events: none;
  }

  .td-auth-panel-logo {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 2.8rem;
    font-weight: 600;
    color: ${G.text};
    letter-spacing: 0.02em;
    line-height: 1;
    margin-bottom: 0.2rem;
    position: relative;
  }

  .td-auth-panel-logo em {
    font-style: italic;
    color: ${G.gold};
  }

  .td-auth-panel-sub {
    font-size: 0.6rem;
    letter-spacing: 0.32em;
    text-transform: uppercase;
    color: ${G.muted};
    margin-bottom: 3.5rem;
    position: relative;
    font-weight: 500;
  }

  .td-auth-panel-headline {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: clamp(2.2rem, 3.8vw, 3.2rem);
    font-weight: 400;
    color: ${G.text};
    line-height: 1.18;
    letter-spacing: 0.01em;
    margin-bottom: 1.25rem;
    position: relative;
  }

  .td-auth-panel-headline em {
    font-style: italic;
    color: ${G.gold};
  }

  .td-auth-panel-body {
    font-size: 0.82rem;
    color: ${G.muted};
    line-height: 1.7;
    max-width: 380px;
    margin-bottom: 2.5rem;
    position: relative;
    letter-spacing: 0.02em;
  }

  .td-auth-panel-line {
    width: 48px;
    height: 2px;
    background: linear-gradient(90deg, ${G.gold}, ${G.goldLight});
    margin-bottom: 2.5rem;
    position: relative;
  }

  .td-auth-panel-stats {
    display: flex;
    gap: 2.5rem;
    position: relative;
  }

  .td-auth-stat-number {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 1.9rem;
    font-weight: 600;
    color: ${G.text};
    line-height: 1;
    margin-bottom: 0.25rem;
  }

  .td-auth-stat-label {
    font-size: 0.62rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: ${G.muted};
    font-weight: 500;
  }

  /* ── Right form panel ── */
  .td-auth-form-wrap {
    width: 480px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 3rem 3.5rem;
    background: ${G.surface};
    overflow-y: auto;
  }

  .td-auth-back {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.7rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: ${G.muted};
    text-decoration: none;
    transition: color 0.18s;
    font-weight: 500;
  }
  .td-auth-back:hover { color: ${G.gold}; }

  .td-auth-tabs {
    display: flex;
    gap: 0.4rem;
    background: ${G.bgAlt};
    border-radius: 6px;
    padding: 4px;
    margin-bottom: 2rem;
    border: 1px solid ${G.border};
  }

  .td-auth-tab {
    flex: 1;
    padding: 0.6rem;
    border: none;
    border-radius: 4px;
    background: transparent;
    font-family: 'Jost', sans-serif;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${G.muted};
    cursor: pointer;
    transition: all 0.2s;
  }

  .td-auth-tab--active {
    background: ${G.text};
    color: ${G.bg};
    box-shadow: 0 2px 8px rgba(28,26,22,0.12);
  }

  .td-auth-form-title {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 1.8rem;
    font-weight: 500;
    color: ${G.text};
    margin-bottom: 0.3rem;
    letter-spacing: 0.01em;
  }

  .td-auth-form-hint {
    font-size: 0.75rem;
    color: ${G.muted};
    margin-bottom: 1.75rem;
    letter-spacing: 0.04em;
  }

  .td-auth-field { margin-bottom: 1.1rem; }

  .td-auth-label {
    display: block;
    font-size: 0.62rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: ${G.textMid};
    margin-bottom: 0.4rem;
  }

  .td-auth-input {
    width: 100%;
    background: ${G.bg};
    border: 1.5px solid ${G.border};
    border-radius: 6px;
    padding: 0.72rem 0.9rem;
    font-family: 'Jost', sans-serif;
    font-size: 0.84rem;
    color: ${G.text};
    outline: none;
    transition: border-color 0.18s, box-shadow 0.18s;
  }
  .td-auth-input:hover { border-color: ${G.borderDark}; }
  .td-auth-input:focus {
    border-color: ${G.gold};
    box-shadow: 0 0 0 3px ${G.goldBg};
  }
  .td-auth-input::placeholder { color: rgba(154,142,124,0.55); }
  .td-auth-input--error {
    border-color: rgba(192,57,43,0.4);
    background: ${G.errorBg};
  }

  .td-auth-err {
    font-size: 0.65rem;
    color: ${G.error};
    margin-top: 0.3rem;
    letter-spacing: 0.04em;
  }

  .td-auth-alert {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.75rem 0.9rem;
    border-radius: 6px;
    font-size: 0.78rem;
    margin-bottom: 1.1rem;
    letter-spacing: 0.02em;
  }
  .td-auth-alert--error {
    background: ${G.errorBg};
    border: 1px solid rgba(192,57,43,0.25);
    color: ${G.error};
  }
  .td-auth-alert--success {
    background: ${G.successBg};
    border: 1px solid rgba(46,125,82,0.25);
    color: ${G.success};
  }

  .td-auth-submit {
    width: 100%;
    margin-top: 0.6rem;
    padding: 0.85rem;
    background: ${G.text};
    color: ${G.bg};
    border: none;
    border-radius: 6px;
    font-family: 'Jost', sans-serif;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.2s;
  }
  .td-auth-submit:hover {
    background: #2E2B24;
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(28,26,22,0.18);
  }
  .td-auth-submit:active { transform: translateY(0); }
  .td-auth-submit:disabled { opacity: 0.45; cursor: not-allowed; transform: none; box-shadow: none; }

  .td-auth-divider {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin: 1.25rem 0;
    color: ${G.muted};
    font-size: 0.7rem;
    letter-spacing: 0.1em;
  }
  .td-auth-divider::before,
  .td-auth-divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${G.border};
  }

  @media (max-width: 900px) {
    .td-auth-panel { display: none; }
    .td-auth-form-wrap { width: 100%; padding: 2rem 1.5rem; }
  }
`;

/* ── Field component ─────────────────────────────────────────── */
function Field({ label, type = "text", value, onChange, placeholder, error, autoFocus, disabled }) {
  const [show, setShow] = useState(false);
  const isPwd = type === "password";
  return (
    <div className="td-auth-field">
      <label className="td-auth-label">{label}</label>
      <div style={{ position: "relative" }}>
        <input
          type={isPwd && show ? "text" : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoFocus={autoFocus}
          disabled={disabled}
          className={`td-auth-input${error ? " td-auth-input--error" : ""}`}
          style={isPwd ? { paddingRight: "2.5rem" } : {}}
        />
        {isPwd && (
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "0.75rem", color: G.muted, fontFamily: "inherit", padding: 0 }}
          >
            {show ? "Hide" : "Show"}
          </button>
        )}
      </div>
      {error && <div className="td-auth-err">⚠ {error}</div>}
    </div>
  );
}

/* ── LOGIN form ──────────────────────────────────────────────── */
function LoginForm({ onSwitch }) {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = {};
    if (!form.email.trim()) errs.email = "Email is required";
    if (!form.password) errs.password = "Password is required";
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);

    try {
      const res = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();

      if (!data.success) {
        setAlert({ type: "error", msg: data.message || "Invalid credentials" });
        setLoading(false);
        return;
      }

      // Store session
      setSession(
        { email: data.user?.email || form.email, name: data.user?.name || "Seller" }, 
        "seller", 
        data.token || "", 
        data.onboardingCompleted
      );

      // Navigate based on backend status
      navigate(data.onboardingCompleted ? "/seller/dashboard" : "/seller/onboarding", { replace: true });

    } catch {
      setAlert({ type: "error", msg: "Could not connect to server. Please try again." });
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="td-auth-form-title">Welcome back</div>
      <div className="td-auth-form-hint">Sign in to your Trendy Drapes Seller account</div>

      {alert && (
        <div className={`td-auth-alert td-auth-alert--${alert.type}`}>
          {alert.type === "error" ? "✕" : "✓"} {alert.msg}
        </div>
      )}

      <Field label="Email Address" type="email" value={form.email} onChange={set("email")} placeholder="you@email.com" error={errors.email} autoFocus />
      <Field label="Password" type="password" value={form.password} onChange={set("password")} placeholder="Your password" error={errors.password} />

      <button type="submit" className="td-auth-submit" disabled={loading}>
        {loading ? "Signing in…" : "Sign In to Dashboard"}
      </button>

      <div className="td-auth-divider"><span>or</span></div>

      <div style={{ textAlign: "center", fontSize: "0.72rem", color: G.muted, letterSpacing: "0.05em" }}>
        No account?{" "}
        <button type="button" onClick={onSwitch} style={{ background: "none", border: "none", color: G.gold, cursor: "pointer", fontWeight: 700, fontSize: "0.72rem", fontFamily: "inherit", padding: 0, letterSpacing: "0.05em" }}>
          Create one →
        </button>
      </div>
    </form>
  );
}

/* ── REGISTER form ───────────────────────────────────────────── */
function RegisterForm({ onSwitch }) {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = "Full name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 6) errs.password = "Minimum 6 characters";
    if (form.password !== form.confirm) errs.confirm = "Passwords do not match";
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);

    try {
      const res = await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name: form.fullName, email: form.email, password: form.password, role: "seller" }),
      });
      const data = await res.json();

      if (!data.success) {
        setAlert({ type: "error", msg: data.message || "Registration failed" });
        setLoading(false);
        return;
      }

      // Auto-login after register
      const loginRes = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const loginData = await loginRes.json();

      if (loginData.success) {
        setSession(
          { fullName: form.fullName, email: form.email }, 
          "seller", 
          loginData.token || "", 
          loginData.onboardingCompleted
        );

        setAlert({ type: "success", msg: "Account created! Starting your onboarding…" });
        setTimeout(() => navigate("/seller/onboarding", { replace: true }), 1200);
      } else {
        setAlert({ type: "success", msg: "Account created! Please sign in." });
        setTimeout(() => onSwitch(), 1800);
      }

    } catch {
      setAlert({ type: "error", msg: "Could not connect to server. Please try again." });
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="td-auth-form-title">Create account</div>
      <div className="td-auth-form-hint">Join Trendy Drapes as a Seller</div>

      {alert && (
        <div className={`td-auth-alert td-auth-alert--${alert.type}`}>
          {alert.type === "error" ? "✕" : "✓"} {alert.msg}
        </div>
      )}

      <Field label="Full Name" value={form.fullName} onChange={set("fullName")} placeholder="Your full name" error={errors.fullName} autoFocus />
      <Field label="Email Address" type="email" value={form.email} onChange={set("email")} placeholder="you@email.com" error={errors.email} />
      <Field label="Password" type="password" value={form.password} onChange={set("password")} placeholder="Min. 6 characters" error={errors.password} />
      <Field label="Confirm Password" type="password" value={form.confirm} onChange={set("confirm")} placeholder="Repeat password" error={errors.confirm} />

      <button type="submit" className="td-auth-submit" disabled={loading}>
        {loading ? "Creating account…" : "Create Account & Continue"}
      </button>

      <div className="td-auth-divider"><span>or</span></div>

      <div style={{ textAlign: "center", fontSize: "0.72rem", color: G.muted, letterSpacing: "0.05em" }}>
        Already registered?{" "}
        <button type="button" onClick={onSwitch} style={{ background: "none", border: "none", color: G.gold, cursor: "pointer", fontWeight: 700, fontSize: "0.72rem", fontFamily: "inherit", padding: 0, letterSpacing: "0.05em" }}>
          Sign in →
        </button>
      </div>
    </form>
  );
}

/* ── Page root ───────────────────────────────────────────────── */
export default function SellerAuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const { user, role } = useAuth();

  useEffect(() => {
    if (user && role === "seller") {
      const done = user.onboardingCompleted === true;
      navigate(done ? "/seller/dashboard" : "/seller/onboarding", { replace: true });
    }
  }, [user, role, navigate]);

  return (
    <>
      <style>{css}</style>
      <div className="td-auth-root">

        {/* ── Left panel ── */}
        <div className="td-auth-panel">
          <div className="td-auth-panel-logo">Trendy <em>Drapes</em></div>
          <div className="td-auth-panel-sub">Seller Center — Since 2020</div>

          <h1 className="td-auth-panel-headline">
            Sell your <em>sarees</em><br />
            to a nation<br />
            of buyers.
          </h1>

          <div className="td-auth-panel-line" />

          <p className="td-auth-panel-body">
            List your handloom sarees, silk collections, and ethnic wear on India's
            most trusted drapes marketplace. Manage inventory, track orders,
            and grow your weaving business — all from one elegant dashboard.
          </p>

          <div className="td-auth-panel-stats">
            <div>
              <div className="td-auth-stat-number">1.2L+</div>
              <div className="td-auth-stat-label">Active Buyers</div>
            </div>
            <div>
              <div className="td-auth-stat-number">₹42L+</div>
              <div className="td-auth-stat-label">Monthly GMV</div>
            </div>
            <div>
              <div className="td-auth-stat-number">4.9★</div>
              <div className="td-auth-stat-label">Seller Rating</div>
            </div>
          </div>
        </div>

        {/* ── Right form panel ── */}
        <div className="td-auth-form-wrap">
          <div style={{ marginBottom: "2rem" }}>
            <Link to="/" className="td-auth-back">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Back to Trendy Drapes
            </Link>
          </div>

          <div className="td-auth-tabs">
            <button type="button" className={`td-auth-tab${mode === "login" ? " td-auth-tab--active" : ""}`} onClick={() => setMode("login")}>
              Sign In
            </button>
            <button type="button" className={`td-auth-tab${mode === "register" ? " td-auth-tab--active" : ""}`} onClick={() => setMode("register")}>
              Register
            </button>
          </div>

          {mode === "login"
            ? <LoginForm onSwitch={() => setMode("register")} />
            : <RegisterForm onSwitch={() => setMode("login")} />
          }

          <div style={{ marginTop: "2rem", fontSize: "0.62rem", color: G.muted, textAlign: "center", letterSpacing: "0.08em", lineHeight: 1.5 }}>
            Your data is encrypted and never shared with third parties
          </div>
        </div>

      </div>
    </>
  );
}