import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar, Sidebar } from './components/Layout';
import Dashboard from './pages/Dashboard';
import Suggestions from './pages/Suggestions';
import AdminSuggestions from './pages/AdminSuggestions';
import Feedback from './pages/Feedback';
import Summaries from './pages/Summaries';
import LoginPage from './LoginPage';
import { authService } from './services/api';
import './App.css';

// Protected route wrapper
function ProtectedRoute({ children, user }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Admin-only route wrapper
function AdminRoute({ children, user }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role !== 'Admin') {
    return <Navigate to="/" replace />;
  }
  return children;
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="bg-gray-50 min-h-screen">
        <Navbar user={user} onLogout={handleLogout} />
        <div className="flex pt-16 overflow-hidden bg-gray-50">
          <Sidebar user={user} />
          <main className="relative w-full h-full overflow-y-auto bg-gray-50 lg:ml-64 min-h-[calc(100vh-4rem)]">
            <div className="p-4">
              <Routes>
                <Route
                  path="/"
                  element={
                    <ProtectedRoute user={user}>
                      <Dashboard user={user} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/suggestions"
                  element={
                    <ProtectedRoute user={user}>
                      <Suggestions user={user} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/suggestions"
                  element={
                    <AdminRoute user={user}>
                      <AdminSuggestions />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/dashboard"
                  element={
                    <AdminRoute user={user}>
                      <div className="p-4">
                        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                        <p className="mt-2 text-gray-600">Placeholder for overall statistics and system management.</p>
                      </div>
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/analytics"
                  element={
                    <AdminRoute user={user}>
                      <div className="p-4">
                        <h1 className="text-2xl font-bold">Analytics</h1>
                        <p className="mt-2 text-gray-600">Placeholder for feedback charts and trends.</p>
                      </div>
                    </AdminRoute>
                  }
                />
                <Route
                  path="/feedback"
                  element={
                    <ProtectedRoute user={user}>
                      <Feedback user={user} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/summaries"
                  element={
                    <ProtectedRoute user={user}>
                      <Summaries user={user} />
                    </ProtectedRoute>
                  }
                />
                <Route path="/login" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
