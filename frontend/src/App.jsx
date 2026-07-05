import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import AppLayout from './layouts/AppLayout';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import AllNotes from './pages/AllNotes';
import PinnedNotes from './pages/PinnedNotes';
import ArchivedNotes from './pages/ArchivedNotes';
import Folders from './pages/Folders';
import FolderNotes from './pages/FolderNotes';
import NotePage from './pages/NotePage';
import Settings from './pages/Settings';

/**
 * Protects routes that require authentication.
 * Redirects to /login if not authenticated, shows spinner while checking.
 */
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-dark-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/**
 * Redirects authenticated users away from public routes.
 */
function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

              {/* Protected Routes — wrapped in AppLayout */}
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<Dashboard />} />
                <Route path="/notes" element={<AllNotes />} />
                <Route path="/notes/new" element={<NotePage />} />
                <Route path="/notes/:id" element={<NotePage />} />
                <Route path="/pinned" element={<PinnedNotes />} />
                <Route path="/archived" element={<ArchivedNotes />} />
                <Route path="/folders" element={<Folders />} />
                <Route path="/folders/:id" element={<FolderNotes />} />
                <Route path="/settings" element={<Settings />} />
              </Route>

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}