import { useNavigate, Navigate } from 'react-router-dom';
import { useStore } from '../../data/store';
import { useState } from 'react';
import { Lock, Eye, EyeOff, Mail } from 'lucide-react';

export function AdminLogin() {
  const { isAdmin, authLoading, loginAdmin } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center p-6">
        <div className="text-ivory/60 text-xs uppercase tracking-[0.2em]">Verifying session...</div>
      </div>
    );
  }

  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setSubmitting(true);
    const result = await loginAdmin(email.trim(), password);
    setSubmitting(false);

    if (result.ok) {
      navigate('/admin', { replace: true });
    } else {
      setError(result.error || 'Invalid email or password.');
    }
  };

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-12">
          <h1 className="font-display text-3xl text-ivory tracking-[0.15em] uppercase mb-2">Needle Collection</h1>
          <p className="text-[11px] uppercase tracking-[0.2em] text-ivory/50">Admin Portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="text-[10px] uppercase tracking-[0.18em] text-ivory/50 mb-2 block">Email Address</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@needlecollection.com"
                autoComplete="email"
                required
                className="w-full bg-transparent border-b border-ivory/20 py-3 pl-7 text-ivory text-sm outline-none focus:border-oxblood transition-colors placeholder:text-ivory/30"
              />
              <Mail size={15} className="absolute left-0 top-1/2 -translate-y-1/2 text-ivory/40" />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-[0.18em] text-ivory/50 mb-2 block">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
                required
                className="w-full bg-transparent border-b border-ivory/20 py-3 text-ivory text-sm outline-none focus:border-oxblood transition-colors placeholder:text-ivory/30 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-ivory/50 hover:text-ivory transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-terracotta/15 border border-terracotta/40 px-3 py-2.5 text-terracotta text-xs">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-oxblood text-ivory py-4 text-[11px] uppercase tracking-[0.18em] font-medium hover:bg-oxblood-light transition-smooth disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Lock size={14} /> {submitting ? 'Signing In...' : 'Sign In'}
          </button>

          <div className="text-center pt-2">
            <p className="text-[10px] text-ivory/35">
              Default Admin: <span className="text-ivory/60">admin@needlecollection.com</span> / <span className="text-ivory/60">password123</span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
