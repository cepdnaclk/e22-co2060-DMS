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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-dark rounded-2xl p-6 w-full max-w-sm border border-white/10 shadow-2xl animate-slide-up">
        <button onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
            <LogOut className="w-7 h-7 text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Log Out</h3>
            <p className="text-gray-400 text-sm mt-1">
              Are you sure you want to log out of your account?
            </p>
          </div>
          <div className="flex gap-3 w-full">
            <button onClick={onClose} className="btn-secondary flex-1 text-sm">Cancel</button>
            <button onClick={handleLogout} className="btn-danger flex-1 text-sm">Log Out</button>
          </div>
        </div>
      </div>
    </div>
  );
}
