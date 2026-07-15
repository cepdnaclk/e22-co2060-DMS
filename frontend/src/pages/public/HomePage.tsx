import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, BarChart3, Calendar, Crown, Eye, Medal, MessageSquareQuote,
  Scale, Shield, Trophy, Users
} from 'lucide-react';
import { matchesAPI, tournamentsAPI, usersAPI } from '../../api';
import Avatar from '../../components/common/Avatar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import type { DebaterStats, Match, Tournament } from '../../types';

function LiveMatchCard({ match }: { match: Match }) {
  return (
    <article className="paper-panel p-5">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <p className="eyebrow text-slate-500">{match.tournamentName || 'Live Tournament'}</p>
          <p className="text-sm font-bold text-[#8a6a00] mt-1">{match.matchCode}</p>
        </div>
        <span className="badge-live">Live</span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="border border-slate-300 bg-[#eef5ff] p-3 min-h-20">
          <p className="eyebrow text-slate-500 mb-2">Proposition</p>
          <p className="font-bold text-[#06192b] leading-snug">{match.propositionSchool?.name || 'TBA'}</p>
        </div>
        <span className="text-xs font-black text-slate-400">VS</span>
        <div className="border border-slate-300 bg-white p-3 min-h-20">
          <p className="eyebrow text-slate-500 mb-2">Opposition</p>
          <p className="font-bold text-[#06192b] leading-snug">{match.oppositionSchool?.name || 'TBA'}</p>
        </div>
      </div>

      <p className="text-sm text-slate-600 leading-relaxed mt-4 line-clamp-2">"{match.topic}"</p>

      <Link to={`/tournament/${match.tournamentId}`} className="btn-secondary mt-5 w-full text-xs">
        <Eye className="w-4 h-4" /> Join as Spectator
      </Link>
    </article>
  );
}

