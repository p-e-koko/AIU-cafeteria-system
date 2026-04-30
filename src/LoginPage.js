import React, { useState } from 'react';
import { LogIn, UserPlus } from 'lucide-react';
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-inter">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="px-8 pt-10 pb-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-[#1e3a8a] mb-4">
              {showRegister ? <UserPlus size={32} /> : <LogIn size={32} />}
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AIU Cafeteria</h1>
            <p className="text-slate-500 mt-2">
              {showRegister ? 'Create your campus account' : 'Sign in to access the portal'}
            </p>
          </div>

          <form onSubmit={showRegister ? handleRegister : handleLogin} className="space-y-5">
            {showRegister && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  className="input-shadcn"
                  placeholder="Enter your full name"
                  value={registerData.name}
                  onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                  disabled={loading}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
              <input
                type="email"
                required
                className="input-shadcn"
                placeholder="university@aiu.edu"
                value={showRegister ? registerData.email : email}
                onChange={(e) => showRegister ? setRegisterData({ ...registerData, email: e.target.value }) : setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <input
                type="password"
                required
                className="input-shadcn"
                placeholder="••••••••"
                value={showRegister ? registerData.password : password}
                onChange={(e) => showRegister ? setRegisterData({ ...registerData, password: e.target.value }) : setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            {showRegister && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Your Role</label>
                <select
                  className="input-shadcn"
                  value={registerData.role}
                  onChange={(e) => setRegisterData({ ...registerData, role: e.target.value })}
                  disabled={loading}
                >
                  <option value="Student">Student</option>
                  <option value="Staff">Staff</option>
                </select>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm animate-in slide-in-from-top-1">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary h-11 flex items-center justify-center"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {showRegister ? 'Creating Account...' : 'Signing In...'}
                </span>
              ) : (
                showRegister ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <button
              onClick={() => { setShowRegister(!showRegister); setError(''); }}
              className="text-sm font-medium text-[#1e3a8a] hover:underline"
            >
              {showRegister ? 'Already have an account? Sign In' : "Don't have an account? Register Now"}
            </button>
            <p className="mt-4 text-xs text-slate-400">
              Demo: demo@aiu.edu / password123 or admin@aiu.edu / admin123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
