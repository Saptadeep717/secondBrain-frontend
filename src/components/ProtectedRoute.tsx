import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { shallow } from "zustand/shallow";
import { useAuthStore } from "@/stores/authStore";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  // While we are checking the session, don't redirect yet.
  if (!isInitialized) return null;

  if (!accessToken) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
