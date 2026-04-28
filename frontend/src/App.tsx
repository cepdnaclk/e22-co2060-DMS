import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import PublicLayout from './components/layout/PublicLayout';

// Public pages
import HomePage from './pages/public/HomePage';
import ScoringPage from './pages/public/ScoringPage';
import NewsPage from './pages/public/NewsPage';
import AboutUsPage from './pages/public/AboutUsPage';
import SearchResultsPage from './pages/public/SearchResultsPage';

// Auth pages
import RoleSelectionPage from './pages/auth/RoleSelectionPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';

// Dashboard pages
import DebaterDashboard from './pages/dashboard/DebaterDashboard';
import JudgeDashboard from './pages/dashboard/JudgeDashboard';
import OrganizerDashboard from './pages/dashboard/OrganizerDashboard';

// Tournament pages
import CreateTournamentWizard from './pages/tournament/CreateTournamentWizard';
import TournamentPage from './pages/tournament/TournamentPage';
import ScoreSheetPage from './pages/tournament/ScoreSheetPage';

// Shared pages
import NotificationsPage from './pages/shared/NotificationsPage';
import CalendarPage from './pages/shared/CalendarPage';
import SettingsPage from './pages/shared/SettingsPage';
import ProfilePage from './pages/shared/ProfilePage';

function ProtectedRoute({ children, allowedRoles }: {
  children: React.ReactNode;
  allowedRoles?: string[];
}) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/role-select" replace />;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      {/* Public routes with shared layout */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/scoring" element={<ScoringPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/about" element={<AboutUsPage />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/profile/:id" element={<ProfilePage />} />
        <Route path="/tournament/:id" element={<TournamentPage />} />
      </Route>

      {/* Auth pages (no public layout) */}
      <Route path="/role-select" element={<RoleSelectionPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Protected routes */}
      <Route path="/dashboard/debater" element={
        <ProtectedRoute allowedRoles={['DEBATER']}>
          <PublicLayout />
        </ProtectedRoute>
      }>
        <Route index element={<DebaterDashboard />} />
      </Route>

      <Route path="/dashboard/judge" element={
        <ProtectedRoute allowedRoles={['JUDGE']}>
          <PublicLayout />
        </ProtectedRoute>
      }>
        <Route index element={<JudgeDashboard />} />
      </Route>

      <Route path="/dashboard/organizer" element={
        <ProtectedRoute allowedRoles={['ORGANIZER']}>
          <PublicLayout />
        </ProtectedRoute>
      }>
        <Route index element={<OrganizerDashboard />} />
      </Route>

      <Route path="/create-tournament" element={
        <ProtectedRoute allowedRoles={['ORGANIZER']}>
          <PublicLayout />
        </ProtectedRoute>
      }>
        <Route index element={<CreateTournamentWizard />} />
      </Route>

      <Route element={
        <ProtectedRoute>
          <PublicLayout />
        </ProtectedRoute>
      }>
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/score-sheet/:matchId/:judgeId" element={<ScoreSheetPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
