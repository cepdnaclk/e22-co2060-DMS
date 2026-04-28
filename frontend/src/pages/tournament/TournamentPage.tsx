import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Trophy, Users, Scale, MessageSquare, BarChart3, Award,
  Plus, CheckCircle, Clock, ChevronRight, Loader2, Trash2, Send, X
} from 'lucide-react';
import { tournamentsAPI, matchesAPI, statsAPI, discussionAPI, scoreSheetsAPI } from '../../api';
import type { Tournament, Match, SchoolLeaderboardEntry, DiscussionComment } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Avatar from '../../components/common/Avatar';
import CreateMatchModal from './CreateMatchModal';
import { format } from 'date-fns';

type Tab = 'matches' | 'discussion' | 'leaderboard' | 'scoresheet' | 'results' | 'info';

export default function TournamentPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [leaderboard, setLeaderboard] = useState<SchoolLeaderboardEntry[]>([]);
  const [comments, setComments] = useState<DiscussionComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('matches');
  const [showCreateMatch, setShowCreateMatch] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [scoreTemplate, setScoreTemplate] = useState<any>(null);

  const isOrganizer = user?.role === 'ORGANIZER' && tournament?.organizer?.id === user?.id;

  const fetchAll = async () => {
    if (!id) return;
    try {
      const [tRes, mRes, lRes, cRes] = await Promise.allSettled([
        tournamentsAPI.getById(parseInt(id)),
        matchesAPI.getByTournament(parseInt(id)),
        statsAPI.getLeaderboard(parseInt(id)),
        discussionAPI.getComments(parseInt(id)),
      ]);
      if (tRes.status === 'fulfilled') setTournament(tRes.value.data);
      if (mRes.status === 'fulfilled') setMatches(mRes.value.data);
      if (lRes.status === 'fulfilled') setLeaderboard(lRes.value.data);
      if (cRes.status === 'fulfilled') setComments(cRes.value.data);

      // Load score template
      try {
        const tmplRes = await scoreSheetsAPI.getTemplate(parseInt(id));
        setScoreTemplate(tmplRes.data);
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [id]);

  const postComment = async () => {
    if (!newComment.trim() || !user || !id) return;
    setCommentLoading(true);
    try {
      await discussionAPI.addComment({ tournamentId: parseInt(id), userId: user.id, comment: newComment });
      setNewComment('');
      const { data } = await discussionAPI.getComments(parseInt(id));
      setComments(data);
      showToast('Comment posted', 'success');
    } catch {
      showToast('Failed to post comment', 'error');
    } finally {
      setCommentLoading(false);
    }
  };

  const deleteComment = async (commentId: number) => {
    try {
      await discussionAPI.delete(commentId);
      setComments(p => p.filter(c => c.id !== commentId));
    } catch { showToast('Failed to delete comment', 'error'); }
  };

  const generateNextRound = async () => {
    if (!id) return;
    try {
      await matchesAPI.generateNextRound(parseInt(id));
      showToast('Next round generated!', 'success');
      const { data } = await matchesAPI.getByTournament(parseInt(id));
      setMatches(data);
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Cannot generate next round yet', 'error');
    }
  };

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'matches', label: 'Matches', icon: Trophy },
    { key: 'leaderboard', label: 'Leaderboard', icon: BarChart3 },
    { key: 'discussion', label: 'Discussion', icon: MessageSquare },
    { key: 'scoresheet', label: 'Score Sheet', icon: Scale },
    { key: 'results', label: 'Results', icon: Award },
    { key: 'info', label: 'Info', icon: Users },
  ];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner message="Loading tournament..." />
    </div>
  );

  if (!tournament) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-400">Tournament not found</p>
        <Link to="/" className="btn-primary mt-4 inline-block">Go Home</Link>
      </div>
    </div>
  );

  const completedMatches = matches.filter(m => m.status === 'COMPLETED');
  const winner = tournament.status === 'COMPLETED'
    ? leaderboard[0]
    : null;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="card mb-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-blue-500/20 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-white">{tournament.name}</h1>
                  <p className="text-gray-400 text-sm">
                    {tournament.debateType?.replace(/_/g, ' ')} · {tournament.tournamentType}
                    {tournament.customDebateType && ` · ${tournament.customDebateType}`}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-400">
                Organized by <span className="text-white font-medium">{tournament.organizer?.fullName}</span>
              </p>
            </div>
            <div className="flex flex-col items-start sm:items-end gap-2">
              <span className={`badge border ${tournament.status === 'ACTIVE' ? 'badge-active' : 'badge-completed'}`}>
                {tournament.status}
              </span>
              <span className="text-xs text-gray-500">{matches.length} matches · {tournament.schools?.length ?? 0} schools</span>
            </div>
          </div>

          {isOrganizer && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/10">
              <button onClick={() => setShowCreateMatch(true)}
                className="btn-primary text-sm flex items-center gap-2">
                <Plus className="w-4 h-4" /> Create Match
              </button>
              {tournament.tournamentType === 'KNOCKOUT' && (
                <button onClick={generateNextRound}
                  className="btn-secondary text-sm flex items-center gap-2">
                  <ChevronRight className="w-4 h-4" /> Generate Next Round
                </button>
              )}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto scrollbar-hide pb-1">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === t.key ? 'tab-btn-active' : 'tab-btn-inactive'
              }`}>
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'matches' && (
          <div className="space-y-4">
            <h2 className="font-bold text-white">All Matches ({matches.length})</h2>
            {matches.length > 0 ? (
              <div className="space-y-3">
                {matches.map(m => (
                  <div key={m.id} className="card">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-4">
                        <div>
                          <span className="text-xs font-mono text-gray-500">{m.matchCode}</span>
                          <p className="text-xs text-gray-400">Round {m.roundNumber}</p>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-white font-semibold">{m.propositionSchool?.name}</span>
                          <span className="text-gray-500 text-xs">VS</span>
                          <span className="text-white font-semibold">{m.oppositionSchool?.name}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`badge border ${
                          m.status === 'LIVE' ? 'badge-live' :
                          m.status === 'COMPLETED' ? 'badge-completed' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        }`}>
                          {m.status}
                        </span>
                        {m.status === 'COMPLETED' && m.winnerSchool && (
                          <span className="text-xs text-green-400 flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> {m.winnerSchool.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 italic">"{m.topic}"</p>
                    {m.judges && m.judges.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {m.judges.map(j => (
                          <Link key={j.id} to={`/score-sheet/${m.id}/${j.judge.id}`}
                            className={`text-xs px-2 py-0.5 rounded-full border ${
                              j.submitted ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-white/5 text-gray-400 border-white/10'
                            }`}>
                            {j.judge.fullName} {j.submitted ? '✓' : ''}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="card text-center py-12">
                <Trophy className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-400">No matches yet</p>
                {isOrganizer && (
                  <button onClick={() => setShowCreateMatch(true)}
                    className="btn-primary mt-4 inline-flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Create First Match
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="card">
            <h2 className="font-bold text-white mb-4">Tournament Leaderboard</h2>
            {leaderboard.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-400 border-b border-white/10">
                      <th className="pb-3 pr-4">#</th>
                      <th className="pb-3 pr-4">School</th>
                      <th className="pb-3 pr-4 text-center">P</th>
                      <th className="pb-3 pr-4 text-center">W</th>
                      <th className="pb-3 pr-4 text-center">L</th>
                      <th className="pb-3 pr-4 text-center">Pts</th>
                      <th className="pb-3 text-center">Win%</th>
                    </tr>
                  </thead>
                  <tbody className="space-y-1">
                    {leaderboard.map((entry, i) => (
                      <tr key={entry.schoolId} className={`border-b border-white/5 ${i === 0 ? 'text-yellow-400' : 'text-white'}`}>
                        <td className="py-3 pr-4 font-bold">{i + 1}</td>
                        <td className="py-3 pr-4 font-semibold">{entry.schoolName}</td>
                        <td className="py-3 pr-4 text-center text-gray-300">{entry.played}</td>
                        <td className="py-3 pr-4 text-center text-green-400">{entry.wins}</td>
                        <td className="py-3 pr-4 text-center text-red-400">{entry.losses}</td>
                        <td className="py-3 pr-4 text-center font-bold">{entry.points}</td>
                        <td className="py-3 text-center text-gray-300">{entry.winRate.toFixed(0)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Leaderboard will appear after matches are played</p>
            )}
          </div>
        )}

        {activeTab === 'discussion' && (
          <div className="space-y-4">
            <h2 className="font-bold text-white">Discussion Panel</h2>
            {user && (
              <div className="card">
                <div className="flex gap-3">
                  <Avatar name={user.fullName} src={user.profilePictureUrl} size="sm" />
                  <div className="flex-1">
                    <textarea value={newComment} onChange={e => setNewComment(e.target.value)}
                      placeholder="Share your thoughts about the tournament..."
                      rows={3} className="input-field resize-none text-sm" />
                    <button onClick={postComment} disabled={commentLoading || !newComment.trim()}
                      className="btn-primary text-sm mt-2 flex items-center gap-2 disabled:opacity-50">
                      {commentLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Post Comment
                    </button>
                  </div>
                </div>
              </div>
            )}
            {comments.length > 0 ? (
              <div className="space-y-3">
                {comments.map(c => (
                  <div key={c.id} className="card">
                    <div className="flex items-start gap-3">
                      <Avatar name={c.user.fullName} src={c.user.profilePictureUrl} size="sm" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white">{c.user.fullName}</span>
                            <span className="badge bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              {c.user.role}
                            </span>
                          </div>
                          {(isOrganizer || user?.id === c.user.id) && (
                            <button onClick={() => deleteComment(c.id)}
                              className="text-red-400 hover:text-red-300 p-1">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-gray-300 mt-1">{c.comment}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {c.createdAt ? format(new Date(c.createdAt), 'MMM d, h:mm a') : ''}
                        </p>
                        {c.replies && c.replies.length > 0 && (
                          <div className="mt-3 pl-4 border-l border-white/10 space-y-3">
                            {c.replies.map(r => (
                              <div key={r.id} className="flex items-start gap-2">
                                <Avatar name={r.user.fullName} src={r.user.profilePictureUrl} size="xs" />
                                <div>
                                  <span className="text-xs font-semibold text-white">{r.user.fullName}</span>
                                  <p className="text-xs text-gray-400">{r.comment}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card text-center py-10">
                <MessageSquare className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-400">No comments yet. Start the discussion!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'scoresheet' && (
          <div className="card">
            <h2 className="font-bold text-white mb-4">Score Sheet Template</h2>
            {scoreTemplate ? (
              <div>
                <p className="text-sm text-gray-400 mb-4">Template: <span className="text-white">{scoreTemplate.name}</span></p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-400 border-b border-white/10">
                        <th className="pb-3 pr-4">Criteria</th>
                        <th className="pb-3 text-center">Max Marks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scoreTemplate.criteriaJson && JSON.parse(scoreTemplate.criteriaJson).map((c: any, i: number) => (
                        <tr key={i} className="border-b border-white/5">
                          <td className="py-3 pr-4 text-white font-medium">{c.name}</td>
                          <td className="py-3 text-center text-gray-300">{c.maxMarks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No score sheet template configured</p>
            )}
          </div>
        )}

        {activeTab === 'results' && (
          <div className="space-y-4">
            <h2 className="font-bold text-white">Tournament Results</h2>
            {completedMatches.length > 0 ? (
              <div>
                {winner && (
                  <div className="card border-yellow-500/30 bg-yellow-500/5 text-center mb-6">
                    <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-3" />
                    <h3 className="text-2xl font-black text-white">Winner</h3>
                    <p className="text-xl font-bold text-yellow-400 mt-1">{winner.schoolName}</p>
                    <p className="text-gray-400 text-sm mt-1">{winner.wins} wins · {winner.points} points</p>
                  </div>
                )}
                <div className="space-y-3">
                  {completedMatches.map(m => (
                    <div key={m.id} className="card">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-mono text-gray-500">{m.matchCode} · Round {m.roundNumber}</p>
                          <div className="flex items-center gap-2 mt-1 text-sm">
                            <span className={m.winnerSchool?.id === m.propositionSchool?.id ? 'text-green-400 font-bold' : 'text-gray-400'}>
                              {m.propositionSchool?.name}
                            </span>
                            <span className="text-gray-600">vs</span>
                            <span className={m.winnerSchool?.id === m.oppositionSchool?.id ? 'text-green-400 font-bold' : 'text-gray-400'}>
                              {m.oppositionSchool?.name}
                            </span>
                          </div>
                        </div>
                        {m.bestSpeaker && (
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Best Speaker</p>
                            <p className="text-sm font-semibold text-yellow-400">⭐ {m.bestSpeaker.fullName}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="card text-center py-12">
                <Award className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-400">Results will appear as matches are completed</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'info' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" /> Schools & Debaters
              </h3>
              {tournament.schools?.map(school => (
                <div key={school.id} className="mb-4">
                  <p className="font-semibold text-white mb-1">{school.name}</p>
                  <div className="flex flex-wrap gap-1">
                    {school.debaters?.map(d => (
                      <Link key={d.id} to={`/profile/${d.id}`}
                        className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors">
                        {d.fullName}
                      </Link>
                    )) ?? <span className="text-xs text-gray-500">No debaters listed</span>}
                  </div>
                </div>
              ))}
            </div>
            <div className="card">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Scale className="w-4 h-4 text-violet-400" /> Judges
              </h3>
              {tournament.judges?.map(tj => (
                <div key={tj.id} className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-mono text-gray-500">{tj.judgeCode}</span>
                  <Avatar name={tj.judge.fullName} src={tj.judge.profilePictureUrl} size="sm" />
                  <Link to={`/profile/${tj.judge.id}`}
                    className="text-sm font-medium text-white hover:text-blue-400 transition-colors">
                    {tj.judge.fullName}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showCreateMatch && tournament && (
        <CreateMatchModal
          tournament={tournament}
          onClose={() => setShowCreateMatch(false)}
          onCreated={() => {
            setShowCreateMatch(false);
            matchesAPI.getByTournament(parseInt(id!)).then(r => setMatches(r.data));
          }}
        />
      )}
    </div>
  );
}
