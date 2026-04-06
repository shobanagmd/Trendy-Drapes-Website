
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// ─── THEME ────────────────────────────────────────────────────────────────────
const PRIMARY = "#8B5CF6"; // Purple gradient
const PRIMARY_DARK = "#7C3AED";
const PRIMARY_LIGHT = "#A78BFA";
const BG_WHITE = "#FFFFFF";
const CARD_WHITE = "#FFFFFF";
const BORDER_LIGHT = "#E5E7EB";
const TEXT_PRIMARY = "#1F2937";
const TEXT_SECONDARY = "#6B7280";
const TEXT_MUTED = "#9CA3AF";
const SUCCESS = "#10B981";
const ERROR = "#EF4444";
const GRADIENT_START = "#8B5CF6";
const GRADIENT_END = "#6366F1";

// ─── SHARED FIELD ────────────────────────────────────────────────────────────
function InputField({ label, type = "text", value, onChange, placeholder, error }) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);
  const isPassword = type === "password";

  return (
    <div style={{ marginBottom: 24 }}>
      <label style={{ 
        display: "block", 
        fontSize: 13, 
        fontWeight: 600, 
        color: TEXT_SECONDARY, 
        marginBottom: 8,
        letterSpacing: "0.3px"
      }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          type={isPassword && show ? "text" : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{
            width: "100%",
            background: BG_WHITE,
            border: `2px solid ${error ? ERROR : (focused ? PRIMARY : BORDER_LIGHT)}`,
            borderRadius: 12,
            padding: isPassword ? "13px 48px 13px 16px" : "13px 16px",
            fontSize: 14,
            color: TEXT_PRIMARY,
            outline: "none",
            boxSizing: "border-box",
            transition: "all 0.2s ease",
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            style={{
              position: "absolute",
              right: 14,
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: TEXT_MUTED,
              fontSize: 13,
              padding: 0,
              fontWeight: 500,
            }}
          >
            {show ? "Hide" : "Show"}
          </button>
        )}
      </div>
      {error && (
        <div style={{ 
          fontSize: 12, 
          color: ERROR, 
          marginTop: 6, 
          display: "flex", 
          alignItems: "center", 
          gap: 6,
          fontWeight: 500
        }}>
          <span>⚠️</span> {error}
        </div>
      )}
    </div>
  );
}

