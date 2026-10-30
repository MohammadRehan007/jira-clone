import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProjectProvider } from './context/ProjectContext';

import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import BoardPage from './pages/BoardPage';
import BacklogPage from './pages/BacklogPage';
import SprintsPage from './pages/SprintsPage';
import DashboardPage from './pages/DashboardPage';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white font-bold text-lg">
        Loading Jira Engine...
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/board" replace />;
  }
  return children;
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <ProjectProvider>
            <Routes>
              {/* Public Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<Navigate to="/login" replace />} />
              <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* Protected App Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/board" replace />} />
                <Route path="board" element={<BoardPage />} />
                <Route path="backlog" element={<BacklogPage />} />
                <Route
                  path="sprints"
                  element={
                    <ProtectedRoute allowedRoles={['Admin', 'ProjectLead']}>
                      <SprintsPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="dashboard" element={<DashboardPage />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/board" replace />} />
            </Routes>
          </ProjectProvider>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
