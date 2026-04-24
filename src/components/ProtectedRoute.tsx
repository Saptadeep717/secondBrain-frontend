import { ReactNode, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { refreshAccessToken } from "@/lib/api";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  useEffect(() => {
    if (!accessToken) {
      refreshAccessToken();
    }
  }, [accessToken]);

  // While we are checking the session, don't redirect yet.
  if (!isInitialized) return null;

  if (!accessToken) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
