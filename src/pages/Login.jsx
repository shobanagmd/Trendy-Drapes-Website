import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/utils/api";
import { toast } from "sonner";
import { Mail, Lock, User as UserIcon, Store, Calendar, Users } from "lucide-react";
import loginBgImage from "@/assets/login-bg.webp";

// mode: "login" | "register" | "seller-register"
const Login = () => {
  const [mode, setMode] = useState("login");

  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register fields
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regDob, setRegDob] = useState("");
  const [regGender, setRegGender] = useState("");

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setSession } = useAuth();
  const register = async (email, password, name, role, phone, dob, gender) => {
    const res = await apiFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, role, phone_no: phone, date_of_birth: dob, gender }),
    });

    return await res.json();
  };
  const login = async (email, password) => {
    const res = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    return await res.json();
  };


  const isLogin = mode === "login";
  const isSellerRegister = mode === "seller-register";
  const isAnyRegister = mode === "register" || mode === "seller-register";

  const switchToRegister = () => {
    setRegName(""); setRegEmail(""); setRegPhone(""); setRegPassword(""); setRegConfirmPassword("");
    setMode("register");
  };
  const switchToSellerRegister = () => {
    setRegName(""); setRegEmail(""); setRegPhone(""); setRegPassword(""); setRegConfirmPassword("");
    setMode("seller-register");
  };
  const switchToLogin = () => setMode("login");

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!loginEmail || !loginPassword) {
      toast.error("Please fill in all required fields");
      setLoading(false);
      return;
    }

    const result = await login(loginEmail, loginPassword);

    if (!result.success) {
      toast.error(result.message);
      setLoading(false);
      return;
    }

    if (result.role === "admin") {
      setSession({ name: "Admin", email: loginEmail }, "admin", result.token);
      toast.success("Welcome, Admin!");
      navigate("/admin");
    } else if (result.role === "seller") {
      const sellerName = result.user?.name || "Seller";
      setSession({ name: sellerName, email: loginEmail }, "seller", result.token, result.onboardingCompleted);
      toast.success(`Welcome, ${sellerName}!`);
      // Navigate based on backend status
      navigate(result.onboardingCompleted ? "/seller/dashboard" : "/seller/onboarding");
    } else {
      const customerName = result.user?.name || "Customer";
      setSession({ name: customerName, email: loginEmail }, "user", result.token);
      toast.success("Welcome back!");
      navigate("/home");
    }

    setLoading(false);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!regName.trim() || !regEmail || !regPhone || !regPassword) {
      toast.error("Please fill in all required fields");
      setLoading(false);
      return;
    }

    if (regPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    if (regPassword !== regConfirmPassword) {
      toast.error("Passwords do not match");
      setLoading(false);
      return;
    }

    const role = isSellerRegister ? "seller" : "user";

    const result = await register(regEmail, regPassword, regName, role, regPhone, regDob, regGender);

    if (!result.success) {
      toast.error(result.message);
      setLoading(false);
      return;
    }

    toast.success(result.message);
    setLoginEmail(regEmail);
    setMode("login");
    setRegPassword("");
    setRegConfirmPassword("");
    setLoading(false);
  };

  // Shared input class
  const inputCls =
    "w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 text-gray-900 placeholder-gray-400 shadow-sm text-sm font-body focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all rounded-none";

  return (
    <div className="h-screen w-full flex flex-col bg-background overflow-hidden relative">
      <div className="flex-1 w-full relative flex overflow-hidden">

        {/* ======================= DESKTOP SPLIT SCREEN ======================= */}
        <div className="hidden md:flex flex-1 w-full h-full relative overflow-hidden bg-card">

          {/* ── SIGN IN FORM (Left Side) ── */}
          <div
            className={`absolute top-0 left-0 w-1/2 h-full flex flex-col justify-center items-center px-8 lg:px-16 transition-all duration-700 ease-in-out ${isLogin
              ? "translate-x-0 opacity-100 z-20"
              : "translate-x-[15%] opacity-0 z-10 pointer-events-none"
              }`}
          >
            <div className="w-full max-w-sm">
              <div className="text-center mb-10">
                <h2 className="text-4xl font-display font-semibold text-foreground">Sign In</h2>
                <p className="text-sm text-muted-foreground mt-3 font-body tracking-wide uppercase">
                  Login to Trendy Drapes
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-6">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-black transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className={inputCls}
                    placeholder="Email Address"
                    required
                  />
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-black transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className={inputCls}
                    placeholder="Password"
                    required
                  />
                </div>

                <div className="flex items-center justify-between text-xs font-body mb-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded-none text-black focus:ring-black bg-white border-gray-300"
                    />
                    <span className="text-muted-foreground uppercase tracking-widest text-[10px]">
                      Remember me
                    </span>
                  </label>
                  <a
                    href="#"
                    className="text-foreground hover:text-black dark:hover:text-gray-500 font-semibold transition-colors uppercase tracking-widest text-[10px]"
                  >
                    Forgot password?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 mt-4 bg-black hover:bg-gray-900 text-white font-body text-xs font-semibold tracking-widest uppercase transition-all duration-300 disabled:opacity-70 shadow-md rounded-none"
                >
                  {loading ? "Signing In..." : "SIGN IN"}
                </button>

                {/* Seller Register Link */}
                <div className="pt-1 text-center">
                  <p className="text-[11px] font-body text-muted-foreground">
                    Are you a seller?{" "}
                    <button
                      type="button"
                      onClick={switchToSellerRegister}
                      className="text-foreground font-semibold underline underline-offset-2 hover:opacity-70 transition-opacity uppercase tracking-wide"
                    >
                      Register as Seller
                    </button >
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* ── SIGN UP / SELLER SIGN UP FORM (Right Side) ── */}
          <div
            className={`absolute top-0 left-1/2 w-1/2 h-full flex flex-col justify-center items-center px-8 lg:px-16 transition-all duration-700 ease-in-out ${isAnyRegister
              ? "translate-x-0 opacity-100 z-20"
              : "-translate-x-[15%] opacity-0 z-10 pointer-events-none"
              }`}
          >
            <div className="w-full max-w-sm">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-display font-semibold text-foreground">
                  {isSellerRegister ? "Seller Sign Up" : "Create Account"}
                </h2>
                <p className="text-sm text-muted-foreground mt-3 font-body tracking-wide uppercase">
                  {isSellerRegister ? "Join as a Seller on Trendy Drapes" : "Join Trendy Drapes"}
                </p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                {isSellerRegister && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-body font-semibold tracking-widest uppercase">
                    <Store size={13} />
                    Registering as a Seller
                  </div>
                )}

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-black transition-colors">
                    <UserIcon size={18} />
                  </div>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className={inputCls}
                    placeholder="Full Name"
                    autoComplete="name"
                    required
                  />
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-black transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className={inputCls}
                    placeholder="Email Address"
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-black transition-colors">
                    <Store size={18} />
                  </div>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className={inputCls}
                    placeholder="Phone Number"
                    required
                  />
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-black transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className={inputCls}
                    placeholder="Password (Min. 6 chars)"
                    autoComplete="new-password"
                    required
                  />
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-black transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className={inputCls}
                    placeholder="Confirm Password"
                    autoComplete="new-password"
                    required
                  />
                </div>

                {!isSellerRegister && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-black transition-colors">
                        <Calendar size={18} />
                      </div>
                      <input
                        type="date"
                        value={regDob}
                        onChange={(e) => setRegDob(e.target.value)}
                        className={inputCls}
                        title="Date of Birth"
                      />
                    </div>

                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-black transition-colors">
                        <Users size={18} />
                      </div>
                      <select
                        value={regGender}
                        onChange={(e) => setRegGender(e.target.value)}
                        className={`${inputCls} appearance-none`}
                      >
                        <option value="">Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">NA</option>
                      </select>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 mt-6 bg-black hover:bg-gray-900 text-white font-body text-xs font-semibold tracking-widest uppercase transition-all duration-300 disabled:opacity-70 shadow-md rounded-none"
                >
                  {loading
                    ? "Registering..."
                    : isSellerRegister
                      ? "REGISTER AS SELLER"
                      : "SIGN UP"}
                </button>
              </form>
            </div>
          </div>

          {/* ── OVERLAY CONTAINER ── */}
          <div
            className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-700 ease-in-out z-50 bg-black ${isLogin ? "translate-x-0" : "-translate-x-full"
              }`}
          >
            <div
              className={`relative -left-full w-[200%] h-full transform transition-transform duration-700 ease-in-out ${isLogin ? "translate-x-0" : "translate-x-1/2"
                }`}
            >
              <img
                src={loginBgImage}
                alt="Trendy Drapes Shop"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/60" />

              {/* Left: shown when register active → prompt sign in */}
              <div
                className={`absolute top-0 left-0 w-1/2 h-full flex flex-col justify-center items-center px-12 text-center transition-transform duration-700 ease-in-out ${isLogin ? "-translate-x-[20%]" : "translate-x-0"
                  }`}
              >
                <h2 className="text-4xl lg:text-5xl font-display font-semibold mb-6 text-white drop-shadow-md tracking-wide">
                  One of Us?
                </h2>
                <p className="text-white/80 text-sm md:text-base font-body mb-10 max-w-sm drop-shadow tracking-wide leading-relaxed">
                  If you already have an account, just sign in. Dive back into discovering exquisite sarees.
                </p>
                <button
                  onClick={switchToLogin}
                  className="px-10 py-4 bg-transparent border border-white text-white font-body text-xs font-semibold tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-500 rounded-none shadow-sm"
                >
                  SIGN IN NOW
                </button>
              </div>

              {/* Right: shown when login active → prompt to create account */}
              <div
                className={`absolute top-0 right-0 w-1/2 h-full flex flex-col justify-center items-center px-12 text-center transition-transform duration-700 ease-in-out ${isLogin ? "translate-x-0" : "translate-x-[20%]"
                  }`}
              >
                <h2 className="text-4xl lg:text-5xl font-display font-semibold mb-6 text-white drop-shadow-md tracking-wide">
                  New Here?
                </h2>
                <p className="text-white/80 text-sm md:text-base font-body mb-8 max-w-sm drop-shadow tracking-wide leading-relaxed">
                  Sign up and discover a premium collection of elegant drapes and authentic handlooms.
                </p>
                <button
                  onClick={switchToRegister}
                  className="px-10 py-4 bg-transparent border border-white text-white font-body text-xs font-semibold tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-500 rounded-none shadow-sm mb-4"
                >
                  CREATE ACCOUNT
                </button>
                <button
                  onClick={switchToSellerRegister}
                  className="flex items-center gap-2 text-white/70 hover:text-white text-[11px] font-body font-semibold tracking-widest uppercase transition-colors"
                >
                  <Store size={13} />
                  Register as Seller
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ======================= MOBILE FALLBACK ======================= */}
        <div className="md:hidden flex-1 w-full relative bg-card overflow-y-auto">

          {/* Mobile Image Header */}
          <div className="w-full h-48 relative shrink-0">
            <img
              src={loginBgImage}
              alt="Trendy Drapes Shop"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60" />
            <div className="absolute inset-0 flex items-center justify-center">
              <h2 className="text-3xl font-display font-semibold text-white drop-shadow-md">
                {isLogin ? "Welcome Back" : isSellerRegister ? "Seller Sign Up" : "Join Us"}
              </h2>
            </div>
          </div>

          {/* Mobile Tab Bar */}
          <div className="flex border-b border-border shadow-sm sticky top-0 z-10 bg-background/95 backdrop-blur">
            <button
              onClick={switchToLogin}
              className={`flex-1 py-4 text-[11px] font-body font-semibold tracking-widest uppercase transition-colors rounded-none ${isLogin
                ? "text-foreground border-b-2 border-black dark:border-white bg-black/5"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              SIGN IN
            </button>
            <button
              onClick={switchToRegister}
              className={`flex-1 py-4 text-[11px] font-body font-semibold tracking-widest uppercase transition-colors rounded-none ${mode === "register"
                ? "text-foreground border-b-2 border-black dark:border-white bg-black/5"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              REGISTER
            </button>
            <button
              onClick={switchToSellerRegister}
              className={`flex-1 py-4 text-[11px] font-body font-semibold tracking-widest uppercase transition-colors rounded-none flex items-center justify-center gap-1 ${isSellerRegister
                ? "text-foreground border-b-2 border-black dark:border-white bg-black/5"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <Store size={11} />
              SELLER
            </button>
          </div>

          <div className="p-8 pb-12 w-full max-w-sm mx-auto">
            {isLogin ? (
              /* Mobile Login Form */
              <form onSubmit={handleLoginSubmit} className="space-y-5">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-black transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className={inputCls}
                    placeholder="Email Address"
                    required
                  />
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-black transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className={inputCls}
                    placeholder="Password"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 mt-8 bg-black hover:bg-gray-900 text-white font-body text-xs font-semibold tracking-widest uppercase transition-colors disabled:opacity-70 shadow-md rounded-none"
                >
                  {loading ? "Signing In..." : "SIGN IN"}
                </button>
                {/* Mobile Seller Link */}
                <div className="pt-1 text-center">
                  <p className="text-[11px] font-body text-muted-foreground">
                    Are you a seller?{" "}
                    <button
                      type="button"
                      onClick={switchToSellerRegister}
                      className="text-foreground font-semibold underline underline-offset-2 hover:opacity-70 transition-opacity uppercase tracking-wide"
                    >
                      Register as Seller
                    </button>
                  </p>
                </div>
              </form>
            ) : (
              /* Mobile Register Form (user or seller) */
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                {isSellerRegister && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-body font-semibold tracking-widest uppercase">
                    <Store size={13} />
                    Registering as a Seller
                  </div>
                )}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-black transition-colors">
                    <UserIcon size={18} />
                  </div>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className={inputCls}
                    placeholder="Full Name"
                    autoComplete="name"
                    required
                  />
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-black transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className={inputCls}
                    placeholder="Email Address"
                    autoComplete="email"
                    required
                  />
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-black transition-colors">
                    <Store size={18} />
                  </div>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className={inputCls}
                    placeholder="Phone Number"
                    required
                  />
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-black transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className={inputCls}
                    placeholder="Password (Min. 6 chars)"
                    autoComplete="new-password"
                    required
                  />
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-black transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className={inputCls}
                    placeholder="Confirm Password"
                    autoComplete="new-password"
                    required
                  />
                </div>

                {!isSellerRegister && (
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-black transition-colors">
                        <Calendar size={18} />
                      </div>
                      <input
                        type="date"
                        value={regDob}
                        onChange={(e) => setRegDob(e.target.value)}
                        className={inputCls}
                        title="Date of Birth"
                      />
                    </div>

                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-black transition-colors">
                        <Users size={18} />
                      </div>
                      <select
                        value={regGender}
                        onChange={(e) => setRegGender(e.target.value)}
                        className={`${inputCls} appearance-none`}
                      >
                        <option value="">Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">NA</option>
                      </select>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 mt-8 bg-black hover:bg-gray-900 text-white font-body text-xs font-semibold tracking-widest uppercase transition-colors disabled:opacity-70 shadow-md rounded-none"
                >
                  {loading ? "Registering..." : isSellerRegister ? "REGISTER AS SELLER" : "SIGN UP"}
                </button>
              </form>
            )}

            <div className="mt-8 text-center text-[10px] uppercase tracking-widest font-body text-muted-foreground/50 border-t border-border pt-4">
              Admin: admin@gmail.com/admin@123 | Seller: seller@gmail.com/seller@123
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;