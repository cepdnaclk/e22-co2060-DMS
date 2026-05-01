import { useState, useEffect } from 'react';
import { MapPin, Mail, Clock, Trophy, Plus, Users, CheckCircle, ArrowRight, TrendingUp, BarChart3, Pencil } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { tournamentsAPI, notificationsAPI } from '../../api';
import type { Tournament, Notification } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EditProfileModal from '../../components/common/EditProfileModal';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

/* ────────────────────── SVG Donut Chart ────────────────────── */
function DonutChart({ active, completed, total }: { active: number; completed: number; total: number }) {
  const size = 140;
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const activeArc = total > 0 ? (active / total) * circumference : 0;
  const completedArc = total > 0 ? (completed / total) * circumference : 0;
  const cancelled = Math.max(0, total - active - completed);
  const cancelledArc = total > 0 ? (cancelled / total) * circumference : 0;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        {/* Active */}
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke="#22c55e" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${activeArc} ${circumference - activeArc}`}
          className="transition-all duration-1000 ease-out" />
        {/* Completed */}
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke="#3b82f6" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${completedArc} ${circumference - completedArc}`}
          strokeDashoffset={-activeArc}
          className="transition-all duration-1000 ease-out" />
        {/* Cancelled */}
        {cancelledArc > 0.5 && (
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
            stroke="#6b7280" strokeWidth={stroke} strokeLinecap="round"
            strokeDasharray={`${cancelledArc} ${circumference - cancelledArc}`}
            strokeDashoffset={-(activeArc + completedArc)}
            className="transition-all duration-1000 ease-out" />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-white leading-none">{total}</span>
        <span className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-wider">Total</span>
      </div>
    </div>
  );
}



