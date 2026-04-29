import { useState, useEffect } from 'react';
import { Newspaper, Video, Users, Calendar, ArrowRight } from 'lucide-react';
import { newsAPI } from '../../api';
import type { NewsPost } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { format } from 'date-fns';

const categories = [
  { key: 'ALL', label: 'All', icon: Newspaper },
  { key: 'LATEST_NEWS', label: 'Latest News', icon: Newspaper },
  { key: 'VLOGS', label: 'Vlogs', icon: Video },
  { key: 'COMMUNITY_STORIES', label: 'Community Stories', icon: Users },
];

const categoryColors: Record<string, string> = {
  LATEST_NEWS: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  VLOGS: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  COMMUNITY_STORIES: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

const categoryLabels: Record<string, string> = {
  LATEST_NEWS: 'Latest News',
  VLOGS: 'Vlogs',
  COMMUNITY_STORIES: 'Community Stories',
};

function PostCard({ post }: { post: NewsPost }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card-hover group overflow-hidden flex flex-col">
      {/* Image */}
      <div className="h-48 rounded-xl overflow-hidden mb-4 bg-gradient-to-br from-blue-600/20 to-violet-600/20 flex items-center justify-center">
        {post.imageUrl ? (
          <img src={post.imageUrl} alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <Newspaper className="w-12 h-12 text-gray-600" />
        )}
      </div>

      {/* Badge */}
      <span className={`badge border mb-3 self-start ${categoryColors[post.category] || 'bg-gray-500/20 text-gray-400'}`}>
        {categoryLabels[post.category] || post.category}
      </span>

      <h3 className="font-bold text-white text-lg mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
        {post.title}
      </h3>

      <p className={`text-gray-400 text-sm mb-4 ${expanded ? '' : 'line-clamp-3'}`}>
        {post.content}
      </p>

      <div className="mt-auto flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          {post.authorName && <span className="font-medium text-gray-400">{post.authorName}</span>}
          {post.authorName && <span>·</span>}
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {post.createdAt ? format(new Date(post.createdAt), 'MMM d, yyyy') : ''}
          </span>
        </div>
        <button onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
          {expanded ? 'Show less' : 'Read More'} <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
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
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-white mb-3">News & Community</h1>
          <p className="text-gray-400 text-lg">Latest updates, vlogs, and community stories from the debate world</p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map(cat => (
            <button key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeCategory === cat.key
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                  : 'glass text-gray-400 hover:text-white hover:bg-white/10'
              }`}>
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
          <div className="card text-center py-16">
            <Newspaper className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No posts in this category yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