// ─── REGISTER FORM ───────────────────────────────────────────────────────────
function RegisterForm({ onSwitch }) {
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = "Full name is required";
    if (!form.email.trim()) {
      errs.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = "Please enter a valid email address";
    }
    if (!form.password) {
      errs.password = "Password is required";
    } else if (form.password.length < 6) {
      errs.password = "Password must be at least 6 characters";
    }
    if (!form.confirmPassword) {
      errs.confirmPassword = "Please confirm your password";
    } else if (form.password !== form.confirmPassword) {
      errs.confirmPassword = "Passwords do not match";
    }
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const existing = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
      if (existing.find(u => u.email.toLowerCase() === form.email.toLowerCase())) {
        setErrors({ email: "This email is already registered. Please login." });
        setLoading(false);
        return;
      }

      const userData = {
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        registeredAt: new Date().toISOString(),
      };
      existing.push(userData);
      localStorage.setItem("registeredUsers", JSON.stringify(existing));

      setErrors({});
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onSwitch();
        setLoading(false);
      }, 2000);
    } catch {
      setErrors({ general: "Something went wrong. Please try again." });
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ 
          fontSize: 28, 
          fontWeight: 700, 
          background: `linear-gradient(135deg, ${GRADIENT_START}, ${GRADIENT_END})`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          marginBottom: 8
        }}>
          Create Account
        </div>
        <div style={{ fontSize: 14, color: TEXT_SECONDARY }}>
          Join LuxeJewels™ Seller Center
        </div>
      </div>

      {errors.general && (
        <div style={{ 
          background: "#FEF2F2", 
          border: `1px solid ${ERROR}`,
          borderRadius: 12, 
          padding: "12px 16px", 
          marginBottom: 20, 
          fontSize: 13, 
          color: ERROR,
          display: "flex",
          alignItems: "center",
          gap: 8
        }}>
          {/* <span></span> {errors.general} */}
        </div>
      )}

      {success && (
        <div style={{ 
          background: "#ECFDF5", 
          border: `1px solid ${SUCCESS}`,
          borderRadius: 12, 
          padding: "12px 16px", 
          marginBottom: 20, 
          fontSize: 13, 
          color: SUCCESS,
          display: "flex",
          alignItems: "center",
          gap: 8
        }}>
          <span>✅</span> Account created successfully! Redirecting to login…
        </div>
      )}

      <InputField label="Full Name" value={form.fullName} onChange={set("fullName")} placeholder="e.g., Arjun Mehta" error={errors.fullName} />
      <InputField label="Email Address" type="email" value={form.email} onChange={set("email")} placeholder="e.g., arjun@luxejewels.com" error={errors.email} />
      <InputField label="Password" type="password" value={form.password} onChange={set("password")} placeholder="Min 6 characters" error={errors.password} />
      <InputField label="Confirm Password" type="password" value={form.confirmPassword} onChange={set("confirmPassword")} placeholder="Repeat your password" error={errors.confirmPassword} />

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          width: "100%",
          marginTop: 8,
          background: `linear-gradient(135deg, ${GRADIENT_START}, ${GRADIENT_END})`,
          color: "#fff",
          border: "none",
          borderRadius: 12,
          padding: "14px",
          fontSize: 15,
          fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
          fontFamily: "'Inter', sans-serif",
          boxShadow: "0 4px 14px rgba(139,92,246,0.3)",
          transition: "all 0.2s ease",
          opacity: loading ? 0.7 : 1,
        }}
        onMouseEnter={e => !loading && (e.currentTarget.style.transform = "translateY(-2px)")}
        onMouseLeave={e => !loading && (e.currentTarget.style.transform = "translateY(0)")}
      >
        {loading ? "Creating Account..." : "Create Account"}
      </button>

      <div style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: TEXT_SECONDARY }}>
        Already have an account?{" "}
        <button
          onClick={onSwitch}
          style={{ 
            background: "none", 
            border: "none", 
            color: PRIMARY, 
            cursor: "pointer", 
            fontWeight: 600, 
            fontSize: 14, 
            fontFamily: "inherit", 
            padding: 0,
            textDecoration: "underline"
          }}
        >
          Sign In
        </button>
      </div>
    </div>
  );
}

// ─── LOGIN FORM ──────────────────────────────────────────────────────────────
function LoginForm({ onSwitch }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async () => {
    const errs = {};
    if (!form.email.trim()) errs.email = "Email is required";
    if (!form.password) errs.password = "Password is required";

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const users = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
      const user = users.find(u => u.email.toLowerCase() === form.email.trim().toLowerCase());

      if (!user) {
        setErrors({ general: "User not found. Please register first." });
        setLoading(false);
        return;
      }

      if (user.password !== form.password) {
        setErrors({ general: "Invalid credentials. Please check your password." });
        setLoading(false);
        return;
      }

      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("currentUser", JSON.stringify({ fullName: user.fullName, email: user.email }));
      navigate("/dashboard");
    } catch {
      setErrors({ general: "Something went wrong. Please try again." });
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ 
          fontSize: 28, 
          fontWeight: 700, 
          background: `linear-gradient(135deg, ${GRADIENT_START}, ${GRADIENT_END})`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          marginBottom: 8
        }}>
          Welcome Back
        </div>
        <div style={{ fontSize: 14, color: TEXT_SECONDARY }}>
          Sign in to your Seller Center
        </div>
      </div>

      {errors.general && (
        <div style={{ 
          background: "#FEF2F2", 
          border: `1px solid ${ERROR}`,
          borderRadius: 12, 
          padding: "12px 16px", 
          marginBottom: 20, 
          fontSize: 13, 
          color: ERROR,
          display: "flex",
          alignItems: "center",
          gap: 8
        }}>
          <span>⚠️</span> {errors.general}
        </div>
      )}

      <InputField label="Email Address" type="email" value={form.email} onChange={set("email")} placeholder="Your registered email" error={errors.email} />
      <InputField label="Password" type="password" value={form.password} onChange={set("password")} placeholder="Your password" error={errors.password} />

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          width: "100%",
          marginTop: 8,
          background: `linear-gradient(135deg, ${GRADIENT_START}, ${GRADIENT_END})`,
          color: "#fff",
          border: "none",
          borderRadius: 12,
          padding: "14px",
          fontSize: 15,
          fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
          fontFamily: "'Inter', sans-serif",
          boxShadow: "0 4px 14px rgba(139,92,246,0.3)",
          transition: "all 0.2s ease",
          opacity: loading ? 0.7 : 1,
        }}
        onMouseEnter={e => !loading && (e.currentTarget.style.transform = "translateY(-2px)")}
        onMouseLeave={e => !loading && (e.currentTarget.style.transform = "translateY(0)")}
      >
        {loading ? "Signing In..." : "Sign In to Dashboard"}
      </button>

      <div style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: TEXT_SECONDARY }}>
        Don't have an account?{" "}
        <button
          onClick={onSwitch}
          style={{ 
            background: "none", 
            border: "none", 
            color: PRIMARY, 
            cursor: "pointer", 
            fontWeight: 600, 
            fontSize: 14, 
            fontFamily: "inherit", 
            padding: 0,
            textDecoration: "underline"
          }}
        >
          Create Account
        </button>
      </div>
    </div>
  );
}

