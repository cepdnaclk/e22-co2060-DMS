import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ArrowRight, Calendar, Newspaper, Users, Video } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { newsAPI } from '../../api';
import type { NewsPost } from '../../types';

const categories = [
  { key: 'ALL', label: 'All', icon: Newspaper },
  { key: 'LATEST_NEWS', label: 'Latest News', icon: Newspaper },
  { key: 'VLOGS', label: 'Vlogs', icon: Video },
  { key: 'COMMUNITY_STORIES', label: 'Community Stories', icon: Users },
];

const categoryLabels: Record<string, string> = {
  LATEST_NEWS: 'Latest News',
  VLOGS: 'Vlogs',
  COMMUNITY_STORIES: 'Community Stories',
};

function PostCard({ post }: { post: NewsPost }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="paper-panel p-5 flex flex-col">
      <div className="h-48 overflow-hidden mb-5 bg-[#eef5ff] border border-slate-300 flex items-center justify-center">
        {post.imageUrl ? (
          <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
        ) : (
          <Newspaper className="w-12 h-12 text-slate-400" />
        )}
      </div>

      <span className="badge bg-[#eef5ff] text-[#06192b] border-slate-300 self-start mb-4">
        {categoryLabels[post.category] || post.category}
      </span>

      <h3 className="font-display text-2xl font-bold text-[#06192b] mb-3 line-clamp-2">
        {post.title}
      </h3>

      <p className={`text-slate-600 text-sm leading-7 mb-5 ${expanded ? '' : 'line-clamp-3'}`}>
        {post.content}
      </p>

      <div className="mt-auto flex items-center justify-between gap-4 border-t border-slate-300 pt-4">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          {post.authorName && <span className="font-bold text-[#06192b]">{post.authorName}</span>}
          {post.authorName && <span>/</span>}
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {post.createdAt ? format(new Date(post.createdAt), 'MMM d, yyyy') : ''}
          </span>
        </div>
        <button onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#06192b]">
          {expanded ? 'Show less' : 'Read More'} <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </article>
  );
}

export default function NewsPage() {
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('ALL');

  useEffect(() => {
    newsAPI.getAll()
      .then(r => setPosts(r.data))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeCategory === 'ALL'
    ? posts
    : posts.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen py-16">
      <div className="editorial-shell">
        <header className="max-w-3xl mb-10">
          <p className="eyebrow text-slate-500 mb-4">News & Community</p>
          <h1 className="font-display text-5xl sm:text-6xl font-bold text-[#06192b]">Dispatches from the debate world.</h1>
          <p className="text-slate-600 text-lg mt-5">Latest updates, vlogs, and community stories from tournaments and institutions.</p>
        </header>

        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map(cat => (
            <button key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={activeCategory === cat.key ? 'tab-btn-active' : 'tab-btn-inactive'}>
              <cat.icon className="w-4 h-4" />
              {cat.label}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner message="Loading news..." />
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(post => <PostCard key={post.id} post={post} />)}
          </div>
        ) : (
          <div className="paper-panel text-center py-16">
            <Newspaper className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-500">No posts in this category yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
