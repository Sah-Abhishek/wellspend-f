import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppShell from './components/AppShell';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import LogEntry from './pages/LogEntry';
import Groups from './pages/Groups';
import CreateGroup from './pages/CreateGroup';
import GroupDetail from './pages/GroupDetail';
import MemberStats from './pages/MemberStats';
import JoinGroup from './pages/JoinGroup';
import Stats from './pages/Stats';
import Calendar from './pages/Calendar';
import Profile from './pages/Profile';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-dvh bg-bg flex items-center justify-center text-text-muted">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/app" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<GuestRoute><Landing /></GuestRoute>} />
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />
      <Route path="/join/:inviteCode" element={<JoinGroup />} />

      <Route path="/app" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="log" element={<LogEntry />} />
        <Route path="groups" element={<Groups />} />
        <Route path="groups/new" element={<CreateGroup />} />
        <Route path="groups/:id" element={<GroupDetail />} />
        <Route path="groups/:id/members/:userId" element={<MemberStats />} />
        <Route path="stats" element={<Stats />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-center" toastOptions={{ duration: 3000, style: { borderRadius: '8px', background: '#1C2330', color: '#E8ECF1', fontSize: '13px', border: '1px solid #1E2A37' } }} />
      </AuthProvider>
    </BrowserRouter>
  );
}
