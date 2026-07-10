import { useState, type ReactNode } from 'react';
import { MapPin, Mail, Calendar, Clock, ArrowRight, Pencil, Linkedin, Facebook, Twitter, Swords, Gavel, BarChart3 } from 'lucide-react';
import type { User, Notification } from '../../types';
import EditProfileModal from './EditProfileModal';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { getNotificationRoute } from '../../utils/notificationRouting';
import { toAbsoluteAvatarUrl } from '../../utils/avatarUrl';
import { notificationsAPI } from '../../api';
import LoadingSpinner from './LoadingSpinner';
import ConnectionRequestsPanel from './ConnectionRequestsPanel';

/* ── Role theme config ── */
const ROLE_THEME: Record<string, { gradient: string; shadow: string; badgeBg: string; badgeBorder: string; badgeText: string; icon: typeof Swords; label: string }> = {
  DEBATER:   { gradient: 'from-blue-500 to-violet-600',   shadow: 'shadow-blue-500/20',   badgeBg: 'bg-blue-500/15',   badgeBorder: 'border-blue-500/25',   badgeText: 'text-blue-400',   icon: Swords,    label: 'Debater' },
  JUDGE:     { gradient: 'from-violet-500 to-purple-700',  shadow: 'shadow-violet-500/20', badgeBg: 'bg-violet-500/15', badgeBorder: 'border-violet-500/25', badgeText: 'text-violet-400', icon: Gavel,     label: 'Judge' },
  ORGANIZER: { gradient: 'from-blue-500 to-cyan-600',     shadow: 'shadow-blue-500/20',   badgeBg: 'bg-cyan-500/15',   badgeBorder: 'border-cyan-500/25',   badgeText: 'text-cyan-400',   icon: BarChart3,  label: 'Organizer' },
};

export interface SharedProfileLayoutProps {
  user: User;
  notifications: Notification[];
  isReadOnly: boolean;
  loading: boolean;
  onNotificationsChange?: (updater: (prev: Notification[]) => Notification[]) => void;
  /** Role-specific sidebar extras (e.g. expertise badges, quick stats, create button) */
  sidebarExtra?: ReactNode;
  /** Extra actions for the header (e.g. Connect/Block buttons) */
  headerActions?: ReactNode;
  /** Role-specific right-column content (stats, charts, activity, tournaments) */
  children: ReactNode;
}

export default function SharedProfileLayout({
  user, notifications, isReadOnly, loading, onNotificationsChange, sidebarExtra, headerActions, children,
}: SharedProfileLayoutProps) {
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const theme = ROLE_THEME[user.role] ?? ROLE_THEME.DEBATER;
  const RoleIcon = theme.icon;

  return (
    <div className="min-h-screen py-8 px-4 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
            {/* ════ LEFT SIDEBAR ════ */}
            <aside className="space-y-5">
              <div className="card text-center relative">
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  {headerActions}
                  {!isReadOnly && (
                    <button onClick={() => setIsEditModalOpen(true)}
                      className="text-gray-500 hover:text-white transition-colors cursor-pointer" title="Edit Profile">
                      <Pencil className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className={`mx-auto w-28 h-28 rounded-full bg-gradient-to-br ${theme.gradient} flex items-center justify-center text-4xl font-black text-white border-4 border-white/10 shadow-lg ${theme.shadow} mb-4`}>
                  {user.profilePictureUrl ? (
                    <img src={toAbsoluteAvatarUrl(user.profilePictureUrl)} alt={user.fullName} className="w-full h-full rounded-full object-cover" />
                  ) : user.fullName[0]?.toUpperCase()}
                </div>
                <h1 className="text-xl font-black text-white">{user.fullName}</h1>
                <p className="text-gray-500 text-sm">@{user.username}</p>
                <div className="mt-3">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg ${theme.badgeBg} border ${theme.badgeBorder} ${theme.badgeText} text-xs font-bold uppercase tracking-wider`}>
                    <RoleIcon className="w-3.5 h-3.5" /> {theme.label}
                  </span>
                </div>
                {user.bio && <p className="text-gray-400 text-sm mt-4 leading-relaxed">{user.bio}</p>}
              </div>

              <div className="card space-y-3">
                {user.location && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-gray-600 flex-shrink-0" /><span className="text-gray-300">{user.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-gray-600 flex-shrink-0" /><span className="text-gray-300 truncate">{user.email}</span>
                </div>
                {user.age && (
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-gray-600 flex-shrink-0" /><span className="text-gray-300">Age {user.age}</span>
                  </div>
                )}
                {user.createdAt && (
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-4 h-4 text-gray-600 flex-shrink-0" /><span className="text-gray-300">Joined {format(new Date(user.createdAt), 'MMM yyyy')}</span>
                  </div>
                )}
              </div>

              {sidebarExtra}

              {!isReadOnly && <ConnectionRequestsPanel />}

              <div className="flex items-center justify-center gap-6 mt-4 py-4">
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-500 transition-all duration-300 hover:-translate-y-1"><Linkedin className="w-5 h-5" /></a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-200 transition-all duration-300 hover:-translate-y-1"><Twitter className="w-5 h-5" /></a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-600 transition-all duration-300 hover:-translate-y-1"><Facebook className="w-5 h-5" /></a>
              </div>
            </aside>

            {/* ════ RIGHT COLUMN ════ */}
            <main className="space-y-5">
              {children}

              {!isReadOnly && notifications.length > 0 && (
                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Notifications</h3>
                    <Link to="/notifications" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
                      View all <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                  <div className="space-y-2">
                    {notifications.map(n => (
                      <div key={n.id}
                        onClick={async () => {
                          if (!n.readStatus) {
                            try {
                              await notificationsAPI.markRead(n.id);
                              onNotificationsChange?.(prev => prev.map(item => item.id === n.id ? { ...item, readStatus: true } : item));
                            } catch { /* silent */ }
                          }
                          const route = getNotificationRoute(n);
                          if (route) navigate(route);
                        }}
                        className={`flex items-start gap-3 p-3 rounded-xl transition-colors cursor-pointer ${n.readStatus ? 'bg-white/[0.02] hover:bg-white/[0.04]' : 'bg-blue-500/[0.06] border border-blue-500/15 hover:bg-blue-500/[0.10]'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${n.readStatus ? 'bg-gray-700' : 'bg-blue-400'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-200 truncate">{n.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{n.message}</p>
                        </div>
                        <span className="text-[10px] text-gray-600 flex-shrink-0 mt-0.5">
                          {n.createdAt ? format(new Date(n.createdAt), 'MMM d') : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </main>
          </div>
        )}
      </div>
      {!isReadOnly && user && (
        <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} user={user} />
      )}
    </div>
  );
}
