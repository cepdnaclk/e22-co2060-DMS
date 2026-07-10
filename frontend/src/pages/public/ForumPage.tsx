import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft, Check, MessageCircle, Plus, Reply, Search, Send, Shield, Sparkles,
  ThumbsDown, ThumbsUp, Users
} from 'lucide-react';
import { forumAPI } from '../../api';
import type { ForumRole, ForumSide, ForumTopic } from '../../types';

const fallbackTopics: ForumTopic[] = [
  {
    id: 1,
    title: 'This house would make voting compulsory',
    language: 'English',
    category: 'Civics',
    summary: 'Discuss whether democratic participation should be a legal duty.',
    createdAt: '',
    points: [
      {
        id: 101,
        topicId: 1,
        side: 'PROPOSITION',
        authorName: 'Anjali',
        role: 'DEBATER',
        colorClass: 'border-blue-400 bg-blue-500/10',
        content: 'Compulsory voting makes elected leaders answerable to a wider public, not only the most motivated groups.',
        createdAt: new Date().toISOString(),
      },
      {
        id: 102,
        topicId: 1,
        side: 'OPPOSITION',
        authorName: 'Kavin',
        role: 'JUDGE',
        colorClass: 'border-rose-400 bg-rose-500/10',
        content: 'A forced vote may increase turnout numbers but reduce the quality of democratic choice if people vote without interest.',
        taggedPointId: 101,
        createdAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: 2,
    title: 'Artificial intelligence should be regulated like medicine',
    language: 'English',
    category: 'Technology',
    summary: 'Balance innovation, public safety, accountability, and access.',
    createdAt: '',
    points: [],
  },
  {
    id: 3,
    title: 'பள்ளிகளில் கைப்பேசி பயன்பாட்டை தடை செய்ய வேண்டுமா?',
    language: 'தமிழ்',
    category: 'கல்வி',
    summary: 'கற்றல் கவனம், பாதுகாப்பு, மற்றும் டிஜிட்டல் திறன் குறித்து விவாதிக்கவும்.',
    createdAt: '',
    points: [
      {
        id: 103,
        topicId: 3,
        side: 'PROPOSITION',
        authorName: 'Meena',
        role: 'ORGANIZER',
        colorClass: 'border-emerald-400 bg-emerald-500/10',
        content: 'கைப்பேசி தடை மாணவர்களின் கவனச்சிதறலை குறைத்து வகுப்பறை ஒழுங்கை மேம்படுத்தும்.',
        createdAt: new Date().toISOString(),
      },
      {
        id: 104,
        topicId: 3,
        side: 'OPPOSITION',
        authorName: 'Suren',
        role: 'DEBATER',
        colorClass: 'border-violet-400 bg-violet-500/10',
        content: 'முழு தடை விட, பொறுப்பான பயன்பாட்டை கற்பிப்பதே மாணவர்களுக்கு நீண்டகால பயன் தரும்.',
        taggedPointId: 103,
        createdAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: 4,
    title: 'தமிழ் இலக்கியம் நவீன தொழில்நுட்பத்துடன் இணைக்கப்பட வேண்டுமா?',
    language: 'தமிழ்',
    category: 'மொழி',
    summary: 'பாரம்பரியம், அணுகல், மற்றும் புதிய தலைமுறை வாசிப்பு பழக்கங்கள்.',
    createdAt: '',
    points: [],
  },
  {
    id: 5,
    title: 'Universities should prioritize skills over exams',
    language: 'English',
    category: 'Education',
    summary: 'Compare practical ability, fairness, grading, and employability.',
    createdAt: '',
    points: [],
  },
  {
    id: 6,
    title: 'சுற்றுச்சூழல் பாதுகாப்புக்கு தனிநபர் பொறுப்பே முக்கியமா?',
    language: 'தமிழ்',
    category: 'சுற்றுச்சூழல்',
    summary: 'அரசு கொள்கை, தொழில், மற்றும் மக்களின் தினசரி தேர்வுகள்.',
    createdAt: '',
    points: [],
  },
];

const roleLabels: Record<ForumRole, string> = {
  DEBATER: 'Debater',
  ORGANIZER: 'Organizer',
  JUDGE: 'Judge',
};

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ForumPage() {
  const [topics, setTopics] = useState<ForumTopic[]>(fallbackTopics);
  const [query, setQuery] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState<number>(fallbackTopics[0].id);
  const [side, setSide] = useState<ForumSide>('PROPOSITION');
  const [role, setRole] = useState<ForumRole>('DEBATER');
  const [author, setAuthor] = useState('Guest Speaker');
  const [point, setPoint] = useState('');
  const [taggedPointId, setTaggedPointId] = useState<number | undefined>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadTopics = async () => {
      try {
        const { data } = await forumAPI.getTopics();
        if (data.length > 0) {
          setTopics(data);
          setSelectedTopicId(data[0].id);
        }
      } catch {
        setError('Backend forum API is not running, so sample topics are shown temporarily.');
      } finally {
        setLoading(false);
      }
    };
    loadTopics();
  }, []);

  const selectedTopic = topics.find(topic => topic.id === selectedTopicId) || topics[0];
  const topicPoints = selectedTopic?.points || [];
  const taggedPoint = topicPoints.find(item => item.id === taggedPointId);

  const filteredTopics = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return topics;
    return topics.filter(topic =>
      `${topic.title} ${topic.category} ${topic.summary} ${topic.language}`.toLowerCase().includes(value)
    );
  }, [query, topics]);

  const addPoint = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!point.trim() || !selectedTopic) return;

    setSaving(true);
    setError('');
    try {
      const { data } = await forumAPI.addPoint(selectedTopic.id, {
        side,
        authorName: author.trim() || 'Guest Speaker',
        role,
        content: point.trim(),
        taggedPointId,
      });

      setTopics(current => current.map(topic =>
        topic.id === selectedTopic.id
          ? { ...topic, points: [...topic.points, data] }
          : topic
      ));
      setPoint('');
      setTaggedPointId(undefined);
    } catch {
      setError('Could not save this point. Please make sure the backend is running.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 px-4 pb-16">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-sm mb-4">
              <MessageCircle className="w-4 h-4" /> Forum
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white">Debate Topic Forum</h1>
            <p className="text-gray-400 mt-3 max-w-2xl">
              Search topics, choose a side, tag another point, and build a clear proposition or opposition thread.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="glass rounded-xl px-4 py-3">
              <p className="text-xl font-black text-white">{topics.length}</p>
              <p className="text-xs text-gray-400">Topics</p>
            </div>
            <div className="glass rounded-xl px-4 py-3">
              <p className="text-xl font-black text-white">{topicPoints.length}</p>
              <p className="text-xs text-gray-400">Points</p>
            </div>
            <div className="glass rounded-xl px-4 py-3">
              <p className="text-xl font-black text-white">2</p>
              <p className="text-xs text-gray-400">Sides</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
          <aside className="space-y-4">
            {error && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                {error}
              </div>
            )}
            {loading && (
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-300">
                Loading forum topics...
              </div>
            )}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="Search debate topics..."
                className="input-field pl-11"
              />
            </div>

            <div className="space-y-3">
              {filteredTopics.map(topic => (
                <button
                  key={topic.id}
                  onClick={() => {
                    setSelectedTopicId(topic.id);
                    setTaggedPointId(undefined);
                  }}
                  className={`w-full text-left rounded-2xl border p-4 transition-all ${
                    selectedTopic.id === topic.id
                      ? 'bg-cyan-500/10 border-cyan-400/50'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="text-xs text-cyan-300">{topic.category}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-gray-300">
                      {topic.language}
                    </span>
                  </div>
                  <h2 className="text-sm font-bold text-white leading-snug">{topic.title}</h2>
                  <p className="text-xs text-gray-400 mt-2 leading-relaxed">{topic.summary}</p>
                </button>
              ))}
            </div>
          </aside>

          <main className="space-y-5">
            <section className="card">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <button
                    onClick={() => setTaggedPointId(undefined)}
                    className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-3"
                  >
                    <ArrowLeft className="w-4 h-4" /> Clear selected reply
                  </button>
                  <h2 className="text-2xl font-black text-white">{selectedTopic.title}</h2>
                  <p className="text-gray-400 text-sm mt-2">{selectedTopic.summary}</p>
                </div>
                <span className="badge bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {selectedTopic.language}
                </span>
              </div>
            </section>

            <form onSubmit={addPoint} className="card space-y-4">
              <div className="flex flex-col xl:flex-row gap-3">
                <input
                  value={author}
                  onChange={event => setAuthor(event.target.value)}
                  className="input-field xl:max-w-52"
                  placeholder="Your name"
                />
                <select value={role} onChange={event => setRole(event.target.value as ForumRole)} className="input-field xl:max-w-44">
                  <option value="DEBATER" className="bg-gray-900">Debater</option>
                  <option value="ORGANIZER" className="bg-gray-900">Organizer</option>
                  <option value="JUDGE" className="bg-gray-900">Judge</option>
                </select>
                <div className="grid grid-cols-2 gap-2 xl:w-80">
                  {(['PROPOSITION', 'OPPOSITION'] as ForumSide[]).map(item => (
                    <button
                      type="button"
                      key={item}
                      onClick={() => setSide(item)}
                      className={`rounded-xl px-3 py-3 text-sm font-semibold border transition-colors ${
                        side === item
                          ? item === 'PROPOSITION'
                            ? 'bg-blue-500/20 text-blue-200 border-blue-400/60'
                            : 'bg-rose-500/20 text-rose-200 border-rose-400/60'
                          : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {item === 'PROPOSITION' ? 'Proposition' : 'Opposition'}
                    </button>
                  ))}
                </div>
              </div>

              {taggedPoint && (
                <div className="rounded-xl bg-white/5 border border-white/10 p-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Replying to {taggedPoint.authorName}</p>
                    <p className="text-sm text-gray-200 line-clamp-2">{taggedPoint.content}</p>
                  </div>
                  <button type="button" onClick={() => setTaggedPointId(undefined)} className="text-gray-500 hover:text-white">
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              )}

              <textarea
                value={point}
                onChange={event => setPoint(event.target.value)}
                placeholder="Write your point, rebuttal, or idea..."
                className="input-field min-h-28 resize-y"
              />
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <p className="text-xs text-gray-500 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Useful feature: tag a point before writing a rebuttal to keep arguments traceable.
                </p>
                <button type="submit" disabled={saving} className="btn-primary inline-flex items-center justify-center gap-2 disabled:opacity-60">
                  <Send className="w-4 h-4" /> {saving ? 'Saving...' : 'Post Point'}
                </button>
              </div>
            </form>

            <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {(['PROPOSITION', 'OPPOSITION'] as ForumSide[]).map(columnSide => (
                <div key={columnSide} className="card">
                  <div className="flex items-center gap-2 mb-4">
                    {columnSide === 'PROPOSITION' ? (
                      <ThumbsUp className="w-5 h-5 text-blue-300" />
                    ) : (
                      <ThumbsDown className="w-5 h-5 text-rose-300" />
                    )}
                    <h3 className="font-bold text-white">
                      {columnSide === 'PROPOSITION' ? 'Proposition' : 'Opposition'}
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {topicPoints.filter(item => item.side === columnSide).map(item => {
                      const parent = topicPoints.find(parentPoint => parentPoint.id === item.taggedPointId);
                      return (
                        <article key={item.id} className={`rounded-2xl border-l-4 p-4 ${item.colorClass}`}>
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div>
                              <p className="font-semibold text-white">{item.authorName}</p>
                              <p className="text-xs text-gray-400 flex items-center gap-1">
                                {item.role === 'JUDGE' ? <Shield className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                                {roleLabels[item.role]} · {formatTime(item.createdAt)}
                              </p>
                            </div>
                            <button
                              onClick={() => setTaggedPointId(item.id)}
                              className="inline-flex items-center gap-1 text-xs text-gray-300 hover:text-white"
                            >
                              <Reply className="w-3.5 h-3.5" /> Tag
                            </button>
                          </div>
                          {parent && (
                            <div className="mb-3 rounded-xl bg-black/20 border border-white/10 p-3">
                              <p className="text-[11px] text-gray-500 mb-1">Rebuttal to {parent.authorName}</p>
                              <p className="text-xs text-gray-300 line-clamp-2">{parent.content}</p>
                            </div>
                          )}
                          <p className="text-sm text-gray-100 leading-relaxed">{item.content}</p>
                        </article>
                      );
                    })}

                    {topicPoints.filter(item => item.side === columnSide).length === 0 && (
                      <div className="rounded-2xl bg-white/5 border border-white/10 p-8 text-center">
                        <Plus className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">No points on this side yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
