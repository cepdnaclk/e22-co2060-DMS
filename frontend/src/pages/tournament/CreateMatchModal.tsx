import { useState } from 'react';
import { X, Plus, Loader2 } from 'lucide-react';
import { matchesAPI } from '../../api';
import { useToast } from '../../components/common/Toast';
import type { Tournament } from '../../types';

interface Props {
  tournament: Tournament;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateMatchModal({ tournament, onClose, onCreated }: Props) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [propSchoolId, setPropSchoolId] = useState('');
  const [oppSchoolId, setOppSchoolId] = useState('');
  const [topic, setTopic] = useState('');
  const [selectedJudgeIds, setSelectedJudgeIds] = useState<number[]>([]);

  const toggleJudge = (judgeId: number) => {
    setSelectedJudgeIds(prev =>
      prev.includes(judgeId) ? prev.filter(id => id !== judgeId) : [...prev, judgeId]
    );
  };

  const handleCreate = async () => {
    if (!propSchoolId || !oppSchoolId || !topic) {
      showToast('Please fill all required fields', 'error'); return;
    }
    if (propSchoolId === oppSchoolId) {
      showToast('Proposition and opposition schools cannot be the same', 'error'); return;
    }
    setLoading(true);
    try {
      await matchesAPI.create({
        tournamentId: tournament.id,
        propositionSchoolId: parseInt(propSchoolId),
        oppositionSchoolId: parseInt(oppSchoolId),
        topic,
        judgeIds: selectedJudgeIds,
      });
      showToast('Match created successfully!', 'success');
      onCreated();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to create match', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-dark rounded-2xl w-full max-w-lg border border-white/10 shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h3 className="text-lg font-bold text-white">Create Match</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Proposition School *</label>
            <select value={propSchoolId} onChange={e => setPropSchoolId(e.target.value)} className="input-field">
              <option className="bg-gray-800" value="">Select school</option>
              {tournament.schools?.map(s => (
                <option className="bg-gray-800" key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Opposition School *</label>
            <select value={oppSchoolId} onChange={e => setOppSchoolId(e.target.value)} className="input-field">
              <option className="bg-gray-800" value="">Select school</option>
              {tournament.schools?.map(s => (
                <option className="bg-gray-800" key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Topic / Motion *</label>
            <input value={topic} onChange={e => setTopic(e.target.value)}
              placeholder="This house believes that..." className="input-field" />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Assign Judges</label>
            <div className="space-y-2">
              {tournament.judges?.map(tj => (
                <button key={tj.id} type="button"
                  onClick={() => toggleJudge(tj.judge.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${selectedJudgeIds.includes(tj.judge.id)
                    ? 'bg-blue-500/20 border-blue-500/50'
                    : 'glass border-white/10 hover:border-white/20'
                    }`}>
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${selectedJudgeIds.includes(tj.judge.id) ? 'bg-blue-500 border-blue-500' : 'border-white/30'
                    }`}>
                    {selectedJudgeIds.includes(tj.judge.id) && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{tj.judge.fullName}</p>
                    <p className="text-xs text-gray-400">{tj.judgeCode}</p>
                  </div>
                </button>
              )) ?? <p className="text-gray-500 text-sm">No judges added to tournament</p>}
            </div>
          </div>
        </div>
        <div className="flex gap-3 p-6 border-t border-white/10">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleCreate} disabled={loading}
            className="btn-primary flex-1 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {loading ? 'Creating...' : 'Create Match'}
          </button>
        </div>
      </div>
    </div>
  );
}
