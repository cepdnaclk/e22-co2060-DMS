import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy, Users, Star, TrendingUp, Eye, Zap,
  Medal, Crown, ArrowRight, Calendar, Shield
} from 'lucide-react';
import { matchesAPI, usersAPI, tournamentsAPI } from '../../api';
import type { Match, DebaterStats, Tournament } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Avatar from '../../components/common/Avatar';

function LiveMatchCard({ match }: { match: Match }) {
  return (
    <div className="card-hover group relative overflow-hidden">
      <div className="absolute top-3 right-3">
        <span className="badge-live flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
          LIVE
        </span>
      </div>
      <div className="mb-3">
        <p className="text-xs text-gray-500 mb-1">{match.tournamentName}</p>
        <p className="text-xs text-blue-400 font-mono">{match.matchCode}</p>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 glass rounded-xl p-2.5 text-center">
            <p className="text-xs text-gray-400 mb-1">Proposition</p>
            <p className="text-sm font-semibold text-white truncate">{match.propositionSchool?.name}</p>
          </div>
          <div className="text-gray-500 font-bold text-sm px-2">VS</div>
          <div className="flex-1 glass rounded-xl p-2.5 text-center">
            <p className="text-xs text-gray-400 mb-1">Opposition</p>
            <p className="text-sm font-semibold text-white truncate">{match.oppositionSchool?.name}</p>
          </div>
        </div>
        <p className="text-xs text-gray-400 line-clamp-2 text-center italic">"{match.topic}"</p>
      </div>
      <Link to={`/tournament/${match.tournamentId}`}
        className="mt-4 flex items-center justify-center gap-2 w-full btn-secondary text-sm">
        <Eye className="w-4 h-4" /> Join as Spectator
      </Link>
    </div>
  );
}

