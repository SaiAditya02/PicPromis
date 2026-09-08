import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { AuthProvider, useAuth } from './lib/auth';
import { supabase } from './lib/supabase';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import CustomerDashboard from './pages/CustomerDashboard';
import PhotographerDashboard from './pages/PhotographerDashboard';
import PhotographerSetup from './pages/PhotographerSetup';

function PrivateRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole?: 'customer' | 'photographer' | 'admin' }) {
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

  if (profile?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return <CustomerDashboard />;
}

function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error: signInError } = await signIn(email, password);
      if (signInError) throw signInError;

      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', currentUser.id)
          .maybeSingle();

        if (profileError) {
          await supabase.auth.signOut();
          throw profileError;
        }

        if (!profileData || profileData.role !== 'admin') {
          await supabase.auth.signOut();
          throw new Error('Access denied. This login is reserved for system administrators.');
        }
      }
      navigate('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-parchment flex items-center justify-center p-8">
      <div className="w-full max-w-md bg-brand-white rounded-2xl border border-ink/10 p-8 shadow-xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-sindoor to-sindoor-deep flex items-center justify-center shadow-lg">
            <span className="text-marigold-soft font-display font-bold text-2xl">P</span>
          </div>
          <h2 className="font-display text-2xl font-semibold text-ink">PicPromise</h2>
          <p className="text-sm text-brand-grey mt-1">Admin Portal</p>
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-soft mb-2">Admin Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-ink/10 bg-brand-white focus:border-sindoor outline-none transition-all"
              placeholder="admin@picpromise.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-soft mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-4 pr-12 py-3 rounded-xl border border-ink/10 bg-brand-white focus:border-sindoor outline-none transition-all"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-grey hover:text-ink transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-ink text-white font-semibold rounded-xl hover:bg-ink-soft transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? 'Logging in...' : 'Enter Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-sindoor border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || profile?.role !== 'admin') {
    return <AdminLoginPage />;
  }

  return <>{children}</>;
}

function AdminDashboard() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-parchment">
      <header className="bg-ink text-parchment">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a href="/" className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sindoor to-sindoor-deep flex items-center justify-center">
                  <span className="text-marigold-soft font-display font-bold text-xl">P</span>
                </div>
                <span className="font-display font-semibold text-xl">PicPromise</span>
              </a>
              <span className="px-3 py-1 text-xs font-mono font-semibold tracking-wider bg-marigold/20 text-marigold rounded-full">ADMIN</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-parchment/70">Welcome, {profile?.full_name}</span>
              <button onClick={handleSignOut} className="px-4 py-2 text-sm font-medium border border-parchment/30 rounded-lg hover:bg-parchment/10 transition-colors">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-semibold text-ink">Admin Dashboard</h1>
          <p className="text-brand-grey mt-1">Manage the PicPromise platform</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Users', value: '—', color: 'sindoor' },
            { label: 'Photographers', value: '—', color: 'marigold' },
            { label: 'Active Bookings', value: '—', color: 'sage' },
            { label: 'Revenue', value: '—', color: 'ink' },
          ].map((stat) => (
            <div key={stat.label} className="bg-brand-white rounded-xl border border-ink/10 p-6">
              <p className="font-display text-2xl font-semibold text-ink">{stat.value}</p>
              <p className="text-sm text-brand-grey">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-brand-white rounded-xl border border-ink/10 p-12 text-center">
          <h3 className="font-display text-xl text-ink mb-2">Platform Management</h3>
          <p className="text-brand-grey">Admin management features coming soon. Use the Supabase dashboard for now.</p>
        </div>
      </main>
    </div>
  );
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
            path="/customer/dashboard"
            element={
              <PrivateRoute requiredRole="customer">
                <CustomerDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/couple/dashboard"
            element={
              <PrivateRoute>
                <CustomerDashboard />
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
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
