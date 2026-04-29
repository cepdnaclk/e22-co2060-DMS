import { useState } from 'react';
import { Settings, Globe, Lock, Bell, User, Eye, EyeOff, Save, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usersAPI } from '../../api';
import { useToast } from '../../components/common/Toast';
import Avatar from '../../components/common/Avatar';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'si', label: 'Sinhala' },
  { code: 'ta', label: 'Tamil' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
];

type Tab = 'profile' | 'privacy' | 'notifications' | 'password';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [saving, setSaving] = useState(false);

  // Profile form
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    username: user?.username || '',
    age: user?.age?.toString() || '',
    bio: user?.bio || '',
    location: user?.location || '',
    profilePictureUrl: user?.profilePictureUrl || '',
    expertise: user?.expertise || '',
    yearsOfExperience: user?.yearsOfExperience?.toString() || '',
    language: user?.language || 'en',
  });

  // Privacy
  const [privacy, setPrivacy] = useState<'PUBLIC' | 'PRIVATE'>(user?.privacyStatus || 'PUBLIC');

  // Notifications (frontend-only preference simulation)
  const [notifPrefs, setNotifPrefs] = useState({
    matchAssigned: true,
    matchStartsSoon: true,
    teamInvitation: true,
    scoreSubmitted: true,
    discussionComment: false,
  });

  // Password
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, new: false });

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { data } = await usersAPI.update(user.id, {
        fullName: form.fullName,
        age: form.age ? parseInt(form.age) : undefined,
        bio: form.bio,
        location: form.location,
        profilePictureUrl: form.profilePictureUrl || undefined,
        expertise: form.expertise || undefined,
        yearsOfExperience: form.yearsOfExperience ? parseInt(form.yearsOfExperience) : undefined,
        language: form.language,
        privacyStatus: privacy,
      } as any);
      updateUser(data);
      showToast('Profile updated successfully!', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const savePrivacy = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { data } = await usersAPI.update(user.id, { privacyStatus: privacy } as any);
      updateUser(data);
      showToast('Privacy settings updated!', 'success');
    } catch {
      showToast('Failed to update privacy settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'privacy', label: 'Privacy', icon: Lock },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'password', label: 'Password', icon: Eye },
  ];

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-black text-white flex items-center gap-2 mb-6">
          <Settings className="w-6 h-6 text-blue-400" /> Settings
        </h1>

        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-1">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === t.key ? 'bg-blue-600 text-white' : 'glass text-gray-400 hover:text-white hover:bg-white/10'
              }`}>
              <t.icon className="w-4 h-4" />{t.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="card space-y-5">
            <div className="flex items-center gap-4">
              <Avatar name={user.fullName} src={user.profilePictureUrl} size="lg" />
              <div>
                <p className="font-semibold text-white">{user.fullName}</p>
                <p className="text-sm text-gray-400">@{user.username} · {user.role}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Full Name</label>
                <input value={form.fullName} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))}
                  className="input-field" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Age</label>
                <input type="number" value={form.age}
                  onChange={e => setForm(p => ({ ...p, age: e.target.value }))}
                  min="10" max="100" className="input-field" />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">Bio</label>
              <textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                rows={3} className="input-field resize-none" placeholder="Tell us about yourself..." />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">Location</label>
              <input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                className="input-field" placeholder="City, Country" />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">Profile Picture URL</label>
              <input value={form.profilePictureUrl}
                onChange={e => setForm(p => ({ ...p, profilePictureUrl: e.target.value }))}
                className="input-field" placeholder="https://..." />
            </div>

            {user.role === 'JUDGE' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Expertise</label>
                  <input value={form.expertise}
                    onChange={e => setForm(p => ({ ...p, expertise: e.target.value }))}
                    className="input-field" placeholder="e.g. Asian Parliamentary" />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Years of Experience</label>
                  <input type="number" value={form.yearsOfExperience}
                    onChange={e => setForm(p => ({ ...p, yearsOfExperience: e.target.value }))}
                    min="0" className="input-field" />
                </div>
              </div>
            )}

            <div>
              <label className="text-sm text-gray-400 mb-2 block flex items-center gap-2">
                <Globe className="w-4 h-4" /> Language
              </label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map(l => (
                  <button key={l.code} onClick={() => setForm(p => ({ ...p, language: l.code }))}
                    className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                      form.language === l.code
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'glass border-white/10 text-gray-400 hover:text-white'
                    }`}>
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={saveProfile} disabled={saving}
              className="btn-primary w-full flex items-center justify-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        )}

        {/* Privacy Tab */}
        {activeTab === 'privacy' && (
          <div className="card space-y-5">
            <h3 className="font-bold text-white">Privacy Settings</h3>
            <div className="grid grid-cols-2 gap-4">
              {(['PUBLIC', 'PRIVATE'] as const).map(p => (
                <button key={p} onClick={() => setPrivacy(p)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    privacy === p ? 'bg-blue-600/20 border-blue-500 text-white' : 'glass border-white/10 text-gray-400 hover:border-white/20'
                  }`}>
                  {p === 'PUBLIC' ? (
                    <>
                      <Eye className="w-5 h-5 mb-2 text-blue-400" />
                      <p className="font-semibold">Public Profile</p>
                      <p className="text-xs text-gray-400 mt-1">Anyone can see your profile and stats</p>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-5 h-5 mb-2 text-gray-400" />
                      <p className="font-semibold">Private Profile</p>
                      <p className="text-xs text-gray-400 mt-1">Only tournament participants can see your profile</p>
                    </>
                  )}
                </button>
              ))}
            </div>
            <button onClick={savePrivacy} disabled={saving}
              className="btn-primary w-full flex items-center justify-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Save Privacy Settings'}
            </button>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="card space-y-4">
            <h3 className="font-bold text-white">Notification Preferences</h3>
            <p className="text-sm text-gray-400">Choose which notifications you'd like to receive</p>
            {Object.entries({
              matchAssigned: 'Match Assigned',
              matchStartsSoon: 'Match Starts Soon',
              teamInvitation: 'Team Invitation',
              scoreSubmitted: 'Score Sheet Submitted',
              discussionComment: 'Discussion Comments',
            }).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between py-3 border-b border-white/5">
                <div>
                  <p className="text-sm font-medium text-white">{label}</p>
                </div>
                <button
                  onClick={() => setNotifPrefs(p => ({ ...p, [key]: !p[key as keyof typeof p] }))}
                  className={`w-12 h-6 rounded-full transition-all duration-200 relative ${
                    notifPrefs[key as keyof typeof notifPrefs] ? 'bg-blue-600' : 'bg-white/10'
                  }`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200 ${
                    notifPrefs[key as keyof typeof notifPrefs] ? 'left-7' : 'left-1'
                  }`} />
                </button>
              </div>
            ))}
            <button onClick={() => showToast('Notification preferences saved!', 'success')}
              className="btn-primary w-full flex items-center justify-center gap-2">
              <Save className="w-4 h-4" /> Save Preferences
            </button>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <div className="card space-y-4">
            <h3 className="font-bold text-white">Change Password</h3>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Current Password</label>
              <div className="relative">
                <input type={showPw.current ? 'text' : 'password'}
                  value={pwForm.current} onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))}
                  placeholder="••••••••" className="input-field pr-12" />
                <button type="button" onClick={() => setShowPw(p => ({ ...p, current: !p.current }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPw.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">New Password</label>
              <div className="relative">
                <input type={showPw.new ? 'text' : 'password'}
                  value={pwForm.newPw} onChange={e => setPwForm(p => ({ ...p, newPw: e.target.value }))}
                  placeholder="••••••••" className="input-field pr-12" />
                <button type="button" onClick={() => setShowPw(p => ({ ...p, new: !p.new }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPw.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Confirm New Password</label>
              <input type="password" value={pwForm.confirm}
                onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))}
                placeholder="••••••••" className="input-field" />
            </div>
            <div className="p-3 glass rounded-xl text-sm text-gray-400">
              Password change requires backend integration. This is a placeholder UI.
            </div>
            <button onClick={() => {
              if (!pwForm.current || !pwForm.newPw) { showToast('Please fill all fields', 'error'); return; }
              if (pwForm.newPw !== pwForm.confirm) { showToast('Passwords do not match', 'error'); return; }
              showToast('Password change feature coming soon!', 'info');
            }} className="btn-primary w-full flex items-center justify-center gap-2">
              <Lock className="w-4 h-4" /> Change Password
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
