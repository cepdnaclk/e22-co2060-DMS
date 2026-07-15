import { useNavigate } from 'react-router-dom';
import { ArrowRight, Briefcase, Mic, Scale } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { Role } from '../../types';

const roles = [
  {
    id: 'DEBATER' as Role,
    icon: Mic,
    title: 'Debater',
    desc: 'Participate in tournaments, track wins, join forums, and build your debate record.',
    perks: ['Tournament entry', 'Rankings', 'Debate diary'],
  },
  {
    id: 'JUDGE' as Role,
    icon: Scale,
    title: 'Judge',
    desc: 'Adjudicate matches, submit digital scoresheets, and manage verdict history.',
    perks: ['Score sheets', 'Room notes', 'Best speaker voting'],
  },
  {
    id: 'ORGANIZER' as Role,
    icon: Briefcase,
    title: 'Organizer',
    desc: 'Create tournaments, assign judges, manage rounds, and publish results.',
    perks: ['Tournament setup', 'Match control', 'Live oversight'],
  },
];

export default function RoleSelectionPage() {
  const navigate = useNavigate();
  const { setSelectedRole } = useAuth();

  const handleSelect = (role: Role) => {
    setSelectedRole(role);
    navigate('/login');
  };

  return (
    <div className="min-h-screen page-bg flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-7">
            <img src="/logo.png" alt="VIVAATHI" className="w-12 h-12 border border-[#06192b]/20" />
            <span className="font-display text-3xl font-bold text-[#06192b]">VIVAATHI</span>
          </div>
          <p className="eyebrow text-slate-500 mb-4">Access Desk</p>
          <h1 className="font-display text-5xl font-bold text-[#06192b]">How will you participate?</h1>
          <p className="text-slate-600 mt-4">Choose your role to enter the correct tournament workflow.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((role, index) => (
            <button
              key={role.id}
              onClick={() => handleSelect(role.id)}
              className={`group paper-panel text-left p-7 hover:border-[#06192b] hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(6,25,43,0.08)] transition-all ${
                index === 1 ? 'bg-[#06192b] text-white border-[#06192b]' : ''
              }`}
            >
              <div className={`w-14 h-14 border flex items-center justify-center mb-8 ${
                index === 1 ? 'bg-[#102a43] border-white/15 text-[#fff0bd]' : 'bg-[#eef5ff] border-slate-300 text-[#06192b]'
              }`}>
                <role.icon className="w-7 h-7" />
              </div>
              <p className={`eyebrow mb-3 ${index === 1 ? 'text-slate-300' : 'text-slate-500'}`}>0{index + 1}</p>
              <h3 className={`font-display text-3xl font-bold ${index === 1 ? 'text-white' : 'text-[#06192b]'}`}>{role.title}</h3>
              <p className={`mt-4 text-sm leading-7 ${index === 1 ? 'text-slate-300' : 'text-slate-600'}`}>{role.desc}</p>
              <ul className="mt-6 space-y-2">
                {role.perks.map(perk => (
                  <li key={perk} className={`text-sm ${index === 1 ? 'text-slate-200' : 'text-slate-600'}`}>
                    / {perk}
                  </li>
                ))}
              </ul>
              <div className={`mt-8 inline-flex items-center gap-3 text-xs font-bold uppercase tracking-widest ${
                index === 1 ? 'text-[#fff0bd]' : 'text-[#06192b]'
              }`}>
                Continue <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>

        <p className="text-center text-slate-600 text-sm mt-8">
          Already have an account?{' '}
          <button onClick={() => navigate('/login')} className="font-bold text-[#06192b] underline underline-offset-4">
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
