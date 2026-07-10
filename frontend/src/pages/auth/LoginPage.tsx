import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, Swords, Chrome } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api';
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
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <img src="/src/assets/logo.png" alt="VIVAATHI" className="w-11 h-11 rounded-2xl shadow-xl" />
            <span className="font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">VIVAATHI</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          {selectedRole && (
            <p className="text-gray-400 text-sm mt-1">
              Signing in as <span className="text-blue-400 font-medium">{selectedRole}</span>
            </p>
          )}
        </div>

        <div className="card border-white/10">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Username or Email</label>
              <input
                value={form.usernameOrEmail}
                onChange={e => setForm(p => ({ ...p, usernameOrEmail: e.target.value }))}
                placeholder="username or email@example.com"
                className="input-field"
                autoFocus
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  className="input-field pr-12"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3">
              <LogIn className="w-4 h-4" />
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="relative flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-gray-500 text-xs">OR</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <button type="button"
              className="btn-secondary w-full flex items-center justify-center gap-2 py-3 opacity-60 cursor-not-allowed"
              disabled>
              <Chrome className="w-4 h-4" />
              Continue with Google
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Create one
            </Link>
          </p>
          <p className="text-center text-xs text-gray-600 mt-2">
            Want to choose a different role?{' '}
            <Link to="/role-select" className="text-gray-400 hover:text-white transition-colors">
              Go back
            </Link>
          </p>
        </div>

        {/* Demo credentials */}
        <div className="mt-4 card border-yellow-500/20 bg-yellow-500/5 text-center">
          <p className="text-xs text-yellow-400 font-medium mb-2">Demo Credentials</p>
          <div className="grid grid-cols-3 gap-2 text-xs text-gray-400">
            <div><span className="text-white">organizer1</span><br/>/ password123</div>
            <div><span className="text-white">debater1</span><br/>/ password123</div>
            <div><span className="text-white">judge1</span><br/>/ password123</div>
          </div>
        </div>
      </div>
    </div>
  );
}
