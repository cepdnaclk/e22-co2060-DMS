import { Award, BarChart3, Brain, CheckCircle, Layout, MessageSquare, Repeat, Users } from 'lucide-react';

const criteria = [
  {
    name: 'Matter',
    desc: 'Substance, evidence, and logical construction of the argument.',
    focus: 'Quality of Arguments',
    score: 32,
    maxScore: 40,
    details: ['Logical Reasoning', 'Rebuttal Strength'],
  },
  {
    name: 'Manner',
    desc: 'Elocution, persuasion, body language, and rhetorical flair.',
    focus: 'Presentation Impact',
    score: 36,
    maxScore: 40,
    details: ['Voice & Pace', 'Rhetorical Style'],
  },
  {
    name: 'Method',
    desc: 'Structure of the speech, timing, and fulfilment of the role.',
    focus: 'Structural Integrity',
    score: 28,
    maxScore: 40,
    details: ['Team Structure', 'Time Discipline'],
  },
];

const fullCriteria = [
  { icon: Brain, name: 'Matter', maxScore: 40 },
  { icon: MessageSquare, name: 'Manner', maxScore: 40 },
  { icon: Layout, name: 'Method', maxScore: 40 },
  { icon: Repeat, name: 'Rebuttal', maxScore: 30 },
  { icon: Users, name: 'Teamwork', maxScore: 30 },
];

