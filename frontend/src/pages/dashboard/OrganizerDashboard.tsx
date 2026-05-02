import { useState, useEffect } from 'react';
import { Trophy, Plus, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { tournamentsAPI, notificationsAPI } from '../../api';
import type { Tournament, Notification } from '../../types';
import SharedProfileLayout from '../../components/common/SharedProfileLayout';
import { Link } from 'react-router-dom';

/* ── SVG Donut ── */
function DonutChart({ active, completed, total }: { active: number; completed: number; total: number }) {
  const size = 140, stroke = 12, radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const activeArc = total > 0 ? (active / total) * circ : 0;
  const completedArc = total > 0 ? (completed / total) * circ : 0;
  const cancelled = Math.max(0, total - active - completed);
  const cancelledArc = total > 0 ? (cancelled / total) * circ : 0;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#22c55e" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${activeArc} ${circ - activeArc}`} className="transition-all duration-1000 ease-out" />
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#3b82f6" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${completedArc} ${circ - completedArc}`} strokeDashoffset={-activeArc} className="transition-all duration-1000 ease-out" />
        {cancelledArc > 0.5 && (
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#6b7280" strokeWidth={stroke} strokeLinecap="round"
            strokeDasharray={`${cancelledArc} ${circ - cancelledArc}`} strokeDashoffset={-(activeArc + completedArc)} className="transition-all duration-1000 ease-out" />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-white leading-none">{total}</span>
        <span className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-wider">Total</span>
      </div>
    </div>
  );
}

export default function OrganizerDashboard() {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const [tRes, nRes] = await Promise.allSettled([
          tournamentsAPI.getByOrganizer(user.id), notificationsAPI.getAll(),
        ]);
        if (tRes.status === 'fulfilled') setTournaments(tRes.value.data);
        if (nRes.status === 'fulfilled') setNotifications(nRes.value.data.slice(0, 8));
      } finally { setLoading(false); }
    };
    load();
  }, [user]);

  if (!user) return null;

  const activeTournaments = tournaments.filter(t => t.status === 'ACTIVE');
  const completed = tournaments.filter(t => t.status === 'COMPLETED');
  const totalSchools = tournaments.reduce((acc, t) => acc + (t.schools?.length ?? 0), 0);
  const totalJudges = tournaments.reduce((acc, t) => acc + (t.judges?.length ?? 0), 0);

  const statusStyle: Record<string, { dot: string; text: string }> = {
    ACTIVE: { dot: 'bg-emerald-400', text: 'text-emerald-400' },
    COMPLETED: { dot: 'bg-blue-400', text: 'text-blue-400' },
    CANCELLED: { dot: 'bg-gray-400', text: 'text-gray-400' },
  };

  const sidebarExtra = (
    <>
      {/* Create Tournament CTA */}
      <Link to="/create-tournament"
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 active:scale-[0.98]">
        <Plus className="w-4 h-4" /> Create Tournament
      </Link>
      {/* Quick Stats */}
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
    </>
  );

  return (
    <SharedProfileLayout user={user} notifications={notifications} isReadOnly={false} loading={loading} onNotificationsChange={setNotifications} sidebarExtra={sidebarExtra}>
      {/* ── Top Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-5">Tournament Overview</h3>
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <DonutChart active={activeTournaments.length} completed={completed.length} total={tournaments.length} />
            <div className="flex-1 grid grid-cols-2 gap-4 w-full">
              {[
                { val: activeTournaments.length, lbl: 'Active', from: 'from-emerald-400', to: 'to-emerald-600' },
                { val: completed.length, lbl: 'Completed', from: 'from-blue-400', to: 'to-blue-600' },
                { val: totalSchools, lbl: 'Participants', from: 'from-cyan-400', to: 'to-cyan-600' },
                { val: totalJudges, lbl: 'Judges Assigned', from: 'from-amber-400', to: 'to-amber-600' },
              ].map(s => (
                <div key={s.lbl} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03]">
                  <div className={`w-2 h-8 rounded-full bg-gradient-to-b ${s.from} ${s.to}`} />
                  <div>
                    <p className="text-2xl font-black text-white leading-none">{s.val}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{s.lbl}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Active tournament card */}
        {activeTournaments.length > 0 ? (
          <Link to={`/tournament/${activeTournaments[0].id}`}
            className="card lg:col-span-1 flex flex-col justify-between border border-white/10 hover:border-cyan-500/60 hover:bg-white/[0.04] cursor-pointer transition-all duration-300 group">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Active Tournament</span>
              </div>
              <p className="text-lg font-black text-white leading-tight truncate">{activeTournaments[0].name}</p>
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-600 uppercase w-12 flex-shrink-0">Type</span>
                  <span className="text-sm font-semibold text-gray-300">{activeTournaments[0].debateType?.replace(/_/g, ' ')} · {activeTournaments[0].tournamentType}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-600 uppercase w-12 flex-shrink-0">Teams</span>
                  <span className="text-sm text-gray-400">{activeTournaments[0].schools?.length ?? 0} schools</span>
                </div>
              </div>
            </div>
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

      {/* Tournament List */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Your Tournaments</h3>
          <Link to="/create-tournament" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
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
                    <p className="text-sm font-semibold text-gray-200 group-hover:text-blue-400 transition-colors truncate">{t.name}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{t.debateType?.replace(/_/g, ' ')} · {t.schools?.length ?? 0} schools</p>
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
            <Link to="/create-tournament" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors">
              <Plus className="w-4 h-4" /> Create Your First Tournament
            </Link>
          </div>
        )}
      </div>
    </SharedProfileLayout>
  );
}
