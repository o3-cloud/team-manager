import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';
import AnnouncementsPage from './pages/AnnouncementsPage';
import DashboardPage from './pages/DashboardPage';
import EventDetailPage from './pages/EventDetailPage';
import EventsPage from './pages/EventsPage';
import GameResultsPage from './pages/GameResultsPage';
import InviteAcceptPage from './pages/InviteAcceptPage';
import LoginPage from './pages/LoginPage';
import NotificationsPage from './pages/NotificationsPage';
import RegisterPage from './pages/RegisterPage';
import TeamDetailPage from './pages/TeamDetailPage';
import TeamsPage from './pages/TeamsPage';

export default function App() {
  const { token } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/teams" replace /> : <LoginPage />} />
      <Route
        path="/register"
        element={token ? <Navigate to="/teams" replace /> : <RegisterPage />}
      />
      <Route
        path="/teams"
        element={
          <ProtectedRoute>
            <TeamsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/invites/:token"
        element={
          <ProtectedRoute>
            <InviteAcceptPage />
          </ProtectedRoute>
        }
      />

      {/* Team-scoped routes share the AppLayout shell (sidebar + top bar) */}
      <Route
        path="/teams/:teamId"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="detail" element={<TeamDetailPage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="events/:eventId" element={<EventDetailPage />} />
        <Route path="announcements" element={<AnnouncementsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="game-results" element={<GameResultsPage />} />
      </Route>

      <Route path="*" element={<Navigate to={token ? '/teams' : '/login'} replace />} />
    </Routes>
  );
}
