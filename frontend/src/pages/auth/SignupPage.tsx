import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api';
import { useToast } from '../../components/common/Toast';
import type { Role } from '../../types';
import logo from '../../assets/logo.png';

const roles: Role[] = ['DEBATER', 'JUDGE', 'ORGANIZER'];
const roleLabels: Record<Role, string> = {
  DEBATER: 'Debater', JUDGE: 'Judge', ORGANIZER: 'Organizer'
};

export default function SignupPage() {
  const { selectedRole, login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    fullName: '',
    username: '',
    age: '',
    bio: '',
    location: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: selectedRole || 'DEBATER' as Role,
    profilePictureUrl: '',
    expertise: '',
    yearsOfExperience: '',
  });

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      showToast('Passwords do not match', 'error'); return;
    }
    if (form.password.length < 6) {
      showToast('Password must be at least 6 characters', 'error'); return;
    }
    setLoading(true);
    try {
      const payload = {
        fullName: form.fullName,
        username: form.username,
        age: form.age ? parseInt(form.age) : undefined,
        bio: form.bio,
        location: form.location,
        email: form.email,
        password: form.password,
        role: form.role,
        profilePictureUrl: form.profilePictureUrl || undefined,
        expertise: form.expertise || undefined,
        yearsOfExperience: form.yearsOfExperience ? parseInt(form.yearsOfExperience) : undefined,
      };
      const { data } = await authAPI.signup(payload);
      login(data.token, data.user);
      showToast('Account created successfully!', 'success');
      switch (data.user.role) {
        case 'DEBATER': navigate('/dashboard/debater'); break;
        case 'JUDGE': navigate('/dashboard/judge'); break;
        case 'ORGANIZER': navigate('/dashboard/organizer'); break;
        default: navigate('/');
      }
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Registration failed. Try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen page-bg flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <img src={logo} alt="VIVAATHI logo" className="w-11 h-11 rounded-2xl object-cover shadow-xl" />
            <span className="font-black text-3xl tracking-[0.2em] uppercase bg-gradient-to-r from-cyan-300 via-blue-300 to-violet-400 bg-clip-text text-transparent">
              VIVAATHI
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
        </div>

        <div className="card border-white/10">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">I am a</label>
              <div className="grid grid-cols-3 gap-2">
                {roles.map(r => (
                  <button key={r} type="button" onClick={() => set('role', r)}
                    className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${
                      form.role === r
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'glass border-white/10 text-gray-400 hover:text-white'
                    }`}>
                    {roleLabels[r]}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-sm text-gray-400 mb-1 block">Full Name *</label>
                <input value={form.fullName} onChange={e => set('fullName', e.target.value)}
                  required placeholder="Your full name" className="input-field" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Username *</label>
                <input value={form.username} onChange={e => set('username', e.target.value)}
                  required placeholder="username" className="input-field" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Age</label>
                <input type="number" value={form.age} onChange={e => set('age', e.target.value)}
                  placeholder="Age" min="10" max="100" className="input-field" />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">Email *</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                required placeholder="your@email.com" className="input-field" />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">Bio</label>
              <textarea value={form.bio} onChange={e => set('bio', e.target.value)}
                rows={2} placeholder="Tell us about yourself..." className="input-field resize-none" />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">Location</label>
              <input value={form.location} onChange={e => set('location', e.target.value)}
                placeholder="City, Country" className="input-field" />
            </div>

            {form.role === 'JUDGE' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Expertise</label>
                  <input value={form.expertise} onChange={e => set('expertise', e.target.value)}
                    placeholder="e.g. Asian Parliamentary" className="input-field" />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Years of Experience</label>
                  <input type="number" value={form.yearsOfExperience}
                    onChange={e => set('yearsOfExperience', e.target.value)}
                    placeholder="Years" min="0" className="input-field" />
                </div>
              </div>
            )}

            <div>
              <label className="text-sm text-gray-400 mb-1 block">Profile Picture URL</label>
              <input value={form.profilePictureUrl} onChange={e => set('profilePictureUrl', e.target.value)}
                placeholder="https://example.com/photo.jpg" className="input-field" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Password *</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={form.password}
                    onChange={e => set('password', e.target.value)}
                    required placeholder="••••••••" className="input-field pr-12" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Confirm Password *</label>
                <input type="password" value={form.confirmPassword}
                  onChange={e => set('confirmPassword', e.target.value)}
                  required placeholder="••••••••" className="input-field" />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2">
              <UserPlus className="w-4 h-4" />
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
