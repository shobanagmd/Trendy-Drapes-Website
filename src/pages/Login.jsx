import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "admin123";

const Login = () => {
  // "register" | "login"
  const [mode, setMode] = useState("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login, register, adminLogin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Basic validation
    if (!email || !password) {
      toast.error("Please fill in all required fields");
      setLoading(false);
      return;
    }

    // ── ADMIN shortcut ──────────────────────────────────────────────────
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const result = login(email, password);
      // Admin bypasses register check — inject admin user directly
      // We need to ensure admin is always in the registered list
      register(email, password, "Admin"); // silently registers if not exists
      const loginResult = login(email, password);
      adminLogin("admin", "admin123");
      toast.success("Welcome, Admin!");
      navigate("/admin");
      setLoading(false);
      return;
    }

    // ── REGISTER MODE ───────────────────────────────────────────────────
    if (mode === "register") {
      if (!name.trim()) {
        toast.error("Please enter your full name");
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        toast.error("Password must be at least 6 characters");
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        setLoading(false);
        return;
      }
      const result = register(email, password, name);
      if (!result.success) {
        toast.error(result.message);
        setLoading(false);
        return;
      }
      toast.success(result.message);
      // Auto-switch to login after successful registration
      setMode("login");
      setPassword("");
      setConfirmPassword("");
      setLoading(false);
      return;
    }

    // ── LOGIN MODE ──────────────────────────────────────────────────────
    if (mode === "login") {
      const result = login(email, password);
      if (!result.success) {
        toast.error(result.message);
        setLoading(false);
        return;
      }
      toast.success("Welcome back!");
      navigate("/");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-semibold text-foreground">
              {mode === "register" ? "Create Account" : "Welcome Back"}
            </h1>
            <p className="font-body text-sm text-muted-foreground mt-2">
              {mode === "register"
                ? "Register first to access Trendy Drapes"
                : "Sign in to your Trendy Drapes account"}
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex mb-6 border border-border">
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`flex-1 py-2.5 text-sm font-body font-semibold tracking-wider uppercase transition-colors ${
                mode === "register"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Register
            </button>
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 py-2.5 text-sm font-body font-semibold tracking-wider uppercase transition-colors ${
                mode === "login"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign In
            </button>
          </div>

          {/* Info banner for login mode */}
          {mode === "login" && (
            <div className="mb-4 px-4 py-3 bg-secondary border border-border text-xs font-body text-muted-foreground">
              ℹ️ You must <button onClick={() => setMode("register")} className="text-accent underline font-medium">create an account</button> before signing in.
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="filter-section-title">Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-border bg-card text-sm font-body text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="Enter your full name"
                  autoComplete="name"
                />
              </div>
            )}

            <div>
              <label className="filter-section-title">Email Address *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-border bg-card text-sm font-body text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="filter-section-title">Password *</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-border bg-card text-sm font-body text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder={mode === "register" ? "Min. 6 characters" : "••••••••"}
                autoComplete={mode === "register" ? "new-password" : "current-password"}
              />
            </div>

            {mode === "register" && (
              <div>
                <label className="filter-section-title">Confirm Password *</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-border bg-card text-sm font-body text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-primary text-primary-foreground font-body text-sm font-semibold tracking-wider uppercase hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {loading
                ? "Please wait..."
                : mode === "register"
                ? "Create Account"
                : "Sign In"}
            </button>
          </form>

          <p className="text-center font-body text-sm text-muted-foreground mt-6">
            {mode === "register" ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={() => setMode(mode === "register" ? "login" : "register")}
              className="text-accent font-medium hover:underline"
            >
              {mode === "register" ? "Sign In" : "Register Now"}
            </button>
          </p>

          {/* Admin hint */}
          <p className="text-center font-body text-xs text-muted-foreground/50 mt-4">
            Admin? Use admin@gmail.com / admin123
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
