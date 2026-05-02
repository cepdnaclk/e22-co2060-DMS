import { useState, useEffect } from 'react';
import { Scale, Star, Briefcase, Trophy, ArrowRight, ClipboardList } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { statsAPI, notificationsAPI, matchesAPI } from '../../api';
import type { Notification, Match } from '../../types';
import SharedProfileLayout from '../../components/common/SharedProfileLayout';
import { Link } from 'react-router-dom';

/* ── SVG Donut ── */
function DonutChart({ judged, label }: { judged: number; label: string }) {
  const size = 140, stroke = 12, radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const arc = (Math.min(judged, 100) / 100) * circ;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#8b5cf6" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${arc} ${circ - arc}`} className="transition-all duration-1000 ease-out" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-white leading-none">{judged}</span>
        <span className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-wider">{label}</span>
      </div>
    </div>
  );
}

export default function JudgeDashboard() {
  const { user } = useAuth();
  const [judgeStats, setJudgeStats] = useState<{ matchesJudged: number } | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const [statsRes, notifRes, liveRes] = await Promise.allSettled([
          statsAPI.getJudgeStats(user.id), notificationsAPI.getAll(), matchesAPI.getLive(),
        ]);
        if (statsRes.status === 'fulfilled') setJudgeStats(statsRes.value.data);
        if (notifRes.status === 'fulfilled') setNotifications(notifRes.value.data.slice(0, 8));
        if (liveRes.status === 'fulfilled') setMatches(liveRes.value.data);
      } finally { setLoading(false); }
    };
    load();
  }, [user]);

  if (!user) return null;

  const matchesJudged = judgeStats?.matchesJudged ?? 0;

  /* Mock data */
  const upcomingAssignments = [
    { id: 'M-2050', topic: 'Should AI Replace Teachers?', date: 'May 5, 2026', tournament: 'National Championship' },
    { id: 'M-2051', topic: 'Renewable Energy vs Nuclear', date: 'May 7, 2026', tournament: 'National Championship' },
    { id: 'M-2053', topic: 'Universal Healthcare Debate', date: 'May 12, 2026', tournament: 'Inter-University Cup' },
  ];
  const recentActivity = [
    { status: 'Completed', id: 'M-2040', topic: 'Space Colonization Ethics', date: '2 days ago' },
    { status: 'Completed', id: 'M-2035', topic: 'Digital Privacy Laws', date: '5 days ago' },
    { status: 'Assigned', id: 'M-2050', topic: 'Should AI Replace Teachers?', date: 'Upcoming' },
    { status: 'Completed', id: 'M-2028', topic: 'Free Trade Agreements', date: '1 week ago' },
    { status: 'Assigned', id: 'M-2051', topic: 'Renewable Energy vs Nuclear', date: 'Upcoming' },
  ];
  const statusDot: Record<string, string> = { Completed: 'bg-emerald-400', Assigned: 'bg-blue-400', Pending: 'bg-amber-400' };
  const statusText: Record<string, string> = { Completed: 'text-emerald-400', Assigned: 'text-blue-400', Pending: 'text-amber-400' };

  const sidebarExtra = (
    <>
      {user.expertise && (
        <div className="card">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Expertise</h3>
          <div className="flex flex-wrap gap-2">
            {user.expertise.split(',').map((e, i) => (
              <span key={i} className="px-2.5 py-1 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium">{e.trim()}</span>
            ))}
          </div>
        </div>
      )}
      <div className="card bg-gradient-to-br from-violet-500/[0.08] to-purple-500/[0.08] border-violet-500/20">
        <div className="flex items-center gap-3 mb-2">
          <ClipboardList className="w-5 h-5 text-violet-400" />
          <h3 className="text-sm font-bold text-violet-300">Score Sheet Access</h3>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">
          When assigned to a match, you'll receive a direct link to the score sheet in your notifications.
        </p>
      </div>
    </>
  );

  return (
    <SharedProfileLayout user={user} notifications={notifications} isReadOnly={false} loading={loading} onNotificationsChange={setNotifications} sidebarExtra={sidebarExtra}>
      {/* ── Top Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-5">Judging Performance</h3>
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <DonutChart judged={matchesJudged} label="Judged" />
            <div className="flex-1 grid grid-cols-2 gap-4 w-full">
              {[
                { val: matchesJudged, lbl: 'Matches Judged', from: 'from-violet-400', to: 'to-violet-600' },
                { val: upcomingAssignments.length, lbl: 'Upcoming', from: 'from-blue-400', to: 'to-blue-600' },
                { val: user.yearsOfExperience ?? 0, lbl: 'Years Exp.', from: 'from-amber-400', to: 'to-amber-600' },
                { val: user.expertise?.split(',').length ?? 0, lbl: 'Formats', from: 'from-emerald-400', to: 'to-emerald-600' },
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

        {/* Match card */}
        {(() => {
          const liveMatch = matches.find(m => m.status === 'LIVE');
          const upMatch = matches.filter(m => m.status === 'UPCOMING').sort((a, b) => {
            if (a.startTime && b.startTime) return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          })[0];
          const doneMatch = matches.filter(m => m.status === 'COMPLETED').sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
          const active = liveMatch || upMatch || doneMatch;
          if (!active) return (
            <div className="card lg:col-span-1 flex flex-col items-center justify-center border border-dashed border-white/20 min-h-[200px]">
              <Trophy className="w-10 h-10 text-gray-700 mb-3" />
              <p className="text-gray-500 text-sm font-medium">No matches assigned yet</p>
              <p className="text-gray-600 text-xs mt-1">You'll see your judging assignments here</p>
            </div>
          );
          const isLive = active.status === 'LIVE';
          const isUp = active.status === 'UPCOMING';
          const dotColor = isLive ? 'bg-red-500' : isUp ? 'bg-amber-500' : 'bg-gray-500';
          const pingColor = isLive ? 'bg-red-400' : isUp ? 'bg-amber-400' : '';
          const labelColor = isLive ? 'text-red-400' : isUp ? 'text-amber-400' : 'text-gray-400';
          const label = isLive ? 'Live Now' : isUp ? 'Up Next' : 'Last Match';
          const cta = isLive ? 'Judge Match' : isUp ? 'View Details' : 'View Results';
          return (
            <Link to={`/tournament/${active.tournamentId}`} className="card lg:col-span-1 flex flex-col justify-between border border-white/10 hover:border-violet-500/60 hover:bg-white/[0.04] cursor-pointer transition-all duration-300 group">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="relative flex h-2.5 w-2.5">
                    {(isLive || isUp) && <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${pingColor} opacity-75`} />}
                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${dotColor}`} />
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${labelColor}`}>{label}</span>
                </div>
                <p className="text-lg font-black text-white leading-tight">{active.matchCode}</p>
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-600 uppercase w-12 flex-shrink-0">Teams</span>
                    <span className="text-sm font-semibold text-gray-300">{active.propositionSchool?.name} vs {active.oppositionSchool?.name}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[10px] text-gray-600 uppercase w-12 flex-shrink-0 mt-0.5">Topic</span>
                    <span className="text-sm text-gray-400 line-clamp-2 leading-snug">{active.topic}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-1.5 mt-5 text-violet-400 group-hover:text-violet-300 transition-colors">
                <span className="text-xs font-semibold">{cta}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          );
        })()}
      </div>

      {/* Upcoming Assignments */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Upcoming Assignments</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 font-semibold">{upcomingAssignments.length} pending</span>
        </div>
        <div className="space-y-2">
          {upcomingAssignments.map((a, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
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

      {/* Recent Activity */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Recent Activity</h3>
          <Link to="/notifications" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors">View all <ArrowRight className="w-3 h-3" /></Link>
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
                  <td className="py-3 pl-1"><div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${statusDot[a.status]}`} /><span className={`font-semibold text-xs ${statusText[a.status]}`}>{a.status}</span></div></td>
                  <td className="py-3"><span className="text-gray-300 font-mono text-xs">{a.id}</span></td>
                  <td className="py-3 hidden sm:table-cell"><span className="text-gray-400 truncate max-w-[200px] block">{a.topic}</span></td>
                  <td className="py-3 pr-1 text-right text-gray-600 text-xs">{a.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SharedProfileLayout>
  );
}