function DebaterRow({ stats, rank }: { stats: DebaterStats; rank: number }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-200 last:border-0">
      <span className={`w-9 h-9 border flex items-center justify-center text-sm font-bold flex-shrink-0 ${
        rank === 1 ? 'bg-[#fff0bd] text-[#8a6a00] border-[#e8d48a]' : 'bg-[#eef5ff] text-[#06192b] border-slate-300'
      }`}>
        {rank === 1 ? <Crown className="w-4 h-4" /> : rank}
      </span>
      <Avatar name={stats.fullName} src={stats.profilePictureUrl} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-[#06192b] truncate">{stats.fullName}</p>
        <p className="text-xs text-slate-500">@{stats.username}</p>
      </div>
      <div className="hidden sm:flex items-center gap-4 text-xs text-slate-500">
        <span>{stats.matchesPlayed}M</span>
        <span className="text-emerald-700">{stats.wins}W</span>
        <span className="text-[#8a6a00]">{stats.winRate.toFixed(0)}%</span>
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
  const stats = [
    { label: 'Active Debates', value: tournaments.length.toString() },
    { label: 'Top Debaters', value: topDebaters.length.toString() },
    { label: 'Live Matches', value: liveMatches.length.toString() },
  ];

  return (
    <div className="min-h-screen">
      <section className="relative min-h-[calc(100vh-76px)] overflow-hidden bg-[#eef5ff] border-b border-slate-300">
        <div className="absolute right-[-9rem] top-40 h-[640px] w-[260px] rotate-12 border border-slate-300/70 bg-white/20" />
        <div className="editorial-shell relative flex min-h-[calc(100vh-76px)] items-center py-20">
          <div className="max-w-3xl">
            <p className="eyebrow mb-7">Tournament intelligence for serious debate</p>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[0.95] text-[#06192b]">
              Where Great Debates
              <span className="block italic text-[#8a6a00]">Come to Life</span>
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-700">
              Manage tournaments, track scores, judge matches, and build your legacy in one calm platform designed for rigorous academic and competitive debate.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row sm:items-center gap-4">
              <Link to="/role-select" className="btn-primary text-xs">
                Get Started
              </Link>
              <Link to="/forum" className="btn-secondary text-xs">
                Open Forum
              </Link>
              <Link to="/scoring" className="inline-flex items-center gap-3 px-2 py-3 text-xs font-bold uppercase tracking-widest text-[#06192b]">
                How Scoring Works <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="editorial-shell -mt-10 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 border border-slate-300 bg-white shadow-[0_18px_40px_rgba(6,25,43,0.08)]">
          {stats.map(stat => (
            <div key={stat.label} className="p-6 text-center border-b sm:border-b-0 sm:border-r border-slate-300 last:border-0">
              <p className="font-display text-4xl font-bold text-[#06192b]">{stat.value}</p>
              <p className="eyebrow mt-2 text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="editorial-shell py-20">
        <div className="max-w-2xl mb-10">
          <h2 className="section-title">Everything You Need</h2>
          <p className="mt-4 text-slate-600 leading-7">
            Built on structural integrity and editorial clarity, VIVAATHI gives organizers, judges, and debaters a shared operating room for competition day.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[
            { icon: BarChart3, title: 'Structured Scoring', desc: 'Matter, Manner, Method, Rebuttal, and Teamwork criteria with transparent scoring ranges.' },
            { icon: Users, title: 'Role-Aware Workflows', desc: 'Separate paths for debaters, judges, and organizers without losing one shared source of truth.' },
            { icon: MessageSquareQuote, title: 'Argument Forum', desc: 'Topic-led proposition and opposition threads for practice, rebuttals, and debate literacy.' },
          ].map((feature, index) => (
            <article key={feature.title} className={`paper-panel p-8 ${index === 2 ? 'lg:bg-[#06192b] lg:text-white' : ''}`}>
              <div className={`w-12 h-12 flex items-center justify-center border mb-10 ${
                index === 2 ? 'bg-[#102a43] border-white/10 text-[#fff0bd]' : 'bg-[#eef5ff] border-slate-300 text-[#06192b]'
              }`}>
                <feature.icon className="w-5 h-5" />
              </div>
              <p className={`eyebrow mb-3 ${index === 2 ? 'text-slate-300' : 'text-slate-500'}`}>0{index + 1}</p>
              <h3 className={`font-display text-2xl font-bold ${index === 2 ? 'text-white' : 'text-[#06192b]'}`}>{feature.title}</h3>
              <p className={`mt-4 text-sm leading-7 ${index === 2 ? 'text-slate-300' : 'text-slate-600'}`}>{feature.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-300 bg-white/70 py-16">
        <div className="editorial-shell">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <p className="eyebrow text-slate-500 mb-3">Live Room</p>
              <h2 className="section-title">Happening Now</h2>
            </div>
            <Link to="/forum" className="btn-secondary text-xs">
              Visit Forum <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : liveMatches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {liveMatches.slice(0, 6).map(m => <LiveMatchCard key={m.id} match={m} />)}
            </div>
          ) : (
            <div className="paper-panel py-16 px-6 text-center">
              <Calendar className="w-10 h-10 mx-auto text-slate-400 mb-4" />
              <p className="font-display text-2xl font-bold text-[#06192b]">No live matches right now.</p>
              <p className="text-slate-500 text-sm mt-2">Check back soon for active rooms and judging sessions.</p>
            </div>
          )}
        </div>
      </section>

      <section className="editorial-shell py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-8">
          <div className="paper-panel p-7">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <p className="eyebrow text-slate-500 mb-2">Rankings</p>
                <h2 className="font-display text-3xl font-bold text-[#06192b]">Top Debaters</h2>
              </div>
              <Crown className="w-8 h-8 text-[#8a6a00]" />
            </div>
            {loading ? <LoadingSpinner size="sm" /> : topDebaters.length > 0 ? (
              <div>
                {topDebaters.slice(0, 8).map((d, i) => (
                  <Link key={d.debaterId} to={`/profile/${d.debaterId}`}>
                    <DebaterRow stats={d} rank={i + 1} />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm py-8">No debater stats yet.</p>
            )}
          </div>

          <div className="ink-panel p-7">
            <p className="eyebrow text-slate-300 mb-2">Tournament Spotlight</p>
            <h2 className="font-display text-3xl font-bold text-white mb-6">Active Rooms</h2>
            {loading ? <LoadingSpinner size="sm" /> : upcomingTournaments.length > 0 ? (
              <div className="space-y-3">
                {upcomingTournaments.slice(0, 6).map(t => (
                  <Link key={t.id} to={`/tournament/${t.id}`}
                    className="flex items-center gap-3 border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-colors">
                    <div className="w-10 h-10 bg-[#102a43] border border-white/10 flex items-center justify-center flex-shrink-0">
                      <Trophy className="w-5 h-5 text-[#fff0bd]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{t.name}</p>
                      <p className="text-xs text-slate-300">
                        {t.debateType?.replace(/_/g, ' ')} / {t.tournamentType}
                      </p>
                    </div>
                    <span className="badge bg-[#fff0bd] text-[#06192b] border-[#fff0bd]">Active</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-slate-300 text-sm py-8">No active tournaments.</p>
            )}
          </div>
        </div>
      </section>

      <section className="editorial-shell pb-20">
        <div className="paper-panel p-8 sm:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <p className="eyebrow text-slate-500 mb-3">Built for the full circuit</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#06192b]">Run a cleaner tournament day.</h2>
            <p className="mt-4 text-slate-600 leading-7">
              Add score sheets, adjudicator notes, live forums, team records, and performance history without making users fight the interface.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[Shield, Scale, Medal].map((Icon, index) => (
              <div key={index} className="w-16 h-16 bg-[#eef5ff] border border-slate-300 flex items-center justify-center">
                <Icon className="w-6 h-6 text-[#06192b]" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
