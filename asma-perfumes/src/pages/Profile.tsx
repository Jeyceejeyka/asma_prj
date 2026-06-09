import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User as UserIcon, Mail, LogOut, Shield, Heart, ShoppingBag } from "lucide-react";
import { z } from "zod";
import { useAuthStore } from "@/store/authStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import { toast } from "sonner";
import Footer from "@/components/Footer";

const profileSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required").max(50, "First name is too long"),
  last_name: z.string().trim().min(1, "Last name is required").max(50, "Last name is too long"),
  email: z.string().trim().email("Please enter a valid email").max(255, "Email is too long"),
});

type FieldErrors = Partial<Record<"first_name" | "last_name" | "email", string>>;

const Profile = () => {
  const { user, logout, updateProfile, changePassword, isLoading } = useAuthStore();
  const wishlistCount = useWishlistStore((s) => s.ids.length);
  const cartCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const [pwForm, setPwForm] = useState({ old_password: "", new_password: "", confirm: "" });
  const [pwSubmitting, setPwSubmitting] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwSubmitting || isLoading) return;
    if (pwForm.new_password.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (pwForm.new_password !== pwForm.confirm) {
      toast.error("Passwords don't match");
      return;
    }
    setPwSubmitting(true);
    try {
      await changePassword(pwForm.old_password, pwForm.new_password);
      toast.success("Password changed");
      setPwForm({ old_password: "", new_password: "", confirm: "" });
    } catch (err: any) {
      toast.error(err?.message || "Could not change password");
    } finally {
      setPwSubmitting(false);
    }
  };

  useEffect(() => {
    if (user) {
      setForm({ first_name: user.first_name, last_name: user.last_name, email: user.email });
    }
  }, [user]);

  const updateField = (field: "first_name" | "last_name" | "email", value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || isLoading) return;

    const parsed = profileSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FieldErrors;
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      toast.error("Please fix the highlighted fields");
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      await updateProfile(parsed.data);
      toast.success("Profile updated");
    } catch (err: any) {
      const message = err?.message || "Could not update profile";
      // Map common backend field errors back to inputs when possible
      const lower = message.toLowerCase();
      if (lower.includes("email")) {
        setErrors((prev) => ({ ...prev, email: message }));
      }
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOut = () => {
    logout();
    toast.success("Signed out");
    navigate("/", { replace: true });
  };

  if (!user) return null;

  const initials = `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase();

  return (
    <>
      <main className="min-h-screen pt-24 sm:pt-32 pb-16">
        <div className="section-padding max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 mb-12 pb-8 border-b border-border/40">
              <div className="w-24 h-24 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center font-display text-2xl tracking-wider text-primary">
                {initials || <UserIcon size={28} strokeWidth={1.5} />}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h1 className="font-display text-3xl sm:text-4xl tracking-wider">
                  {user.first_name} {user.last_name}
                </h1>
                <p className="text-muted-foreground text-sm font-light mt-1 flex items-center gap-2 justify-center sm:justify-start">
                  <Mail size={12} /> {user.email}
                </p>
                {user.role === "admin" && (
                  <span className="inline-flex items-center gap-1 mt-2 text-[10px] uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-2 py-1 rounded-full">
                    <Shield size={10} /> Admin
                  </span>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-12">
              <Link to="/wishlist" className="bg-card border border-border/40 rounded-xl p-5 hover:border-primary/40 transition-colors">
                <Heart size={18} className="text-primary mb-2" strokeWidth={1.5} />
                <p className="font-display text-2xl">{wishlistCount}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Wishlist</p>
              </Link>
              <button onClick={() => useCartStore.getState().toggleCart()} className="text-left bg-card border border-border/40 rounded-xl p-5 hover:border-primary/40 transition-colors">
                <ShoppingBag size={18} className="text-primary mb-2" strokeWidth={1.5} />
                <p className="font-display text-2xl">{cartCount}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">In Cart</p>
              </button>
              {user.role === "admin" && (
                <Link to="/admin" className="bg-card border border-border/40 rounded-xl p-5 hover:border-primary/40 transition-colors">
                  <Shield size={18} className="text-primary mb-2" strokeWidth={1.5} />
                  <p className="font-display text-base mt-1">Dashboard</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Admin</p>
                </Link>
              )}
            </div>

            {/* Edit form */}
            <div className="bg-card border border-border/40 rounded-2xl p-6 sm:p-8">
              <h2 className="font-display text-xl tracking-wider mb-6">Account Details</h2>
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block font-body">First Name</label>
                    <input
                      type="text"
                      value={form.first_name}
                      onChange={(e) => updateField("first_name", e.target.value)}
                      aria-invalid={!!errors.first_name}
                      disabled={submitting || isLoading}
                      className={`w-full bg-background border rounded-xl px-4 py-3 text-sm font-body focus:outline-none transition-colors disabled:opacity-60 ${
                        errors.first_name ? "border-destructive/70 focus:border-destructive" : "border-border/60 focus:border-primary/50"
                      }`}
                    />
                    {errors.first_name && <p className="text-xs text-destructive mt-1.5">{errors.first_name}</p>}
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block font-body">Last Name</label>
                    <input
                      type="text"
                      value={form.last_name}
                      onChange={(e) => updateField("last_name", e.target.value)}
                      aria-invalid={!!errors.last_name}
                      disabled={submitting || isLoading}
                      className={`w-full bg-background border rounded-xl px-4 py-3 text-sm font-body focus:outline-none transition-colors disabled:opacity-60 ${
                        errors.last_name ? "border-destructive/70 focus:border-destructive" : "border-border/60 focus:border-primary/50"
                      }`}
                    />
                    {errors.last_name && <p className="text-xs text-destructive mt-1.5">{errors.last_name}</p>}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block font-body">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    aria-invalid={!!errors.email}
                    disabled={submitting || isLoading}
                    className={`w-full bg-background border rounded-xl px-4 py-3 text-sm font-body focus:outline-none transition-colors disabled:opacity-60 ${
                      errors.email ? "border-destructive/70 focus:border-destructive" : "border-border/60 focus:border-primary/50"
                    }`}
                  />
                  {errors.email && <p className="text-xs text-destructive mt-1.5">{errors.email}</p>}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={submitting || isLoading}
                    aria-busy={submitting || isLoading}
                    className={`flex-1 btn-gold-solid rounded-xl ${(submitting || isLoading) ? "opacity-60 pointer-events-none" : ""}`}
                  >
                    {(submitting || isLoading) ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>

            {/* Change Password */}
            <div className="bg-card border border-border/40 rounded-2xl p-6 sm:p-8 mt-6">
              <h2 className="font-display text-xl tracking-wider mb-6">Change Password</h2>
              <form onSubmit={handleChangePassword} className="space-y-4" noValidate>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block font-body">Current Password</label>
                  <input
                    type="password"
                    value={pwForm.old_password}
                    onChange={(e) => setPwForm((f) => ({ ...f, old_password: e.target.value }))}
                    disabled={pwSubmitting || isLoading}
                    autoComplete="current-password"
                    className="w-full bg-background border border-border/60 rounded-xl px-4 py-3 text-sm font-body focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-60"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block font-body">New Password</label>
                    <input
                      type="password"
                      value={pwForm.new_password}
                      onChange={(e) => setPwForm((f) => ({ ...f, new_password: e.target.value }))}
                      disabled={pwSubmitting || isLoading}
                      autoComplete="new-password"
                      className="w-full bg-background border border-border/60 rounded-xl px-4 py-3 text-sm font-body focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block font-body">Confirm New Password</label>
                    <input
                      type="password"
                      value={pwForm.confirm}
                      onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))}
                      disabled={pwSubmitting || isLoading}
                      autoComplete="new-password"
                      className="w-full bg-background border border-border/60 rounded-xl px-4 py-3 text-sm font-body focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-60"
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={pwSubmitting || isLoading}
                    aria-busy={pwSubmitting || isLoading}
                    className={`flex-1 btn-gold-solid rounded-xl ${(pwSubmitting || isLoading) ? "opacity-60 pointer-events-none" : ""}`}
                  >
                    {pwSubmitting ? "Updating..." : "Update Password"}
                  </button>
                  <Link
                    to="/forgot-password"
                    className="flex-1 text-center border border-border/60 rounded-xl py-3 text-sm font-body hover:border-primary/40 transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </form>
            </div>

            <button
              onClick={handleSignOut}
              className="mt-6 w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors py-3"
            >
              <LogOut size={14} /> Sign Out
            </button>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Profile;
