import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { login, isLoading, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = (location.state as any)?.from?.pathname || "/";
  const busy = submitting || isLoading;

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (busy) return;
    
    if (!email.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    
    setSubmitting(true);
    
    try {
      await login(email, password);
      toast.success("Welcome back!");
      // The useEffect will handle redirect after isAuthenticated becomes true
    } catch (err: any) {
      console.error("Login error:", err);
      
      // Handle specific error messages
      if (err.message?.toLowerCase().includes("credentials") || 
          err.message?.toLowerCase().includes("invalid")) {
        toast.error("Invalid email or password");
      } else if (err.status === 401) {
        toast.error("Invalid email or password");
      } else {
        toast.error(err.message || "Login failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="fixed inset-0 z-40 bg-background overflow-y-auto flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-card border border-border/40 rounded-2xl p-6 sm:p-8 shadow-xl"
        >
          <div className="text-center mb-6 sm:mb-8">
            <Link to="/" className="inline-block">
              <h1 className="font-display text-2xl tracking-[0.25em] text-primary">
                ASMA
              </h1>
            </Link>
            <h1 className="font-display text-2xl sm:text-3xl tracking-wider mt-4 mb-1">
              Welcome Back
            </h1>
            <p className="text-muted-foreground text-sm font-light">
              Sign in to your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block font-body">
                Email
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-background border border-border/60 rounded-xl pl-9 pr-4 py-3 text-sm font-body focus:outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground/30"
                  autoComplete="email"
                  disabled={busy}
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block font-body">
                Password
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-background border border-border/60 rounded-xl pl-9 pr-10 py-3 text-sm font-body focus:outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground/30"
                  autoComplete="current-password"
                  disabled={busy}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={busy}
              aria-busy={busy}
              className={`w-full btn-gold-solid text-center rounded-xl py-3 ${
                busy ? "opacity-60 pointer-events-none" : ""
              }`}
            >
              {busy ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary hover:underline">
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </main>
  );
};

export default Login;