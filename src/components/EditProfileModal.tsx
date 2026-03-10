import React, { useState, useEffect, useRef } from 'react';

interface EditProfileData {
    name: string;
    bio: string;
    github: string;
    linkedin: string;
}

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: EditProfileData) => void;
    initialData: EditProfileData;
    isDarkMode: boolean;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialData,
    isDarkMode,
}) => {
    const [formData, setFormData] = useState<EditProfileData>(initialData);
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState<Partial<EditProfileData>>({});
    const overlayRef = useRef<HTMLDivElement>(null);
    const firstInputRef = useRef<HTMLInputElement>(null);

    // Sync form when modal opens with latest initialData
    useEffect(() => {
        if (isOpen) {
            setFormData(initialData);
            setErrors({});
            // Focus first input after transition
            const t = setTimeout(() => firstInputRef.current?.focus(), 80);
            return () => clearTimeout(t);
        }
    }, [isOpen, initialData]);

    // Trap Escape key
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    const validate = (): boolean => {
        const newErrors: Partial<EditProfileData> = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required.';
        if (formData.github && !/^https?:\/\/(www\.)?github\.com\/.+/.test(formData.github.trim())) {
            newErrors.github = 'Enter a valid GitHub URL (e.g. https://github.com/username)';
        }
        if (formData.linkedin && !/^https?:\/\/(www\.)?linkedin\.com\/.+/.test(formData.linkedin.trim())) {
            newErrors.linkedin = 'Enter a valid LinkedIn URL (e.g. https://linkedin.com/in/username)';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name as keyof EditProfileData]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setIsSaving(true);
        // Simulate async save (replace with real API call when backend is ready)
        await new Promise(res => setTimeout(res, 600));
        onSave(formData);
        setIsSaving(false);
        onClose();
    };

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === overlayRef.current) onClose();
    };

    if (!isOpen) return null;

    // ── Styles ──────────────────────────────────────────────────────────────
    const overlayBg = 'fixed inset-0 z-50 flex items-center justify-center p-4';
    const overlayBackdrop = 'absolute inset-0 bg-black/60 backdrop-blur-sm';
    const modalBg = isDarkMode
        ? 'relative bg-[#1e1e1e] border border-gray-700 text-gray-100'
        : 'relative bg-white border border-gray-200 text-gray-900';
    const labelClass = `block text-xs font-semibold mb-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`;
    const inputBase = `w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-all duration-150 border`;
    const inputTheme = isDarkMode
        ? 'bg-[#2a2a2a] border-gray-700 text-gray-100 placeholder-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
        : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20';
    const inputError = 'border-red-500 focus:border-red-500 focus:ring-red-500/20';
    const mutedText = isDarkMode ? 'text-gray-500' : 'text-gray-400';

    return (
        <div
            ref={overlayRef}
            className={overlayBg}
            onClick={handleOverlayClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-profile-title"
        >
            {/* Backdrop */}
            <div className={overlayBackdrop} />

            {/* Modal Panel */}
            <div
                className={`${modalBg} w-full max-w-md rounded-2xl shadow-2xl`}
                style={{ animation: 'modalIn 0.18s ease-out' }}
            >
                {/* Header */}
                <div className={`flex items-center justify-between px-6 py-5 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                    <div>
                        <h2 id="edit-profile-title" className="font-bold text-lg">Edit Profile</h2>
                        <p className={`text-xs mt-0.5 ${mutedText}`}>Update your public information</p>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-200' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-800'}`}
                        aria-label="Close"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} noValidate>
                    <div className="px-6 py-5 space-y-5">

                        {/* Name */}
                        <div>
                            <label htmlFor="ep-name" className={labelClass}>
                                Display Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                ref={firstInputRef}
                                id="ep-name"
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Your full name"
                                className={`${inputBase} ${inputTheme} ${errors.name ? inputError : ''}`}
                                maxLength={80}
                            />
                            {errors.name && (
                                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        {/* Bio */}
                        <div>
                            <label htmlFor="ep-bio" className={labelClass}>Bio</label>
                            <textarea
                                id="ep-bio"
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                placeholder="Tell the community a bit about yourself..."
                                rows={3}
                                maxLength={200}
                                className={`${inputBase} ${inputTheme} resize-none`}
                            />
                            <p className={`text-right text-[11px] mt-1 ${mutedText}`}>{formData.bio.length}/200</p>
                        </div>

                        {/* Social Links */}
                        <div className={`rounded-xl p-4 space-y-4 ${isDarkMode ? 'bg-[#2a2a2a] border border-gray-700/60' : 'bg-gray-50 border border-gray-200'}`}>
                            <p className={`text-xs font-bold uppercase tracking-wider ${mutedText}`}>Social Links</p>

                            {/* GitHub */}
                            <div>
                                <label htmlFor="ep-github" className={labelClass}>
                                    <span className="flex items-center gap-1.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /></svg>
                                        GitHub
                                    </span>
                                </label>
                                <input
                                    id="ep-github"
                                    name="github"
                                    type="url"
                                    value={formData.github}
                                    onChange={handleChange}
                                    placeholder="https://github.com/username"
                                    className={`${inputBase} ${inputTheme} ${errors.github ? inputError : ''}`}
                                />
                                {errors.github && (
                                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                        {errors.github}
                                    </p>
                                )}
                            </div>

                            {/* LinkedIn */}
                            <div>
                                <label htmlFor="ep-linkedin" className={labelClass}>
                                    <span className="flex items-center gap-1.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
                                        LinkedIn
                                    </span>
                                </label>
                                <input
                                    id="ep-linkedin"
                                    name="linkedin"
                                    type="url"
                                    value={formData.linkedin}
                                    onChange={handleChange}
                                    placeholder="https://linkedin.com/in/username"
                                    className={`${inputBase} ${inputTheme} ${errors.linkedin ? inputError : ''}`}
                                />
                                {errors.linkedin && (
                                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                        {errors.linkedin}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Backend note */}
                        <div className={`flex items-start gap-2.5 text-xs p-3 rounded-lg ${isDarkMode ? 'bg-blue-500/10 border border-blue-500/20 text-blue-300' : 'bg-blue-50 border border-blue-200 text-blue-700'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                            <span>In production this will call <code className="font-mono font-semibold">PUT /api/users/&#123;id&#125;/profile</code> (Spring Boot · JWT secured).</span>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className={`flex gap-3 px-6 py-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                        <button
                            type="button"
                            onClick={onClose}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md hover:shadow-blue-500/30 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSaving ? (
                                <>
                                    <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                                    Saving…
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Keyframe for modal entrance */}
            <style>{`
                @keyframes modalIn {
                    from { opacity: 0; transform: scale(0.96) translateY(6px); }
                    to   { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default EditProfileModal;
