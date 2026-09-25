import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Bell, Calendar, Settings, LogOut,
  User, LayoutDashboard, ChevronDown, Menu, X, Swords, MessageCircleMore,
  Award, Home, Trophy, Search
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toAbsoluteAvatarUrl } from '../../utils/avatarUrl';
import LogoutModal from '../common/LogoutModal';
import SearchBar from '../common/SearchBar';
import { notificationsAPI } from '../../api';

export default function Navbar() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
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

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setUnreadCount(0);
      return;
    }
    const fetchUnread = () => {
      notificationsAPI.getUnreadCount()
        .then(res => setUnreadCount(res.data.count))
        .catch(() => setUnreadCount(0));
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 10000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user, location.pathname]);

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

  // Mobile Bottom Bar Tabs
  const profileOrAuthLink = isAuthenticated && user ? `/profile/${user.id}` : '/role-select';
  const bottomTabs = [
    { label: 'Home', to: '/', icon: Home },
    { label: 'Forums', to: '/forum', icon: MessageCircleMore },
    { label: 'Rankings', to: '/scoring', icon: Award },
    { 
      label: 'Notifs', 
      to: '/notifications', 
      icon: Bell, 
      badge: unreadCount > 0 ? unreadCount : undefined,
      authRequired: true 
    },
    { label: user ? 'Profile' : 'Sign In', to: profileOrAuthLink, icon: User },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-300">
        <div className="editorial-shell">
          <div className="flex items-center justify-between h-[64px] sm:h-[76px] gap-3">
            {/* Logo + Title (visible on both mobile and desktop) */}
            <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
              <img src="/logo.png" alt="VIVAATHI" className="w-8 h-8 sm:w-10 sm:h-10 object-contain border border-[#06192b]/20" />
              <span className="font-display font-bold text-lg sm:text-2xl text-[#06192b] tracking-normal">VIVAATHI</span>
            </Link>

            {/* Desktop Nav Links */}
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

            {/* Desktop Search */}
            <div className="hidden md:block flex-1 max-w-[320px]">
              <SearchBar />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              {isAuthenticated && user ? (
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Quick Notification Bell Icon */}
                  <Link
                    to="/notifications"
                    className="relative p-2 text-slate-700 hover:text-[#06192b] hover:bg-[#eef5ff] transition-colors border border-slate-300 flex items-center justify-center"
                    title="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border border-white"></span>
                      </span>
                    )}
                  </Link>

                  <div className="relative hidden sm:block" ref={dropdownRef}>
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center gap-2 focus:outline-none relative"
                    >
                      <div className="relative">
                        {user.profilePictureUrl ? (
                          <img src={toAbsoluteAvatarUrl(user.profilePictureUrl)} alt={user.fullName}
                            className="w-9 h-9 sm:w-10 sm:h-10 rounded-none object-cover border border-[#06192b]" />
                        ) : (
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-none bg-[#06192b] flex items-center justify-center text-sm font-bold text-white border border-[#06192b]">
                            {avatarLetter}
                          </div>
                        )}
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border border-white"></span>
                          </span>
                        )}
                      </div>
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
                </div>
              ) : (
                <Link to="/role-select"
                  className="btn-primary text-xs hidden sm:flex">
                  Sign In
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 text-[#06192b] hover:bg-[#eef5ff] transition-colors border border-slate-300 relative active:scale-95">
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border border-white"></span>
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Interactive Mobile Drawer Overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 top-[64px] z-50 lg:hidden flex">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-[#06192b]/60 backdrop-blur-sm animate-fade-in"
              onClick={() => setMobileOpen(false)}
            />

            {/* Slide-over Drawer Content */}
            <div className="relative ml-auto w-full max-w-xs bg-white h-[calc(100vh-64px)] shadow-2xl flex flex-col justify-between overflow-y-auto animate-slide-left z-10 border-l border-slate-300 p-5">
              <div className="space-y-5">
                {/* Search in Drawer */}
                <div>
                  <SearchBar />
                </div>

                {/* User Info Card on Mobile */}
                {isAuthenticated && user ? (
                  <div className="p-4 bg-[#eef5ff] border border-slate-300 rounded-none flex items-center gap-3">
                    {user.profilePictureUrl ? (
                      <img src={toAbsoluteAvatarUrl(user.profilePictureUrl)} alt={user.fullName}
                        className="w-11 h-11 object-cover border border-[#06192b]" />
                    ) : (
                      <div className="w-11 h-11 bg-[#06192b] text-white flex items-center justify-center font-bold text-base border border-[#06192b]">
                        {avatarLetter}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#06192b] truncate">{user.fullName}</p>
                      <p className="text-xs text-slate-500">@{user.username}</p>
                      <span className="badge bg-white text-[#06192b] border-slate-300 mt-1">
                        {user.role}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-[#eef5ff] border border-slate-300 text-center space-y-2">
                    <p className="text-xs font-bold text-[#06192b] uppercase tracking-wider">Welcome to VIVAATHI</p>
                    <p className="text-xs text-slate-500">Join academic debate circuit</p>
                    <Link 
                      to="/role-select" 
                      onClick={() => setMobileOpen(false)} 
                      className="btn-primary text-xs w-full mt-2"
                    >
                      <User className="w-4 h-4" /> Sign In / Register
                    </Link>
                  </div>
                )}

                {/* Navigation Section */}
                <div className="space-y-1">
                  <p className="eyebrow text-slate-400 px-2 py-1">Main Menu</p>
                  {publicLinks.map(link => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setMobileOpen(false)}
                      className="sidebar-item font-bold text-sm"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>

                {/* Authenticated Links */}
                {isAuthenticated && user && (
                  <div className="space-y-1 pt-2 border-t border-slate-200">
                    <p className="eyebrow text-slate-400 px-2 py-1">Your Account</p>
                    <Link
                      to={getDashboardPath()}
                      onClick={() => setMobileOpen(false)}
                      className="sidebar-item text-sm font-semibold"
                    >
                      <LayoutDashboard className="w-4 h-4 text-[#06192b]" /> Dashboard
                    </Link>
                    <Link
                      to={`/profile/${user.id}#diaries`}
                      onClick={() => setMobileOpen(false)}
                      className="sidebar-item text-sm font-semibold"
                    >
                      <Award className="w-4 h-4 text-[#8a6a00]" /> My Diaries
                    </Link>
                    <Link
                      to="/calendar"
                      onClick={() => setMobileOpen(false)}
                      className="sidebar-item text-sm font-semibold"
                    >
                      <Calendar className="w-4 h-4 text-[#06192b]" /> Calendar
                    </Link>
                    <Link
                      to="/messages"
                      onClick={() => setMobileOpen(false)}
                      className="sidebar-item text-sm font-semibold"
                    >
                      <MessageCircleMore className="w-4 h-4 text-[#06192b]" /> Messages
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setMobileOpen(false)}
                      className="sidebar-item text-sm font-semibold"
                    >
                      <Settings className="w-4 h-4 text-[#06192b]" /> Settings
                    </Link>
                  </div>
                )}
              </div>

              {/* Bottom Actions inside Drawer */}
              {isAuthenticated && user && (
                <div className="pt-4 border-t border-slate-200 pb-6">
                  <button
                    onClick={() => { setMobileOpen(false); setLogoutModal(true); }}
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-red-50 text-red-700 hover:bg-red-100 font-bold text-xs uppercase tracking-wider border border-red-200 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Sleek Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-300 shadow-[0_-4px_20px_rgba(6,25,43,0.08)] pb-safe">
        <div className="grid grid-cols-5 h-14 items-center">
          {bottomTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = location.pathname === tab.to || (tab.to !== '/' && location.pathname.startsWith(tab.to));
            if (tab.authRequired && (!isAuthenticated || !user)) return null;

            return (
              <Link
                key={tab.label}
                to={tab.to}
                className={`relative flex flex-col items-center justify-center py-1 transition-all active:scale-95 ${
                  isActive ? 'text-[#06192b]' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {isActive && (
                  <span className="absolute top-0 w-8 h-0.5 bg-[#06192b] rounded-full" />
                )}
                <div className="relative">
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                  {tab.badge && (
                    <span className="absolute -top-1.5 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white px-1 border border-white">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] mt-0.5 font-bold tracking-tight ${isActive ? 'text-[#06192b]' : 'text-slate-500'}`}>
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      <LogoutModal isOpen={logoutModal} onClose={() => setLogoutModal(false)} />
    </>
  );
}
