import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { requestPasswordReset, isLoading } = useAuthStore();
  const busy = submitting || isLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }
    setSubmitting(true);
    try {
      await requestPasswordReset(email);
      setSent(true);
      toast.success("Check your email for reset instructions");
    } catch (err: any) {
      toast.error(err.message || "Could not send reset email");
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
            <h1 className="font-display text-2xl sm:text-3xl tracking-wider mt-4 mb-1">
              {sent ? "Check Your Email" : "Reset Password"}
            </h1>
            <p className="text-muted-foreground text-sm font-light">
              {sent
                ? "We've sent a reset link to your inbox."
                : "Enter your email and we'll send you a reset link."}
            </p>
          </div>

          {sent ? (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <CheckCircle2 size={48} className="text-primary/70" strokeWidth={1.2} />
              </div>
              <p className="text-sm text-muted-foreground">
                If an account exists for <span className="text-foreground">{email}</span>, you'll receive a password reset email shortly.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <ArrowLeft size={14} /> Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block font-body">Email</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-background border border-border/60 rounded-xl pl-9 pr-4 py-3 text-sm font-body focus:outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground/30"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={busy}
                  aria-busy={busy}
                  className={`w-full btn-gold-solid text-center rounded-xl ${busy ? "opacity-60 pointer-events-none" : ""}`}
                >
                  {busy ? "Sending..." : "Send Reset Link"}
                </button>
              </form>

              <p className="text-center text-sm text-muted-foreground mt-6">
                <Link to="/login" className="text-primary hover:underline inline-flex items-center gap-1">
                  <ArrowLeft size={12} /> Back to sign in
                </Link>
              </p>
            </>
          )}
        </motion.div>
      </div>
    </main>
  );
};

export default ForgotPassword;
