import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Mail, Lock, User as UserIcon } from "lucide-react";
import loginBgImage from "@/assets/login-bg.webp";

const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "admin@123";

const SELLER_EMAIL = "seller@gmail.com";
const SELLER_PASSWORD = "seller@123";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  
  // Login Form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Register Form
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login, register, adminLogin, setRole, setIsAdmin, setUser } = useAuth();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!loginEmail || !loginPassword) {
      toast.error("Please fill in all required fields");
      setLoading(false);
      return;
    }

    const result = login(loginEmail, loginPassword);
    
    if (!result.success) {
      toast.error(result.message);
      setLoading(false);
      return;
    }

    // Role-based navigation
    if (result.role === "admin") {
      toast.success("Welcome, Admin!");
      navigate("/admin");
    } else if (result.role === "seller") {
      toast.success("Welcome, Seller!");
      navigate("/seller/dashboard");
    } else {
      toast.success("Welcome back!");
      navigate("/");
    }
    
    setLoading(false);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!regName.trim() || !regEmail || !regPassword) {
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
    
    const result = register(regEmail, regPassword, regName);
    if (!result.success) {
      toast.error(result.message);
      setLoading(false);
      return;
    }
    
    toast.success(result.message);
    setLoading(false);
    
    setLoginEmail(regEmail);
    setIsLogin(true);
    
    setRegPassword("");
    setRegConfirmPassword("");
  };

  return (
    <div className="h-screen w-full flex flex-col bg-background overflow-hidden relative">
      <div className="flex-1 w-full relative flex overflow-hidden">
        
        {/* ======================= DESKTOP SPLIT SCREEN ======================= */}
        <div className="hidden md:flex flex-1 w-full h-full relative overflow-hidden bg-card">
          
          {/* ---- SIGN IN FORM (Left Side) ---- */}
          <div className={`absolute top-0 left-0 w-1/2 h-full flex flex-col justify-center items-center px-8 lg:px-16 transition-all duration-700 ease-in-out ${
            isLogin ? "translate-x-0 opacity-100 z-20" : "translate-x-[15%] opacity-0 z-10 pointer-events-none"
          }`}>
            <div className="w-full max-w-sm">
              <div className="text-center mb-10">
                <h2 className="text-4xl font-display font-semibold text-foreground">Sign In</h2>
                <p className="text-sm text-muted-foreground mt-3 font-body tracking-wide uppercase">Login to Trendy Drapes</p>
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
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 text-gray-900 placeholder-gray-400 shadow-sm text-sm font-body focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all rounded-none"
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
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 text-gray-900 placeholder-gray-400 shadow-sm text-sm font-body focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all rounded-none"
                    placeholder="Password"
                    required
                  />
                </div>
                
                <div className="flex items-center justify-between text-xs font-body mb-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" className="rounded-none text-black focus:ring-black bg-white border-gray-300" />
                    <span className="text-muted-foreground uppercase tracking-widest text-[10px]">Remember me</span>
                  </label>
                  <a href="#" className="text-foreground hover:text-black dark:hover:text-gray-500 font-semibold transition-colors uppercase tracking-widest text-[10px]">
                    Forgot password?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 mt-4 bg-black hover:bg-gray-900 text-white font-body text-xs font-semibold tracking-widest uppercase transition-all duration-300 disabled:opacity-70 disabled:hover:bg-black shadow-md rounded-none"
                >
                  {loading ? "Signing In..." : "SIGN IN"}
                </button>
              </form>
            </div>
          </div>

          {/* ---- SIGN UP FORM (Right Side visually, placed at left-1/2) ---- */}
          <div className={`absolute top-0 left-1/2 w-1/2 h-full flex flex-col justify-center items-center px-8 lg:px-16 transition-all duration-700 ease-in-out ${
            isLogin ? "-translate-x-[15%] opacity-0 z-10 pointer-events-none" : "translate-x-0 opacity-100 z-20"
          }`}>
            <div className="w-full max-w-sm">
              <div className="text-center mb-10">
                <h2 className="text-4xl font-display font-semibold text-foreground">Create Account</h2>
                <p className="text-sm text-muted-foreground mt-3 font-body tracking-wide uppercase">Join Trendy Drapes</p>
              </div>
              
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-black transition-colors">
                    <UserIcon size={18} />
                  </div>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 text-gray-900 placeholder-gray-400 shadow-sm text-sm font-body focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all rounded-none"
                    placeholder="Full Name"
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
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 text-gray-900 placeholder-gray-400 shadow-sm text-sm font-body focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all rounded-none"
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
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 text-gray-900 placeholder-gray-400 shadow-sm text-sm font-body focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all rounded-none"
                    placeholder="Password (Min. 6 chars)"
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
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 text-gray-900 placeholder-gray-400 shadow-sm text-sm font-body focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all rounded-none"
                    placeholder="Confirm Password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 mt-6 bg-black hover:bg-gray-900 text-white font-body text-xs font-semibold tracking-widest uppercase transition-all duration-300 disabled:opacity-70 disabled:hover:bg-black shadow-md rounded-none"
                >
                  {loading ? "Registering..." : "SIGN UP"}
                </button>
              </form>
            </div>
          </div>

          {/* ---- OVERLAY CONTAINER ---- */}
          <div className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-700 ease-in-out z-50 bg-black ${
            isLogin ? "translate-x-0" : "-translate-x-full"
          }`}>
            
            <div className={`relative -left-full w-[200%] h-full transform transition-transform duration-700 ease-in-out ${
              isLogin ? "translate-x-0" : "translate-x-1/2"
            }`}>

              {/* Fashion Image Background */}
              <img 
                src={loginBgImage} 
                alt="Trendy Drapes Shop"
                className="absolute inset-0 w-full h-full object-cover"
              />
              
              {/* Black overlay on image */}
              <div className="absolute inset-0 bg-black/60" />

              <div className={`absolute top-0 left-0 w-1/2 h-full flex flex-col justify-center items-center px-12 text-center transition-transform duration-700 ease-in-out ${
                isLogin ? "-translate-x-[20%]" : "translate-x-0"
              }`}>
                <h2 className="text-4xl lg:text-5xl font-display font-semibold mb-6 text-white drop-shadow-md tracking-wide">One of Us?</h2>
                <p className="text-white/80 text-sm md:text-base font-body mb-10 max-w-sm drop-shadow tracking-wide leading-relaxed">
                  If you already have an account, just sign in. Dive back into discovering exquisite sarees.
                </p>
                <button 
                  onClick={() => setIsLogin(true)}
                  className="px-10 py-4 bg-transparent border border-white text-white font-body text-xs font-semibold tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-500 rounded-none shadow-sm"
                >
                  SIGN IN NOW
                </button>
              </div>

              <div className={`absolute top-0 right-0 w-1/2 h-full flex flex-col justify-center items-center px-12 text-center transition-transform duration-700 ease-in-out ${
                isLogin ? "translate-x-0" : "translate-x-[20%]"
              }`}>
                <h2 className="text-4xl lg:text-5xl font-display font-semibold mb-6 text-white drop-shadow-md tracking-wide">New Here?</h2>
                <p className="text-white/80 text-sm md:text-base font-body mb-10 max-w-sm drop-shadow tracking-wide leading-relaxed">
                  Sign up and discover a premium collection of elegant drapes and authentic handlooms.
                </p>
                <button 
                  onClick={() => setIsLogin(false)}
                  className="px-10 py-4 bg-transparent border border-white text-white font-body text-xs font-semibold tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-500 rounded-none shadow-sm"
                >
                  CREATE ACCOUNT
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* ======================= MOBILE FALLBACK ======================= */}
        <div className="md:hidden flex-1 w-full relative bg-card overflow-y-auto">
          
          {/* Mobile Image Header Area */}
          <div className="w-full h-48 relative shrink-0">
             <img 
                src={loginBgImage} 
                alt="Trendy Drapes Shop"
                className="absolute inset-0 w-full h-full object-cover"
             />
             {/* Black overlay on image */}
             <div className="absolute inset-0 bg-black/60" />
             
             <div className="absolute inset-0 flex items-center justify-center">
                <h2 className="text-3xl font-display font-semibold text-white drop-shadow-md">
                   {isLogin ? "Welcome Back" : "Join Us"}
                </h2>
             </div>
          </div>

          <div className="flex border-b border-border shadow-sm sticky top-0 z-10 bg-background/95 backdrop-blur">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-4 text-[11px] font-body font-semibold tracking-widest uppercase transition-colors rounded-none ${
                isLogin ? "text-foreground border-b-2 border-black dark:border-white bg-black/5" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              SIGN IN
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-4 text-[11px] font-body font-semibold tracking-widest uppercase transition-colors rounded-none ${
                !isLogin ? "text-foreground border-b-2 border-black dark:border-white bg-black/5" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              REGISTER
            </button>
          </div>

          <div className="p-8 pb-12 w-full max-w-sm mx-auto">
            {isLogin ? (
              <form onSubmit={handleLoginSubmit} className="space-y-5">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-black transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 text-gray-900 placeholder-gray-400 shadow-sm text-sm font-body focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all rounded-none"
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
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 text-gray-900 placeholder-gray-400 shadow-sm text-sm font-body focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all rounded-none"
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
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-black transition-colors">
                    <UserIcon size={18} />
                  </div>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 text-gray-900 placeholder-gray-400 shadow-sm text-sm font-body focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all rounded-none"
                    placeholder="Full Name"
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
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 text-gray-900 placeholder-gray-400 shadow-sm text-sm font-body focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all rounded-none"
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
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 text-gray-900 placeholder-gray-400 shadow-sm text-sm font-body focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all rounded-none"
                    placeholder="Password (Min. 6 chars)"
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
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 text-gray-900 placeholder-gray-400 shadow-sm text-sm font-body focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all rounded-none"
                    placeholder="Confirm Password"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 mt-8 bg-black hover:bg-gray-900 text-white font-body text-xs font-semibold tracking-widest uppercase transition-colors disabled:opacity-70 shadow-md rounded-none"
                >
                  {loading ? "Registering..." : "SIGN UP"}
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
