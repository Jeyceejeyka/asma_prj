import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, Info } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

const Register = () => {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [generatedUsername, setGeneratedUsername] = useState("");
  const { register, isLoading, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const busy = submitting || isLoading;

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Generate username preview for user feedback
  useEffect(() => {
    if (form.first_name || form.last_name || form.email) {
      let username = `${form.first_name}${form.last_name}`.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      if (username.length < 3 && form.email) {
        username = form.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      }
      
      if (username.length > 0) {
        const randomSuffix = Math.floor(Math.random() * 1000);
        setGeneratedUsername(`${username}${randomSuffix}`);
      } else {
        setGeneratedUsername("");
      }
    }
  }, [form.first_name, form.last_name, form.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (busy) return;
    
    // Validation
    if (!form.first_name.trim() || !form.last_name.trim() || !form.email.trim() || !form.password) {
      toast.error("Please fill in all fields");
      return;
    }
    
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    setSubmitting(true);
    
    try {
      await register({
        email: form.email,
        password: form.password,
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
      });
      
      toast.success("Account created successfully! Welcome to ASMA.");
      // The useEffect will handle redirect after isAuthenticated becomes true
    } catch (err: any) {
      console.error("Registration error:", err);
      
      // Handle specific error messages from backend
      if (err.data?.email) {
        toast.error(err.data.email.join(", "));
      } else if (err.data?.password) {
        toast.error(err.data.password.join(", "));
      } else if (err.data?.username) {
        toast.error(`Username error: ${err.data.username.join(", ")}`);
      } else if (err.message?.includes("already exists") || err.message?.includes("taken")) {
        toast.error("An account with this email already exists");
      } else {
        toast.error(err.message || "Registration failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const update = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
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
              Create Account
            </h1>
            <p className="text-muted-foreground text-sm font-light">
              Join the ASMA experience
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block font-body">
                  First Name
                </label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                  <input
                    type="text"
                    value={form.first_name}
                    onChange={(e) => update("first_name", e.target.value)}
                    placeholder="Jane"
                    className="w-full bg-background border border-border/60 rounded-xl pl-9 pr-3 py-3 text-sm font-body focus:outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground/30"
                    disabled={busy}
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block font-body">
                  Last Name
                </label>
                <input
                  type="text"
                  value={form.last_name}
                  onChange={(e) => update("last_name", e.target.value)}
                  placeholder="Wanjiku"
                  className="w-full bg-background border border-border/60 rounded-xl px-4 py-3 text-sm font-body focus:outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground/30"
                  disabled={busy}
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block font-body">
                Email
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-background border border-border/60 rounded-xl pl-9 pr-4 py-3 text-sm font-body focus:outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground/30"
                  autoComplete="email"
                  disabled={busy}
                />
              </div>
            </div>

            {/* Optional: Show generated username */}
            {generatedUsername && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 p-2 rounded-lg">
                <Info size={12} className="text-primary" />
                <span>Your username will be: <span className="font-mono text-primary">{generatedUsername}</span></span>
              </div>
            )}

            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block font-body">
                Password
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full bg-background border border-border/60 rounded-xl pl-9 pr-10 py-3 text-sm font-body focus:outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground/30"
                  autoComplete="new-password"
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

            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block font-body">
                Confirm Password
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => update("confirmPassword", e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-background border border-border/60 rounded-xl pl-9 pr-4 py-3 text-sm font-body focus:outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground/30"
                  autoComplete="new-password"
                  disabled={busy}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={busy}
              aria-busy={busy}
              className={`w-full btn-gold-solid text-center rounded-xl py-3 ${
                busy ? "opacity-60 pointer-events-none" : ""
              }`}
            >
              {busy ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </main>
  );
};

export default Register;