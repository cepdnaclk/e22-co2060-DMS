import { useState, useEffect } from 'react';
import { MapPin, Mail, Clock, Scale, Star, Briefcase, Gavel, ArrowRight, CheckCircle, ClipboardList, Pencil } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { statsAPI, notificationsAPI } from '../../api';
import type { Notification } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EditProfileModal from '../../components/common/EditProfileModal';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

/* ────────────────────── SVG Donut Chart ────────────────────── */
function DonutChart({ judged, label }: { judged: number; label: string }) {
  const size = 140;
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  // Show a proportion arc — cap at 100 for visual purposes
  const pct = Math.min(judged, 100);
  const arc = (pct / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke="#8b5cf6" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${arc} ${circumference - arc}`}
          className="transition-all duration-1000 ease-out" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-white leading-none">{judged}</span>
        <span className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-wider">{label}</span>
      </div>
    </div>
  );
}



/* ────────────────────── Main Dashboard ────────────────────── */
export default function JudgeDashboard() {
  const { user } = useAuth();
  const [judgeStats, setJudgeStats] = useState<{ matchesJudged: number } | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const [statsRes, notifRes] = await Promise.allSettled([
          statsAPI.getJudgeStats(user.id),
          notificationsAPI.getAll(),
        ]);
        if (statsRes.status === 'fulfilled') setJudgeStats(statsRes.value.data);
        if (notifRes.status === 'fulfilled') setNotifications(notifRes.value.data.slice(0, 8));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  if (!user) return null;

  const matchesJudged = judgeStats?.matchesJudged ?? 0;

  /* Mock upcoming assignments */
  const upcomingAssignments = [
    { id: 'M-2050', topic: 'Should AI Replace Teachers?', date: 'May 5, 2026', tournament: 'National Championship' },
    { id: 'M-2051', topic: 'Renewable Energy vs Nuclear', date: 'May 7, 2026', tournament: 'National Championship' },
    { id: 'M-2053', topic: 'Universal Healthcare Debate', date: 'May 12, 2026', tournament: 'Inter-University Cup' },
  ];

  /* Mock recent judging activity */
  const recentActivity = [
    { status: 'Completed', id: 'M-2040', topic: 'Space Colonization Ethics', date: '2 days ago' },
    { status: 'Completed', id: 'M-2035', topic: 'Digital Privacy Laws', date: '5 days ago' },
    { status: 'Assigned', id: 'M-2050', topic: 'Should AI Replace Teachers?', date: 'Upcoming' },
    { status: 'Completed', id: 'M-2028', topic: 'Free Trade Agreements', date: '1 week ago' },
    { status: 'Assigned', id: 'M-2051', topic: 'Renewable Energy vs Nuclear', date: 'Upcoming' },
  ];

  const statusDot: Record<string, string> = {
    Completed: 'bg-emerald-400', Assigned: 'bg-blue-400', Pending: 'bg-amber-400',
  };
  const statusText: Record<string, string> = {
    Completed: 'text-emerald-400', Assigned: 'text-blue-400', Pending: 'text-amber-400',
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
                {/* Edit button */}
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors cursor-pointer"
                  title="Edit Profile">
                  <Pencil className="w-4 h-4" />
                </button>
                <div className="mx-auto w-28 h-28 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-4xl font-black text-white border-4 border-white/10 shadow-lg shadow-violet-500/20 mb-4">
                  {user.profilePictureUrl ? (
                    <img src={user.profilePictureUrl} alt={user.fullName} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    user.fullName[0]?.toUpperCase()
                  )}
                </div>

                <h1 className="text-xl font-black text-white">{user.fullName}</h1>
                <p className="text-gray-500 text-sm">@{user.username}</p>

                <div className="mt-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-violet-500/15 border border-violet-500/25 text-violet-400 text-xs font-bold uppercase tracking-wider">
                    <Gavel className="w-3.5 h-3.5" /> Judge
                  </span>
                </div>

                {user.bio && (
                  <p className="text-gray-400 text-sm mt-4 leading-relaxed">{user.bio}</p>
                )}
              </div>

              {/* Details */}
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
                {user.expertise && (
                  <div className="flex items-center gap-3 text-sm">
                    <Star className="w-4 h-4 text-gray-600 flex-shrink-0" />
                    <span className="text-gray-300">{user.expertise}</span>
                  </div>
                )}
                {user.yearsOfExperience && (
                  <div className="flex items-center gap-3 text-sm">
                    <Briefcase className="w-4 h-4 text-gray-600 flex-shrink-0" />
                    <span className="text-gray-300">{user.yearsOfExperience} years experience</span>
                  </div>
                )}
                {user.createdAt && (
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-4 h-4 text-gray-600 flex-shrink-0" />
                    <span className="text-gray-300">Joined {format(new Date(user.createdAt), 'MMM yyyy')}</span>
                  </div>
                )}
              </div>

              {/* Judge Expertise Badges */}
              {user.expertise && (
                <div className="card">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Expertise</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.expertise.split(',').map((e, i) => (
                      <span key={i}
                        className="px-2.5 py-1 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium">
                        {e.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Score Sheet Quick Access */}
              <div className="card bg-gradient-to-br from-violet-500/[0.08] to-purple-500/[0.08] border-violet-500/20">
                <div className="flex items-center gap-3 mb-2">
                  <ClipboardList className="w-5 h-5 text-violet-400" />
                  <h3 className="text-sm font-bold text-violet-300">Score Sheet Access</h3>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  When assigned to a match, you'll receive a direct link to the score sheet in your notifications.
                </p>
              </div>
            </aside>

            {/* ════════════ RIGHT COLUMN — STATS & ACTIVITY ════════════ */}
            <main className="space-y-5">

              {/* ─── Top Row: 3-col grid ─── */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* ── Judging Performance (spans 2 cols) ── */}
                <div className="card lg:col-span-2">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-5">Judging Performance</h3>
                  <div className="flex flex-col sm:flex-row items-center gap-8">
                    <DonutChart judged={matchesJudged} label="Judged" />

                    <div className="flex-1 grid grid-cols-2 gap-4 w-full">
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03]">
                        <div className="w-2 h-8 rounded-full bg-gradient-to-b from-violet-400 to-violet-600" />
                        <div>
                          <p className="text-2xl font-black text-white leading-none">{matchesJudged}</p>
                          <p className="text-xs text-gray-500 mt-0.5">Matches Judged</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03]">
                        <div className="w-2 h-8 rounded-full bg-gradient-to-b from-blue-400 to-blue-600" />
                        <div>
                          <p className="text-2xl font-black text-white leading-none">{upcomingAssignments.length}</p>
                          <p className="text-xs text-gray-500 mt-0.5">Upcoming</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03]">
                        <div className="w-2 h-8 rounded-full bg-gradient-to-b from-amber-400 to-amber-600" />
                        <div>
                          <p className="text-2xl font-black text-white leading-none">{user.yearsOfExperience ?? 0}</p>
                          <p className="text-xs text-gray-500 mt-0.5">Years Exp.</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03]">
                        <div className="w-2 h-8 rounded-full bg-gradient-to-b from-emerald-400 to-emerald-600" />
                        <div>
                          <p className="text-2xl font-black text-white leading-none">
                            {user.expertise?.split(',').length ?? 0}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">Formats</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Live / Upcoming Match Card (spans 1 col) ── */}
                <Link to="/tournament/1"
                  className="card lg:col-span-1 flex flex-col justify-between border border-white/10 hover:border-violet-500/60 hover:bg-white/[0.04] cursor-pointer transition-all duration-300 group">

                  {/* Header with pulsing indicator */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                      </span>
                      <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Live Now</span>
                    </div>

                    {/* Match details */}
                    <p className="text-lg font-black text-white leading-tight">MATCH-5-2</p>
                    <div className="mt-3 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-600 uppercase w-12 flex-shrink-0">Teams</span>
                        <span className="text-sm font-semibold text-gray-300">Colombo vs Peradeniya</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] text-gray-600 uppercase w-12 flex-shrink-0 mt-0.5">Topic</span>
                        <span className="text-sm text-gray-400 line-clamp-2 leading-snug">
                          Should AI Replace Teachers in Higher Education?
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer CTA */}
                  <div className="flex items-center justify-end gap-1.5 mt-5 text-violet-400 group-hover:text-violet-300 transition-colors">
                    <span className="text-xs font-semibold">Judge Match</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              </div>


              {/* ─── Upcoming Assignments ─── */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Upcoming Assignments
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 font-semibold">
                    {upcomingAssignments.length} pending
                  </span>
                </div>
                <div className="space-y-2">
                  {upcomingAssignments.map((a, i) => (
                    <div key={i}
                      className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors group">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <Scale className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-200 truncate">{a.topic}</p>
                        <p className="text-xs text-gray-600 mt-0.5">{a.tournament} · {a.id}</p>
                      </div>
                      <span className="text-xs text-gray-500 flex-shrink-0">{a.date}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ─── Bottom Row: Recent Activity Table ─── */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Recent Activity
                  </h3>
                  <Link to="/notifications" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors">
                    View all <ArrowRight className="w-3 h-3" />
                  </Link>
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

              {/* ─── Notifications ─── */}
              {notifications.length > 0 && (
                <div className="card">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Notifications</h3>
                  <div className="space-y-2">
                    {notifications.map(n => (
                      <div key={n.id}
                        className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${n.readStatus ? 'bg-white/[0.02]' : 'bg-violet-500/[0.06] border border-violet-500/15'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${n.readStatus ? 'bg-gray-700' : 'bg-violet-400'}`} />
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
      {/* Edit Profile Modal */}
      {user && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          user={user}
        />
      )}
    </div>
  );
}
