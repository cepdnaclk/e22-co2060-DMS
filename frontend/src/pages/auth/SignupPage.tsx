import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, Eye, EyeOff, UserPlus } from 'lucide-react';
import { authAPI, usersAPI } from '../../api';
import { useToast } from '../../components/common/Toast';
import { useAuth } from '../../context/AuthContext';
import type { Role } from '../../types';
import { compressImageFile } from '../../utils/avatarUrl';

const roles: Role[] = ['DEBATER', 'JUDGE', 'ORGANIZER'];
const roleLabels: Record<Role, string> = {
  DEBATER: 'Debater',
  JUDGE: 'Judge',
  ORGANIZER: 'Organizer',
};

export default function SignupPage() {
  const { selectedRole, login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');

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
    expertise: '',
    yearsOfExperience: '',
  });

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    if (avatarPreview.startsWith('blob:')) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    if (form.password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
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
        expertise: form.expertise || undefined,
        yearsOfExperience: form.yearsOfExperience ? parseInt(form.yearsOfExperience) : undefined,
      };
      const { data } = await authAPI.signup(payload);

      if (avatarFile && data.user?.id) {
        try {
          const compressed = await compressImageFile(avatarFile);
          const { data: updatedUser } = await usersAPI.uploadProfilePicture(data.user.id, compressed);
          login(data.token, updatedUser);
        } catch {
          login(data.token, data.user);
        }
      } else {
        login(data.token, data.user);
      }

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
    <div className="min-h-screen page-bg py-8 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[360px_1fr] border border-slate-300 bg-white shadow-[0_24px_70px_rgba(6,25,43,0.12)]">
        <aside className="bg-[#eef5ff] border-b lg:border-b-0 lg:border-r border-slate-300 p-8 flex flex-col justify-between">
          <Link to="/" className="flex items-center gap-3 mb-10">
            <img src="/logo.png" alt="VIVAATHI" className="w-11 h-11 border border-[#06192b]/20" />
            <span className="font-display text-3xl font-bold text-[#06192b]">VIVAATHI</span>
          </Link>
          <div>
            <p className="eyebrow text-slate-500 mb-4">Create Account</p>
            <h1 className="font-display text-4xl font-bold leading-tight text-[#06192b]">Join the debate circuit.</h1>
            <p className="text-slate-600 leading-7 mt-5">
              Build a profile for tournaments, judging panels, rankings, forum participation, and match-day coordination.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-3 gap-2">
            {roles.map(role => (
              <div key={role} className={`border p-3 text-center text-[10px] font-bold uppercase tracking-widest ${
                form.role === role ? 'bg-[#06192b] text-white border-[#06192b]' : 'bg-white text-slate-600 border-slate-300'
              }`}>
                {roleLabels[role]}
              </div>
            ))}
          </div>
        </aside>

        <main className="p-6 sm:p-9">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="eyebrow text-slate-500 mb-3 block">I am a</label>
              <div className="grid grid-cols-3 gap-2">
                {roles.map(r => (
                  <button key={r} type="button" onClick={() => set('role', r)}
                    className={form.role === r ? 'tab-btn-active py-3' : 'tab-btn-inactive py-3'}>
                    {roleLabels[r]}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="eyebrow text-slate-500 mb-2 block">Full Name *</label>
                <input value={form.fullName} onChange={e => set('fullName', e.target.value)}
                  required placeholder="Your full name" className="input-field" />
              </div>
              <div>
                <label className="eyebrow text-slate-500 mb-2 block">Username *</label>
                <input value={form.username} onChange={e => set('username', e.target.value)}
                  required placeholder="username" className="input-field" />
              </div>
              <div>
                <label className="eyebrow text-slate-500 mb-2 block">Age</label>
                <input type="number" value={form.age} onChange={e => set('age', e.target.value)}
                  placeholder="Age" min="10" max="100" className="input-field" />
              </div>
              <div className="md:col-span-2">
                <label className="eyebrow text-slate-500 mb-2 block">Email *</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                  required placeholder="your@email.com" className="input-field" />
              </div>
              <div className="md:col-span-2">
                <label className="eyebrow text-slate-500 mb-2 block">Bio</label>
                <textarea value={form.bio} onChange={e => set('bio', e.target.value)}
                  rows={3} placeholder="Tell us about your debate background..." className="input-field resize-none" />
              </div>
              <div className="md:col-span-2">
                <label className="eyebrow text-slate-500 mb-2 block">Location</label>
                <input value={form.location} onChange={e => set('location', e.target.value)}
                  placeholder="City, Country" className="input-field" />
              </div>
            </div>

            {form.role === 'JUDGE' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 paper-panel bg-[#eef5ff] p-4">
                <div>
                  <label className="eyebrow text-slate-500 mb-2 block">Expertise</label>
                  <input value={form.expertise} onChange={e => set('expertise', e.target.value)}
                    placeholder="e.g. Asian Parliamentary" className="input-field" />
                </div>
                <div>
                  <label className="eyebrow text-slate-500 mb-2 block">Years of Experience</label>
                  <input type="number" value={form.yearsOfExperience}
                    onChange={e => set('yearsOfExperience', e.target.value)}
                    placeholder="Years" min="0" className="input-field" />
                </div>
              </div>
            )}

            <div className="paper-panel p-4">
              <label className="eyebrow text-slate-500 mb-3 flex items-center gap-2">
                <Camera className="w-4 h-4" /> Profile Picture
              </label>
              <div className="flex items-center gap-5">
                <label htmlFor="signup-avatar-upload" className="group relative flex-shrink-0 cursor-pointer">
                  <div className="w-20 h-20 overflow-hidden border border-slate-300 bg-[#eef5ff]">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500">
                        <Camera className="w-7 h-7" />
                      </div>
                    )}
                  </div>
                  <input id="signup-avatar-upload" type="file" accept="image/*" capture="user" className="sr-only" onChange={handleAvatarChange} />
                </label>
                <div>
                  <p className="text-sm font-bold text-[#06192b]">{avatarFile ? avatarFile.name : 'No photo selected'}</p>
                  <p className="text-xs text-slate-500 mt-1">PNG, JPG, WEBP optional</p>
                  <label htmlFor="signup-avatar-upload" className="text-xs font-bold text-[#06192b] underline underline-offset-4 cursor-pointer mt-2 inline-block">
                    Choose a photo
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="eyebrow text-slate-500 mb-2 block">Password *</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={form.password}
                    onChange={e => set('password', e.target.value)}
                    required placeholder="Enter password" className="input-field pr-12" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#06192b]">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="eyebrow text-slate-500 mb-2 block">Confirm Password *</label>
                <input type="password" value={form.confirmPassword}
                  onChange={e => set('confirmPassword', e.target.value)}
                  required placeholder="Confirm password" className="input-field" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              <UserPlus className="w-4 h-4" />
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-600 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-[#06192b] underline underline-offset-4">Sign in</Link>
          </p>
        </main>
      </div>
    </div>
  );
}
