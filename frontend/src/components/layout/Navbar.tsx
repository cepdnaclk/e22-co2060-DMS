import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trophy, Search, Bell, Calendar, Settings, LogOut,
  User, LayoutDashboard, ChevronDown, Menu, X, Swords
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LogoutModal from '../common/LogoutModal';
import SearchBar from '../common/SearchBar';

export default function Navbar() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const getDashboardPath = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'DEBATER': return '/dashboard/debater';
      case 'JUDGE': return '/dashboard/judge';
      case 'ORGANIZER': return '/dashboard/organizer';
      default: return '/';
    }
  };

  const avatarLetter = user?.fullName?.[0]?.toUpperCase() || 'U';

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 glass-dark border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                <Swords className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-white hidden sm:block">DebateMS</span>
            </Link>

            {/* Search Bar - Center */}
            <div className="flex-1 max-w-md hidden md:block">
              <SearchBar />
            </div>

            {/* Nav Links */}
            <div className="hidden lg:flex items-center gap-6">
              <Link to="/" className="nav-link text-sm">Home</Link>
              <Link to="/scoring" className="nav-link text-sm">Scoring</Link>
              <Link to="/about" className="nav-link text-sm">About Us</Link>
              <Link to="/news" className="nav-link text-sm">News</Link>
            </div>

            {/* Right: Auth */}
            <div className="flex items-center gap-3">
              {isAuthenticated && user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 focus:outline-none"
                  >
                    {user.profilePictureUrl ? (
                      <img src={user.profilePictureUrl} alt={user.fullName}
                        className="w-9 h-9 rounded-full object-cover border-2 border-blue-500/50" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-sm font-bold text-white border-2 border-blue-500/50">
                        {avatarLetter}
                      </div>
                    )}
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 glass-dark rounded-2xl shadow-2xl border border-white/10 py-2 animate-fade-in">
                      <div className="px-4 py-3 border-b border-white/10">
                        <p className="text-sm font-semibold text-white truncate">{user.fullName}</p>
                        <p className="text-xs text-gray-400">@{user.username}</p>
                        <span className="mt-1 inline-block text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          {user.role}
                        </span>
                      </div>
                      <Link to={getDashboardPath()} onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                      </Link>
                      <Link to="/calendar" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
                        <Calendar className="w-4 h-4" /> Calendar
                      </Link>
                      <Link to="/notifications" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
                        <Bell className="w-4 h-4" /> Notifications
                      </Link>
                      <Link to="/settings" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
                        <Settings className="w-4 h-4" /> Settings
                      </Link>
                      <div className="border-t border-white/10 mt-1 pt-1">
                        <button
                          onClick={() => { setDropdownOpen(false); setLogoutModal(true); }}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors">
                          <LogOut className="w-4 h-4" /> Log Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/role-select"
                  className="btn-primary text-sm hidden sm:flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Log In / Sign Up
                </Link>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors">
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden glass-dark border-t border-white/10 px-4 py-4 space-y-3 animate-fade-in">
            <div className="mb-4">
              <SearchBar />
            </div>
            <Link to="/" onClick={() => setMobileOpen(false)} className="block text-gray-300 hover:text-white py-2">Home</Link>
            <Link to="/scoring" onClick={() => setMobileOpen(false)} className="block text-gray-300 hover:text-white py-2">Scoring</Link>
            <Link to="/about" onClick={() => setMobileOpen(false)} className="block text-gray-300 hover:text-white py-2">About Us</Link>
            <Link to="/news" onClick={() => setMobileOpen(false)} className="block text-gray-300 hover:text-white py-2">News</Link>
            {!isAuthenticated && (
              <Link to="/role-select" onClick={() => setMobileOpen(false)}
                className="btn-primary text-sm inline-flex items-center gap-2 mt-2">
                <User className="w-4 h-4" /> Log In / Sign Up
              </Link>
            )}
          </div>
        )}
      </nav>

      <LogoutModal isOpen={logoutModal} onClose={() => setLogoutModal(false)} />
    </>
  );
}
