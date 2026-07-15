import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Trophy, User, Users } from 'lucide-react';
import Avatar from '../../components/common/Avatar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { searchAPI } from '../../api';
import type { SearchResult } from '../../types';

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    searchAPI.search(query)
      .then(r => setResults(r.data))
      .catch(() => setResults(null))
      .finally(() => setLoading(false));
  }, [query]);

  const total = results
    ? results.players.length + results.tournaments.length + results.organizers.length
    : 0;

  return (
    <div className="min-h-screen py-16">
      <div className="editorial-shell max-w-5xl">
        <header className="mb-10">
          <p className="eyebrow text-slate-500 mb-3 inline-flex items-center gap-2">
            <Search className="w-4 h-4" /> Search Results
          </p>
          <h1 className="font-display text-5xl font-bold text-[#06192b]">"{query}"</h1>
          {results && <p className="text-slate-600 text-sm mt-2">{total} results found</p>}
        </header>

        {loading ? <LoadingSpinner /> : !results ? (
          <div className="paper-panel text-center py-12">
            <Search className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-500">Enter a search query.</p>
          </div>
        ) : total === 0 ? (
          <div className="paper-panel text-center py-12">
            <Search className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-500">No results found for "{query}"</p>
          </div>
        ) : (
          <div className="space-y-10">
            {results.players.length > 0 && (
              <section>
                <h2 className="eyebrow text-[#06192b] mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" /> Debaters ({results.players.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {results.players.map(p => (
                    <Link key={p.id} to={`/profile/${p.id}`} className="paper-panel hover:bg-[#eef5ff] transition-colors p-4 flex items-center gap-3">
                      <Avatar name={p.fullName} src={p.profilePictureUrl} size="md" />
                      <div className="min-w-0">
                        <p className="font-bold text-[#06192b] truncate">{p.fullName}</p>
                        <p className="text-sm text-slate-500">@{p.username}</p>
                        {p.location && <p className="text-xs text-slate-500">{p.location}</p>}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {results.tournaments.length > 0 && (
              <section>
                <h2 className="eyebrow text-[#06192b] mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-[#8a6a00]" /> Tournaments ({results.tournaments.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {results.tournaments.map(t => (
                    <Link key={t.id} to={`/tournament/${t.id}`} className="paper-panel hover:bg-[#eef5ff] transition-colors p-4 flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#fff0bd] border border-[#e8d48a] flex items-center justify-center flex-shrink-0">
                        <Trophy className="w-5 h-5 text-[#8a6a00]" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-[#06192b] truncate">{t.name}</p>
                        <p className="text-sm text-slate-500">{t.debateType?.replace(/_/g, ' ')} / {t.status}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {results.organizers.length > 0 && (
              <section>
                <h2 className="eyebrow text-[#06192b] mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" /> Organizers ({results.organizers.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {results.organizers.map(o => (
                    <Link key={o.id} to={`/profile/${o.id}`} className="paper-panel hover:bg-[#eef5ff] transition-colors p-4 flex items-center gap-3">
                      <Avatar name={o.fullName} src={o.profilePictureUrl} size="md" />
                      <div className="min-w-0">
                        <p className="font-bold text-[#06192b] truncate">{o.fullName}</p>
                        <p className="text-sm text-slate-500">Organizer</p>
                        {o.location && <p className="text-xs text-slate-500">{o.location}</p>}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
