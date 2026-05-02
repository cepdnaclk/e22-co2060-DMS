import { useState } from 'react';
import { MapPin, Mail, Calendar, Trophy, Swords, Star, Award, Clock, ArrowRight, Pencil, Linkedin, Facebook, Twitter } from 'lucide-react';
import type { User, DebaterStats, Notification, Match } from '../../types';
import EditProfileModal from './EditProfileModal';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { getNotificationRoute } from '../../utils/notificationRouting';
import { notificationsAPI } from '../../api';

/* ────────────────────── SVG Donut Chart ────────────────────── */
function DonutChart({ wins, losses, total }: { wins: number; losses: number; total: number }) {
  const size = 140;
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const winRate = total > 0 ? (wins / total) * 100 : 0;
  const winArc = total > 0 ? (wins / total) * circumference : 0;
  const lossArc = total > 0 ? (losses / total) * circumference : 0;
  const pendingArc = circumference - winArc - lossArc;

  return (
    <div className="relative group cursor-pointer" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background track */}
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        {/* Wins */}
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke="#22c55e" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${winArc} ${circumference - winArc}`}
          strokeDashoffset={0}
          className="transition-all duration-1000 ease-out" />
        {/* Losses */}
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke="#ef4444" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${lossArc} ${circumference - lossArc}`}
          strokeDashoffset={-winArc}
          className="transition-all duration-1000 ease-out" />
        {/* Pending/Draw */}
        {pendingArc > 0.5 && (
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
            stroke="#6b7280" strokeWidth={stroke} strokeLinecap="round"
            strokeDasharray={`${pendingArc} ${circumference - pendingArc}`}
            strokeDashoffset={-(winArc + lossArc)}
            className="transition-all duration-1000 ease-out" />
        )}
      </svg>

      {/* Default State — visible, fades out on hover */}
      <div className="absolute inset-0 flex flex-col items-center justify-center
        transition-all duration-300 ease-in-out
        opacity-100 scale-100
        group-hover:opacity-0 group-hover:scale-95">
        <span className="text-2xl font-black text-white leading-none">{winRate.toFixed(0)}%</span>
        <span className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-wider">Win Rate</span>
      </div>

      {/* Hover State — hidden, fades in on hover */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1
        transition-all duration-300 ease-in-out
        opacity-0 scale-105
        group-hover:opacity-100 group-hover:scale-100">
        <div className="text-center">
          <p className="text-xs text-gray-400 leading-none">Avg Score</p>
          <p className="text-sm font-bold text-gray-200 mt-0.5">82.5</p>
        </div>
        <div className="w-6 h-px bg-white/10" />
        <div className="text-center">
          <p className="text-xs text-gray-400 leading-none">Streak</p>
          <p className="text-sm font-bold text-amber-400 mt-0.5">3 Wins </p>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────── Props ────────────────────── */
export interface SharedDebaterLayoutProps {
  user: User;
  stats: DebaterStats | null;
  matches: Match[];
  notifications: Notification[];
  isReadOnly: boolean;
  loading: boolean;
  /** Callback to update notifications state (for mark-as-read). Only needed when !isReadOnly */
  onNotificationsChange?: (updater: (prev: Notification[]) => Notification[]) => void;
}

/* ────────────────────── Main Layout ────────────────────── */
import LoadingSpinner from './LoadingSpinner';

export default function SharedDebaterLayout({
  user,
  stats,
  matches,
  notifications,
  isReadOnly,
  loading,
  onNotificationsChange,
}: SharedDebaterLayoutProps) {
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const wins = stats?.wins ?? 0;
  const losses = stats?.losses ?? 0;
  const total = stats?.matchesPlayed ?? 0;
  const pom = stats?.playerOfMatchCount ?? 0;
  const bestDebater = stats?.bestDebaterTournamentCount ?? 0;

  /* --- Badge definitions --- */
  const badges = [
    ...Array.from({ length: pom }, (_, i) => ({
      id: `pom-${i}`, label: 'Player of Match', icon: Star,
      gradient: 'from-yellow-500/20 to-amber-500/20', border: 'border-yellow-500/30',
      iconColor: 'text-yellow-400', textColor: 'text-yellow-400/90',
    })),
    ...Array.from({ length: bestDebater }, (_, i) => ({
      id: `bd-${i}`, label: 'Best Debater', icon: Award,
      gradient: 'from-orange-500/20 to-red-500/20', border: 'border-orange-500/30',
      iconColor: 'text-orange-400', textColor: 'text-orange-400/90',
    })),
  ];

  /* --- Mock recent activity --- */
  const recentActivity = [
    { status: 'Win', id: 'M-1024', topic: 'AI Ethics in Education', date: '2 days ago' },
    { status: 'Loss', id: 'M-1019', topic: 'Universal Basic Income', date: '5 days ago' },
    { status: 'Win', id: 'M-1012', topic: 'Climate Change Policy', date: '1 week ago' },
    { status: 'Win', id: 'M-1005', topic: 'Social Media Regulation', date: '2 weeks ago' },
    { status: 'Loss', id: 'M-0998', topic: 'Nuclear Energy Expansion', date: '3 weeks ago' },
  ];

  const statusDot: Record<string, string> = {
    Win: 'bg-emerald-400', Loss: 'bg-red-400', Assigned: 'bg-blue-400',
  };
  const statusText: Record<string, string> = {
    Win: 'text-emerald-400', Loss: 'text-red-400', Assigned: 'text-blue-400',
  };

  return (
    <div className="min-h-screen py-8 px-4 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">

            {/* ════════════ LEFT COLUMN — PROFILE SIDEBAR ════════════ */}
            <aside className="space-y-5">
              {/* Avatar + Name */}
              <div className="card text-center relative">
                {/* Edit button — hidden in read-only mode */}
                {!isReadOnly && (
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors cursor-pointer"
                    title="Edit Profile">
                    <Pencil className="w-4 h-4" />
                  </button>
                )}
                {/* Large circular avatar */}
                <div className="mx-auto w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-4xl font-black text-white border-4 border-white/10 shadow-lg shadow-blue-500/20 mb-4">
                  {user.profilePictureUrl ? (
                    <img src={user.profilePictureUrl} alt={user.fullName} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    user.fullName[0]?.toUpperCase()
                  )}
                </div>

                <h1 className="text-xl font-black text-white">{user.fullName}</h1>
                <p className="text-gray-500 text-sm">@{user.username}</p>

                {/* Role badge */}
                <div className="mt-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-500/15 border border-blue-500/25 text-blue-400 text-xs font-bold uppercase tracking-wider">
                    <Swords className="w-3.5 h-3.5" /> Debater
                  </span>
                </div>

                {/* Bio */}
                {user.bio && (
                  <p className="text-gray-400 text-sm mt-4 leading-relaxed">{user.bio}</p>
                )}
              </div>

              {/* Details list */}
              <div className="card space-y-3">
                {user.location && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-gray-600 flex-shrink-0" />
                    <span className="text-gray-300">{user.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-gray-600 flex-shrink-0" />
                  <span className="text-gray-300 truncate">{user.email}</span>
                </div>
                {user.age && (
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-gray-600 flex-shrink-0" />
                    <span className="text-gray-300">Age {user.age}</span>
                  </div>
                )}
                {user.createdAt && (
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-4 h-4 text-gray-600 flex-shrink-0" />
                    <span className="text-gray-300">Joined {format(new Date(user.createdAt), 'MMM yyyy')}</span>
                  </div>
                )}
              </div>

              {/* Badges / Achievements */}
              {badges.length > 0 && (
                <div className="card">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Badges</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {badges.map(b => (
                      <div key={b.id}
                        className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-gradient-to-br ${b.gradient} border ${b.border} hover:scale-105 transition-transform cursor-default`}>
                        <b.icon className={`w-5 h-5 ${b.iconColor}`} />
                        <span className={`text-[10px] font-semibold ${b.textColor} text-center leading-tight`}>
                          {b.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Links */}
              <div className="flex items-center justify-center gap-6 mt-4 py-4">
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
                  className="text-gray-500 hover:text-blue-500 transition-all duration-300 hover:-translate-y-1">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                  className="text-gray-500 hover:text-gray-200 transition-all duration-300 hover:-translate-y-1">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                  className="text-gray-500 hover:text-blue-600 transition-all duration-300 hover:-translate-y-1">
                  <Facebook className="w-5 h-5" />
                </a>
              </div>
            </aside>

            {/* ════════════ RIGHT COLUMN — STATS & ACTIVITY ════════════ */}
            <main className="space-y-5">

              {/* ─── Top Row: 3-col grid ─── */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* ── Match Performance (spans 2 cols) ── */}
                <div className="card lg:col-span-2">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-5">Match Performance</h3>
                  <div className="flex flex-col sm:flex-row items-center gap-8">
                    {/* Donut */}
                    <DonutChart wins={wins} losses={losses} total={total} />

                    {/* Breakdown numbers */}
                    <div className="flex-1 grid grid-cols-2 gap-4 w-full">
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03]">
                        <div className="w-2 h-8 rounded-full bg-gradient-to-b from-emerald-400 to-emerald-600" />
                        <div>
                          <p className="text-2xl font-black text-white leading-none">{wins}</p>
                          <p className="text-xs text-gray-500 mt-0.5">Wins</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03]">
                        <div className="w-2 h-8 rounded-full bg-gradient-to-b from-red-400 to-red-600" />
                        <div>
                          <p className="text-2xl font-black text-white leading-none">{losses}</p>
                          <p className="text-xs text-gray-500 mt-0.5">Losses</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03]">
                        <div className="w-2 h-8 rounded-full bg-gradient-to-b from-blue-400 to-blue-600" />
                        <div>
                          <p className="text-2xl font-black text-white leading-none">{total}</p>
                          <p className="text-xs text-gray-500 mt-0.5">Total Matches</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03]">
                        <div className="w-2 h-8 rounded-full bg-gradient-to-b from-violet-400 to-violet-600" />
                        <div>
                          <p className="text-2xl font-black text-white leading-none">{pom + bestDebater}</p>
                          <p className="text-xs text-gray-500 mt-0.5">Awards</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Dynamic Match Status Card (spans 1 col) ── */}
                {(() => {
                  const liveMatch = matches.find(m => m.status === 'LIVE');
                  const upcomingMatch = matches
                    .filter(m => m.status === 'UPCOMING')
                    .sort((a, b) => {
                      if (a.startTime && b.startTime) return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
                      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                    })[0];
                  const completedMatch = matches
                    .filter(m => m.status === 'COMPLETED')
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

                  const activeMatch = liveMatch || upcomingMatch || completedMatch;

                  if (!activeMatch) {
                    return (
                      <div className="card lg:col-span-1 flex flex-col items-center justify-center border border-dashed border-white/20 min-h-[200px]">
                        <Trophy className="w-10 h-10 text-gray-700 mb-3" />
                        <p className="text-gray-500 text-sm font-medium">No matches assigned yet</p>
                        <p className="text-gray-600 text-xs mt-1">
                          {isReadOnly ? 'No matches to display' : "You'll see your matches here"}
                        </p>
                      </div>
                    );
                  }

                  const isLive = activeMatch.status === 'LIVE';
                  const isUpcoming = activeMatch.status === 'UPCOMING';

                  const dotColor = isLive ? 'bg-red-500' : isUpcoming ? 'bg-amber-500' : 'bg-gray-500';
                  const pingColor = isLive ? 'bg-red-400' : isUpcoming ? 'bg-amber-400' : '';
                  const labelColor = isLive ? 'text-red-400' : isUpcoming ? 'text-amber-400' : 'text-gray-400';
                  const label = isLive ? 'Live Now' : isUpcoming ? 'Up Next' : 'Last Match';

                  // In read-only mode: "View Match" instead of "Join Match"
                  const ctaText = isLive
                    ? (isReadOnly ? 'View Match' : 'Join Match')
                    : isUpcoming ? 'View Details' : 'View Results';

                  return (
                    <Link to={`/tournament/${activeMatch.tournamentId}`}
                      className="card lg:col-span-1 flex flex-col justify-between border border-white/10 hover:border-blue-500/60 hover:bg-white/[0.04] cursor-pointer transition-all duration-300 group">

                      {/* Header with indicator */}
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="relative flex h-2.5 w-2.5">
                            {(isLive || isUpcoming) && (
                              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${pingColor} opacity-75`} />
                            )}
                            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${dotColor}`} />
                          </span>
                          <span className={`text-[10px] font-bold uppercase tracking-widest ${labelColor}`}>{label}</span>
                        </div>

                        {/* Match details */}
                        <p className="text-lg font-black text-white leading-tight">{activeMatch.matchCode}</p>
                        <div className="mt-3 space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-600 uppercase w-8 flex-shrink-0">vs</span>
                            <span className="text-sm font-semibold text-gray-300">
                              {activeMatch.propositionSchool?.name} vs {activeMatch.oppositionSchool?.name}
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-[10px] text-gray-600 uppercase w-8 flex-shrink-0 mt-0.5">Topic</span>
                            <span className="text-sm text-gray-400 line-clamp-2 leading-snug">
                              {activeMatch.topic}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Footer CTA */}
                      <div className="flex items-center justify-end gap-1.5 mt-5 text-blue-400 group-hover:text-blue-300 transition-colors">
                        <span className="text-xs font-semibold">{ctaText}</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </Link>
                  );
                })()}
              </div>


              {/* ─── Bottom Row: Recent Activity Table ─── */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Recent Activity
                  </h3>
                  {!isReadOnly && (
                    <Link to="/notifications" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
                      View all <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-600 text-xs uppercase tracking-wider border-b border-white/5">
                        <th className="text-left pb-3 pl-1 font-medium">Status</th>
                        <th className="text-left pb-3 font-medium">Match</th>
                        <th className="text-left pb-3 font-medium hidden sm:table-cell">Topic</th>
                        <th className="text-right pb-3 pr-1 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {recentActivity.map((a, i) => (
                        <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 pl-1">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${statusDot[a.status]}`} />
                              <span className={`font-semibold text-xs ${statusText[a.status]}`}>{a.status}</span>
                            </div>
                          </td>
                          <td className="py-3">
                            <span className="text-gray-300 font-mono text-xs">{a.id}</span>
                          </td>
                          <td className="py-3 hidden sm:table-cell">
                            <span className="text-gray-400 truncate max-w-[200px] block">{a.topic}</span>
                          </td>
                          <td className="py-3 pr-1 text-right text-gray-600 text-xs">{a.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ─── Notifications — only shown for the owner ─── */}
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
                        className={`flex items-start gap-3 p-3 rounded-xl transition-colors cursor-pointer ${
                          n.readStatus ? 'bg-white/[0.02] hover:bg-white/[0.04]' : 'bg-blue-500/[0.06] border border-blue-500/15 hover:bg-blue-500/[0.10]'
                        }`}>
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
      {/* Edit Profile Modal — only rendered for the owner */}
      {!isReadOnly && user && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          user={user}
        />
      )}
    </div>
  );
}
