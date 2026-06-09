import { useState, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

const ResetPassword = () => {
  const [params] = useSearchParams();
  const token = useMemo(() => params.get("token") || "", [params]);
  const email = useMemo(() => params.get("email") || "", [params]);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { resetPassword, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const busy = submitting || isLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (!token || !email) {
      toast.error("Invalid or missing reset link");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords don't match");
      return;
    }
    setSubmitting(true);
    try {
      await resetPassword(email, token, password);
      toast.success("Password reset! Please sign in.");
      navigate("/login", { replace: true });
    } catch (err: any) {
      toast.error(err.message || "Could not reset password");
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
            <Link to="/" className="font-display text-xl tracking-[0.25em] text-primary">
              ASMA
            </Link>
            <h1 className="font-display text-2xl sm:text-3xl tracking-wider mt-4 mb-1">Set New Password</h1>
            <p className="text-muted-foreground text-sm font-light">Choose a strong password for your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block font-body">New Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full bg-background border border-border/60 rounded-xl pl-9 pr-10 py-3 text-sm font-body focus:outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground/30"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-foreground transition-colors"
                >
                  {show ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block font-body">Confirm Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-background border border-border/60 rounded-xl pl-9 pr-4 py-3 text-sm font-body focus:outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground/30"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={busy}
              aria-busy={busy}
              className={`w-full btn-gold-solid text-center rounded-xl ${busy ? "opacity-60 pointer-events-none" : ""}`}
            >
              {busy ? "Resetting..." : "Reset Password"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            <Link to="/login" className="text-primary hover:underline">Back to sign in</Link>
          </p>
        </motion.div>
      </div>
    </main>
  );
};

export default ResetPassword;
