import { Link } from "react-router-dom";
import Logo from "../components/Logo";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { homePathForRole } from "../lib/routes";

export default function NotFound() {
  const { isAuthenticated, role } = useAuth();
  const home = isAuthenticated ? homePathForRole(role) : "/";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-blush-page px-6 text-center">
      <Logo className="h-12 w-12" />
      <p className="text-5xl font-bold text-primary">404</p>
      <p className="text-lg font-medium text-secondary">Page not found</p>
      <p className="max-w-sm text-sm text-neutral-600">
        The page you're looking for doesn't exist or you don't have access to
        it.
      </p>
      <Link to={home}>
        <Button>Back to {isAuthenticated ? "dashboard" : "home"}</Button>
      </Link>
    </div>
  );
}
