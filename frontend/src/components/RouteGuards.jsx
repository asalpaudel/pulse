import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { homePathForRole } from "../lib/routes";
import Spinner from "./ui/Spinner";

// Requires an authenticated session.
export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner label="Loading Pulse…" />
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}

// Requires a specific role; bounces others to their own dashboard.
export function RoleRoute({ role, children }) {
  const { role: userRole, loading } = useAuth();
  if (loading) return null;
  if (userRole !== role) {
    return <Navigate to={homePathForRole(userRole)} replace />;
  }
  return children;
}

// Redirect already-authenticated users away from public auth pages.
export function PublicOnlyRoute({ children }) {
  const { isAuthenticated, role, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated) {
    return <Navigate to={homePathForRole(role)} replace />;
  }
  return children;
}
