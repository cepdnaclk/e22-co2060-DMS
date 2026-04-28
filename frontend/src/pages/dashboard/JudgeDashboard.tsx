import { useState, useEffect } from 'react';
import { Scale, CheckCircle, Clock, Star, Bell, MapPin, Mail, Briefcase } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { statsAPI, notificationsAPI, matchesAPI } from '../../api';
import type { Notification } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Avatar from '../../components/common/Avatar';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export default function JudgeDashboard() {
  const { user } = useAuth();
  const [judgeStats, setJudgeStats] = useState<{ matchesJudged: number } | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      try {
        const [statsRes, notifRes] = await Promise.allSettled([
          statsAPI.getJudgeStats(user.id),
          notificationsAPI.getAll(),
        ]);
        if (statsRes.status === 'fulfilled') setJudgeStats(statsRes.value.data);
        if (notifRes.status === 'fulfilled') setNotifications(notifRes.value.data.slice(0, 6));
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user]);

  if (!user) return null;

  const statCards = [
    { label: 'Total Judged', value: judgeStats?.matchesJudged ?? 0, icon: Scale, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
    { label: 'Expertise', value: user.expertise || 'General', icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
    { label: 'Years Exp.', value: user.yearsOfExperience ?? 0, icon: Briefcase, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  ];

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Profile Header */}
        <div className="card bg-gradient-to-r from-violet-600/10 to-purple-600/10 border-violet-500/20">
          <div className="flex flex-col sm:flex-row gap-6">
            <Avatar name={user.fullName} src={user.profilePictureUrl} size="xl" />
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-white">{user.fullName}</h1>
                  <p className="text-gray-400">@{user.username}</p>
                  {user.bio && <p className="text-gray-300 text-sm mt-2 max-w-lg">{user.bio}</p>}
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-400">
                    {user.location && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{user.location}</span>}
                    <span className="flex items-center gap-1"><Mail className="w-4 h-4" />{user.email}</span>
                  </div>
                  {user.expertise && (
                    <div className="mt-3">
                      <span className="badge bg-violet-500/20 text-violet-400 border border-violet-500/30">
                        {user.expertise}
                      </span>
                    </div>
                  )}
                </div>
                <span className="badge bg-violet-500/20 text-violet-400 border border-violet-500/30 self-start">
                  Judge
                </span>
              </div>
            </div>
          </div>
        </div>

        {loading ? <LoadingSpinner /> : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {statCards.map(s => (
                <div key={s.label} className={`card border ${s.bg} text-center`}>
                  <s.icon className={`w-8 h-8 ${s.color} mx-auto mb-2`} />
                  <p className="text-3xl font-black text-white">{s.value}</p>
                  <p className="text-sm text-gray-400 mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Notifications & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-violet-400" /> Notifications
                </h3>
                {notifications.length > 0 ? (
                  <div className="space-y-3">
                    {notifications.map(n => (
                      <div key={n.id} className={`flex items-start gap-3 p-3 rounded-xl ${n.readStatus ? 'bg-white/3' : 'bg-violet-500/10 border border-violet-500/20'}`}>
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.readStatus ? 'bg-gray-600' : 'bg-violet-400'}`} />
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

              {/* Judge Info Card */}
              <div className="card">
                <h3 className="font-bold text-white mb-4">Judge Profile</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 glass rounded-xl">
                    <span className="text-sm text-gray-400">Total Matches Judged</span>
                    <span className="text-sm font-bold text-white">{judgeStats?.matchesJudged ?? 0}</span>
                  </div>
                  {user.expertise && (
                    <div className="flex items-center justify-between p-3 glass rounded-xl">
                      <span className="text-sm text-gray-400">Areas of Expertise</span>
                      <span className="text-sm font-bold text-white">{user.expertise}</span>
                    </div>
                  )}
                  {user.yearsOfExperience && (
                    <div className="flex items-center justify-between p-3 glass rounded-xl">
                      <span className="text-sm text-gray-400">Years of Experience</span>
                      <span className="text-sm font-bold text-white">{user.yearsOfExperience} years</span>
                    </div>
                  )}
                  <div className="mt-4 p-4 bg-violet-500/10 border border-violet-500/20 rounded-xl">
                    <p className="text-sm text-violet-400 font-medium mb-1">📋 Score Sheet Access</p>
                    <p className="text-xs text-gray-400">
                      When a match is assigned to you, you'll receive a notification with a direct link to the score sheet.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
