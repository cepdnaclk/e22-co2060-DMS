import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EditableProfile } from '../App';

interface EditProfilePageProps {
    editableProfile: EditableProfile;
    onEditSave: (data: EditableProfile) => void;
    isDarkMode: boolean;
    user: {
        name: string;
        location?: string;
        affiliation?: string;
        bio?: string;
        profilePictureUrl?: string;
        socialLinks?: {
            github?: string;
            linkedin?: string;
            twitter?: string;
            website?: string;
        };
    };
}

type EditField = keyof EditableProfile | 'gender' | 'location' | 'birthday' | 'website' | null;

const EditProfilePage: React.FC<EditProfilePageProps> = ({
    editableProfile,
    onEditSave,
    isDarkMode,
    user,
}) => {
    const navigate = useNavigate();
    const [activeField, setActiveField] = useState<EditField>(null);
    const [formData, setFormData] = useState({
        name: editableProfile.name,
        bio: editableProfile.bio,
        github: editableProfile.github,
        linkedin: editableProfile.linkedin,
        gender: 'Male',
        location: user.location ?? '',
        birthday: 'September 12, 2003',
        website: user.socialLinks?.website ?? '',
    });
    const [isSaving, setIsSaving] = useState(false);
    const [savedFields, setSavedFields] = useState<Set<string>>(new Set());

    const bg = isDarkMode ? 'bg-[#1a1a1a] text-gray-100' : 'bg-gray-50 text-gray-900';
    const cardBg = isDarkMode ? 'bg-[#232323] border-gray-700' : 'bg-white border-gray-200';
    const mutedText = isDarkMode ? 'text-gray-400' : 'text-gray-500';
    const inputTheme = isDarkMode
        ? 'bg-[#2a2a2a] border-gray-700 text-gray-100 placeholder-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
        : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20';
    const divider = isDarkMode ? 'divide-gray-700/60' : 'divide-gray-100';
    const rowHover = isDarkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50';

    const handleChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setSavedFields(prev => { const s = new Set(prev); s.delete(field); return s; });
    };

    const handleRowSave = (field: keyof typeof formData) => {
        setSavedFields(prev => new Set(prev).add(field));
        setActiveField(null);
    };

    const handleFullSave = async () => {
        setIsSaving(true);
        await new Promise(res => setTimeout(res, 700));
        onEditSave({
            name: formData.name,
            bio: formData.bio,
            github: formData.github,
            linkedin: formData.linkedin,
        });
        setIsSaving(false);
        navigate('/');
    };

    type RowField = keyof typeof formData;

    const rows: {
        key: RowField;
        label: string;
        icon: React.ReactNode;
        type?: string;
        placeholder?: string;
    }[] = [
            {
                key: 'name',
                label: 'Display Name',
                icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                    </svg>
                ),
                placeholder: 'Your display name',
            },
            {
                key: 'gender',
                label: 'Gender',
                icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="11" r="4" /><path d="M12 15v6" /><path d="M9 18h6" /><path d="M18 5l-3.5 3.5" /><path d="M18 5h-4" /><path d="M18 5v4" />
                    </svg>
                ),
                placeholder: 'e.g. Male, Female, Non-binary',
            },
            {
                key: 'location',
                label: 'Location',
                icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                    </svg>
                ),
                placeholder: 'City, Country',
            },
            {
                key: 'birthday',
                label: 'Birthday',
                icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                ),
                type: 'text',
                placeholder: 'Month Day, Year',
            },
            {
                key: 'website',
                label: 'Websites',
                icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                ),
                placeholder: 'https://yourwebsite.com',
            },
            {
                key: 'github',
                label: 'Github',
                icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                    </svg>
                ),
                placeholder: 'https://github.com/username',
            },
            {
                key: 'linkedin',
                label: 'LinkedIn',
                icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" />
                    </svg>
                ),
                placeholder: 'https://linkedin.com/in/username',
            },
        ];

    return (
        <div className={`min-h-screen ${bg} transition-colors duration-300`}>
            {/* Page Header / Topbar */}
            <header className={`sticky top-0 z-30 w-full border-b backdrop-blur-md px-4 sm:px-6 h-16 flex items-center gap-4 transition-colors duration-300 ${isDarkMode ? 'bg-[#1a1a1a]/90 border-gray-800' : 'bg-white/90 border-gray-200'}`}>
                <button
                    onClick={() => navigate('/')}
                    className={`p-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-semibold ${isDarkMode ? 'text-gray-400 hover:bg-gray-800 hover:text-gray-100' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                    </svg>
                    Back
                </button>
                <span className={`font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-500`}>
                    DMS
                </span>
                <span className={`text-sm font-medium ${mutedText}`}>/ Edit Profile</span>
            </header>

            {/* Page Content */}
            <main className="max-w-2xl mx-auto px-4 py-10">

                {/* Avatar Section */}
                <div className="flex flex-col items-center mb-10">
                    <div className="relative">
                        <div className={`w-28 h-28 rounded-full flex items-center justify-center shadow-lg border-4 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-500' : 'bg-gray-100 border-gray-200 text-gray-400'}`}>
                            {user.profilePictureUrl ? (
                                <img src={user.profilePictureUrl} alt={formData.name} className="w-full h-full object-cover rounded-full" />
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                                </svg>
                            )}
                        </div>
                        <button
                            className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-110 bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
                            title="Change photo"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" />
                            </svg>
                        </button>
                    </div>
                    <p className={`mt-3 text-xs ${mutedText}`}>Click the camera icon to change your photo</p>
                </div>

                {/* General Section */}
                <div className="mb-6">
                    <h2 className="font-bold text-lg mb-1">General</h2>
                    <p className={`text-sm ${mutedText}`}>Manage your basic profile information.</p>
                </div>

                <div className={`rounded-xl border overflow-hidden ${cardBg}`}>
                    <div className={`divide-y ${divider}`}>
                        {rows.map(({ key, label, icon, placeholder }) => (
                            <div key={key}>
                                {/* Row trigger */}
                                <button
                                    onClick={() => setActiveField(activeField === key ? null : key)}
                                    className={`w-full flex items-center justify-between px-5 py-4 text-left transition-colors ${rowHover}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`${mutedText} shrink-0`}>{icon}</span>
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <span className="font-semibold text-sm">{label}</span>
                                            {formData[key] ? (
                                                <span className={`text-sm truncate max-w-[200px] ${key === 'github' || key === 'linkedin' || key === 'website'
                                                    ? 'text-blue-500'
                                                    : mutedText
                                                    }`}>
                                                    {formData[key]}
                                                </span>
                                            ) : (
                                                <span className={`text-sm italic ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                                                    Not set
                                                </span>
                                            )}
                                            {savedFields.has(key) && (
                                                <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded">
                                                    Saved
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className={`${mutedText} transition-transform duration-200 shrink-0 ${activeField === key ? 'rotate-90' : ''}`}
                                    >
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                </button>

                                {/* Inline edit panel */}
                                {activeField === key && (
                                    <div
                                        className={`px-5 pb-4 pt-1 ${isDarkMode ? 'bg-gray-800/30' : 'bg-gray-50/80'}`}
                                        style={{ animation: 'slideDown 0.15s ease-out' }}
                                    >
                                        <label className={`block text-xs font-semibold mb-1.5 ${mutedText}`}>
                                            {label}
                                        </label>
                                        {key === 'bio' ? (
                                            <textarea
                                                value={formData[key]}
                                                onChange={e => handleChange(key, e.target.value)}
                                                rows={3}
                                                placeholder={placeholder}
                                                className={`w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-all duration-150 border resize-none ${inputTheme}`}
                                                maxLength={200}
                                            />
                                        ) : key === 'gender' ? (
                                            <div className="relative">
                                                <select
                                                    value={formData[key]}
                                                    onChange={e => handleChange(key, e.target.value)}
                                                    autoFocus
                                                    className={`w-full rounded-lg px-3 py-2.5 pr-10 text-sm outline-none transition-all duration-150 border ${inputTheme} appearance-none cursor-pointer`}
                                                >
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={mutedText}>
                                                        <polyline points="6 9 12 15 18 9" />
                                                    </svg>
                                                </div>
                                            </div>
                                        ) : key === 'birthday' ? (
                                            <input
                                                type="date"
                                                value={(() => {
                                                    const d = new Date(formData[key]);
                                                    if (!isNaN(d.getTime())) {
                                                        // Use local parts to avoid UTC timezone shift
                                                        const yyyy = d.getFullYear();
                                                        const mm = String(d.getMonth() + 1).padStart(2, '0');
                                                        const dd = String(d.getDate()).padStart(2, '0');
                                                        return `${yyyy}-${mm}-${dd}`;
                                                    }
                                                    return '';
                                                })()}
                                                onChange={e => {
                                                    if (!e.target.value) return;
                                                    // Parse YYYY-MM-DD in local time (avoids UTC day-shift)
                                                    const [y, m, d] = e.target.value.split('-').map(Number);
                                                    const local = new Date(y, m - 1, d);
                                                    handleChange(key, local.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
                                                }}
                                                autoFocus
                                                className={`w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-all duration-150 border ${inputTheme} [color-scheme:dark]`}
                                            />
                                        ) : (
                                            <input
                                                type={key === 'github' || key === 'linkedin' || key === 'website' ? 'url' : 'text'}
                                                value={formData[key]}
                                                onChange={e => handleChange(key, e.target.value)}
                                                placeholder={placeholder}
                                                className={`w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-all duration-150 border ${inputTheme}`}
                                                autoFocus
                                            />
                                        )}
                                        <div className="flex gap-2 mt-3">
                                            <button
                                                onClick={() => setActiveField(null)}
                                                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => handleRowSave(key)}
                                                className="flex-1 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white transition-all shadow-sm"
                                            >
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Backend note */}
                <div className={`mt-5 flex items-start gap-2.5 text-xs p-3 rounded-lg ${isDarkMode ? 'bg-blue-500/10 border border-blue-500/20 text-blue-300' : 'bg-blue-50 border border-blue-200 text-blue-700'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span>
                        In production this will call{' '}
                        <code className="font-mono font-semibold">PUT /api/users/&#123;id&#125;/profile</code>{' '}
                        (Spring Boot · JWT secured).
                    </span>
                </div>

                {/* Footer Actions */}
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={() => navigate('/')}
                        className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-colors border ${isDarkMode ? 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleFullSave}
                        disabled={isSaving}
                        className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md hover:shadow-blue-500/30 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSaving ? (
                            <>
                                <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                </svg>
                                Saving…
                            </>
                        ) : (
                            'Save All Changes'
                        )}
                    </button>
                </div>
            </main>

            <style>{`
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-6px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default EditProfilePage;
