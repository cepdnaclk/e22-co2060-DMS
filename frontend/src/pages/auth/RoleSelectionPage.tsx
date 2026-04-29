import { useNavigate } from 'react-router-dom';
import { Mic, Scale, Briefcase, ArrowRight, Swords } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { Role } from '../../types';

const roles = [
  {
    id: 'DEBATER' as Role,
    icon: Mic,
    title: 'Debater',
    desc: 'Participate in tournaments, track your wins, and build your debate career.',
    color: 'from-blue-500 to-cyan-500',
    border: 'hover:border-blue-500/50',
    glow: 'hover:shadow-blue-500/20',
    perks: ['Join tournaments', 'Track stats & rankings', 'Earn awards', 'Discussion access'],
  },
  {
    id: 'JUDGE' as Role,
    icon: Scale,
    title: 'Judge',
    desc: 'Adjudicate matches, submit digital score sheets, and shape debate outcomes.',
    color: 'from-violet-500 to-purple-500',
    border: 'hover:border-violet-500/50',
    glow: 'hover:shadow-violet-500/20',
    perks: ['Score matches digitally', 'Select best speakers', 'View judging history', 'Earn certificates'],
  },
  {
    id: 'ORGANIZER' as Role,
    icon: Briefcase,
    title: 'Organizer',
    desc: 'Create and manage tournaments, set up score sheets, and oversee all matches.',
    color: 'from-emerald-500 to-teal-500',
    border: 'hover:border-emerald-500/50',
    glow: 'hover:shadow-emerald-500/20',
    perks: ['Create tournaments', 'Manage matchups', 'Assign judges', 'View all results'],
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
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2.5 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-xl">
              <Swords className="w-6 h-6 text-white" />
            </div>
            <span className="font-black text-2xl text-white">DebateMS</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">
            How will you participate?
          </h1>
          <p className="text-gray-400 text-lg">Choose your role to get started</p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map(role => (
            <button
              key={role.id}
              onClick={() => handleSelect(role.id)}
              className={`group card text-left border border-white/10 ${role.border} ${role.glow} hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer`}
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${role.color} flex items-center justify-center mb-5 shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                <role.icon className="w-7 h-7 text-white" />
              </div>

              <h3 className="text-xl font-bold text-white mb-2">{role.title}</h3>
              <p className="text-gray-400 text-sm mb-5 leading-relaxed">{role.desc}</p>

              <ul className="space-y-2 mb-6">
                {role.perks.map(p => (
                  <li key={p} className="flex items-center gap-2 text-sm text-gray-300">
                    <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${role.color}`} />
                    {p}
                  </li>
                ))}
              </ul>

              <div className={`flex items-center gap-2 text-sm font-semibold bg-gradient-to-r ${role.color} bg-clip-text text-transparent group-hover:gap-3 transition-all duration-200`}>
                Continue as {role.title} <ArrowRight className="w-4 h-4 text-current opacity-70" />
              </div>
            </button>
          ))}
        </div>

        <p className="text-center text-gray-500 text-sm mt-8">
          Already have an account?{' '}
          <button onClick={() => navigate('/login')}
            className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
