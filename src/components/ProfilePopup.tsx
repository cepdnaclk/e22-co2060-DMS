import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface ProfilePopupProps {
    isDarkMode: boolean;
    onClose: () => void;
    userName: string;
    userRole: 'STUDENT' | 'JUDGE';
    profilePictureUrl?: string;
}

const ProfilePopup: React.FC<ProfilePopupProps> = ({
    isDarkMode,
    onClose,
    userName,
    userRole,
    profilePictureUrl,
}) => {
    const popupRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Close on outside click
    useEffect(() => {
        const handleOutside = (e: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleOutside);
        return () => document.removeEventListener('mousedown', handleOutside);
    }, [onClose]);

    const bg = isDarkMode ? 'bg-[#1e1e1e] border-gray-700 text-gray-100' : 'bg-white border-gray-200 text-gray-900';
    const mutedText = isDarkMode ? 'text-gray-400' : 'text-gray-500';
    const itemHover = isDarkMode ? 'hover:bg-gray-800 text-gray-300 hover:text-white' : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900';
    const divider = isDarkMode ? 'border-gray-700' : 'border-gray-100';

    const handleNavigate = (path: string) => {
        onClose();
        navigate(path);
    };

    const menuItems = [
        {
            label: 'View Profile',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
            ),
            action: () => handleNavigate('/'),
        },
        {
            label: 'Edit Profile',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
            ),
            action: () => handleNavigate('/edit-profile'),
        },
        {
            label: 'Settings',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
            ),
            action: () => handleNavigate('/'),
        },
    ];

    return (
        <div
            ref={popupRef}
            className={`absolute right-0 top-full mt-2 w-56 rounded-xl shadow-2xl border z-50 overflow-hidden ${bg}`}
            style={{ animation: 'popupIn 0.15s ease-out' }}
        >
            {/* User Info */}
            <div className={`px-4 py-3 border-b ${divider}`}>
                <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                        {profilePictureUrl ? (
                            <img src={profilePictureUrl} alt={userName} className="w-full h-full object-cover rounded-full" />
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                            </svg>
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-bold truncate">{userName}</p>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${userRole === 'STUDENT'
                                ? (isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600')
                                : (isDarkMode ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-50 text-purple-600')
                            }`}>
                            {userRole === 'STUDENT' ? 'Debater' : 'Judge'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Menu Items */}
            <div className="py-1">
                {menuItems.map((item) => (
                    <button
                        key={item.label}
                        onClick={item.action}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors text-left ${itemHover}`}
                    >
                        <span className={mutedText}>{item.icon}</span>
                        {item.label}
                    </button>
                ))}
            </div>

            {/* Sign Out */}
            <div className={`border-t py-1 ${divider}`}>
                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors text-left">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Sign Out
                </button>
            </div>

            <style>{`
                @keyframes popupIn {
                    from { opacity: 0; transform: translateY(-6px) scale(0.97); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </div>
    );
};

export default ProfilePopup;
