import React, { useEffect, useRef } from 'react';

interface Notification {
    id: string;
    type: 'match' | 'system' | 'result' | 'invite';
    title: string;
    body: string;
    time: string;
    read: boolean;
}

interface NotificationPopupProps {
    isDarkMode: boolean;
    onClose: () => void;
}

const mockNotifications: Notification[] = [
    {
        id: 'n1',
        type: 'match',
        title: 'Match Starting Soon',
        body: 'Your match in CDC 2026 Finals starts in 30 minutes. Room A102.',
        time: '5 min ago',
        read: false,
    },
    {
        id: 'n2',
        type: 'result',
        title: 'Match Result Available',
        body: 'Your result from "Kandy Open" Round 3 has been published.',
        time: '2 hours ago',
        read: false,
    },
    {
        id: 'n3',
        type: 'invite',
        title: 'Team Invitation',
        body: 'Peradeniya Team B has invited you to join as a reserve debater.',
        time: '1 day ago',
        read: true,
    },
    {
        id: 'n4',
        type: 'system',
        title: 'Profile Approved',
        body: 'Your judge profile has been reviewed and approved by the admin.',
        time: '3 days ago',
        read: true,
    },
];

const typeIcon = (type: Notification['type'], isDarkMode: boolean) => {
    const base = `w-8 h-8 rounded-full flex items-center justify-center shrink-0`;
    switch (type) {
        case 'match':
            return (
                <div className={`${base} ${isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                    </svg>
                </div>
            );
        case 'result':
            return (
                <div className={`${base} ${isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-50 text-green-600'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                    </svg>
                </div>
            );
        case 'invite':
            return (
                <div className={`${base} ${isDarkMode ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />
                    </svg>
                </div>
            );
        default:
            return (
                <div className={`${base} ${isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                </div>
            );
    }
};

const NotificationPopup: React.FC<NotificationPopupProps> = ({ isDarkMode, onClose }) => {
    const popupRef = useRef<HTMLDivElement>(null);

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

    const unreadCount = mockNotifications.filter(n => !n.read).length;

    const bg = isDarkMode ? 'bg-[#1e1e1e] border-gray-700 text-gray-100' : 'bg-white border-gray-200 text-gray-900';
    const mutedText = isDarkMode ? 'text-gray-400' : 'text-gray-500';
    const itemHover = isDarkMode ? 'hover:bg-gray-800/60' : 'hover:bg-gray-50';
    const divider = isDarkMode ? 'divide-gray-700/60' : 'divide-gray-100';

    return (
        <div
            ref={popupRef}
            className={`absolute right-0 top-full mt-2 w-80 rounded-xl shadow-2xl border z-50 overflow-hidden ${bg}`}
            style={{ animation: 'popupIn 0.15s ease-out' }}
        >
            {/* Header */}
            <div className={`flex items-center justify-between px-4 py-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">Notifications</span>
                    {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500 text-white">
                            {unreadCount}
                        </span>
                    )}
                </div>
                <button className="text-xs font-semibold text-blue-500 hover:text-blue-400 transition-colors">
                    Mark all read
                </button>
            </div>

            {/* Notification List */}
            <div className={`divide-y ${divider} max-h-80 overflow-y-auto`}>
                {mockNotifications.map(notif => (
                    <div
                        key={notif.id}
                        className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors relative ${itemHover} ${!notif.read ? (isDarkMode ? 'bg-blue-500/5' : 'bg-blue-50/50') : ''}`}
                    >
                        {typeIcon(notif.type, isDarkMode)}
                        <div className="flex-1 min-w-0">
                            <p className={`text-xs font-semibold leading-tight ${!notif.read ? '' : mutedText}`}>
                                {notif.title}
                            </p>
                            <p className={`text-xs mt-0.5 leading-relaxed ${mutedText}`}>
                                {notif.body}
                            </p>
                            <p className={`text-[10px] mt-1 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                                {notif.time}
                            </p>
                        </div>
                        {!notif.read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                        )}
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className={`px-4 py-2.5 border-t text-center ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                <button className="text-xs font-semibold text-blue-500 hover:text-blue-400 transition-colors">
                    View all notifications
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

export default NotificationPopup;
