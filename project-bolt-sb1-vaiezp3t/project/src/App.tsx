import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import CoupleDashboard from './pages/CoupleDashboard';
import PhotographerDashboard from './pages/PhotographerDashboard';
import PhotographerSetup from './pages/PhotographerSetup';

function PrivateRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole?: 'couple' | 'photographer' }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-sindoor border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (requiredRole && profile?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function DashboardRouter() {
  const { profile } = useAuth();

  if (profile?.role === 'photographer') {
    return <Navigate to="/photographer/dashboard" replace />;
  }

  return <CoupleDashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardRouter />
              </PrivateRoute>
            }
          />
          <Route
            path="/couple/dashboard"
            element={
              <PrivateRoute requiredRole="couple">
                <CoupleDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/photographer/dashboard"
            element={
              <PrivateRoute requiredRole="photographer">
                <PhotographerDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/photographer/setup"
            element={
              <PrivateRoute requiredRole="photographer">
                <PhotographerSetup />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
