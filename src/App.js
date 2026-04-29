import React, { useState } from 'react';
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
  );
}

export default App;
