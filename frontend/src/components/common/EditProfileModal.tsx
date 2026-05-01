import { useState, useEffect } from 'react';
import { X, Linkedin, Twitter, Facebook } from 'lucide-react';
import type { User } from '../../types';
import { usersAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

interface SocialLinks {
  linkedinUrl: string;
  twitterUrl: string;
  facebookUrl: string;
}

function parseSocialLinks(json?: string): SocialLinks {
  try {
    if (json) {
      const parsed = JSON.parse(json);
      return {
        linkedinUrl: parsed.linkedinUrl || '',
        twitterUrl: parsed.twitterUrl || '',
        facebookUrl: parsed.facebookUrl || '',
      };
    }
  } catch { /* ignore */ }
  return { linkedinUrl: '', twitterUrl: '', facebookUrl: '' };
}

export default function EditProfileModal({ isOpen, onClose, user }: EditProfileModalProps) {
  const { updateUser } = useAuth();

  const [form, setForm] = useState({
    fullName: '',
    username: '',
    bio: '',
    location: '',
    age: '' as string | number,
  });
  const [social, setSocial] = useState<SocialLinks>({
    linkedinUrl: '',
    twitterUrl: '',
    facebookUrl: '',
  });
  const [saving, setSaving] = useState(false);

  // Populate form when modal opens
  useEffect(() => {
    if (isOpen && user) {
      setForm({
        fullName: user.fullName,
        username: user.username,
        bio: user.bio || '',
        location: user.location || '',
        age: user.age || '',
      });
      setSocial(parseSocialLinks(user.socialLinksJson));
    }
  }, [isOpen, user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const socialLinksJson = JSON.stringify({
        linkedinUrl: social.linkedinUrl || undefined,
        twitterUrl: social.twitterUrl || undefined,
        facebookUrl: social.facebookUrl || undefined,
      });

      const payload: Partial<User> = {
        fullName: form.fullName,
        bio: form.bio || undefined,
        location: form.location || undefined,
        age: form.age ? Number(form.age) : undefined,
        socialLinksJson,
      };

      const res = await usersAPI.update(user.id, payload);
      updateUser(res.data);
      onClose();
    } catch (err) {
      console.error('Failed to update profile', err);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const inputClass =
    'bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2.5 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all';

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 border border-gray-700 rounded-2xl p-6 w-full max-w-md animate-fade-in max-h-[90vh] overflow-y-auto scrollbar-hide"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={form.fullName}
              onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
              className={inputClass}
            />
          </div>

          {/* Username (read-only) */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Username
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-sm">
                @
              </span>
              <input
                type="text"
                value={form.username}
                readOnly
                className="bg-gray-800 border border-gray-700 text-gray-500 rounded-lg pl-7 pr-4 py-2.5 w-full text-sm cursor-not-allowed opacity-70"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Bio
            </label>
            <textarea
              value={form.bio}
              rows={3}
              onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              className={`${inputClass} resize-none`}
              placeholder="Tell us about yourself..."
            />
          </div>

          {/* Location + Age */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Location
              </label>
              <input
                type="text"
                value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                className={inputClass}
                placeholder="City, Country"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Age
              </label>
              <input
                type="number"
                value={form.age}
                onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                className={inputClass}
                placeholder="25"
                min={1}
                max={120}
              />
            </div>
          </div>

          {/* ── Social Links ── */}
          <div className="pt-2">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              Social Links
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Linkedin className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <input
                  type="url"
                  value={social.linkedinUrl}
                  onChange={e =>
                    setSocial(s => ({ ...s, linkedinUrl: e.target.value }))
                  }
                  className={inputClass}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
              <div className="flex items-center gap-3">
                <Twitter className="w-4 h-4 text-gray-300 flex-shrink-0" />
                <input
                  type="url"
                  value={social.twitterUrl}
                  onChange={e =>
                    setSocial(s => ({ ...s, twitterUrl: e.target.value }))
                  }
                  className={inputClass}
                  placeholder="https://twitter.com/username"
                />
              </div>
              <div className="flex items-center gap-3">
                <Facebook className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <input
                  type="url"
                  value={social.facebookUrl}
                  onChange={e =>
                    setSocial(s => ({ ...s, facebookUrl: e.target.value }))
                  }
                  className={inputClass}
                  placeholder="https://facebook.com/username"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-700/50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !form.fullName.trim()}
            className="px-5 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