/* ────────────────────── Main Dashboard ────────────────────── */
export default function OrganizerDashboard() {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const [tRes, nRes] = await Promise.allSettled([
          tournamentsAPI.getByOrganizer(user.id),
          notificationsAPI.getAll(),
        ]);
        if (tRes.status === 'fulfilled') setTournaments(tRes.value.data);
        if (nRes.status === 'fulfilled') setNotifications(nRes.value.data.slice(0, 8));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  if (!user) return null;

  const active = tournaments.filter(t => t.status === 'ACTIVE');
  const completed = tournaments.filter(t => t.status === 'COMPLETED');
  const totalSchools = tournaments.reduce((acc, t) => acc + (t.schools?.length ?? 0), 0);
  const totalJudges = tournaments.reduce((acc, t) => acc + (t.judges?.length ?? 0), 0);

  /* Status styling for tournament list */
  const statusStyle: Record<string, { dot: string; text: string; bg: string }> = {
    ACTIVE: { dot: 'bg-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    COMPLETED: { dot: 'bg-blue-400', text: 'text-blue-400', bg: 'bg-blue-500/10' },
    CANCELLED: { dot: 'bg-gray-400', text: 'text-gray-400', bg: 'bg-gray-500/10' },
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
                <div className="mx-auto w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-4xl font-black text-white border-4 border-white/10 shadow-lg shadow-blue-500/20 mb-4">
                  {user.profilePictureUrl ? (
                    <img src={user.profilePictureUrl} alt={user.fullName} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    user.fullName[0]?.toUpperCase()
                  )}
                </div>

                <h1 className="text-xl font-black text-white">{user.fullName}</h1>
                <p className="text-gray-500 text-sm">@{user.username}</p>

                <div className="mt-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/25 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                    <BarChart3 className="w-3.5 h-3.5" /> Organizer
                  </span>
                </div>

                {user.bio && (
                  <p className="text-gray-400 text-sm mt-4 leading-relaxed">{user.bio}</p>
                )}

                {/* Create Tournament CTA */}
                <Link to="/create-tournament"
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 active:scale-[0.98]">
                  <Plus className="w-4 h-4" /> Create Tournament
                </Link>
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
                {user.age && (
                  <div className="flex items-center gap-3 text-sm">
                    <Users className="w-4 h-4 text-gray-600 flex-shrink-0" />
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

              {/* Quick Stats Sidebar */}
              <div className="card">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Quick Stats</h3>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.03]">
                    <span className="text-xs text-gray-500">Total Schools</span>
                    <span className="text-sm font-bold text-white">{totalSchools}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.03]">
                    <span className="text-xs text-gray-500">Total Judges</span>
                    <span className="text-sm font-bold text-white">{totalJudges}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.03]">
                    <span className="text-xs text-gray-500">Completion Rate</span>
                    <span className="text-sm font-bold text-white">
                      {tournaments.length > 0 ? ((completed.length / tournaments.length) * 100).toFixed(0) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </aside>

            {/* ════════════ RIGHT COLUMN — STATS & ACTIVITY ════════════ */}
            <main className="space-y-5">

              {/* ─── Top Row: 3-col grid ─── */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* ── Tournament Overview (spans 2 cols) ── */}
                <div className="card lg:col-span-2">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-5">Tournament Overview</h3>
                  <div className="flex flex-col sm:flex-row items-center gap-8">
                    <DonutChart active={active.length} completed={completed.length} total={tournaments.length} />

                    <div className="flex-1 grid grid-cols-2 gap-4 w-full">
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03]">
                        <div className="w-2 h-8 rounded-full bg-gradient-to-b from-emerald-400 to-emerald-600" />
                        <div>
                          <p className="text-2xl font-black text-white leading-none">{active.length}</p>
                          <p className="text-xs text-gray-500 mt-0.5">Active</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03]">
                        <div className="w-2 h-8 rounded-full bg-gradient-to-b from-blue-400 to-blue-600" />
                        <div>
                          <p className="text-2xl font-black text-white leading-none">{completed.length}</p>
                          <p className="text-xs text-gray-500 mt-0.5">Completed</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03]">
                        <div className="w-2 h-8 rounded-full bg-gradient-to-b from-cyan-400 to-cyan-600" />
                        <div>
                          <p className="text-2xl font-black text-white leading-none">{totalSchools}</p>
                          <p className="text-xs text-gray-500 mt-0.5">Participants</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03]">
                        <div className="w-2 h-8 rounded-full bg-gradient-to-b from-amber-400 to-amber-600" />
                        <div>
                          <p className="text-2xl font-black text-white leading-none">{totalJudges}</p>
                          <p className="text-xs text-gray-500 mt-0.5">Judges Assigned</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Live / Active Tournament Card (spans 1 col) ── */}
                {active.length > 0 ? (
                  <Link to={`/tournament/${active[0].id}`}
                    className="card lg:col-span-1 flex flex-col justify-between border border-white/10 hover:border-cyan-500/60 hover:bg-white/[0.04] cursor-pointer transition-all duration-300 group">

                    {/* Header with pulsing indicator */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                        </span>
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Active Tournament</span>
                      </div>

                      {/* Tournament details */}
                      <p className="text-lg font-black text-white leading-tight truncate">{active[0].name}</p>
                      <div className="mt-3 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-600 uppercase w-12 flex-shrink-0">Type</span>
                          <span className="text-sm font-semibold text-gray-300">
                            {active[0].debateType?.replace(/_/g, ' ')} · {active[0].tournamentType}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-600 uppercase w-12 flex-shrink-0">Teams</span>
                          <span className="text-sm text-gray-400">{active[0].schools?.length ?? 0} schools</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer CTA */}
                    <div className="flex items-center justify-end gap-1.5 mt-5 text-cyan-400 group-hover:text-cyan-300 transition-colors">
                      <span className="text-xs font-semibold">Manage Tournament</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
                ) : (
                  <Link to="/create-tournament"
                    className="card lg:col-span-1 flex flex-col items-center justify-center border border-dashed border-white/20 hover:border-blue-500/50 hover:bg-blue-500/[0.04] cursor-pointer transition-all duration-300 group min-h-[200px]">
                    <div className="w-12 h-12 rounded-full border-2 border-dashed border-white/20 group-hover:border-blue-500/50 flex items-center justify-center transition-colors mb-3">
                      <Plus className="w-6 h-6 text-gray-500 group-hover:text-blue-400 transition-colors" />
                    </div>
                    <p className="text-gray-500 group-hover:text-blue-400 font-medium text-sm transition-colors">Create Tournament</p>
                  </Link>
                )}
              </div>


              {/* ─── Your Tournaments (card list) ─── */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Your Tournaments
                  </h3>
                  <Link to="/create-tournament"
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
                    Create new <Plus className="w-3 h-3" />
                  </Link>
                </div>

                {tournaments.length > 0 ? (
                  <div className="space-y-2">
                    {tournaments.map(t => {
                      const st = statusStyle[t.status] || statusStyle.CANCELLED;
                      return (
                        <Link key={t.id} to={`/tournament/${t.id}`}
                          className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-all group">
                          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500/15 to-cyan-500/15 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                            <Trophy className="w-4 h-4 text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-200 group-hover:text-blue-400 transition-colors truncate">
                              {t.name}
                            </p>
                            <p className="text-xs text-gray-600 mt-0.5">
                              {t.debateType?.replace(/_/g, ' ')} · {t.schools?.length ?? 0} schools
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="flex items-center gap-1.5">
                              <div className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                              <span className={`text-xs font-medium ${st.text}`}>{t.status}</span>
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-blue-400 transition-colors" />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <Trophy className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm mb-4">No tournaments created yet</p>
                    <Link to="/create-tournament"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors">
                      <Plus className="w-4 h-4" /> Create Your First Tournament
                    </Link>
                  </div>
                )}
              </div>

              {/* ─── Notifications ─── */}
              {notifications.length > 0 && (
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
                        className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${n.readStatus ? 'bg-white/[0.02]' : 'bg-blue-500/[0.06] border border-blue-500/15'}`}>
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
