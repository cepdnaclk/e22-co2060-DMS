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
          placeholder="Search debates..."
          className="w-full bg-[#eef5ff] border border-transparent rounded-none pl-9 pr-16 py-2.5 text-sm text-[#06192b] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#dbeafe] focus:border-[#06192b] transition-all"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono hidden sm:block">
          Ctrl+K
        </span>
      </div>

      {open && query && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-300 shadow-2xl overflow-hidden z-[100] animate-fade-in">
          {loading && (
            <div className="flex items-center gap-2 px-4 py-3 text-slate-500 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> Searching...
            </div>
          )}

          {!loading && !hasResults && (
            <div className="px-4 py-6 text-center text-slate-500 text-sm">
              No results for "{query}"
            </div>
          )}

          {!loading && hasResults && (
            <div className="max-h-80 overflow-y-auto scrollbar-hide py-2">
              {results!.players.length > 0 && (
                <div>
                  <p className="px-4 py-1.5 eyebrow text-slate-500">Debaters</p>
                  {results!.players.slice(0, 3).map(p => (
                    <button key={p.id} onClick={() => handleSelect(`/profile/${p.id}`)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#eef5ff] transition-colors text-left">
                      <div className="w-8 h-8 bg-[#dbeafe] flex items-center justify-center text-xs font-bold text-[#06192b] flex-shrink-0">
                        {p.fullName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#06192b]">{p.fullName}</p>
                        <p className="text-xs text-slate-500">@{p.username}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {results!.tournaments.length > 0 && (
                <div>
                  <p className="px-4 py-1.5 eyebrow text-slate-500">Tournaments</p>
                  {results!.tournaments.slice(0, 3).map(t => (
                    <button key={t.id} onClick={() => handleSelect(`/tournament/${t.id}`)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#eef5ff] transition-colors text-left">
                      <div className="w-8 h-8 bg-[#fff0bd] border border-[#e8d48a] flex items-center justify-center flex-shrink-0">
                        <Trophy className="w-4 h-4 text-[#8a6a00]" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#06192b]">{t.name}</p>
                        <p className="text-xs text-slate-500">{t.status} · {t.debateType?.replace(/_/g, ' ')}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {results!.organizers.length > 0 && (
                <div>
                  <p className="px-4 py-1.5 eyebrow text-slate-500">Organizers</p>
                  {results!.organizers.slice(0, 2).map(o => (
                    <button key={o.id} onClick={() => handleSelect(`/profile/${o.id}`)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#eef5ff] transition-colors text-left">
                      <div className="w-8 h-8 bg-emerald-50 border border-emerald-200 flex items-center justify-center text-xs font-bold text-emerald-800 flex-shrink-0">
                        {o.fullName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#06192b]">{o.fullName}</p>
                        <p className="text-xs text-slate-500">Organizer</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <button onClick={() => handleSelect(`/search?q=${encodeURIComponent(query)}`)}
                className="w-full px-4 py-2.5 text-sm font-bold text-[#06192b] hover:bg-[#eef5ff] transition-colors text-left border-t border-slate-200 mt-1">
                See all results for "{query}"
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
