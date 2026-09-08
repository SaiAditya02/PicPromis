import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { ArrowRight, Mail, Lock, User, Camera, Heart, Sparkles, Shield, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'couple' | 'photographer' | 'admin'>('couple');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const { error: signInError } = await signIn(email, password);
        if (signInError) throw signInError;
      } else {
        const { error: signUpError } = await signUp(email, password, fullName, role);
        if (signUpError) throw signUpError;
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-parchment flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 mb-8">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sindoor to-sindoor-deep flex items-center justify-center">
              <span className="text-marigold-soft font-display font-bold text-xl">P</span>
            </div>
            <span className="font-display font-semibold text-2xl text-ink">PicPromise</span>
          </Link>

          {/* Tab Switcher */}
          <div className="flex bg-brand-white rounded-xl p-1 shadow-sm border border-ink/10 mb-8">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-lg font-medium transition-all ${isLogin ? 'bg-sindoor text-white shadow-md' : 'text-ink-soft hover:text-ink'
                }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-lg font-medium transition-all ${!isLogin ? 'bg-sindoor text-white shadow-md' : 'text-ink-soft hover:text-ink'
                }`}
            >
              Sign Up
            </button>
          </div>

          {/* Role Selector */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-ink-soft mb-3">
              {isLogin ? 'Sign in as a...' : 'I am a...'}
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole('couple')}
                className={`p-4 rounded-xl border-2 transition-all ${role === 'couple'
                  ? 'border-sindoor bg-sindoor/5'
                  : 'border-ink/10 hover:border-ink/30'
                  }`}
              >
                <Sparkles size={24} className={`mx-auto mb-2 ${role === 'couple' ? 'text-sindoor' : 'text-brand-grey'}`} />
                <span className={`font-medium text-sm ${role === 'couple' ? 'text-ink' : 'text-ink-soft'}`}>
                  Customer
                </span>
                <span className="block text-xs text-brand-grey mt-1">Planning your big day</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('photographer')}
                className={`p-4 rounded-xl border-2 transition-all ${role === 'photographer'
                  ? 'border-sindoor bg-sindoor/5'
                  : 'border-ink/10 hover:border-ink/30'
                  }`}
              >
                <Camera size={24} className={`mx-auto mb-2 ${role === 'photographer' ? 'text-sindoor' : 'text-brand-grey'}`} />
                <span className={`font-medium text-sm ${role === 'photographer' ? 'text-ink' : 'text-ink-soft'}`}>
                  Photographer
                </span>
                <span className="block text-xs text-brand-grey mt-1">Capture moments</span>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-ink-soft mb-2">Full Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-grey" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-ink/10 bg-brand-white focus:border-sindoor focus:ring-2 focus:ring-sindoor/20 outline-none transition-all"
                    placeholder="Enter your full name"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-ink-soft mb-2">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-grey" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-ink/10 bg-brand-white focus:border-sindoor focus:ring-2 focus:ring-sindoor/20 outline-none transition-all"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-soft mb-2">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-grey" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 rounded-xl border border-ink/10 bg-brand-white focus:border-sindoor focus:ring-2 focus:ring-sindoor/20 outline-none transition-all"
                  placeholder="Enter your password"
                  required
                  minLength={6}
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
              className="w-full py-4 bg-sindoor text-white font-semibold rounded-xl shadow-lg shadow-sindoor/30 hover:shadow-xl hover:shadow-sindoor/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
              <ArrowRight size={18} />
            </button>
          </form>

          <p className="text-center text-sm text-brand-grey mt-6">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sindoor font-medium hover:underline"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>

      {/* Right Side - Hero */}
      <div className="hidden lg:flex w-1/2 bg-ink text-parchment items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.1)_10px,rgba(255,255,255,0.1)_20px)]" />
        <div className="relative max-w-lg text-center">
          <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-sindoor to-sindoor-deep flex items-center justify-center shadow-2xl">
            <span className="text-marigold-soft font-display font-bold text-5xl">P</span>
          </div>
          <h1 className="font-display text-4xl font-semibold mb-4">
            Book with a promise, not a guess.
          </h1>
          <p className="text-parchment/70 text-lg">
            Verified photographers, escrow-protected payments, and a delivery guarantee for your wedding day.
          </p>
        </div>
      </div>
    </div>
  );
}
