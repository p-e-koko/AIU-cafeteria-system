import React, { useState } from 'react';
import './LoginPage.css';
import { LogIn } from 'lucide-react';

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Mock authentication - replace with actual API call
      if (email && password.length >= 6) {
        setLoading(false);
        onLogin({ email, name: email.split('@')[0] });
      } else {
        setError('Invalid email or password');
        setLoading(false);
      }
    }, 500);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <LogIn size={40} className="login-icon" />
          <h1>AIU Cafeteria System</h1>
          <p className="login-subtitle">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          <p>Demo credentials: any email | password (min 6 chars)</p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
