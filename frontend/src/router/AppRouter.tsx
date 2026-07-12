import { Navigate, Route, Routes } from "react-router-dom";
import { LandingPage } from "../pages/Landing";
import { SignInPage } from "../pages/SignIn";
import { SignUpPage } from "../pages/SignUp";
import { DashboardPage } from "../pages/Dashboard";
import { SettingsPage } from "../pages/Settings";
import { useAuth } from "../contexts/AuthContext";
import { Loader } from "../components/ui/Loader";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/signin" element={<SignInPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
