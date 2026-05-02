import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin, Mail, Calendar, Trophy, Star, Award,
  Scale, Briefcase, ExternalLink, Users
} from 'lucide-react';
import { usersAPI, statsAPI, tournamentsAPI, matchesAPI } from '../../api';
import type { User, DebaterStats, Tournament, Match } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import SharedDebaterLayout from '../../components/common/SharedDebaterLayout';

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

  /* ── Debater: reuse the shared layout in read-only mode ── */
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

  /* ── Judge & Organizer: inline profile views (no duplication issue) ── */
  const socialLinks = (() => {
    try { return user.socialLinksJson ? JSON.parse(user.socialLinksJson) : {}; }
    catch { return {}; }
  })();

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <div className="card">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="mx-auto sm:mx-0 w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-2xl font-black text-white border-4 border-white/10 shadow-lg flex-shrink-0">
              {user.profilePictureUrl ? (
                <img src={user.profilePictureUrl} alt={user.fullName} className="w-full h-full rounded-full object-cover" />
              ) : (
                user.fullName[0]?.toUpperCase()
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-white">{user.fullName}</h1>
                  <p className="text-gray-400">@{user.username}</p>
                  {user.bio && (
                    <p className="text-gray-300 text-sm mt-2 max-w-lg leading-relaxed">{user.bio}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-400">
                    {user.location && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-blue-400" />{user.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-blue-400" />{user.email}
                    </span>
                    {user.age && (
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-blue-400" />Age {user.age}
                      </span>
                    )}
                  </div>
                  {Object.keys(socialLinks).length > 0 && (
                    <div className="flex gap-2 mt-3">
                      {Object.entries(socialLinks).map(([platform, url]) => (
                        <a key={platform} href={url as string} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                          <ExternalLink className="w-3 h-3" /> {platform}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`badge border ${
                    user.role === 'JUDGE' ? 'bg-violet-500/20 text-violet-400 border-violet-500/30' :
                    'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  }`}>
                    {user.role}
                  </span>
                  {user.expertise && (
                    <span className="text-xs text-gray-400">{user.expertise}</span>
                  )}
                  {user.yearsOfExperience && (
                    <span className="text-xs text-gray-500">{user.yearsOfExperience} yrs exp.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Judge Stats */}
        {user.role === 'JUDGE' && (
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
        )}

        {/* Organizer Tournaments */}
        {user.role === 'ORGANIZER' && (
          <div className="card">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
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
                      <p className="text-sm font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
                        {t.name}
                      </p>
                      <p className="text-xs text-gray-400">{t.debateType?.replace(/_/g, ' ')}</p>
                    </div>
                    <span className={`badge border flex-shrink-0 ${t.status === 'ACTIVE' ? 'badge-active' : 'badge-completed'}`}>
                      {t.status}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-6">No tournaments organized yet</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
