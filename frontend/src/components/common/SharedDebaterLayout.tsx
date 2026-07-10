import { ReactNode } from 'react';
import { Star, Award, Trophy, ArrowRight } from 'lucide-react';
import type { User, DebaterStats, Notification, Match } from '../../types';
import SharedProfileLayout from './SharedProfileLayout';
import { Link } from 'react-router-dom';

/* ── SVG Donut Chart ── */
function DonutChart({ wins, losses, total }: { wins: number; losses: number; total: number }) {
  const size = 140, stroke = 12, radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const winRate = total > 0 ? (wins / total) * 100 : 0;
  const winArc = total > 0 ? (wins / total) * circ : 0;
  const lossArc = total > 0 ? (losses / total) * circ : 0;
  const pendingArc = circ - winArc - lossArc;
  return (
    <div className="relative group cursor-pointer" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#22c55e" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${winArc} ${circ - winArc}`} strokeDashoffset={0} className="transition-all duration-1000 ease-out" />
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#ef4444" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${lossArc} ${circ - lossArc}`} strokeDashoffset={-winArc} className="transition-all duration-1000 ease-out" />
        {pendingArc > 0.5 && (
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#6b7280" strokeWidth={stroke} strokeLinecap="round"
            strokeDasharray={`${pendingArc} ${circ - pendingArc}`} strokeDashoffset={-(winArc + lossArc)} className="transition-all duration-1000 ease-out" />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center transition-all duration-300 ease-in-out opacity-100 scale-100 group-hover:opacity-0 group-hover:scale-95">
        <span className="text-2xl font-black text-white leading-none">{winRate.toFixed(0)}%</span>
        <span className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-wider">Win Rate</span>
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 transition-all duration-300 ease-in-out opacity-0 scale-105 group-hover:opacity-100 group-hover:scale-100">
        <div className="text-center"><p className="text-xs text-gray-400 leading-none">Avg Score</p><p className="text-sm font-bold text-gray-200 mt-0.5">82.5</p></div>
        <div className="w-6 h-px bg-white/10" />
        <div className="text-center"><p className="text-xs text-gray-400 leading-none">Streak</p><p className="text-sm font-bold text-amber-400 mt-0.5">3 Wins</p></div>
      </div>
    </div>
  );
}

export interface SharedDebaterLayoutProps {
  user: User;
  stats: DebaterStats | null;
  matches: Match[];
  notifications: Notification[];
  isReadOnly: boolean;
  loading: boolean;
  onNotificationsChange?: (updater: (prev: Notification[]) => Notification[]) => void;
  headerActions?: ReactNode;
}

export default function SharedDebaterLayout({
  user, stats, matches, notifications, isReadOnly, loading, onNotificationsChange, headerActions,
}: SharedDebaterLayoutProps) {
  const wins = stats?.wins ?? 0;
  const losses = stats?.losses ?? 0;
  const total = stats?.matchesPlayed ?? 0;
  const pom = stats?.playerOfMatchCount ?? 0;
  const bestDebater = stats?.bestDebaterTournamentCount ?? 0;

  const badges = [
    ...Array.from({ length: pom }, (_, i) => ({ id: `pom-${i}`, label: 'Player of Match', icon: Star, gradient: 'from-yellow-500/20 to-amber-500/20', border: 'border-yellow-500/30', iconColor: 'text-yellow-400', textColor: 'text-yellow-400/90' })),
    ...Array.from({ length: bestDebater }, (_, i) => ({ id: `bd-${i}`, label: 'Best Debater', icon: Award, gradient: 'from-orange-500/20 to-red-500/20', border: 'border-orange-500/30', iconColor: 'text-orange-400', textColor: 'text-orange-400/90' })),
  ];

  const recentActivity = [
    { status: 'Win', id: 'M-1024', topic: 'AI Ethics in Education', date: '2 days ago' },
    { status: 'Loss', id: 'M-1019', topic: 'Universal Basic Income', date: '5 days ago' },
    { status: 'Win', id: 'M-1012', topic: 'Climate Change Policy', date: '1 week ago' },
    { status: 'Win', id: 'M-1005', topic: 'Social Media Regulation', date: '2 weeks ago' },
    { status: 'Loss', id: 'M-0998', topic: 'Nuclear Energy Expansion', date: '3 weeks ago' },
  ];
  const statusDot: Record<string, string> = { Win: 'bg-emerald-400', Loss: 'bg-red-400', Assigned: 'bg-blue-400' };
  const statusText: Record<string, string> = { Win: 'text-emerald-400', Loss: 'text-red-400', Assigned: 'text-blue-400' };

  const sidebarExtra = badges.length > 0 ? (
    <div className="card">
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Badges</h3>
      <div className="grid grid-cols-3 gap-2">
        {badges.map(b => (
          <div key={b.id} className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-gradient-to-br ${b.gradient} border ${b.border} hover:scale-105 transition-transform cursor-default`}>
            <b.icon className={`w-5 h-5 ${b.iconColor}`} />
            <span className={`text-[10px] font-semibold ${b.textColor} text-center leading-tight`}>{b.label}</span>
          </div>
        ))}
      </div>
    </div>
  ) : undefined;

  return (
    <SharedProfileLayout user={user} notifications={notifications} isReadOnly={isReadOnly} loading={loading} onNotificationsChange={onNotificationsChange} sidebarExtra={sidebarExtra} headerActions={headerActions}>
      {/* Top Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-5">Match Performance</h3>
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <DonutChart wins={wins} losses={losses} total={total} />
            <div className="flex-1 grid grid-cols-2 gap-4 w-full">
              {[
                { val: wins, lbl: 'Wins', from: 'from-emerald-400', to: 'to-emerald-600' },
                { val: losses, lbl: 'Losses', from: 'from-red-400', to: 'to-red-600' },
                { val: total, lbl: 'Total Matches', from: 'from-blue-400', to: 'to-blue-600' },
                { val: pom + bestDebater, lbl: 'Awards', from: 'from-violet-400', to: 'to-violet-600' },
              ].map(s => (
                <div key={s.lbl} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03]">
                  <div className={`w-2 h-8 rounded-full bg-gradient-to-b ${s.from} ${s.to}`} />
                  <div><p className="text-2xl font-black text-white leading-none">{s.val}</p><p className="text-xs text-gray-500 mt-0.5">{s.lbl}</p></div>
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
              <p className="text-gray-600 text-xs mt-1">{isReadOnly ? 'No matches to display' : "You'll see your matches here"}</p>
            </div>
          );
          const isLive = active.status === 'LIVE', isUp = active.status === 'UPCOMING';
          const dotColor = isLive ? 'bg-red-500' : isUp ? 'bg-amber-500' : 'bg-gray-500';
          const pingColor = isLive ? 'bg-red-400' : isUp ? 'bg-amber-400' : '';
          const labelColor = isLive ? 'text-red-400' : isUp ? 'text-amber-400' : 'text-gray-400';
          const label = isLive ? 'Live Now' : isUp ? 'Up Next' : 'Last Match';
          const cta = isLive ? (isReadOnly ? 'View Match' : 'Join Match') : isUp ? 'View Details' : 'View Results';
          return (
            <Link to={`/tournament/${active.tournamentId}`} className="card lg:col-span-1 flex flex-col justify-between border border-white/10 hover:border-blue-500/60 hover:bg-white/[0.04] cursor-pointer transition-all duration-300 group">
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
                  <div className="flex items-center gap-2"><span className="text-[10px] text-gray-600 uppercase w-8 flex-shrink-0">vs</span><span className="text-sm font-semibold text-gray-300">{active.propositionSchool?.name} vs {active.oppositionSchool?.name}</span></div>
                  <div className="flex items-start gap-2"><span className="text-[10px] text-gray-600 uppercase w-8 flex-shrink-0 mt-0.5">Topic</span><span className="text-sm text-gray-400 line-clamp-2 leading-snug">{active.topic}</span></div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-1.5 mt-5 text-blue-400 group-hover:text-blue-300 transition-colors">
                <span className="text-xs font-semibold">{cta}</span><ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          );
        })()}
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Recent Activity</h3>
          {!isReadOnly && <Link to="/notifications" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">View all <ArrowRight className="w-3 h-3" /></Link>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-gray-600 text-xs uppercase tracking-wider border-b border-white/5">
              <th className="text-left pb-3 pl-1 font-medium">Status</th><th className="text-left pb-3 font-medium">Match</th>
              <th className="text-left pb-3 font-medium hidden sm:table-cell">Topic</th><th className="text-right pb-3 pr-1 font-medium">Date</th>
            </tr></thead>
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
