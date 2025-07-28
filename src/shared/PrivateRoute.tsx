import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../features/auth/store/customHooks";
import { ROUTES } from "../app/routes";
import type { PrivateRouteProps } from "../types/auth";

/**
 * Props for the PrivateRoute component
 * @property {React.ReactNode} children - Child components to render if authenticated
 * @property {Role[]} allowedRoles - Optional list of roles allowed to access this route
 * @property {boolean} requireAuth - Whether authentication is required (default: true)
 */

/**
 * PrivateRoute Component
 * Protects routes by requiring authentication and optionally specific roles
 * Redirects to login page if not authenticated or dashboard if not authorized
 */
export const PrivateRoute: React.FC<PrivateRouteProps> = ({
  children,
  allowedRoles,
  requireAuth = true,
}) => {
  const { isAuthenticated, user, loading, selectedRole } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated && requireAuth) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // Check role permissions if roles are specified
  if (
    allowedRoles &&
    user &&
    selectedRole &&
    !allowedRoles.includes(selectedRole)
  ) {
    // Show toast for authorized user trying to access restricted route
    toast.error("Uh Oh You cant do that");
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  // Render children if authenticated and authorized
  return <>{children}</>;
};