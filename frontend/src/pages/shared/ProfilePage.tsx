import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Trophy, Star, Scale, Briefcase, Users, ClipboardList } from 'lucide-react';
import { usersAPI, statsAPI, tournamentsAPI, matchesAPI } from '../../api';
import type { User, DebaterStats, Tournament, Match } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import SharedDebaterLayout from '../../components/common/SharedDebaterLayout';
import SharedProfileLayout from '../../components/common/SharedProfileLayout';

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [debaterStats, setDebaterStats] = useState<DebaterStats | null>(null);
  const [debaterMatches, setDebaterMatches] = useState<Match[]>([]);
  const [judgeMatchesJudged, setJudgeMatchesJudged] = useState<number | null>(null);
  const [organizerTournaments, setOrganizerTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      try {
        const { data: userData } = await usersAPI.getById(parseInt(id));
        setUser(userData);

        if (userData.role === 'DEBATER') {
          const [statsRes, matchesRes] = await Promise.allSettled([
            statsAPI.getDebaterStats(parseInt(id)),
            matchesAPI.getLive(),
          ]);
          if (statsRes.status === 'fulfilled') setDebaterStats(statsRes.value.data);
          if (matchesRes.status === 'fulfilled') setDebaterMatches(matchesRes.value.data);
        } else if (userData.role === 'JUDGE') {
          try {
            const { data } = await statsAPI.getJudgeStats(parseInt(id));
            setJudgeMatchesJudged(data.matchesJudged);
          } catch { }
        } else if (userData.role === 'ORGANIZER') {
          try {
            const { data } = await tournamentsAPI.getByOrganizer(parseInt(id));
            setOrganizerTournaments(data);
          } catch { }
        }
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;
  if (!user) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400">User not found</p>
    </div>
  );

  /* ── Debater: reuse SharedDebaterLayout in read-only mode ── */
  if (user.role === 'DEBATER') {
    return (
      <SharedDebaterLayout
        user={user}
        stats={debaterStats}
        matches={debaterMatches}
        notifications={[]}
        isReadOnly={true}
        loading={false}
      />
    );
  }

  /* ── Judge: reuse SharedProfileLayout in read-only mode ── */
  if (user.role === 'JUDGE') {
    const judgeSidebar = user.expertise ? (
      <div className="card">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Expertise</h3>
        <div className="flex flex-wrap gap-2">
          {user.expertise.split(',').map((e, i) => (
            <span key={i} className="px-2.5 py-1 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium">{e.trim()}</span>
          ))}
        </div>
      </div>
    ) : undefined;

    return (
      <SharedProfileLayout user={user} notifications={[]} isReadOnly={true} loading={false} sidebarExtra={judgeSidebar}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card text-center">
            <Scale className="w-8 h-8 text-violet-400 mx-auto mb-2" />
            <p className="text-3xl font-black text-white">{judgeMatchesJudged ?? 0}</p>
            <p className="text-sm text-gray-400">Matches Judged</p>
          </div>
          {user.expertise && (
            <div className="card text-center">
              <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <p className="text-lg font-bold text-white">{user.expertise}</p>
              <p className="text-sm text-gray-400">Expertise</p>
            </div>
          )}
          {user.yearsOfExperience && (
            <div className="card text-center">
              <Briefcase className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <p className="text-3xl font-black text-white">{user.yearsOfExperience}</p>
              <p className="text-sm text-gray-400">Years of Experience</p>
            </div>
          )}
        </div>
      </SharedProfileLayout>
    );
  }

  /* ── Organizer: reuse SharedProfileLayout in read-only mode ── */
  return (
    <SharedProfileLayout user={user} notifications={[]} isReadOnly={true} loading={false}>
      <div className="card">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-400" />
          Tournaments Organized ({organizerTournaments.length})
        </h3>
        {organizerTournaments.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {organizerTournaments.map(t => (
              <Link key={t.id} to={`/tournament/${t.id}`}
                className="flex items-center gap-3 p-3 glass rounded-xl hover:bg-white/10 transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate group-hover:text-blue-400 transition-colors">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.debateType?.replace(/_/g, ' ')}</p>
                </div>
                <span className={`badge border flex-shrink-0 ${t.status === 'ACTIVE' ? 'badge-active' : 'badge-completed'}`}>{t.status}</span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm text-center py-6">No tournaments organized yet</p>
        )}
      </div>
    </SharedProfileLayout>
  );
}
