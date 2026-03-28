import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Lock } from "lucide-react";

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username || !password) { setError("Please fill all fields"); return; }
    const ok = adminLogin(username, password);
    if (ok) {
      navigate("/admin");
    } else {
      setError("Invalid admin credentials");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Lock className="w-7 h-7 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-semibold text-foreground">Admin Login</h1>
            <p className="font-body text-sm text-muted-foreground mt-1">Sign in to access the admin dashboard</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-body text-sm font-medium text-foreground mb-1.5">Username</label>
              <Input value={username} onChange={(e) => { setUsername(e.target.value); setError(""); }} placeholder="admin" />
            </div>
            <div>
              <label className="block font-body text-sm font-medium text-foreground mb-1.5">Password</label>
              <Input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }} placeholder="••••••••" />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <Button type="submit" className="w-full">Sign In</Button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminLogin;
