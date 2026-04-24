import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import LoginPage from "@/pages/Login";
import SignupPage from "@/pages/Signup";
import DashboardPage from "@/pages/Dashboard";
import SearchPage from "@/pages/SearchPage";
import ChatPage from "@/pages/ChatPage";
import DigestPage from "@/pages/DigestPage";
import SuggestionsPage from "@/pages/SuggestionsPage";
import SharedPage from "@/pages/SharedPage";
import SettingsPage from "@/pages/SettingsPage";
import PublicBrainPage from "@/pages/PublicBrainPage";
import NotFound from "@/pages/NotFound";
import { refreshAccessToken } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

function AuthInitializer() {
  const setInitialized = useAuthStore((s) => s.setInitialized);

  useEffect(() => {
    (async () => {
      await refreshAccessToken();
      setInitialized(true);
    })();
  }, [setInitialized]);

  return null;
}

function AuthenticatedApp({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster position="top-right" />
      <AuthInitializer />
      <BrowserRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/brain/:shareLink" element={<PublicBrainPage />} />
          <Route
            path="/dashboard"
            element={
              <AuthenticatedApp>
                <DashboardPage />
              </AuthenticatedApp>
            }
          />
          <Route
            path="/search"
            element={
              <AuthenticatedApp>
                <SearchPage />
              </AuthenticatedApp>
            }
          />
          <Route
            path="/chat"
            element={
              <AuthenticatedApp>
                <ChatPage />
              </AuthenticatedApp>
            }
          />
          <Route
            path="/digest"
            element={
              <AuthenticatedApp>
                <DigestPage />
              </AuthenticatedApp>
            }
          />
          <Route
            path="/suggestions"
            element={
              <AuthenticatedApp>
                <SuggestionsPage />
              </AuthenticatedApp>
            }
          />
          <Route
            path="/shared"
            element={
              <AuthenticatedApp>
                <SharedPage />
              </AuthenticatedApp>
            }
          />
          <Route
            path="/settings"
            element={
              <AuthenticatedApp>
                <SettingsPage />
              </AuthenticatedApp>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
