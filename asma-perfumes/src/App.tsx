import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import BackendStatus from "@/components/BackendStatus";
import PageTransition from "@/components/PageTransition";
import AuthGuard from "@/components/AuthGuard";
import Index from "./pages/Index";
import CollectionPage from "./pages/CollectionPage";
import ProductDetail from "./pages/ProductDetail";
import NotFound from "./pages/NotFound";
import Wishlist from "./pages/Wishlist";
import Checkout from "./pages/Checkout";
import Admin from "./pages/Admin";
import About from "./pages/About";
import SearchResults from "./pages/SearchResults";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import AIFinder from "./pages/AIFinder";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public routes */}
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/collections/:id" element={<PageTransition><CollectionPage /></PageTransition>} />
        <Route path="/about" element={<PageTransition><About /></PageTransition>} />
        <Route path="/search" element={<PageTransition><SearchResults /></PageTransition>} />
        <Route path="/ai-finder" element={<PageTransition><AIFinder /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
        <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
        <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />

        {/* Protected routes — require authentication */}
        <Route path="/product/:id" element={<PageTransition><AuthGuard><ProductDetail /></AuthGuard></PageTransition>} />
        <Route path="/profile" element={<PageTransition><AuthGuard><Profile /></AuthGuard></PageTransition>} />
        <Route path="/wishlist" element={<PageTransition><AuthGuard><Wishlist /></AuthGuard></PageTransition>} />
        <Route path="/checkout" element={<PageTransition><AuthGuard><Checkout /></AuthGuard></PageTransition>} />

        {/* Admin — requires admin role */}
        <Route path="/admin" element={<AuthGuard requireAdmin><Admin /></AuthGuard>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  useEffect(() => {
    // Tab-scoped auth: initialize from sessionStorage and verify the current tab session.
    useAuthStore.getState().bootstrap().then(() => {
      if (useAuthStore.getState().isAuthenticated) {
        import("@/store/cartStore").then(({ useCartStore }) => useCartStore.getState().fetchCart());
      }
    });

    // Global session-expiry handling: clear local auth and notify user.
    let toasted = false;
    const onExpired = () => {
      if (toasted) return;
      toasted = true;
      setTimeout(() => (toasted = false), 3000);
      const wasAuthed = useAuthStore.getState().isAuthenticated;
      useAuthStore.setState({ user: null, isAuthenticated: false });
      if (wasAuthed) {
        import("sonner").then(({ toast }) =>
          toast.error("Your session expired. Please sign in again.")
        );
      }
    };
    window.addEventListener("auth:session-expired", onExpired);
    return () => window.removeEventListener("auth:session-expired", onExpired);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Navbar />
          <CartDrawer />
          <AnimatedRoutes />
          <BackendStatus />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
