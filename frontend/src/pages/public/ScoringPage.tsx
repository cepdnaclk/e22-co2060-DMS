import { Brain, MessageSquare, Layout, Repeat, Users, Award, ChevronRight, Info } from 'lucide-react';

const criteria = [
  {
    icon: Brain,
    name: 'Matter',
    color: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-500/10 border-blue-500/20',
    desc: 'The content of the debate — arguments, evidence, logic, and relevance to the motion.',
    points: ['Quality of arguments', 'Use of evidence', 'Logical reasoning', 'Relevance to topic'],
    maxScore: 40,
  },
  {
    icon: MessageSquare,
    name: 'Manner',
    color: 'from-violet-500 to-purple-500',
    bg: 'bg-violet-500/10 border-violet-500/20',
    desc: 'The delivery of the speech — tone, confidence, body language, and audience engagement.',
    points: ['Confidence & poise', 'Eye contact', 'Voice modulation', 'Persuasiveness'],
    maxScore: 40,
  },
  {
    icon: Layout,
    name: 'Method',
    color: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    desc: 'The structure and organization of arguments within the speech.',
    points: ['Clear structure', 'Time management', 'Team strategy', 'Logical flow'],
    maxScore: 40,
  },
  {
    icon: Repeat,
    name: 'Rebuttal',
    color: 'from-rose-500 to-pink-500',
    bg: 'bg-rose-500/10 border-rose-500/20',
    desc: 'The ability to effectively respond to and counter opposing arguments.',
    points: ['Direct responses', 'Counter-arguments', 'Clash engagement', 'Quick thinking'],
    maxScore: 30,
  },
  {
    icon: Users,
    name: 'Teamwork',
    color: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-500/10 border-amber-500/20',
    desc: 'How well the team works together — consistency, support, and unified messaging.',
    points: ['Consistency', 'Support for teammates', 'Unified messaging', 'Coordination'],
    maxScore: 30,
  },
];

export default function ScoringPage() {
  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-blue-500/30 text-blue-400 text-sm font-medium mb-6">
            <Award className="w-4 h-4" /> Scoring System
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">
            How Debate Scoring Works
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Our transparent, multi-criteria scoring system ensures fair and comprehensive evaluation of every debater.
          </p>
        </div>

        {/* Algorithm Visual */}
        <div className="card border-blue-500/20 bg-gradient-to-br from-blue-600/5 to-violet-600/5 mb-12">
          <div className="text-center">
            <h2 className="text-xl font-bold text-white mb-6">Scoring Algorithm</h2>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {criteria.map((c, i) => (
                <div key={c.name} className="flex items-center gap-2">
                  <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${c.bg}`}>
                    <c.icon className="w-4 h-4 text-white/80" />
                    <span className="text-sm font-semibold text-white">{c.name}</span>
                    <span className="text-xs text-gray-400">/{c.maxScore}</span>
                  </div>
                  {i < criteria.length - 1 && <span className="text-gray-600">+</span>}
                </div>
              ))}
              <span className="text-gray-400 font-bold">=</span>
              <div className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 border border-blue-500/50">
                <span className="text-sm font-bold text-white">Total Score /180</span>
              </div>
            </div>
          </div>
        </div>

        {/* Winner Logic */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {[
            { step: '01', title: 'Judges Score', desc: 'Each assigned judge fills out score sheets for all speakers from both teams.' },
            { step: '02', title: 'Average Calculated', desc: 'System averages proposition & opposition totals across all submitted score sheets.' },
            { step: '03', title: 'Winner Declared', desc: 'Team with the higher average score wins. Best speaker determined by most judge votes.' },
          ].map(step => (
            <div key={step.step} className="card">
              <span className="text-4xl font-black gradient-text">{step.step}</span>
              <h3 className="font-bold text-white mt-2 mb-1">{step.title}</h3>
              <p className="text-gray-400 text-sm">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Criteria Cards */}
        <h2 className="text-2xl font-bold text-white mb-6">Evaluation Criteria</h2>
        <div className="grid grid-cols-1 gap-6">
          {criteria.map(c => (
            <div key={c.name} className="card group">
              <div className="flex flex-col sm:flex-row gap-5">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${c.color} flex items-center justify-center flex-shrink-0 shadow-xl`}>
                  <c.icon className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-white">{c.name}</h3>
                    <span className={`badge border ${c.bg} text-white`}>Max {c.maxScore} pts</span>
                  </div>
                  <p className="text-gray-400 text-sm mb-4">{c.desc}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {c.points.map(p => (
                      <div key={p} className="flex items-center gap-2 text-sm text-gray-300">
                        <ChevronRight className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                        {p}
                      </div>
                    ))}
                  </div>
                  {/* Score bar */}
                  <div className="mt-4">
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${c.color} rounded-full`}
                        style={{ width: `${(c.maxScore / 40) * 100}%` }} />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-600">0</span>
                      <span className="text-xs text-gray-600">{c.maxScore}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info note */}
        <div className="mt-8 flex items-start gap-3 glass rounded-xl p-4 border border-blue-500/20">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-400 mb-1">Custom Criteria</p>
            <p className="text-sm text-gray-400">
              Organizers can customize scoring criteria, adjust maximum marks, and add or remove criteria when setting up their tournament score sheet template.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
