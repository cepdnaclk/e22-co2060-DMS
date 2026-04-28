import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, User, Trophy, Users } from 'lucide-react';
import { searchAPI } from '../../api';
import type { SearchResult } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Avatar from '../../components/common/Avatar';

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
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <Search className="w-4 h-4" />
            Search results for
          </div>
          <h1 className="text-3xl font-black text-white">"{query}"</h1>
          {results && <p className="text-gray-400 text-sm mt-1">{total} results found</p>}
        </div>

        {loading ? <LoadingSpinner /> : !results ? (
          <div className="card text-center py-12">
            <Search className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">Enter a search query</p>
          </div>
        ) : total === 0 ? (
          <div className="card text-center py-12">
            <Search className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No results found for "{query}"</p>
          </div>
        ) : (
          <div className="space-y-8">
            {results.players.length > 0 && (
              <section>
                <h2 className="flex items-center gap-2 text-lg font-bold text-white mb-4">
                  <User className="w-5 h-5 text-blue-400" /> Debaters ({results.players.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {results.players.map(p => (
                    <Link key={p.id} to={`/profile/${p.id}`} className="card-hover flex items-center gap-3">
                      <Avatar name={p.fullName} src={p.profilePictureUrl} size="md" />
                      <div className="min-w-0">
                        <p className="font-semibold text-white truncate">{p.fullName}</p>
                        <p className="text-sm text-gray-400">@{p.username}</p>
                        {p.location && <p className="text-xs text-gray-500">{p.location}</p>}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {results.tournaments.length > 0 && (
              <section>
                <h2 className="flex items-center gap-2 text-lg font-bold text-white mb-4">
                  <Trophy className="w-5 h-5 text-yellow-400" /> Tournaments ({results.tournaments.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {results.tournaments.map(t => (
                    <Link key={t.id} to={`/tournament/${t.id}`} className="card-hover flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center flex-shrink-0">
                        <Trophy className="w-5 h-5 text-yellow-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-white truncate">{t.name}</p>
                        <p className="text-sm text-gray-400">{t.debateType?.replace(/_/g, ' ')} · {t.status}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {results.organizers.length > 0 && (
              <section>
                <h2 className="flex items-center gap-2 text-lg font-bold text-white mb-4">
                  <Users className="w-5 h-5 text-emerald-400" /> Organizers ({results.organizers.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {results.organizers.map(o => (
                    <Link key={o.id} to={`/profile/${o.id}`} className="card-hover flex items-center gap-3">
                      <Avatar name={o.fullName} src={o.profilePictureUrl} size="md" />
                      <div className="min-w-0">
                        <p className="font-semibold text-white truncate">{o.fullName}</p>
                        <p className="text-sm text-gray-400">Organizer</p>
                        {o.location && <p className="text-xs text-gray-500">{o.location}</p>}
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
