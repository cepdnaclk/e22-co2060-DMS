import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Bell, Calendar, Settings, LogOut,
  User, LayoutDashboard, ChevronDown, Menu, X, Swords, MessageCircleMore,
  Award
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toAbsoluteAvatarUrl } from '../../utils/avatarUrl';
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
  const publicLinks = [
    { label: 'Tournaments', to: '/' },
    { label: 'Forums', to: '/forum' },
    { label: 'Rankings', to: '/scoring' },
    { label: 'About', to: '/about' },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/92 backdrop-blur-xl border-b border-slate-300">
        <div className="editorial-shell">
          <div className="flex items-center justify-between h-[76px] gap-5">
            <Link to="/" className="flex items-center gap-3 flex-shrink-0">
              <img src="/logo.png" alt="VIVAATHI" className="w-10 h-10 object-contain border border-[#06192b]/20" />
              <span className="font-display font-bold text-2xl text-[#06192b] tracking-normal hidden sm:block">VIVAATHI</span>
            </Link>

            <div className="hidden lg:flex items-center gap-8">
              {publicLinks.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) => `nav-link ${isActive ? 'text-[#06192b] after:w-full' : ''}`}
                >
                  {link.label}
                </NavLink>
              ))}
            </div>

            <div className="hidden md:block flex-1 max-w-[320px]">
              <SearchBar />
            </div>

            <div className="flex items-center gap-4">
              {isAuthenticated && user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 focus:outline-none"
                  >
                    {user.profilePictureUrl ? (
                      <img src={toAbsoluteAvatarUrl(user.profilePictureUrl)} alt={user.fullName}
                        className="w-10 h-10 rounded-none object-cover border border-[#06192b]" />
                    ) : (
                      <div className="w-10 h-10 rounded-none bg-[#06192b] flex items-center justify-center text-sm font-bold text-white border border-[#06192b]">
                        {avatarLetter}
                      </div>
                    )}
                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-3 w-60 z-[100] bg-white shadow-2xl border border-slate-300 py-2 animate-fade-in">
                      <div className="px-4 py-3 border-b border-slate-200">
                        <p className="text-sm font-bold text-[#06192b] truncate">{user.fullName}</p>
                        <p className="text-xs text-slate-500">@{user.username}</p>
                        <span className="mt-2 badge bg-[#eef5ff] text-[#06192b] border-slate-300">
                          {user.role}
                        </span>
                      </div>

                      <Link to={`/profile/${user.id}#diaries`} onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:text-[#06192b] hover:bg-[#eef5ff] transition-colors">
                        <Award className="w-4 h-4 text-[#8a6a00]" /> My Diaries
                      </Link>
                      <Link to={getDashboardPath()} onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:text-[#06192b] hover:bg-[#eef5ff] transition-colors">
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                      </Link>
                      <Link to="/calendar" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:text-[#06192b] hover:bg-[#eef5ff] transition-colors">
                        <Calendar className="w-4 h-4" /> Calendar
                      </Link>
                      <Link to="/notifications" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:text-[#06192b] hover:bg-[#eef5ff] transition-colors">
                        <Bell className="w-4 h-4" /> Notifications
                      </Link>
                      <Link to="/messages" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:text-[#06192b] hover:bg-[#eef5ff] transition-colors">
                        <MessageCircleMore className="w-4 h-4" /> Messages
                      </Link>
                      <Link to="/settings" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:text-[#06192b] hover:bg-[#eef5ff] transition-colors">
                        <Settings className="w-4 h-4" /> Settings
                      </Link>
                      <div className="border-t border-slate-200 mt-1 pt-1">
                        <button
                          onClick={() => { setDropdownOpen(false); setLogoutModal(true); }}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-700 hover:text-red-800 hover:bg-red-50 transition-colors">
                          <LogOut className="w-4 h-4" /> Log Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/role-select"
                  className="btn-primary text-xs hidden sm:flex">
                  Sign In
                </Link>
              )}

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 text-[#06192b] hover:bg-[#eef5ff] transition-colors border border-slate-300">
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden bg-white border-t border-slate-300 px-4 py-4 space-y-3 animate-fade-in">
            <div className="mb-4">
              <SearchBar />
            </div>
            {publicLinks.map(link => (
              <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)} className="block text-[#06192b] font-bold py-2">
                {link.label}
              </Link>
            ))}
            {isAuthenticated && user && (
              <>
                <Link to={`/profile/${user.id}#diaries`} onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-[#8a6a00] py-2 font-semibold">
                  <Award className="w-4 h-4" /> My Diaries
                </Link>
                <Link to="/messages" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-[#06192b] py-2 font-semibold">
                  <MessageCircleMore className="w-4 h-4" /> Messages
                </Link>
              </>
            )}
            {!isAuthenticated && (
              <Link to="/role-select" onClick={() => setMobileOpen(false)}
                className="btn-primary text-xs inline-flex mt-2">
                <User className="w-4 h-4" /> Sign In
              </Link>
            )}
          </div>
        )}
      </nav>

      <LogoutModal isOpen={logoutModal} onClose={() => setLogoutModal(false)} />
    </>
  );
}
