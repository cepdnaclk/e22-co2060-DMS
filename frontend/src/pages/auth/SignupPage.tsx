import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, Swords, Camera } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authAPI, usersAPI } from '../../api';
import { useToast } from '../../components/common/Toast';
import type { Role } from '../../types';

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
    expertise: '',
    yearsOfExperience: '',
  });

  // Avatar file upload state
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    if (avatarPreview.startsWith('blob:')) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(URL.createObjectURL(file));
  };

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
        expertise: form.expertise || undefined,
        yearsOfExperience: form.yearsOfExperience ? parseInt(form.yearsOfExperience) : undefined,
      };
      const { data } = await authAPI.signup(payload);

      // Upload avatar after account is created using the real multipart endpoint
      if (avatarFile && data.user?.id) {
        try {
          const { data: updatedUser } = await usersAPI.uploadProfilePicture(data.user.id, avatarFile);
          login(data.token, updatedUser);
        } catch {
          // Avatar upload failed — still log in, profile picture can be set later
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
    <div className="min-h-screen page-bg flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <img src="/logo.png" alt="VIVAATHI" className="w-11 h-11 rounded-2xl shadow-xl" />
            <span className="font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">VIVAATHI</span>
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

            {/* ── Profile Picture Upload ── */}
            <div>
              <label className="text-sm text-gray-400 mb-3 block flex items-center gap-2">
                <Camera className="w-4 h-4" /> Profile Picture
              </label>

              <div className="flex items-center gap-5">
                {/* Circle preview */}
                <label
                  htmlFor="signup-avatar-upload"
                  className="group relative flex-shrink-0 cursor-pointer"
                >
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/20 bg-gray-800">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">
                        <Camera className="w-7 h-7" />
                      </div>
                    )}
                  </div>

                  {/* Camera badge */}
                  <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-blue-600 border-2 border-gray-900 flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                    <Camera className="w-3 h-3 text-white" />
                  </div>

                  <input
                    id="signup-avatar-upload"
                    type="file"
                    accept="image/*"
                    capture="user"
                    className="sr-only"
                    onChange={handleAvatarChange}
                  />
                </label>

                {/* Right-side text */}
                <div className="flex flex-col gap-1.5">
                  <p className="text-sm text-white font-medium">
                    {avatarFile ? avatarFile.name : 'No photo selected'}
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, WEBP (optional)</p>
                  {!avatarFile && (
                    <label
                      htmlFor="signup-avatar-upload"
                      className="text-xs text-blue-400 underline cursor-pointer hover:text-blue-300 transition-colors"
                    >
                      Choose a photo
                    </label>
                  )}
                </div>
              </div>
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
