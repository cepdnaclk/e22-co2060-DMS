import { useState, useEffect } from 'react';
import { Plus, Trophy, Archive, Bell, TrendingUp, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { tournamentsAPI, notificationsAPI } from '../../api';
import type { Tournament, Notification } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Avatar from '../../components/common/Avatar';
import { format } from 'date-fns';

export default function OrganizerDashboard() {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      try {
        const [tRes, nRes] = await Promise.allSettled([
          tournamentsAPI.getByOrganizer(user.id),
          notificationsAPI.getAll(),
        ]);
        if (tRes.status === 'fulfilled') setTournaments(tRes.value.data);
        if (nRes.status === 'fulfilled') setNotifications(nRes.value.data.slice(0, 5));
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user]);

  if (!user) return null;

  const active = tournaments.filter(t => t.status === 'ACTIVE');
  const completed = tournaments.filter(t => t.status === 'COMPLETED');

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar name={user.fullName} src={user.profilePictureUrl} size="lg" />
            <div>
              <h1 className="text-2xl font-black text-white">Welcome, {user.fullName.split(' ')[0]}!</h1>
              <p className="text-gray-400 text-sm">Organizer Dashboard</p>
            </div>
          </div>
          <Link to="/create-tournament" className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create Tournament
          </Link>
        </div>

        {loading ? <LoadingSpinner /> : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Created', value: tournaments.length, icon: Trophy, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
                { label: 'Active', value: active.length, icon: Clock, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
                { label: 'Completed', value: completed.length, icon: CheckCircle, color: 'text-gray-400', bg: 'bg-gray-500/10 border-gray-500/20' },
                { label: 'Total Matches', value: tournaments.reduce((a, t) => a + 0, 0), icon: TrendingUp, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
              ].map(s => (
                <div key={s.label} className={`card border ${s.bg} text-center`}>
                  <s.icon className={`w-6 h-6 ${s.color} mx-auto mb-2`} />
                  <p className="text-3xl font-black text-white">{s.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Tournaments Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Your Tournaments</h2>
              </div>

              {tournaments.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tournaments.map(t => (
                    <Link key={t.id} to={`/tournament/${t.id}`} className="card-hover group">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-blue-500/20 flex items-center justify-center">
                          <Trophy className="w-5 h-5 text-blue-400" />
                        </div>
                        <span className={`badge border ${t.status === 'ACTIVE' ? 'badge-active' : 'badge-completed'}`}>
                          {t.status}
                        </span>
                      </div>
                      <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors mb-1 truncate">
                        {t.name}
                      </h3>
                      <p className="text-sm text-gray-400 mb-3">
                        {t.debateType?.replace(/_/g, ' ')} · {t.tournamentType}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{t.schools?.length ?? 0} schools</span>
                        <span>{t.createdAt ? format(new Date(t.createdAt), 'MMM d, yyyy') : ''}</span>
                      </div>
                      <div className="mt-3 flex items-center gap-1 text-blue-400 text-sm font-medium group-hover:gap-2 transition-all">
                        Manage <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </Link>
                  ))}
                  {/* Create New Card */}
                  <Link to="/create-tournament"
                    className="card border-dashed border-white/20 flex flex-col items-center justify-center text-center gap-3 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group min-h-[160px]">
                    <div className="w-12 h-12 rounded-full border-2 border-dashed border-white/20 group-hover:border-blue-500/50 flex items-center justify-center transition-colors">
                      <Plus className="w-6 h-6 text-gray-500 group-hover:text-blue-400 transition-colors" />
                    </div>
                    <p className="text-gray-500 group-hover:text-blue-400 font-medium transition-colors">Create New Tournament</p>
                  </Link>
                </div>
              ) : (
                <div className="card text-center py-16">
                  <Trophy className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-white mb-2">No Tournaments Yet</h3>
                  <p className="text-gray-400 mb-6">Create your first tournament to get started</p>
                  <Link to="/create-tournament" className="btn-primary inline-flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Create Tournament
                  </Link>
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
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{n.title}</p>
                        <p className="text-xs text-gray-400">{n.message}</p>
                      </div>
                    </div>
                  ))}
                  <Link to="/notifications" className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1">
                    View all <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">No notifications</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
