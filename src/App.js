import React, { useState } from 'react';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar, Sidebar } from './components/Layout';
import Dashboard from './pages/Dashboard';
import Suggestions from './pages/Suggestions';
import Feedback from './pages/Feedback';
import Summaries from './pages/Summaries';
import './App.css';
import LoginPage from './LoginPage';

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome, {user.name}!</h1>
        <p>AIU Cafeteria System</p>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </header>
      <main className="App-main">
        <p>Dashboard coming soon...</p>
      </main>
    </div>
    <Router>
      <div className="bg-gray-50 min-h-screen">
        <Navbar />
        <div className="flex pt-16 overflow-hidden bg-gray-50">
          <Sidebar />
          <main className="relative w-full h-full overflow-y-auto bg-gray-50 lg:ml-64 min-h-[calc(100vh-4rem)]">
            <div className="p-4">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/suggestions" element={<Suggestions />} />
                <Route path="/feedback" element={<Feedback />} />
                <Route path="/summaries" element={<Summaries />} />
                <Route path="/login" element={<div className="p-4">Login Page (Phase 2)</div>} />
                <Route path="/register" element={<div className="p-4">Register Page (Phase 2)</div>} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
