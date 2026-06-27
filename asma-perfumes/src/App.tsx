import { Suspense, lazy, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { toast } from "sonner";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import BackendStatus from "@/components/BackendStatus";
import PageTransition from "@/components/PageTransition";
import AuthGuard from "@/components/AuthGuard";
const Index = lazy(() => import("./pages/Index"));
const CollectionPage = lazy(() => import("./pages/CollectionPage"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Admin = lazy(() => import("./pages/Admin"));
const About = lazy(() => import("./pages/About"));
const SearchResults = lazy(() => import("./pages/SearchResults"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Profile = lazy(() => import("./pages/Profile"));
const AIFinder = lazy(() => import("./pages/AIFinder"));

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<LoadingOverlay label="Loading…" />}>
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
      </Suspense>
    </AnimatePresence>
  );
};

const App = () => {
  useEffect(() => {
    // Tab-scoped auth: initialize from sessionStorage and verify the current tab session.
    useAuthStore.getState().bootstrap().then(() => {
      if (useAuthStore.getState().isAuthenticated) {
        useCartStore.getState().fetchCart();
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
        toast.error("Your session expired. Please sign in again.");
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
