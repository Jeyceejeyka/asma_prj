// import { Navigate, useLocation } from "react-router-dom";
// import { useAuthStore } from "@/store/authStore";
// import { toast } from "sonner";
// import { useEffect, useRef } from "react";

// interface AuthGuardProps {
//   children: React.ReactNode;
//   requireAdmin?: boolean;
// }

// const AuthGuard = ({ children, requireAdmin = false }: AuthGuardProps) => {
//   const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
//   const user = useAuthStore((s) => s.user);
//   const location = useLocation();
//   const toasted = useRef(false);

//   useEffect(() => {
//     if (!isAuthenticated && !toasted.current) {
//       toast.error("Please sign in to continue");
//       toasted.current = true;
//     }
//   }, [isAuthenticated]);

//   if (!isAuthenticated) {
//     return <Navigate to="/login" state={{ from: location }} replace />;
//   }

//   if (requireAdmin && user?.role !== "admin") {
//     return <Navigate to="/" replace />;
//   }

//   return <>{children}</>;
// };

// export default AuthGuard;


import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { useEffect, useRef } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  redirectTo?: string;
  showToast?: boolean;
}

const AuthGuard = ({ 
  children, 
  requireAdmin = false,
  redirectTo = "/login",
  showToast = true 
}: AuthGuardProps) => {
  const { isAuthenticated, user, isBootstrapped } = useAuthStore();
  const location = useLocation();
  const toasted = useRef(false);

  useEffect(() => {
    // Only show toast after bootstrap is complete
    if (isBootstrapped && !isAuthenticated && showToast && !toasted.current) {
      toast.error("Please sign in to continue");
      toasted.current = true;
    }
  }, [isBootstrapped, isAuthenticated, showToast]);

  // Wait for bootstrap to complete before making decisions
  if (!isBootstrapped) {
    return null; // or a loading spinner
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (requireAdmin && user?.role !== "admin") {
    if (showToast) {
      toast.error("Admin access required");
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;