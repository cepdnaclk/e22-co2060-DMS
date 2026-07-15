import { useMemo, useState } from 'react';
import { Check, MessageCircle, MessageSquare, Plus, Reply, Search, Send, Tag, TrendingUp } from 'lucide-react';

type Side = 'PROPOSITION' | 'OPPOSITION';
type Role = 'Debater' | 'Organizer' | 'Judge';

interface ForumTopic {
  id: number;
  title: string;
  language: 'English' | 'தமிழ்';
  category: string;
  summary: string;
  points: string;
}

interface ForumPoint {
  id: number;
  topicId: number;
  side: Side;
  author: string;
  role: Role;
  point: string;
  taggedPointId?: number;
  createdAt: string;
  score: number;
}

const topics: ForumTopic[] = [
  {
    id: 1,
    title: 'This house would make voting compulsory in all federal elections.',
    language: 'English',
    category: 'Civics',
    summary: 'Discuss whether democratic participation should be a legal duty.',
    points: '2.4k pts',
  },
  {
    id: 2,
    title: 'AI should be granted intellectual property rights for original works.',
    language: 'English',
    category: 'Ethics',
    summary: 'Balance authorship, ownership, accountability, and creativity.',
    points: '1.1k pts',
  },
  {
    id: 3,
    title: 'The United Nations Security Council should abolish the veto power.',
    language: 'English',
    category: 'International',
    summary: 'Power, legitimacy, peacekeeping, and global representation.',
    points: '800 pts',
  },
  {
    id: 4,
    title: 'பள்ளிகளில் கைப்பேசி பயன்பாட்டை தடை செய்ய வேண்டுமா?',
    language: 'தமிழ்',
    category: 'கல்வி',
    summary: 'கற்றல் கவனம், பாதுகாப்பு, மற்றும் டிஜிட்டல் திறன் குறித்து விவாதிக்கவும்.',
    points: '620 pts',
  },
];

const starterPoints: ForumPoint[] = [
  {
    id: 101,
    topicId: 1,
    side: 'PROPOSITION',
    author: 'Anjali Sharma',
    role: 'Debater',
    point: 'Compulsory voting ensures that the government reflects the will of the entire population, not just the most politically active. It forces politicians to address a broader range of issues, reducing polarization and extreme policy swings.',
    createdAt: '2h ago',
    score: 45,
  },
  {
    id: 102,
    topicId: 1,
    side: 'OPPOSITION',
    author: 'Kavin Raj',
    role: 'Judge',
    point: 'Freedom of speech must include the freedom to remain silent. Forcing someone to vote against their conscience or when they do not feel informed enough is a violation of basic civil liberties.',
    createdAt: '1h ago',
    score: 32,
  },
  {
    id: 103,
    topicId: 1,
    side: 'PROPOSITION',
    author: 'Meera K.',
    role: 'Organizer',
    point: 'Australia’s model shows that compulsory voting increases civic education as citizens realize their vote is a requirement, leading to a more informed electorate over time.',
    createdAt: '5h ago',
    score: 28,
  },
  {
    id: 104,
    topicId: 1,
    side: 'OPPOSITION',
    author: 'Siddharth V.',
    role: 'Debater',
    point: 'Compulsory voting can lead to donkey voting, where citizens randomly select candidates just to fulfill the legal requirement, thereby diluting the quality of the electoral outcome.',
    createdAt: '4h ago',
    score: 19,
  },
];

