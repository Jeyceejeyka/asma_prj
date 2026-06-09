import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Package, ShoppingCart, Users, CreditCard,
  Layers, ShoppingBag, Settings as SettingsIcon, ArrowLeft, LogOut, Menu, X, BarChart3,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useOrdersStore } from "@/store/ordersStore";
import { useUsersStore } from "@/store/usersStore";
import { usePaymentsStore } from "@/store/paymentsStore";
import { useProductsStore } from "@/store/productsStore";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import logo from "@/assets/asma-perfumes.png";

import Dashboard from "@/components/admin/Dashboard";
import ProductsAdmin from "@/components/admin/ProductsAdmin";
import OrdersAdmin from "@/components/admin/OrdersAdmin";
import UsersAdmin from "@/components/admin/UsersAdmin";
import PaymentsAdmin from "@/components/admin/PaymentsAdmin";
import CategoriesAdmin from "@/components/admin/CategoriesAdmin";
import CartsAdmin from "@/components/admin/CartsAdmin";
import ReportsAdmin from "@/components/admin/ReportsAdmin";

type Tab =
  | "dashboard" | "products" | "categories" | "orders"
  | "users" | "payments" | "carts" | "reports" | "settings";

const NAV: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: "dashboard",  label: "Dashboard",  icon: LayoutDashboard },
  { key: "products",   label: "Products",   icon: Package },
  { key: "categories", label: "Categories", icon: Layers },
  { key: "orders",     label: "Orders",     icon: ShoppingCart },
  { key: "users",      label: "Users",      icon: Users },
  { key: "payments",   label: "Payments",   icon: CreditCard },
  { key: "carts",      label: "Carts",      icon: ShoppingBag },
  { key: "reports",    label: "Reports",    icon: BarChart3 },
  { key: "settings",   label: "Settings",   icon: SettingsIcon },
];

const Admin = () => {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [navOpen, setNavOpen] = useState(false);
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  // Prefetch all admin data so the dashboard charts have inputs
  useEffect(() => {
    useProductsStore.getState().fetchAll();
    useOrdersStore.getState().fetchAdminOrders();
    useUsersStore.getState().fetchAll();
    usePaymentsStore.getState().fetchAdmin();
  }, []);

  const onLogout = async () => {
    await logout();
    toast.success("Signed out");
    navigate("/login");
  };

  const Content = () => {
    switch (tab) {
      case "dashboard":  return <Dashboard />;
      case "products":   return <ProductsAdmin />;
      case "categories": return <CategoriesAdmin />;
      case "orders":     return <OrdersAdmin />;
      case "users":      return <UsersAdmin />;
      case "payments":   return <PaymentsAdmin />;
      case "carts":      return <CartsAdmin />;
      case "reports":    return <ReportsAdmin />;
      case "settings":   return <SettingsPanel />;
    }
  };

  return (
    <main className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`fixed lg:sticky inset-y-0 left-0 z-40 w-full max-w-xs lg:w-72 bg-card border-r border-border/40 transform transition-transform lg:translate-x-0 ${navOpen ? "translate-x-0" : "-translate-x-full"} top-0 h-screen flex flex-col`}>
        <div className="p-5 border-b border-border/40 flex items-center justify-between gap-3">
          {/* <img src={logo} alt="Asma" className="h-9 w-auto" /> */}
          <div>
            <p className="font-display text-sm tracking-[0.2em] text-primary flex-1 mt-8">ADMIN</p>
            <p className="text-[10px] text-muted-foreground">Asma Perfumes</p>
          </div>
          <button onClick={() => setNavOpen(false)} className="lg:hidden text-muted-foreground">
            <X size={18} />
          </button>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV.map((n) => {
            const Icon = n.icon;
            const active = tab === n.key;
            return (
              <button key={n.key} onClick={() => { setTab(n.key); setNavOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs tracking-wider uppercase transition-all ${active ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-background/40"}`}>
                <Icon size={15} /> {n.label}
              </button>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border/40 space-y-2">
          <Link to="/" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary px-3 py-2">
            <ArrowLeft size={13} /> Back to store
          </Link>
          <button onClick={onLogout} className="w-full flex items-center gap-2 text-xs text-muted-foreground hover:text-destructive px-3 py-2">
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </aside>

      {navOpen && <div onClick={() => setNavOpen(false)} className="fixed inset-0 z-30 bg-background/60 lg:hidden" />}

      <div className="flex-1 min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-card/80 backdrop-blur-md border-b border-border/40">
          <div className="flex flex-wrap items-center justify-between gap-3 h-14 px-4 sm:px-6">
            <div className="flex items-center gap-3 min-w-0">
              <button onClick={() => setNavOpen(true)} className="lg:hidden text-muted-foreground"><Menu size={18} /></button>
              <div className="min-w-0">
                <p className="font-display text-sm tracking-wider capitalize truncate">{NAV.find((n) => n.key === tab)?.label}</p>
                <p className="text-[10px] text-muted-foreground truncate">{new Date().toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric" })}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 min-w-0">
              <div className="hidden sm:block text-right truncate">
                <p className="text-xs truncate">{user?.first_name} {user?.last_name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center font-display text-primary">{(user?.first_name || user?.email || "A")[0].toUpperCase()}</div>
            </div>
          </div>
        </header>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 sm:p-6">
          <Content />
        </motion.div>
      </div>
    </main>
  );
};

const SettingsPanel = () => {
  const user = useAuthStore((s) => s.user);
  const { changePassword, isLoading } = useAuthStore();
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await changePassword(oldPwd, newPwd); toast.success("Password updated"); setOldPwd(""); setNewPwd(""); }
    catch (err: any) { toast.error(err.message); }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-card border border-border/40 rounded-2xl p-6">
        <h3 className="font-display text-base tracking-wider mb-4">Admin Profile</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-[10px] uppercase text-muted-foreground">Name</p><p>{user?.first_name} {user?.last_name}</p></div>
          <div><p className="text-[10px] uppercase text-muted-foreground">Email</p><p>{user?.email}</p></div>
          <div><p className="text-[10px] uppercase text-muted-foreground">Role</p><p className="text-primary">{user?.role}</p></div>
          <div><p className="text-[10px] uppercase text-muted-foreground">User ID</p><p className="font-mono">{user?.id}</p></div>
        </div>
      </div>

      <div className="bg-card border border-border/40 rounded-2xl p-6">
        <h3 className="font-display text-base tracking-wider mb-4">Change Password</h3>
        <form onSubmit={submit} className="space-y-3">
          <input type="password" value={oldPwd} onChange={(e) => setOldPwd(e.target.value)} placeholder="Current password"
            className="w-full bg-background border border-border/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50" required />
          <input type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} placeholder="New password (min 8 chars)" minLength={8}
            className="w-full bg-background border border-border/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50" required />
          <button type="submit" disabled={isLoading} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs disabled:opacity-50">{isLoading ? "Saving…" : "Update password"}</button>
        </form>
      </div>
    </div>
  );
};

export default Admin;
