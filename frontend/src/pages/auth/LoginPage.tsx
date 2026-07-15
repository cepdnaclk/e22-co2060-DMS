import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, ShieldCheck } from 'lucide-react';
import { authAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';

export default function LoginPage() {
  const [form, setForm] = useState({ usernameOrEmail: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, selectedRole } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.usernameOrEmail || !form.password) {
      showToast('Please fill all required fields', 'error');
      return;
    }
    setLoading(true);
    try {
      const { data } = await authAPI.login(form);
      login(data.token, data.user);
      showToast('Login successful!', 'success');

      switch (data.user.role) {
        case 'DEBATER': navigate('/dashboard/debater'); break;
        case 'JUDGE': navigate('/dashboard/judge'); break;
        case 'ORGANIZER': navigate('/dashboard/organizer'); break;
        default: navigate('/');
      }
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.message || 'Invalid credentials';
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen page-bg flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-[0.92fr_1.08fr] border border-slate-300 bg-white shadow-[0_24px_70px_rgba(6,25,43,0.12)]">
        <section className="hidden lg:flex bg-[#06192b] text-white p-10 flex-col justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="VIVAATHI" className="w-11 h-11 border border-white/15" />
            <span className="font-display text-3xl font-bold">VIVAATHI</span>
          </Link>
          <div>
            <p className="eyebrow text-slate-300 mb-5">Secure debate workspace</p>
            <h1 className="font-display text-5xl font-bold leading-tight">Return to the tournament room.</h1>
            <p className="mt-6 text-slate-300 leading-7">
              Access score sheets, live rooms, team messages, and your debate record from one focused dashboard.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {['Judge', 'Debater', 'Organizer'].map(item => (
              <div key={item} className="border border-white/15 bg-white/5 p-3 text-center text-xs font-bold uppercase tracking-widest">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="p-7 sm:p-10">
          <div className="lg:hidden mb-8">
            <Link to="/" className="flex items-center gap-3">
              <img src="/logo.png" alt="VIVAATHI" className="w-10 h-10 border border-[#06192b]/20" />
              <span className="font-display text-2xl font-bold text-[#06192b]">VIVAATHI</span>
            </Link>
          </div>

          <p className="eyebrow text-slate-500 mb-3">Sign In</p>
          <h2 className="font-display text-4xl font-bold text-[#06192b]">Welcome back</h2>
          {selectedRole && (
            <p className="text-slate-600 text-sm mt-2">
              Signing in as <span className="font-bold text-[#8a6a00]">{selectedRole}</span>
            </p>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="eyebrow text-slate-500 mb-2 block">Username or Email</label>
              <input
                value={form.usernameOrEmail}
                onChange={e => setForm(p => ({ ...p, usernameOrEmail: e.target.value }))}
                placeholder="username or email@example.com"
                className="input-field"
                autoFocus
              />
            </div>

            <div>
              <label className="eyebrow text-slate-500 mb-2 block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="Enter your password"
                  className="input-field pr-12"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#06192b] transition-colors">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              <LogIn className="w-4 h-4" />
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 paper-panel bg-[#eef5ff] p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#06192b] mt-0.5" />
              <div>
                <p className="text-sm font-bold text-[#06192b]">Demo Credentials</p>
                <p className="text-xs text-slate-600 mt-1">organizer1, debater1, judge1 / password123</p>
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-slate-600 mt-6">
            Do not have an account?{' '}
            <Link to="/signup" className="font-bold text-[#06192b] underline underline-offset-4">
              Create one
            </Link>
          </p>
          <p className="text-center text-xs text-slate-500 mt-2">
            Want a different role?{' '}
            <Link to="/role-select" className="font-bold text-[#06192b]">Go back</Link>
          </p>
        </section>
      </div>
    </div>
  );
}