export default function ForumPage() {
  const [query, setQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<ForumTopic>(topics[0]);
  const [points, setPoints] = useState<ForumPoint[]>(starterPoints);
  const [side, setSide] = useState<Side>('PROPOSITION');
  const [role, setRole] = useState<Role>('Debater');
  const [author, setAuthor] = useState('Guest Speaker');
  const [point, setPoint] = useState('');
  const [taggedPointId, setTaggedPointId] = useState<number | undefined>();

  const filteredTopics = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return topics;
    return topics.filter(topic =>
      `${topic.title} ${topic.category} ${topic.summary} ${topic.language}`.toLowerCase().includes(value)
    );
  }, [query]);

  const topicPoints = points.filter(item => item.topicId === selectedTopic.id);
  const taggedPoint = topicPoints.find(item => item.id === taggedPointId);

  const addPoint = (event: React.FormEvent) => {
    event.preventDefault();
    if (!point.trim()) return;

    setPoints(current => [
      ...current,
      {
        id: Date.now(),
        topicId: selectedTopic.id,
        side,
        author: author.trim() || 'Guest Speaker',
        role,
        point: point.trim(),
        taggedPointId,
        createdAt: 'now',
        score: 0,
      },
    ]);
    setPoint('');
    setTaggedPointId(undefined);
  };

  const renderPoint = (item: ForumPoint) => {
    const parent = topicPoints.find(parentPoint => parentPoint.id === item.taggedPointId);
    const initial = item.author[0]?.toUpperCase() || 'V';

    return (
      <article key={item.id} className="paper-panel p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 flex items-center justify-center font-bold ${
              item.side === 'PROPOSITION' ? 'bg-[#dbeafe] text-[#06192b]' : 'bg-slate-200 text-slate-700'
            }`}>
              {initial}
            </div>
            <div>
              <p className="font-bold text-[#06192b]">{item.author}</p>
              <p className="text-xs italic text-slate-600">{item.role}</p>
            </div>
          </div>
          <p className="text-xs text-slate-500">{item.createdAt}</p>
        </div>

        {parent && (
          <div className="mb-4 border-l-2 border-[#8a6a00] bg-[#fff8df] px-3 py-2">
            <p className="text-[11px] uppercase tracking-widest text-[#8a6a00] mb-1">Rebuttal to {parent.author}</p>
            <p className="text-xs text-slate-600 line-clamp-2">{parent.point}</p>
          </div>
        )}

        <p className="text-lg leading-8 text-[#06192b]">{item.point}</p>

        <div className="mt-5 pt-4 border-t border-slate-300 flex items-center justify-between gap-4">
          <div className="flex items-center gap-5 text-sm text-slate-600">
            <button onClick={() => setTaggedPointId(item.id)} className="inline-flex items-center gap-2 hover:text-[#06192b]">
              <Tag className="w-4 h-4" /> Tag
            </button>
            <button onClick={() => setTaggedPointId(item.id)} className="inline-flex items-center gap-2 hover:text-[#06192b]">
              <Reply className="w-4 h-4" /> Rebuttal
            </button>
          </div>
          <p className="text-sm font-bold text-[#8a6a00]">★ +{item.score} pts</p>
        </div>
      </article>
    );
  };

  return (
    <div className="min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-[348px_1fr]">
        <aside className="bg-[#eef5ff] border-r border-slate-300 lg:min-h-[calc(100vh-76px)]">
          <div className="sticky top-[76px]">
            <div className="p-6 border-b border-slate-300">
              <h1 className="font-display text-3xl font-bold text-[#06192b] mb-4">Topics</h1>
              <div className="flex gap-3 mb-5">
                {['All', 'Civics', 'Science'].map((item, index) => (
                  <button key={item} className={`px-3 py-1 text-xs font-bold uppercase tracking-widest border ${
                    index === 0 ? 'bg-[#06192b] text-white border-[#06192b]' : 'bg-transparent text-slate-600 border-transparent'
                  }`}>
                    {item}
                  </button>
                ))}
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  placeholder="Search topics..."
                  className="input-field pl-10 py-2.5 text-sm"
                />
              </div>
            </div>

            <div>
              {filteredTopics.map(topic => (
                <button
                  key={topic.id}
                  onClick={() => {
                    setSelectedTopic(topic);
                    setTaggedPointId(undefined);
                  }}
                  className={`w-full text-left p-6 border-b border-slate-300 transition-colors ${
                    selectedTopic.id === topic.id ? 'bg-[#dbeafe] border-l-4 border-l-[#06192b]' : 'bg-white/55 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <p className="eyebrow text-[#06192b]">{topic.category} / {topic.language}</p>
                    {selectedTopic.id === topic.id && <p className="text-xs italic text-slate-600">Active Now</p>}
                  </div>
                  <h2 className="font-bold leading-snug text-[#06192b]">{topic.title}</h2>
                  <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> {topicPoints.length || 45}</span>
                    <span className="inline-flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" /> {topic.points}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main>
          <section className="bg-white/85 border-b border-slate-300">
            <div className="px-6 sm:px-10 lg:px-14 py-14 flex flex-col xl:flex-row xl:items-center justify-between gap-8">
              <div>
                <p className="eyebrow text-slate-500 mb-4">Debate Topic Forum</p>
                <h2 className="font-display text-4xl sm:text-5xl font-bold text-[#06192b]">{selectedTopic.category} Forum</h2>
                <p className="text-xl text-slate-700 mt-3">"{selectedTopic.title}"</p>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-slate-300 bg-white min-w-[280px]">
                {[
                  ['124', 'Topics'],
                  ['15.2k', 'Points'],
                  ['2', 'Sides'],
                ].map(([value, label]) => (
                  <div key={label} className="px-5 py-4 text-center border-r border-slate-300 last:border-0">
                    <p className="font-display font-bold text-xl text-[#06192b]">{value}</p>
                    <p className="text-[10px] font-bold uppercase text-slate-600">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="px-6 sm:px-10 lg:px-14 py-8 bg-[#f7f9fd] border-b border-slate-300">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {(['PROPOSITION', 'OPPOSITION'] as Side[]).map(columnSide => (
                <div key={columnSide}>
                  <div className="flex items-center gap-3 mb-6">
                    <span className={`w-3 h-3 rounded-full ${columnSide === 'PROPOSITION' ? 'bg-[#06192b]' : 'bg-slate-500'}`} />
                    <h3 className="eyebrow text-[#06192b]">{columnSide === 'PROPOSITION' ? 'Proposition' : 'Opposition'}</h3>
                  </div>
                  <div className="space-y-6">
                    {topicPoints.filter(item => item.side === columnSide).map(renderPoint)}
                    {topicPoints.filter(item => item.side === columnSide).length === 0 && (
                      <div className="paper-panel p-10 text-center">
                        <Plus className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                        <p className="text-slate-500 text-sm">No points on this side yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <form onSubmit={addPoint} className="bg-white px-6 sm:px-10 lg:px-14 py-7">
            <p className="eyebrow text-slate-500 mb-3">Post a Point</p>
            <div className="flex flex-col xl:flex-row gap-3 mb-3">
              <input value={author} onChange={event => setAuthor(event.target.value)} className="input-field xl:max-w-56" placeholder="Your name" />
              <select value={role} onChange={event => setRole(event.target.value as Role)} className="input-field xl:max-w-48">
                <option>Debater</option>
                <option>Organizer</option>
                <option>Judge</option>
              </select>
              <div className="grid grid-cols-2 gap-2 xl:w-96">
                {(['PROPOSITION', 'OPPOSITION'] as Side[]).map(item => (
                  <button
                    type="button"
                    key={item}
                    onClick={() => setSide(item)}
                    className={side === item ? 'tab-btn-active' : 'tab-btn-inactive'}
                  >
                    As {item === 'PROPOSITION' ? 'Proposition' : 'Opposition'}
                  </button>
                ))}
              </div>
            </div>

            {taggedPoint && (
              <div className="mb-3 bg-[#fff8df] border border-[#e8d48a] p-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#8a6a00]">Replying to {taggedPoint.author}</p>
                  <p className="text-sm text-slate-700 line-clamp-2 mt-1">{taggedPoint.point}</p>
                </div>
                <button type="button" onClick={() => setTaggedPointId(undefined)} className="text-[#8a6a00]">
                  <Check className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex gap-4">
              <textarea
                value={point}
                onChange={event => setPoint(event.target.value)}
                placeholder="Construct your argument with academic rigor..."
                className="input-field min-h-24 resize-y text-lg"
              />
              <button type="submit" className="btn-primary self-start px-5 py-5" aria-label="Post point">
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="mt-3 text-xs text-slate-500 inline-flex items-center gap-2">
              <MessageCircle className="w-3.5 h-3.5" /> Tag a point before writing to keep rebuttals traceable.
            </p>
          </form>
        </main>
      </div>
    </div>
  );
}