export default function ScoringPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="editorial-shell">
        <header className="border-l-4 border-[#06192b] pl-6 mb-12">
          <p className="eyebrow text-slate-500 mb-3">Final Adjudication</p>
          <h1 className="font-display text-5xl sm:text-6xl font-bold text-[#06192b]">Scoring Dashboard</h1>
          <p className="mt-3 text-slate-700">The Grand Parliamentary Debate Finals / Room 402B</p>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-7">
          <main>
            <div className="flex items-center justify-between gap-4 mb-6">
              <h2 className="font-display text-3xl font-bold text-[#06192b]">Evaluation Criteria</h2>
              <span className="badge bg-[#fff0bd] text-[#8a6a00] border-[#e8d48a]">Guidelines v4.2</span>
            </div>

            <div className="space-y-6">
              {criteria.map((criterion, index) => {
                const width = `${(criterion.score / criterion.maxScore) * 100}%`;
                return (
                  <article key={criterion.name} className="paper-panel p-7">
                    <div className="flex items-start justify-between gap-5 mb-7">
                      <div>
                        <h3 className="font-display text-2xl font-bold text-[#06192b]">{criterion.name}</h3>
                        <p className="text-slate-600 mt-1">{criterion.desc}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-[#e1c66a] font-bold">0{index + 1}</p>
                        <p className="text-sm text-slate-600 mt-2">Max Pts:</p>
                        <p className="font-display text-[#8a6a00]">{criterion.maxScore}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 mb-3">
                      <p className="font-medium text-[#06192b]">{criterion.focus}</p>
                      <p className="font-bold text-[#06192b]">{criterion.score}/{criterion.maxScore}</p>
                    </div>
                    <div className="h-1 bg-[#dbeafe]">
                      <div className="h-full bg-[#06192b]" style={{ width }} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      {criterion.details.map(detail => (
                        <div key={detail} className="border-l border-slate-300 pl-4">
                          <p className="font-medium text-[#06192b]">{detail}</p>
                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            Evaluation of clarity, evidence, pacing, and the ability to create useful clash without losing audience focus.
                          </p>
                        </div>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          </main>

          <aside className="space-y-6">
            <section className="ink-panel p-8">
              <p className="eyebrow text-slate-300 mb-10">Aggregated Score</p>
              <div className="flex items-end gap-2">
                <p className="font-display text-6xl font-bold text-white">96</p>
                <p className="text-sm text-slate-400 mb-3">/120</p>
              </div>
              <p className="text-slate-300 mt-2">Performance: Excellent</p>
              <div className="border-t border-white/15 mt-8 pt-6 grid grid-cols-3 gap-1">
                {[
                  ['Matter', 32, 'bg-white'],
                  ['Manner', 36, 'bg-[#ffe58f]'],
                  ['Method', 28, 'bg-slate-500'],
                ].map(([label, score, color]) => (
                  <div key={label as string}>
                    <p className="text-xs text-slate-300 mb-3">{label} ({score})</p>
                    <div className="h-2 bg-white/10">
                      <div className={`h-full ${color}`} style={{ width: `${Number(score) * 2.5}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="paper-panel bg-[#eef5ff] p-6">
              <h3 className="font-bold text-[#06192b] mb-4">Adjudicator Notes</h3>
              <div className="border-t border-slate-300 pt-4 flex gap-3">
                <div className="w-8 h-8 bg-[#dbeafe] flex items-center justify-center text-xs font-bold text-[#06192b]">JD</div>
                <div>
                  <p className="text-sm font-bold text-[#06192b]">Justice D'souza</p>
                  <p className="text-sm italic text-slate-600 mt-1">
                    Exceptional handling of the second cross-examination. Manner score reflects high poise under pressure.
                  </p>
                </div>
              </div>
              <button className="btn-secondary w-full mt-6 text-xs">Submit Final Verdict</button>
            </section>

            <section className="paper-panel bg-[#dbeafe] p-6">
              <h3 className="font-bold text-[#06192b] mb-5">Historical Benchmark</h3>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <p className="text-xs text-slate-600 mb-2">Tournament Average</p>
                  <p className="font-display text-xl text-[#06192b]">82.4</p>
                </div>
                <div className="border-l border-slate-300 pl-5">
                  <p className="text-xs text-slate-600 mb-2">Rank in Room</p>
                  <p className="font-display text-xl text-[#8a6a00]">#1 of 8</p>
                </div>
              </div>
            </section>
          </aside>
        </div>

        <section className="paper-panel p-8 mt-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-7">
            <div>
              <p className="eyebrow text-slate-500 mb-3">Transparent Formula</p>
              <h2 className="font-display text-3xl font-bold text-[#06192b]">How totals are calculated</h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {fullCriteria.map((item, index) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div className="border border-slate-300 bg-[#eef5ff] px-4 py-3 flex items-center gap-2">
                    <item.icon className="w-4 h-4 text-[#06192b]" />
                    <span className="text-sm font-bold text-[#06192b]">{item.name}</span>
                    <span className="text-xs text-slate-500">/{item.maxScore}</span>
                  </div>
                  {index < fullCriteria.length - 1 && <span className="text-slate-400">+</span>}
                </div>
              ))}
              <div className="border border-[#06192b] bg-[#06192b] px-4 py-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-[#fff0bd]" />
                <span className="text-sm font-bold text-white">Total /180</span>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
          {[
            ['01', 'Judges Score', 'Each assigned judge fills out score sheets for all speakers from both teams.'],
            ['02', 'Average Calculated', 'The system averages proposition and opposition totals across submitted score sheets.'],
            ['03', 'Winner Declared', 'The higher average score wins; best speaker is determined by judge votes.'],
          ].map(([step, title, desc]) => (
            <div key={step} className="paper-panel p-6">
              <CheckCircle className="w-5 h-5 text-[#8a6a00] mb-5" />
              <p className="eyebrow text-slate-500">{step}</p>
              <h3 className="font-display text-2xl font-bold text-[#06192b] mt-2">{title}</h3>
              <p className="text-sm text-slate-600 leading-6 mt-3">{desc}</p>
            </div>
          ))}
        </section>

        <div className="mt-8 flex items-start gap-3 paper-panel bg-[#eef5ff] p-5">
          <BarChart3 className="w-5 h-5 text-[#06192b] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-slate-700">
            Organizers can customize criteria, adjust maximum marks, and publish a score sheet template for each tournament format.
          </p>
        </div>
      </div>
    </div>
  );
}