// ─── MAIN AUTH PAGE ──────────────────────────────────────────────────────────
export default function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      position: "relative",
      overflow: "auto",
    }}>
      {/* Animated Background Decorations */}
      <div style={{
        position: "fixed",
        top: "-50%",
        right: "-30%",
        width: "600px",
        height: "600px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, rgba(139,92,246,0) 70%)",
        pointerEvents: "none",
        animation: "float 20s ease-in-out infinite",
      }}/>
      <div style={{
        position: "fixed",
        bottom: "-40%",
        left: "-20%",
        width: "500px",
        height: "500px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99,102,241,0.06) 0%, rgba(99,102,241,0) 70%)",
        pointerEvents: "none",
        animation: "float 25s ease-in-out infinite reverse",
      }} />

      <div style={{ width: "100%", maxWidth: 460 }}>
        {/* Logo / Brand */}
        <div onClick={() => navigate("/")} style={{ textAlign: "center", marginBottom: 40, cursor: "pointer" }}>
         
          <div style={{ 
            fontSize: 24, 
            fontWeight: 800, 
            background: `linear-gradient(135deg, ${GRADIENT_START}, ${GRADIENT_END})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "-0.5px"
          }}>
            LuxeJewels™
          </div>
          <div style={{ fontSize: 13, color: TEXT_SECONDARY, marginTop: 4, fontWeight: 500 }}>
            Seller Center
          </div>
        </div>

        {/* Tab Toggle */}
        <div style={{
          display: "flex",
          background: "#F3F4F6",
          borderRadius: 14,
          padding: 4,
          marginBottom: 28,
          gap: 4,
        }}>
          {["login", "register"].map(tab => (
            <button
              key={tab}
              onClick={() => setMode(tab)}
              style={{
                flex: 1,
                padding: "12px 0",
                borderRadius: 11,
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 14,
                fontWeight: 600,
                transition: "all 0.2s ease",
                background: mode === tab ? BG_WHITE : "transparent",
                color: mode === tab ? PRIMARY : TEXT_SECONDARY,
                boxShadow: mode === tab ? "0 2px 8px rgba(0,0,0,0.05)" : "none",
              }}
            >
              {tab === "login" ? "Sign In" : "Register"}
            </button>
          ))}
        </div>

        {/* Card */}
        <div style={{
          background: CARD_WHITE,
          borderRadius: 24,
          border: `1px solid ${BORDER_LIGHT}`,
          padding: "36px 32px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.03)",
        }}>
          {mode === "login"
            ? <LoginForm onSwitch={() => setMode("register")} />
            : <RegisterForm onSwitch={() => setMode("login")} />
          }
        </div>

        {/* Footer note */}
        <div style={{ 
          textAlign: "center", 
          marginTop: 24, 
          fontSize: 12, 
          color: TEXT_MUTED,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6
        }}>
         Your data is stored securely in your browser
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(5deg); }
          66% { transform: translate(-20px, 20px) rotate(-5deg); }
        }
      `}</style>
    </div>
  );
}
