import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronRight, ChevronLeft, Plus, Trash2, Search, X, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { tournamentsAPI, usersAPI } from '../../api';
import { useToast } from '../../components/common/Toast';
import type { User, DebateType } from '../../types';
import Avatar from '../../components/common/Avatar';

const DEBATE_TYPES: { value: DebateType; label: string }[] = [
  { value: 'TRADITIONAL', label: 'Traditional Debate' },
  { value: 'ASIAN_PARLIAMENTARY', label: 'Asian Parliamentary Debate' },
  { value: 'BRITISH_PARLIAMENTARY', label: 'British Parliamentary Debate' },
  { value: 'SULALUM_SOTPOR', label: 'Sulalum Sotpor' },
  { value: 'VAZHAKAADU_MANDRAM', label: 'Vazhakaadu Mandram' },
  { value: 'OTHER', label: 'Other' },
];

const DEFAULT_CRITERIA = JSON.stringify([
  { name: 'Matter', maxMarks: 40 },
  { name: 'Manner', maxMarks: 40 },
  { name: 'Method', maxMarks: 40 },
  { name: 'Rebuttal', maxMarks: 30 },
  { name: 'Teamwork', maxMarks: 30 },
]);

interface SchoolInput {
  name: string;
  debaters: User[];
}

interface CriteriaRow {
  name: string;
  maxMarks: number;
}

