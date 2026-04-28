import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, User, Trophy, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { searchAPI } from '../../api';
import type { SearchResult } from '../../types';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Keyboard shortcut Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const input = wrapperRef.current?.querySelector('input');
        input?.focus();
        setOpen(true);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults(null); return; }
    setLoading(true);
    try {
      const { data } = await searchAPI.search(q);
      setResults(data);
      setOpen(true);
    } catch {
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => doSearch(query), 350);
    return () => clearTimeout(timer);
  }, [query, doSearch]);

  const hasResults = results && (
    results.players.length > 0 || results.tournaments.length > 0 || results.organizers.length > 0
  );

  const handleSelect = (path: string) => {
    navigate(path);
    setOpen(false);
    setQuery('');
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => query && setOpen(true)}
          placeholder="Search players, tournaments..."
          className="w-full bg-white/5 border border-white/15 rounded-xl pl-9 pr-16 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-600 font-mono hidden sm:block">
          Ctrl+K
        </span>
      </div>

      {open && query && (
        <div className="absolute top-full left-0 right-0 mt-2 glass-dark rounded-2xl border border-white/10 shadow-2xl overflow-hidden z-50 animate-fade-in">
          {loading && (
            <div className="flex items-center gap-2 px-4 py-3 text-gray-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> Searching...
            </div>
          )}

          {!loading && !hasResults && (
            <div className="px-4 py-6 text-center text-gray-400 text-sm">
              No results for "{query}"
            </div>
          )}

          {!loading && hasResults && (
            <div className="max-h-80 overflow-y-auto scrollbar-hide py-2">
              {results!.players.length > 0 && (
                <div>
                  <p className="px-4 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Debaters</p>
                  {results!.players.slice(0, 3).map(p => (
                    <button key={p.id} onClick={() => handleSelect(`/profile/${p.id}`)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 transition-colors text-left">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                        {p.fullName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{p.fullName}</p>
                        <p className="text-xs text-gray-400">@{p.username}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {results!.tournaments.length > 0 && (
                <div>
                  <p className="px-4 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tournaments</p>
                  {results!.tournaments.slice(0, 3).map(t => (
                    <button key={t.id} onClick={() => handleSelect(`/tournament/${t.id}`)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 transition-colors text-left">
                      <div className="w-8 h-8 rounded-xl bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center flex-shrink-0">
                        <Trophy className="w-4 h-4 text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{t.name}</p>
                        <p className="text-xs text-gray-400">{t.status} · {t.debateType?.replace(/_/g, ' ')}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {results!.organizers.length > 0 && (
                <div>
                  <p className="px-4 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Organizers</p>
                  {results!.organizers.slice(0, 2).map(o => (
                    <button key={o.id} onClick={() => handleSelect(`/profile/${o.id}`)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 transition-colors text-left">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                        {o.fullName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{o.fullName}</p>
                        <p className="text-xs text-gray-400">Organizer</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <button onClick={() => handleSelect(`/search?q=${encodeURIComponent(query)}`)}
                className="w-full px-4 py-2.5 text-sm text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition-colors text-left border-t border-white/10 mt-1">
                See all results for "{query}"
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