function DebaterRow({ stats, rank }: { stats: DebaterStats; rank: number }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0
        ${rank === 1 ? 'bg-yellow-500/20 text-yellow-400' :
          rank === 2 ? 'bg-gray-400/20 text-gray-300' :
          rank === 3 ? 'bg-orange-500/20 text-orange-400' :
          'bg-white/5 text-gray-400'}`}>
        {rank === 1 ? <Crown className="w-4 h-4" /> : rank}
      </span>
      <Avatar name={stats.fullName} src={stats.profilePictureUrl} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{stats.fullName}</p>
        <p className="text-xs text-gray-500">@{stats.username}</p>
      </div>
      <div className="hidden sm:flex items-center gap-4 text-xs text-gray-400">
        <span>{stats.matchesPlayed}M</span>
        <span className="text-green-400">{stats.wins}W</span>
        <span className="text-blue-400">{stats.winRate.toFixed(0)}%</span>
        {stats.playerOfMatchCount > 0 && (
          <span className="flex items-center gap-0.5 text-yellow-400">
            <Trophy className="w-3 h-3" />{stats.playerOfMatchCount}
          </span>
        )}
      </div>
    </div>
  );
}

export default function HomePage() {
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [topDebaters, setTopDebaters] = useState<DebaterStats[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [matchRes, debaterRes, tourneyRes] = await Promise.allSettled([
          matchesAPI.getLive(),
          usersAPI.getTopDebaters(),
          tournamentsAPI.getAll(),
        ]);
        if (matchRes.status === 'fulfilled') setLiveMatches(matchRes.value.data);
        if (debaterRes.status === 'fulfilled') setTopDebaters(debaterRes.value.data);
        if (tourneyRes.status === 'fulfilled') setTournaments(tourneyRes.value.data);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const upcomingTournaments = tournaments.filter(t => t.status === 'ACTIVE');

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-violet-600/5 to-transparent" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-blue-500/30 text-blue-400 text-sm font-medium mb-6">
            <Zap className="w-4 h-4" /> The Premier Debate Management Platform
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
            Where Great Debates
            <span className="gradient-text block">Come to Life</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
            Manage tournaments, track scores, judge matches, and build your legacy — all in one powerful platform.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/role-select" className="btn-primary text-base px-8 py-3 flex items-center gap-2">
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/scoring" className="btn-secondary text-base px-8 py-3">
              How Scoring Works
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-3 gap-6 max-w-sm mx-auto">
            {[
              { label: 'Active Debates', value: tournaments.length.toString() },
              { label: 'Top Debaters', value: topDebaters.length.toString() },
              { label: 'Live Matches', value: liveMatches.length.toString() },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-black text-white">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Matches */}
      <section className="py-14 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                <h2 className="section-title">Happening Now</h2>
              </div>
              <p className="text-gray-400 text-sm">Live debate matches in progress</p>
            </div>
          </div>
          {loading ? (
            <LoadingSpinner />
          ) : liveMatches.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {liveMatches.map(m => <LiveMatchCard key={m.id} match={m} />)}
            </div>
          ) : (
            <div className="card text-center py-16">
              <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-600" />
              </div>
              <p className="text-gray-400">No live matches right now.</p>
              <p className="text-gray-600 text-sm mt-1">Check back soon for exciting debates!</p>
            </div>
          )}
        </div>
      </section>

      {/* Leaderboards */}
      <section className="py-14 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 text-center">
            <h2 className="section-title">Leaderboards</h2>
            <p className="text-gray-400 text-sm mt-2">The best debaters and teams in the community</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Debaters */}
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Top Debaters</h3>
                  <p className="text-xs text-gray-400">Ranked by wins & performance</p>
                </div>
              </div>
              {loading ? <LoadingSpinner size="sm" /> : topDebaters.length > 0 ? (
                <div className="space-y-1">
                  {topDebaters.map((d, i) => (
                    <Link key={d.debaterId} to={`/profile/${d.debaterId}`}>
                      <DebaterRow stats={d} rank={i + 1} />
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-8">No debater stats yet</p>
              )}
            </div>

            {/* Tournament Spotlight */}
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Tournament Spotlight</h3>
                  <p className="text-xs text-gray-400">Active & recent tournaments</p>
                </div>
              </div>
              {loading ? <LoadingSpinner size="sm" /> : upcomingTournaments.length > 0 ? (
                <div className="space-y-3">
                  {upcomingTournaments.slice(0, 6).map(t => (
                    <Link key={t.id} to={`/tournament/${t.id}`}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <Trophy className="w-5 h-5 text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
                          {t.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {t.debateType?.replace(/_/g, ' ')} · {t.tournamentType}
                        </p>
                      </div>
                      <span className="badge-active flex-shrink-0">Active</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-8">No active tournaments</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-14 px-4 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-title mb-3">Everything You Need</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">A complete ecosystem for debate tournaments — from registration to results.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: 'Structured Scoring', desc: 'Configurable score sheets with criteria like Matter, Manner, Method, Rebuttal, and Teamwork.', color: 'from-blue-500 to-cyan-500' },
              { icon: TrendingUp, title: 'Live Analytics', desc: 'Real-time leaderboards, win rates, and speaker statistics updated after every match.', color: 'from-violet-500 to-purple-500' },
              { icon: Users, title: 'Multi-Role Access', desc: 'Purpose-built dashboards for Debaters, Judges, and Organizers with role-based access control.', color: 'from-emerald-500 to-teal-500' },
              { icon: Trophy, title: 'Tournament Brackets', desc: 'Knockout and league formats with auto-generated matchups after each round.', color: 'from-yellow-500 to-orange-500' },
              { icon: Star, title: 'Player Recognition', desc: 'Player of the Match, Best Debater awards, and permanent achievement records.', color: 'from-rose-500 to-pink-500' },
              { icon: Medal, title: 'Judge Portal', desc: 'Dedicated score sheet portal for judges with one-click submission and history tracking.', color: 'from-indigo-500 to-blue-500' },
            ].map((f, i) => (
              <div key={i} className="card-hover">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <f.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-white mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="card border-blue-500/20 bg-gradient-to-br from-blue-600/10 to-violet-600/10">
            <Trophy className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h2 className="text-3xl font-black text-white mb-3">Ready to Compete?</h2>
            <p className="text-gray-400 mb-8">Join thousands of debaters, judges, and organizers on the platform.</p>
            <Link to="/role-select" className="btn-primary text-base px-10 py-3 inline-flex items-center gap-2">
              Join DebateMS <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
