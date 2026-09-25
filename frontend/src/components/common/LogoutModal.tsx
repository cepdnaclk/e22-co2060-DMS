import { LogOut, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function LogoutModal({ isOpen, onClose }: Props) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#06192b]/75 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-[#06192b] rounded-2xl p-6 w-full max-w-sm border border-slate-700 shadow-2xl animate-slide-up text-white z-10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center gap-4">
          <div className="relative">
            <img src="/logo.png" alt="VIVAATHI" className="w-16 h-16 rounded-2xl border border-white/20 shadow-xl object-contain bg-white p-1" />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-red-600 border-2 border-[#06192b] flex items-center justify-center shadow-lg">
              <LogOut className="w-4 h-4 text-white" />
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white tracking-wide">Log Out</h3>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Are you sure you want to log out of your account?
            </p>
          </div>

          <div className="flex gap-3 w-full mt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-600 bg-slate-800/80 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-red-600/30 active:scale-95"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
