import React, { useState } from 'react';
import './LoginPage.css';
import { LogIn } from 'lucide-react';
import { authService } from './services/api';

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Student',
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.login(email, password);
      const { token, user } = response.data;

      // Store token and user in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      onLogin(user);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!registerData.name || !registerData.email || !registerData.password) {
      setError('Please fill in all fields');
      return;
    }

    if (registerData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.register(
        registerData.name,
        registerData.email,
        registerData.password,
        registerData.role
      );
      const { token, user } = response.data;

      // Store token and user in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      onLogin(user);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <LogIn size={40} className="login-icon" />
          <h1>AIU Cafeteria System</h1>
          <p className="login-subtitle">
            {showRegister ? 'Create your account' : 'Sign in to your account'}
          </p>
        </div>

        {showRegister ? (
          <form onSubmit={handleRegister} className="login-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={registerData.name}
                onChange={(e) =>
                  setRegisterData({ ...registerData, name: e.target.value })
                }
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-email">Email Address</label>
              <input
                id="reg-email"
                type="email"
                placeholder="Enter your email"
                value={registerData.email}
                onChange={(e) =>
                  setRegisterData({ ...registerData, email: e.target.value })
                }
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-password">Password</label>
              <input
                id="reg-password"
                type="password"
                placeholder="Enter your password (min 6 characters)"
                value={registerData.password}
                onChange={(e) =>
                  setRegisterData({ ...registerData, password: e.target.value })
                }
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="role">Role</label>
              <select
                id="role"
                value={registerData.role}
                onChange={(e) =>
                  setRegisterData({ ...registerData, role: e.target.value })
                }
                disabled={loading}
              >
                <option value="Student">Student</option>
                <option value="Staff">Staff</option>
              </select>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>

            <div className="login-footer">
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setShowRegister(false);
                    setError('');
                  }}
                  className="toggle-link"
                >
                  Sign In
                </button>
              </p>
            </div>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="login-form">
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

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="login-footer">
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setShowRegister(true);
                    setError('');
                  }}
                  className="toggle-link"
                >
                  Register
                </button>
              </p>
              <p style={{ marginTop: '10px', fontSize: '12px' }}>
                Demo: demo@aiu.edu / password123 or admin@aiu.edu / admin123
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default LoginPage;
