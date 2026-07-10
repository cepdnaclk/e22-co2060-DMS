import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from './Toast';
import { diariesAPI } from '../../api';
import type { DiaryPost, DiaryComment } from '../../types';
import Avatar from './Avatar';
import LoadingSpinner from './LoadingSpinner';
import { 
  Heart, MessageSquare, Share2, ShieldAlert, ShieldCheck, 
  Trash2, Plus, Image as ImageIcon, Video as VideoIcon, 
  X, Send, Check, Shield, FileCheck2, Award
} from 'lucide-react';
import { format } from 'date-fns';

interface DiariesSectionProps {
  profileUserId: number;
}

export default function DiariesSection({ profileUserId }: DiariesSectionProps) {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();
  
  const [posts, setPosts] = useState<DiaryPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Create post states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mediaType, setMediaType] = useState<'none' | 'image' | 'video'>('none');
  const [mediaUrl, setMediaUrl] = useState('');
  const [filePreview, setFilePreview] = useState<string | null>(null);

  // Comments state
  const [expandedComments, setExpandedComments] = useState<Record<number, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});

  const fetchDiaries = async () => {
    try {
      const res = await diariesAPI.getByUserId(profileUserId);
      setPosts(res.data);
    } catch (err) {
      console.error('Failed to load diaries', err);
      showToast('Failed to load diaries', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiaries();
  }, [profileUserId]);

  useEffect(() => {
    if (location.hash === '#diaries') {
      const timer = setTimeout(() => {
        const el = document.getElementById('diaries');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [location.hash, posts]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (e.g. 50MB for video, 5MB for image)
    const limit = mediaType === 'video' ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > limit) {
      showToast(`File size is too large. Maximum allowed is ${mediaType === 'video' ? '50MB' : '5MB'}.`, 'error');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      showToast('Post content cannot be empty', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload: Partial<DiaryPost> = {
        title: title.trim() || undefined,
        content: content.trim(),
      };

      if (mediaType === 'image') {
        payload.imageUrl = filePreview || mediaUrl || undefined;
      } else if (mediaType === 'video') {
        payload.videoUrl = filePreview || mediaUrl || undefined;
      }

      const res = await diariesAPI.create(payload);
      setPosts(prev => [res.data, ...prev]);
      showToast('Diary post shared successfully!', 'success');
      
      // Reset form and close modal
      setTitle('');
      setContent('');
      setMediaType('none');
      setMediaUrl('');
      setFilePreview(null);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to create diary post', err);
      showToast('Failed to post to diary', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (postId: number) => {
    if (!currentUser) {
      showToast('Please login to like this post', 'info');
      return;
    }

    try {
      const res = await diariesAPI.like(postId);
      setPosts(prev => prev.map(p => p.id === postId ? { 
        ...p, 
        likesCount: res.data.likesCount, 
        isLikedByCurrentUser: res.data.isLikedByCurrentUser 
      } : p));
    } catch (err) {
      console.error('Failed to like post', err);
      showToast('Failed to update like status', 'error');
    }
  };

  const handleAddComment = async (postId: number) => {
    if (!currentUser) {
      showToast('Please login to comment', 'info');
      return;
    }

    const text = commentInputs[postId] || '';
    if (!text.trim()) return;

    try {
      const res = await diariesAPI.comment(postId, text.trim());
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            comments: [...(p.comments || []), res.data]
          };
        }
        return p;
      }));
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      showToast('Comment posted', 'success');
    } catch (err) {
      console.error('Failed to post comment', err);
      showToast('Failed to add comment', 'error');
    }
  };

  const handleShare = async (postId: number) => {
    try {
      const res = await diariesAPI.share(postId);
      // Update share count in state
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, shareCount: res.data.shareCount } : p));
      
      // Copy simulated link to clipboard
      const shareUrl = `${window.location.origin}${window.location.pathname}#post-${postId}`;
      await navigator.clipboard.writeText(shareUrl);
      showToast('Post link copied to clipboard!', 'success');
    } catch (err) {
      console.error('Failed to share post', err);
      showToast('Failed to share post', 'error');
    }
  };

  const handleVerifyToggle = async (postId: number, currentVerifiedStatus: boolean) => {
    try {
      const res = await diariesAPI.verify(postId, !currentVerifiedStatus);
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, isVerified: res.data.isVerified } : p));
      showToast(
        res.data.isVerified ? 'Post marked as Verified!' : 'Verification removed from post',
        'success'
      );
    } catch (err) {
      console.error('Failed to update verification status', err);
      showToast('Failed to update verification status', 'error');
    }
  };

  const handleDelete = async (postId: number) => {
    if (!window.confirm('Are you sure you want to delete this diary post?')) return;

    try {
      await diariesAPI.delete(postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
      showToast('Post deleted successfully', 'success');
    } catch (err) {
      console.error('Failed to delete post', err);
      showToast('Failed to delete post', 'error');
    }
  };

  const isOwnProfile = currentUser?.id === profileUserId;
  const isOrganizer = currentUser?.role === 'ORGANIZER';

  return (
    <div id="diaries" className="card space-y-6">
      {/* Header section with Create Button */}
      <div className="flex items-center justify-between pb-2 border-b border-white/5">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-400" />
            MyDiaries
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Valuable moments, awards, and certificates</p>
        </div>
        
        {isOwnProfile && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Share Moment
          </button>
        )}
      </div>

      {/* Main diaries container */}
      {loading ? (
        <div className="py-12 flex justify-center"><LoadingSpinner /></div>
      ) : posts.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-white/10 rounded-2xl">
          <ImageIcon className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 text-sm font-medium">No diary moments shared yet</p>
          <p className="text-gray-600 text-xs mt-1">
            {isOwnProfile 
              ? 'Click the button above to post your certificates or memories!' 
              : 'This user hasn\'t posted any diary entries yet.'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map(post => {
            const hasLiked = post.isLikedByCurrentUser;
            const commentsOpen = !!expandedComments[post.id];
            
            return (
              <div 
                key={post.id} 
                id={`post-${post.id}`}
                className="p-5 rounded-2xl glass border border-white/5 hover:border-white/10 transition-all space-y-4"
              >
                {/* Post Author Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar 
                      name={post.authorName} 
                      src={post.authorProfilePictureUrl} 
                      size="sm" 
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-white">{post.authorName}</span>
                        {post.isVerified && (
                          <span 
                            className="p-0.5 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 text-black flex items-center justify-center cursor-default"
                            title="Verified Post by Developers"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </span>
                        )}
                        <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] uppercase tracking-wider text-gray-400 font-semibold">
                          {post.authorRole}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500">
                        {post.createdAt ? format(new Date(post.createdAt), 'MMM d, yyyy h:mm a') : 'Just now'}
                      </p>
                    </div>
                  </div>

                  {/* Actions (Delete, Verify) */}
                  <div className="flex items-center gap-2">
                    {isOrganizer && (
                      <button
                        onClick={() => handleVerifyToggle(post.id, post.isVerified)}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          post.isVerified 
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20' 
                            : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                        }`}
                        title={post.isVerified ? 'Unverify Post' : 'Verify Post'}
                      >
                        <Shield className="w-4 h-4" />
                      </button>
                    )}
                    
                    {(isOwnProfile || isOrganizer) && (
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="Delete Post"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Post Content */}
                <div className="space-y-3">
                  {post.title && <h3 className="text-sm font-bold text-gray-200">{post.title}</h3>}
                  <p className="text-gray-300 text-sm whitespace-pre-line leading-relaxed">{post.content}</p>
                  
                  {/* Media Rendering */}
                  {post.imageUrl && (
                    <div className="max-h-[380px] overflow-hidden rounded-xl bg-black/30 border border-white/5 flex items-center justify-center">
                      <img 
                        src={post.imageUrl} 
                        alt={post.title || "Diary image"} 
                        className="w-full max-h-[380px] object-contain hover:scale-[1.01] transition-transform duration-500" 
                      />
                    </div>
                  )}

                  {post.videoUrl && (
                    <div className="rounded-xl overflow-hidden bg-black/40 border border-white/5">
                      <video 
                        src={post.videoUrl} 
                        controls 
                        className="w-full max-h-[380px] object-contain" 
                      />
                    </div>
                  )}
                </div>

                {/* Interactions Row */}
                <div className="flex items-center gap-6 pt-3 border-t border-white/5 text-gray-400 text-xs">
                  {/* Like Button */}
                  <button 
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-1.5 hover:text-red-400 transition-colors cursor-pointer group ${
                      hasLiked ? 'text-red-500 font-medium' : ''
                    }`}
                  >
                    <Heart className={`w-4 h-4 transition-transform group-active:scale-125 ${hasLiked ? 'fill-red-500 text-red-500' : ''}`} />
                    <span>{post.likesCount || 0} Likes</span>
                  </button>

                  {/* Comment Toggle Button */}
                  <button 
                    onClick={() => setExpandedComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                    className={`flex items-center gap-1.5 hover:text-blue-400 transition-colors cursor-pointer ${
                      commentsOpen ? 'text-blue-400 font-medium' : ''
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{post.comments?.length || 0} Comments</span>
                  </button>

                  {/* Share Button */}
                  <button 
                    onClick={() => handleShare(post.id)}
                    className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>{post.shareCount || 0} Shares</span>
                  </button>
                </div>

                {/* Comments Section */}
                {commentsOpen && (
                  <div className="pt-4 border-t border-white/5 space-y-4 animate-fade-in">
                    {/* Add Comment Box */}
                    {currentUser ? (
                      <div className="flex items-center gap-2">
                        <Avatar 
                          name={currentUser.fullName} 
                          src={currentUser.profilePictureUrl} 
                          size="xs" 
                        />
                        <input
                          type="text"
                          placeholder="Write a comment..."
                          value={commentInputs[post.id] || ''}
                          onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                          className="bg-white/[0.03] border border-white/10 text-white rounded-xl px-3 py-1.5 w-full text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <p className="text-[11px] text-gray-500 text-center">Login to comment on this post</p>
                    )}

                    {/* Comments List */}
                    {post.comments && post.comments.length > 0 ? (
                      <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                        {post.comments.map(comment => (
                          <div key={comment.id} className="flex gap-2.5 items-start p-2 rounded-lg bg-white/[0.02] border border-white/[0.02]">
                            <Avatar 
                              name={comment.authorName} 
                              src={comment.authorProfilePictureUrl} 
                              size="xs" 
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-gray-300">{comment.authorName}</span>
                                <span className="text-[9px] text-gray-500">
                                  {comment.createdAt ? format(new Date(comment.createdAt), 'MMM d, h:mm a') : 'Just now'}
                                </span>
                              </div>
                              <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{comment.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-gray-500 text-center py-2">No comments yet. Start the conversation!</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal - Post Diary Moment */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto"
          onClick={() => setIsModalOpen(false)}
        >
          <form 
            onSubmit={handleCreatePost}
            onClick={e => e.stopPropagation()}
            className="bg-gray-800 border border-gray-700 rounded-2xl p-6 w-full max-w-lg animate-fade-in my-8 space-y-4 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-700/50">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-indigo-400" />
                Share a Diary Moment
              </h3>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Title (Optional) */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Title (Optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Winner at Debate Cup 2026!"
                className="bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2.5 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            {/* Caption/Content (Required) */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Caption / Narrative (Required)
              </label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={4}
                required
                placeholder="Share the details of this accomplishment or memorable moment..."
                className="bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2.5 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
              />
            </div>

            {/* Media Type Toggle */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">
                Add Media (Image or Video)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'none', label: 'No Media', icon: X },
                  { id: 'image', label: 'Image/Certificate', icon: ImageIcon },
                  { id: 'video', label: 'Video Moment', icon: VideoIcon },
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setMediaType(item.id as any);
                      setFilePreview(null);
                      setMediaUrl('');
                    }}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                      mediaType === item.id 
                        ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/10' 
                        : 'bg-gray-900 border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Media URL or File Input based on selection */}
            {mediaType !== 'none' && (
              <div className="p-4 rounded-xl bg-gray-900 border border-gray-700 space-y-3">
                <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
                  <span>Option A: Upload Local File</span>
                  <span className="text-[10px] text-gray-500">Max size: {mediaType === 'video' ? '50MB' : '5MB'}</span>
                </div>
                
                <input
                  type="file"
                  accept={mediaType === 'image' ? 'image/*' : 'video/*'}
                  onChange={handleFileChange}
                  className="block w-full text-xs text-gray-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer"
                />

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-gray-800"></div>
                  <span className="flex-shrink mx-3 text-[10px] text-gray-500 uppercase tracking-widest font-bold">OR</span>
                  <div className="flex-grow border-t border-gray-800"></div>
                </div>

                <div className="text-xs text-gray-400 font-medium mb-1.5">Option B: Enter Web URL</div>
                <input
                  type="url"
                  placeholder={mediaType === 'image' ? "https://example.com/certificate.jpg" : "https://example.com/moment.mp4"}
                  value={mediaUrl}
                  disabled={!!filePreview}
                  onChange={e => setMediaUrl(e.target.value)}
                  className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 w-full text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/50 disabled:opacity-40 disabled:cursor-not-allowed"
                />

                {/* Preview Container */}
                {filePreview && (
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> File Selected
                      </span>
                      <button 
                        type="button" 
                        onClick={() => setFilePreview(null)}
                        className="text-xs text-red-400 hover:text-red-300 font-medium"
                      >
                        Remove
                      </button>
                    </div>
                    {mediaType === 'image' ? (
                      <img src={filePreview} className="max-h-[140px] rounded-lg object-contain bg-black/20" />
                    ) : (
                      <video src={filePreview} className="max-h-[140px] rounded-lg bg-black" controls />
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-700/50">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {submitting ? 'Sharing...' : 'Share Moment'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
