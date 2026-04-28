import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Send, CheckCircle, Loader2, Trophy } from 'lucide-react';
import { matchesAPI, scoreSheetsAPI } from '../../api';
import type { Match, ScoreCriteria } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';

interface SpeakerScore {
  speakerId: number;
  speakerName: string;
  scores: Record<string, number>;
  total: number;
}

export default function ScoreSheetPage() {
  const { matchId, judgeId } = useParams<{ matchId: string; judgeId: string }>();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [match, setMatch] = useState<Match | null>(null);
  const [criteria, setCriteria] = useState<ScoreCriteria[]>([
    { name: 'Matter', maxMarks: 40 },
    { name: 'Manner', maxMarks: 40 },
    { name: 'Method', maxMarks: 40 },
    { name: 'Rebuttal', maxMarks: 30 },
    { name: 'Teamwork', maxMarks: 30 },
  ]);
  const [propScores, setPropScores] = useState<SpeakerScore[]>([]);
  const [oppScores, setOppScores] = useState<SpeakerScore[]>([]);
  const [bestSpeakerId, setBestSpeakerId] = useState<number | null>(null);
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  useEffect(() => {
    if (!matchId || !judgeId) return;
    const fetch = async () => {
      try {
        const [matchRes] = await Promise.allSettled([
          matchesAPI.getById(parseInt(matchId)),
        ]);
        if (matchRes.status === 'fulfilled') {
          const m = matchRes.value.data;
          setMatch(m);

          // Load score template criteria
          try {
            const tmplRes = await scoreSheetsAPI.getTemplate(m.tournamentId);
            if (tmplRes.data?.criteriaJson) {
              setCriteria(JSON.parse(tmplRes.data.criteriaJson));
            }
          } catch {}

          // Check existing submission
          try {
            const subRes = await scoreSheetsAPI.getSubmission(parseInt(matchId), parseInt(judgeId));
            if (subRes.data && !subRes.data.reopened) {
              setAlreadySubmitted(true);
            }
          } catch {}

          // Initialize speaker scores
          const initScores = (speakers: Array<{ id: number; fullName: string }>, crits: ScoreCriteria[]) =>
            speakers.map(s => ({
              speakerId: s.id,
              speakerName: s.fullName,
              scores: Object.fromEntries(crits.map(c => [c.name, 0])),
              total: 0,
            }));

          const propSpeakers = m.propositionSchool?.debaters ?? [];
          const oppSpeakers = m.oppositionSchool?.debaters ?? [];
          setPropScores(initScores(propSpeakers, criteria));
          setOppScores(initScores(oppSpeakers, criteria));
        }
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [matchId, judgeId]);

  const updateScore = (
    side: 'prop' | 'opp',
    speakerIndex: number,
    criteriaName: string,
    value: number
  ) => {
    const setter = side === 'prop' ? setPropScores : setOppScores;
    setter(prev => prev.map((s, i) => {
      if (i !== speakerIndex) return s;
      const newScores = { ...s.scores, [criteriaName]: value };
      const total = Object.values(newScores).reduce((a, b) => a + b, 0);
      return { ...s, scores: newScores, total };
    }));
  };

  const propTotal = propScores.reduce((a, s) => a + s.total, 0);
  const oppTotal = oppScores.reduce((a, s) => a + s.total, 0);

  const handleSubmit = async () => {
    if (!matchId || !judgeId) return;
    setSubmitting(true);
    try {
      await scoreSheetsAPI.submit({
        matchId: parseInt(matchId),
        judgeId: parseInt(judgeId),
        propositionScoresJson: JSON.stringify(propScores),
        oppositionScoresJson: JSON.stringify(oppScores),
        propositionTotal: propTotal,
        oppositionTotal: oppTotal,
        selectedBestSpeakerId: bestSpeakerId,
        comments,
      });
      showToast('Score sheet submitted successfully!', 'success');
      setAlreadySubmitted(true);
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to submit score sheet', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;
  if (!match) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Match not found</p></div>;

  const allSpeakers = [
    ...propScores.map(s => ({ id: s.speakerId, name: s.speakerName, side: 'Proposition' })),
    ...oppScores.map(s => ({ id: s.speakerId, name: s.speakerName, side: 'Opposition' })),
  ];

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="card mb-6 text-center">
          <h1 className="text-2xl font-black text-white">{match.tournamentName}</h1>
          <p className="text-gray-400 text-sm mt-1">Score Sheet · {match.matchCode}</p>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="text-center">
              <p className="text-xs text-gray-400">Proposition</p>
              <p className="font-bold text-white">{match.propositionSchool?.name}</p>
            </div>
            <span className="text-gray-600 font-bold">VS</span>
            <div className="text-center">
              <p className="text-xs text-gray-400">Opposition</p>
              <p className="font-bold text-white">{match.oppositionSchool?.name}</p>
            </div>
          </div>
          <p className="text-sm text-gray-400 mt-3 italic">"{match.topic}"</p>
        </div>

        {alreadySubmitted ? (
          <div className="card text-center py-12 border-green-500/30 bg-green-500/5">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Score Sheet Submitted</h3>
            <p className="text-gray-400">You have already submitted your scores for this match.</p>
            <p className="text-gray-500 text-sm mt-2">Contact the organizer if you need to make changes.</p>
          </div>
        ) : (
          <>
            {/* Proposition Table */}
            <ScoreTable
              title={`Proposition — ${match.propositionSchool?.name}`}
              speakers={propScores}
              criteria={criteria}
              side="prop"
              teamTotal={propTotal}
              onScoreChange={updateScore}
            />

            {/* Opposition Table */}
            <ScoreTable
              title={`Opposition — ${match.oppositionSchool?.name}`}
              speakers={oppScores}
              criteria={criteria}
              side="opp"
              teamTotal={oppTotal}
              onScoreChange={updateScore}
            />

            {/* Score Summary */}
            <div className="card mb-6">
              <h3 className="font-bold text-white mb-4">Score Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl text-center border ${propTotal >= oppTotal ? 'border-green-500/30 bg-green-500/10' : 'border-white/10 bg-white/5'}`}>
                  <p className="text-sm text-gray-400">Proposition Total</p>
                  <p className="text-3xl font-black text-white">{propTotal}</p>
                  {propTotal > oppTotal && <p className="text-green-400 text-xs mt-1">Leading</p>}
                </div>
                <div className={`p-4 rounded-xl text-center border ${oppTotal > propTotal ? 'border-green-500/30 bg-green-500/10' : 'border-white/10 bg-white/5'}`}>
                  <p className="text-sm text-gray-400">Opposition Total</p>
                  <p className="text-3xl font-black text-white">{oppTotal}</p>
                  {oppTotal > propTotal && <p className="text-green-400 text-xs mt-1">Leading</p>}
                </div>
              </div>
            </div>

            {/* Best Speaker */}
            {allSpeakers.length > 0 && (
              <div className="card mb-6">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-400" /> Select Best Speaker
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {allSpeakers.map(s => (
                    <button key={s.id} onClick={() => setBestSpeakerId(s.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                        bestSpeakerId === s.id
                          ? 'bg-yellow-500/20 border-yellow-500/50'
                          : 'glass border-white/10 hover:border-white/20'
                      }`}>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        bestSpeakerId === s.id ? 'bg-yellow-500 border-yellow-500' : 'border-white/30'
                      }`}>
                        {bestSpeakerId === s.id && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{s.name}</p>
                        <p className="text-xs text-gray-400">{s.side}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Comments */}
            <div className="card mb-6">
              <h3 className="font-bold text-white mb-3">Judge Comments</h3>
              <textarea value={comments} onChange={e => setComments(e.target.value)}
                rows={4} placeholder="Overall comments about the debate..."
                className="input-field resize-none" />
            </div>

            {/* Submit */}
            <button onClick={handleSubmit} disabled={submitting}
              className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-base">
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              {submitting ? 'Submitting...' : 'Submit Score Sheet'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function ScoreTable({
  title, speakers, criteria, side, teamTotal, onScoreChange
}: {
  title: string;
  speakers: SpeakerScore[];
  criteria: ScoreCriteria[];
  side: 'prop' | 'opp';
  teamTotal: number;
  onScoreChange: (side: 'prop' | 'opp', speakerIndex: number, criteriaName: string, value: number) => void;
}) {
  if (speakers.length === 0) return null;

  return (
    <div className="card mb-6">
      <h3 className="font-bold text-white mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-white/10">
              <th className="pb-2 pr-3 min-w-[120px]">Speaker</th>
              {criteria.map(c => (
                <th key={c.name} className="pb-2 pr-3 text-center min-w-[80px]">
                  {c.name}
                  <br />
                  <span className="text-xs text-gray-600">/{c.maxMarks}</span>
                </th>
              ))}
              <th className="pb-2 text-center">Total</th>
            </tr>
          </thead>
          <tbody>
            {speakers.map((speaker, si) => (
              <tr key={speaker.speakerId} className="border-b border-white/5">
                <td className="py-3 pr-3">
                  <p className="text-white font-medium truncate max-w-[120px]">{speaker.speakerName}</p>
                </td>
                {criteria.map(c => (
                  <td key={c.name} className="py-2 pr-3">
                    <input
                      type="number"
                      min={0}
                      max={c.maxMarks}
                      value={speaker.scores[c.name] || 0}
                      onChange={e => onScoreChange(side, si, c.name, Math.min(c.maxMarks, Math.max(0, parseInt(e.target.value) || 0)))}
                      className="w-full bg-white/5 border border-white/15 rounded-lg px-2 py-1.5 text-white text-sm text-center focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                    />
                  </td>
                ))}
                <td className="py-2 text-center font-bold text-blue-400">{speaker.total}</td>
              </tr>
            ))}
            <tr className="border-t border-white/20">
              <td className="py-2 font-bold text-white" colSpan={criteria.length + 1}>Team Total</td>
              <td className="py-2 text-center font-black text-xl text-white">{teamTotal}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
