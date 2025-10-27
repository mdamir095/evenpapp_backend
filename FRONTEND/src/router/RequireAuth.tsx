import { Navigate } from "react-router-dom";
import { useAuth } from "../features/auth/hooks/useAuth";

// --- Route Guard for Authenticated Routes ---
// Wrap protected routes with <RequireAuth> to enforce authentication

function RequireAuth({ children }: { children: React.ReactElement }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default RequireAuth;
