import { useState, useEffect } from 'react';
import { Trophy, Target, TrendingDown, Star, Award, Bell, MapPin, Mail, Calendar } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { statsAPI, notificationsAPI, matchesAPI, tournamentsAPI } from '../../api';
import type { DebaterStats, Notification, Match } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Avatar from '../../components/common/Avatar';
import { format } from 'date-fns';

const COLORS = ['#3b82f6', '#ef4444', '#6b7280'];

export default function DebaterDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DebaterStats | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      try {
        const [statsRes, notifRes] = await Promise.allSettled([
          statsAPI.getDebaterStats(user.id),
          notificationsAPI.getAll(),
        ]);
        if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
        if (notifRes.status === 'fulfilled') setNotifications(notifRes.value.data.slice(0, 5));
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user]);

  if (!user) return null;

  const pieData = stats ? [
    { name: 'Wins', value: stats.wins || 0 },
    { name: 'Losses', value: stats.losses || 0 },
    { name: 'Pending', value: Math.max(0, (stats.matchesPlayed || 0) - (stats.wins || 0) - (stats.losses || 0)) },
  ].filter(d => d.value > 0) : [];

  const statCards = [
    { label: 'Matches Played', value: stats?.matchesPlayed ?? 0, icon: Target, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    { label: 'Wins', value: stats?.wins ?? 0, icon: Trophy, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
    { label: 'Losses', value: stats?.losses ?? 0, icon: TrendingDown, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
    { label: 'Win Rate', value: `${stats?.winRate?.toFixed(0) ?? 0}%`, icon: TrendingDown, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
    { label: 'Player of Match', value: stats?.playerOfMatchCount ?? 0, icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
    { label: 'Best Debater', value: stats?.bestDebaterTournamentCount ?? 0, icon: Award, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
  ];

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Profile Header */}
        <div className="card">
          <div className="flex flex-col sm:flex-row gap-6">
            <Avatar name={user.fullName} src={user.profilePictureUrl} size="xl" />
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-white">{user.fullName}</h1>
                  <p className="text-gray-400">@{user.username}</p>
                  {user.bio && <p className="text-gray-300 text-sm mt-2 max-w-lg">{user.bio}</p>}
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-400">
                    {user.location && (
                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{user.location}</span>
                    )}
                    <span className="flex items-center gap-1"><Mail className="w-4 h-4" />{user.email}</span>
                    {user.age && <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />Age {user.age}</span>}
                  </div>
                </div>
                <span className="badge-active self-start">Debater</span>
              </div>
            </div>
          </div>
        </div>

        {loading ? <LoadingSpinner /> : (
          <>
            {/* Stats Grid */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Your Statistics</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {statCards.map(s => (
                  <div key={s.label} className={`card border ${s.bg} text-center`}>
                    <s.icon className={`w-6 h-6 ${s.color} mx-auto mb-2`} />
                    <p className="text-2xl font-black text-white">{s.value}</p>
                    <p className="text-xs text-gray-400 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart & Notifications */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pie Chart */}
              <div className="card">
                <h3 className="font-bold text-white mb-4">Win/Loss Distribution</h3>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} paddingAngle={3} dataKey="value">
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-48 flex items-center justify-center text-gray-500 text-sm">
                    No match data yet
                  </div>
                )}
              </div>

              {/* Notifications */}
              <div className="card">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-blue-400" /> Recent Notifications
                </h3>
                {notifications.length > 0 ? (
                  <div className="space-y-3">
                    {notifications.map(n => (
                      <div key={n.id} className={`flex items-start gap-3 p-3 rounded-xl ${n.readStatus ? 'bg-white/3' : 'bg-blue-500/10 border border-blue-500/20'}`}>
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.readStatus ? 'bg-gray-600' : 'bg-blue-400'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">{n.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{n.message}</p>
                          <p className="text-xs text-gray-600 mt-1">
                            {n.createdAt ? format(new Date(n.createdAt), 'MMM d, h:mm a') : ''}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm text-center py-6">No notifications yet</p>
                )}
              </div>
            </div>

            {/* Achievements */}
            {((stats?.playerOfMatchCount ?? 0) > 0 || (stats?.bestDebaterTournamentCount ?? 0) > 0) && (
              <div className="card">
                <h3 className="font-bold text-white mb-4">Achievements</h3>
                <div className="flex flex-wrap gap-3">
                  {Array.from({ length: stats?.playerOfMatchCount ?? 0 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-yellow-400">Player of the Match</span>
                    </div>
                  ))}
                  {Array.from({ length: stats?.bestDebaterTournamentCount ?? 0 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
                      <Award className="w-4 h-4 text-orange-400" />
                      <span className="text-sm text-orange-400">Best Debater of Tournament</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
