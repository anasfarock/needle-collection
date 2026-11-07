import { useNavigate, Navigate } from 'react-router-dom';
import { useStore } from '../../data/store';
import { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

export function AdminLogin() {
  const { isAdmin, setIsAdmin } = useStore();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo: any credentials work
    if (phone && password) {
      setIsAdmin(true);
      navigate('/admin');
    } else {
      setError('Please enter phone and password');
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
            <label className="text-[10px] uppercase tracking-[0.18em] text-ivory/50 mb-2 block">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="03XX-XXXXXXX"
              className="w-full bg-transparent border-b border-ivory/20 py-3 text-ivory text-sm outline-none focus:border-oxblood transition-colors placeholder:text-ivory/30"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.18em] text-ivory/50 mb-2 block">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full bg-transparent border-b border-ivory/20 py-3 text-ivory text-sm outline-none focus:border-oxblood transition-colors placeholder:text-ivory/30 pr-10"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 top-1/2 -translate-y-1/2 text-ivory/50">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && <p className="text-terracotta text-xs">{error}</p>}

          <button
            type="submit"
            className="w-full bg-oxblood text-ivory py-4 text-[11px] uppercase tracking-[0.18em] font-medium hover:bg-oxblood-light transition-smooth flex items-center justify-center gap-2"
          >
            <Lock size={14} /> Sign In
          </button>

          <p className="text-center text-[10px] text-ivory/30 mt-4">
            Demo: Enter any phone & password to access the admin panel
          </p>
        </form>
      </div>
    </div>
  );
}
