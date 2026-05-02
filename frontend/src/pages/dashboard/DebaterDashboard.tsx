import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { statsAPI, notificationsAPI, matchesAPI } from '../../api';
import type { DebaterStats, Notification, Match } from '../../types';
import SharedDebaterLayout from '../../components/common/SharedDebaterLayout';

/* ────────────────────── Data Wrapper: Own Dashboard ────────────────────── */
export default function DebaterDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DebaterStats | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const [statsRes, notifRes, liveRes] = await Promise.allSettled([
          statsAPI.getDebaterStats(user.id),
          notificationsAPI.getAll(),
          matchesAPI.getLive(),
        ]);
        if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
        if (notifRes.status === 'fulfilled') setNotifications(notifRes.value.data.slice(0, 8));
        if (liveRes.status === 'fulfilled') setMatches(liveRes.value.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  if (!user) return null;

  return (
    <SharedDebaterLayout
      user={user}
      stats={stats}
      matches={matches}
      notifications={notifications}
      isReadOnly={false}
      loading={loading}
      onNotificationsChange={setNotifications}
    />
  );
}
