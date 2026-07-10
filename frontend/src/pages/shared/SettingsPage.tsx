import { useState, useEffect } from 'react';
import { Settings, Globe, Lock, Bell, User, Eye, EyeOff, Save, Loader2, Camera } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usersAPI } from '../../api';
import { useToast } from '../../components/common/Toast';
import Avatar from '../../components/common/Avatar';
import { toAbsoluteAvatarUrl, compressImageFile } from '../../utils/avatarUrl';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'si', label: 'Sinhala' },
  { code: 'ta', label: 'Tamil' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
];

type Tab = 'profile' | 'privacy' | 'notifications' | 'password';

function BlockedUsersList() {
  const [blocked, setBlocked] = useState<import('../../types').Block[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlocked = async () => {
      try {
        const { data } = await import('../../api').then(m => m.connectionsAPI.getBlockedUsers());
        setBlocked(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchBlocked();
  }, []);

  const handleUnblock = async (id: number) => {
    try {
      await import('../../api').then(m => m.connectionsAPI.unblockUser(id));
      setBlocked(prev => prev.filter(b => b.blocked.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <Loader2 className="w-5 h-5 animate-spin mx-auto my-4 text-gray-500" />;
  if (blocked.length === 0) return <p className="text-gray-500 text-sm text-center py-4">No blocked users.</p>;

  return (
    <div className="space-y-3">
      {blocked.map(b => (
        <div key={b.id} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl border border-white/5">
          <div className="flex items-center gap-3">
            <Avatar name={b.blocked.fullName} src={b.blocked.profilePictureUrl} size="md" />
            <div>
              <p className="text-sm font-semibold text-gray-200">{b.blocked.fullName}</p>
              <p className="text-xs text-gray-500">@{b.blocked.username}</p>
            </div>
          </div>
          <button onClick={() => handleUnblock(b.blocked.id)} className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-xs font-semibold transition-colors">
            Unblock
          </button>
        </div>
      ))}
    </div>
  );
}

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

  // Avatar file upload state
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(
    toAbsoluteAvatarUrl(user?.profilePictureUrl)
  );

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    // Revoke previous object URL to avoid memory leaks
    if (avatarPreview && avatarPreview.startsWith('blob:')) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(URL.createObjectURL(file));
  };

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
      let profilePictureUrl: string | undefined = form.profilePictureUrl || undefined;

      // Compress before upload: resize to 1280 px max, JPEG 82% — keeps files tiny
      if (avatarFile) {
        const compressed = await compressImageFile(avatarFile);
        const { data: updatedUser } = await usersAPI.uploadProfilePicture(user.id, compressed);
        if (updatedUser.profilePictureUrl) {
          // Build an absolute URL so <img src> resolves against the backend, not the frontend
          const backendBase = (import.meta.env.VITE_API_BASE_URL || '/api')
            .replace(/\/api$/, ''); // strip trailing /api → get the root origin
          const cacheBust = `?t=${Date.now()}`;
          profilePictureUrl = updatedUser.profilePictureUrl.startsWith('http')
            ? `${updatedUser.profilePictureUrl}${cacheBust}`
            : `${backendBase}${updatedUser.profilePictureUrl}${cacheBust}`;
        }
      }

      const { data } = await usersAPI.update(user.id, {
        fullName: form.fullName,
        age: form.age ? parseInt(form.age) : undefined,
        bio: form.bio,
        location: form.location,
        profilePictureUrl,
        expertise: form.expertise || undefined,
        yearsOfExperience: form.yearsOfExperience ? parseInt(form.yearsOfExperience) : undefined,
        language: form.language,
        privacyStatus: privacy,
      } as any);

      // Push full update then patch picture URL so Navbar refreshes immediately
      updateUser(data);
      if (profilePictureUrl) {
        updateUser({ profilePictureUrl } as any);
        setAvatarPreview(profilePictureUrl); // now an absolute URL — won't show alt text
      }

      setAvatarFile(null);
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
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeTab === t.key ? 'bg-blue-600 text-white' : 'glass text-gray-400 hover:text-white hover:bg-white/10'
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

            {/* ── Profile Picture Upload ── */}
            <div>
              <label className="text-sm text-gray-400 mb-3 block flex items-center gap-2">
                <Camera className="w-4 h-4" /> Profile Picture
              </label>

              <div className="flex items-center gap-5">
                {/* Circle preview */}
                <label
                  htmlFor="avatar-upload"
                  className="group relative flex-shrink-0 cursor-pointer"
                >
                  {/* Circle image */}
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/20 bg-gray-800">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">
                        <Camera className="w-8 h-8" />
                      </div>
                    )}
                  </div>

                  {/* Camera badge */}
                  <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-blue-600 border-2 border-gray-900 flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                    <Camera className="w-3.5 h-3.5 text-white" />
                  </div>

                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    capture="user"
                    className="sr-only"
                    onChange={handleAvatarChange}
                  />
                </label>

                {/* Right-side text / status */}
                <div className="flex flex-col gap-1.5">
                  <p className="text-sm text-white font-medium">
                    {avatarFile ? avatarFile.name : 'No photo selected'}
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 5 MB</p>
                  {avatarFile ? (
                    <p className="text-xs text-blue-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
                      Click <strong>Save Profile</strong> to apply
                    </p>
                  ) : (
                    <label
                      htmlFor="avatar-upload"
                      className="text-xs text-blue-400 underline cursor-pointer hover:text-blue-300 transition-colors"
                    >
                      Choose a photo
                    </label>
                  )}
                </div>
              </div>
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
                    className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${form.language === l.code
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
          <div className="space-y-6">
            <div className="card space-y-5">
              <h3 className="font-bold text-white">Privacy Settings</h3>
              <div className="grid grid-cols-2 gap-4">
                {(['PUBLIC', 'PRIVATE'] as const).map(p => (
                  <button key={p} onClick={() => setPrivacy(p)}
                    className={`p-4 rounded-xl border text-left transition-all ${privacy === p ? 'bg-blue-600/20 border-blue-500 text-white' : 'glass border-white/10 text-gray-400 hover:border-white/20'
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
            
            {/* Blocked Users Section */}
            <div className="card">
              <h3 className="font-bold text-white mb-4">Blocked Users</h3>
              <p className="text-sm text-gray-400 mb-4">Blocked users cannot view your profile or send you messages.</p>
              <BlockedUsersList />
            </div>
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
                  className={`w-12 h-6 rounded-full transition-all duration-200 relative ${notifPrefs[key as keyof typeof notifPrefs] ? 'bg-blue-600' : 'bg-white/10'
                    }`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200 ${notifPrefs[key as keyof typeof notifPrefs] ? 'left-7' : 'left-1'
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