export default function CreateTournamentWizard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1
  const [name, setName] = useState('');
  const [debateType, setDebateType] = useState<DebateType>('TRADITIONAL');
  const [customDebateType, setCustomDebateType] = useState('');

  // Step 2
  const [tournamentType, setTournamentType] = useState<'LEAGUE' | 'KNOCKOUT'>('KNOCKOUT');
  const [numberOfLeagues, setNumberOfLeagues] = useState(2);

  // Step 3
  const [schools, setSchools] = useState<SchoolInput[]>([{ name: '', debaters: [] }]);
  const [debaterSearch, setDebaterSearch] = useState('');
  const [debaterResults, setDebaterResults] = useState<User[]>([]);
  const [activeSchoolIndex, setActiveSchoolIndex] = useState<number | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // Step 4
  const [judges, setJudges] = useState<User[]>([]);
  const [judgeSearch, setJudgeSearch] = useState('');
  const [judgeResults, setJudgeResults] = useState<User[]>([]);
  const [judgeSearchLoading, setJudgeSearchLoading] = useState(false);

  // Step 5
  const [criteria, setCriteria] = useState<CriteriaRow[]>(JSON.parse(DEFAULT_CRITERIA));

  const searchDebaters = async (q: string) => {
    if (!q.trim()) { setDebaterResults([]); return; }
    setSearchLoading(true);
    try {
      const { data } = await usersAPI.searchDebaters(q);
      setDebaterResults(data);
    } finally {
      setSearchLoading(false);
    }
  };

  const searchJudges = async (q: string) => {
    if (!q.trim()) { setJudgeResults([]); return; }
    setJudgeSearchLoading(true);
    try {
      const { data } = await usersAPI.searchJudges(q);
      setJudgeResults(data);
    } finally {
      setJudgeSearchLoading(false);
    }
  };

  const addDebaterToSchool = (schoolIndex: number, debater: User) => {
    const allDebaters = schools.flatMap(s => s.debaters.map(d => d.id));
    if (allDebaters.includes(debater.id)) {
      showToast('This debater is already assigned to a school', 'error');
      return;
    }
    setSchools(prev => prev.map((s, i) =>
      i === schoolIndex ? { ...s, debaters: [...s.debaters, debater] } : s
    ));
    setDebaterSearch('');
    setDebaterResults([]);
  };

  const removeDebater = (schoolIndex: number, debaterId: number) => {
    setSchools(prev => prev.map((s, i) =>
      i === schoolIndex ? { ...s, debaters: s.debaters.filter(d => d.id !== debaterId) } : s
    ));
  };

  const addJudge = (judge: User) => {
    if (judges.find(j => j.id === judge.id)) {
      showToast('Judge already added', 'error'); return;
    }
    setJudges(prev => [...prev, judge]);
    setJudgeSearch('');
    setJudgeResults([]);
  };

  const handleCreate = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const payload = {
        name,
        debateType,
        customDebateType: debateType === 'OTHER' ? customDebateType : undefined,
        tournamentType,
        numberOfLeagues: tournamentType === 'LEAGUE' ? numberOfLeagues : undefined,
        schools: schools.map(s => ({ name: s.name, debaterIds: s.debaters.map(d => d.id) })),
        judgeIds: judges.map(j => j.id),
        scoreTemplate: {
          name: 'Default Score Sheet',
          criteriaJson: JSON.stringify(criteria),
        },
      };
      const { data } = await tournamentsAPI.create(payload);
      showToast('Tournament created successfully!', 'success');
      navigate(`/tournament/${data.id}`);
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to create tournament', 'error');
    } finally {
      setLoading(false);
    }
  };

  const steps = ['Basic Details', 'Type', 'Schools & Debaters', 'Judges', 'Score Sheet', 'Review'];

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-black text-white mb-2">Create Tournament</h1>
        <p className="text-gray-400 text-sm mb-8">Set up your tournament step by step</p>

        {/* Stepper */}
        <div className="flex items-center mb-8 overflow-x-auto scrollbar-hide pb-2">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center flex-shrink-0">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold border-2 transition-all ${
                i + 1 < step ? 'bg-green-500 border-green-500 text-white' :
                i + 1 === step ? 'bg-blue-600 border-blue-500 text-white' :
                'border-white/20 text-gray-500'}`}>
                {i + 1 < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`ml-2 text-xs font-medium hidden sm:block ${i + 1 === step ? 'text-white' : 'text-gray-500'}`}>
                {s}
              </span>
              {i < steps.length - 1 && (
                <div className={`w-8 sm:w-12 h-0.5 mx-2 ${i + 1 < step ? 'bg-green-500' : 'bg-white/10'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="card overflow-visible space-y-5">
          {/* Step 1 */}
          {step === 1 && (
            <>
              <h2 className="text-lg font-bold text-white">Tournament Basic Details</h2>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Tournament Name *</label>
                <input value={name} onChange={e => setName(e.target.value)}
                  placeholder="e.g. National Inter-University Championship 2024"
                  className="input-field" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Type of Debate *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {DEBATE_TYPES.map(dt => (
                    <button key={dt.value} onClick={() => setDebateType(dt.value)}
                      className={`text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                        debateType === dt.value
                          ? 'bg-blue-600/30 border-blue-500 text-white'
                          : 'glass border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                      }`}>
                      {dt.label}
                    </button>
                  ))}
                </div>
              </div>
              {debateType === 'OTHER' && (
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Specify Debate Type</label>
                  <input value={customDebateType} onChange={e => setCustomDebateType(e.target.value)}
                    placeholder="Enter debate type" className="input-field" />
                </div>
              )}
            </>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <>
              <h2 className="text-lg font-bold text-white">Tournament Type</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: 'KNOCKOUT', title: 'Knockout', desc: 'Single elimination. Winners advance, losers are eliminated.' },
                  { value: 'LEAGUE', title: 'League', desc: 'Round-robin style. All teams play multiple matches.' },
                ].map(t => (
                  <button key={t.value} onClick={() => setTournamentType(t.value as any)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      tournamentType === t.value
                        ? 'bg-blue-600/20 border-blue-500 text-white'
                        : 'glass border-white/10 text-gray-400 hover:border-white/20'
                    }`}>
                    <p className="font-bold text-base mb-1">{t.title}</p>
                    <p className="text-xs text-gray-400">{t.desc}</p>
                  </button>
                ))}
              </div>
              {tournamentType === 'LEAGUE' && (
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Number of Leagues/Groups</label>
                  <input type="number" value={numberOfLeagues}
                    onChange={e => setNumberOfLeagues(parseInt(e.target.value))}
                    min={1} max={10} className="input-field w-32" />
                </div>
              )}
            </>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Schools & Debaters</h2>
                <button onClick={() => setSchools(p => [...p, { name: '', debaters: [] }])}
                  className="btn-secondary text-sm flex items-center gap-1 py-1.5 px-3">
                  <Plus className="w-3.5 h-3.5" /> Add School
                </button>
              </div>
              <div className="space-y-4 overflow-visible pr-1">
                {schools.map((school, si) => (
                  <div key={si} className={`rounded-xl p-4 space-y-3 border border-white/10 transition-all ${activeSchoolIndex === si ? 'relative z-50 bg-gray-800' : 'relative z-0 bg-gray-800/80'}`}>
                    <div className="flex items-center gap-2">
                      <input value={school.name}
                        onChange={e => setSchools(p => p.map((s, i) => i === si ? { ...s, name: e.target.value } : s))}
                        placeholder={`School ${si + 1} name`} className="input-field text-sm flex-1" />
                      {schools.length > 1 && (
                        <button onClick={() => setSchools(p => p.filter((_, i) => i !== si))}
                          className="text-red-400 hover:text-red-300 p-2">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Debater search for this school */}
                    <div className="relative">
                      <div className="flex gap-2">
                        <input
                          value={activeSchoolIndex === si ? debaterSearch : ''}
                          onChange={e => {
                            setDebaterSearch(e.target.value);
                            setActiveSchoolIndex(si);
                            searchDebaters(e.target.value);
                          }}
                          onFocus={() => setActiveSchoolIndex(si)}
                          placeholder="Search debaters..."
                          className="input-field text-sm flex-1"
                        />
                        <button onClick={() => { setDebaterSearch(''); setDebaterResults([]); }}
                          className="text-gray-500 hover:text-gray-300 p-2">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      {activeSchoolIndex === si && debaterResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900 rounded-md border border-gray-700 shadow-[0_4px_20px_rgba(0,0,0,0.5)] z-[100] max-h-60 overflow-y-auto">
                          {debaterResults.map(d => (
                            <button key={d.id} onClick={() => addDebaterToSchool(si, d)}
                              className="w-full flex items-center gap-3 p-3 hover:bg-white/10 transition-colors text-left">
                              <Avatar name={d.fullName} src={d.profilePictureUrl} size="sm" />
                              <div>
                                <p className="text-sm font-medium text-white">{d.fullName}</p>
                                <p className="text-xs text-gray-400">@{d.username}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Selected debaters */}
                    {school.debaters.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {school.debaters.map(d => (
                          <div key={d.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/20 border border-blue-500/30 text-sm text-blue-400">
                            {d.fullName}
                            <button onClick={() => removeDebater(si, d.id)}>
                              <X className="w-3.5 h-3.5 hover:text-red-400 transition-colors" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Step 4 */}
          {step === 4 && (
            <>
              <h2 className="text-lg font-bold text-white">Judges</h2>
              <div className="relative">
                <input value={judgeSearch}
                  onChange={e => { setJudgeSearch(e.target.value); searchJudges(e.target.value); }}
                  placeholder="Search judges..." className="input-field" />
                {judgeResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900 rounded-md border border-gray-700 shadow-xl z-[100] max-h-48 overflow-y-auto">
                    {judgeResults.map(j => (
                      <button key={j.id} onClick={() => addJudge(j)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-white/10 transition-colors text-left">
                        <Avatar name={j.fullName} src={j.profilePictureUrl} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-white">{j.fullName}</p>
                          <p className="text-xs text-gray-400">@{j.username} · Judge</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {judges.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-400">{judges.length} judge(s) added</p>
                  {judges.map((j, i) => (
                    <div key={j.id} className="flex items-center gap-3 glass rounded-xl p-3">
                      <span className="text-xs font-mono text-gray-500 w-20 flex-shrink-0">
                        JUDGE-{String(i + 1).padStart(3, '0')}
                      </span>
                      <Avatar name={j.fullName} src={j.profilePictureUrl} size="sm" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{j.fullName}</p>
                        <p className="text-xs text-gray-400">@{j.username}</p>
                      </div>
                      <button onClick={() => setJudges(p => p.filter(x => x.id !== j.id))}
                        className="text-red-400 hover:text-red-300 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-6">Search and add judges above</p>
              )}
            </>
          )}

          {/* Step 5: Score Sheet Setup */}
          {step === 5 && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Score Sheet Setup</h2>
                <button onClick={() => setCriteria(p => [...p, { name: '', maxMarks: 40 }])}
                  className="btn-secondary text-sm flex items-center gap-1 py-1.5 px-3">
                  <Plus className="w-3.5 h-3.5" /> Add Criteria
                </button>
              </div>
              <p className="text-sm text-gray-400">Customize scoring criteria for this tournament</p>
              <div className="space-y-2">
                {criteria.map((c, i) => (
                  <div key={i} className="flex items-center gap-3 glass rounded-xl p-3">
                    <input value={c.name}
                      onChange={e => setCriteria(p => p.map((x, j) => j === i ? { ...x, name: e.target.value } : x))}
                      placeholder="Criteria name" className="input-field flex-1 text-sm py-2" />
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Max</span>
                      <input type="number" value={c.maxMarks}
                        onChange={e => setCriteria(p => p.map((x, j) => j === i ? { ...x, maxMarks: parseInt(e.target.value) } : x))}
                        className="input-field w-20 text-sm py-2" min={1} />
                    </div>
                    <button onClick={() => setCriteria(p => p.filter((_, j) => j !== i))}
                      className="text-red-400 hover:text-red-300 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-gray-400">Total maximum marks:</span>
                <span className="font-bold text-white">{criteria.reduce((a, c) => a + c.maxMarks, 0)}</span>
              </div>
            </>
          )}

          {/* Step 6: Review */}
          {step === 6 && (
            <>
              <h2 className="text-lg font-bold text-white">Review & Create</h2>
              <div className="space-y-3">
                {[
                  { label: 'Tournament Name', value: name },
                  { label: 'Debate Type', value: debateType === 'OTHER' ? customDebateType : debateType.replace(/_/g, ' ') },
                  { label: 'Tournament Type', value: tournamentType },
                  { label: 'Schools', value: `${schools.length} schools, ${schools.reduce((a, s) => a + s.debaters.length, 0)} debaters` },
                  { label: 'Judges', value: `${judges.length} judges` },
                  { label: 'Score Criteria', value: `${criteria.length} criteria, ${criteria.reduce((a, c) => a + c.maxMarks, 0)} total marks` },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between py-2 border-b border-white/5">
                    <span className="text-sm text-gray-400">{item.label}</span>
                    <span className="text-sm font-semibold text-white">{item.value}</span>
                  </div>
                ))}
                <div className="mt-2">
                  <p className="text-sm text-gray-400 mb-2">Schools:</p>
                  {schools.map((s, i) => (
                    <div key={i} className="glass rounded-xl p-3 mb-2">
                      <p className="text-sm font-medium text-white">{s.name || `School ${i + 1}`}</p>
                      <p className="text-xs text-gray-400">{s.debaters.map(d => d.fullName).join(', ') || 'No debaters'}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-4 border-t border-white/10">
            <button onClick={() => setStep(p => p - 1)} disabled={step === 1}
              className="btn-secondary flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            {step < 6 ? (
              <button onClick={() => {
                if (step === 1 && !name) { showToast('Please enter tournament name', 'error'); return; }
                setStep(p => p + 1);
              }} className="btn-primary flex items-center gap-2">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleCreate} disabled={loading}
                className="btn-primary flex items-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {loading ? 'Creating...' : 'Create Tournament'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
