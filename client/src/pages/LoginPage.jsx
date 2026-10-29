import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { login, authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if redirected due to an expired session
  const searchParams = new URLSearchParams(location.search);
  const isSessionExpired = searchParams.get('expired') === 'true';

  // If redirected from a protected route, remember where the user wanted to go
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please provide both email and password');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to fill demo credentials
  const fillCredentials = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password123!');
  };

  return (
    <div className="container page-container auth-page-container">
      <div className="card auth-card">
        <div className="auth-header text-center">
          <span className="auth-icon">🔐</span>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Log in to your Engineering Showcase account</p>
        </div>

        {isSessionExpired && (
          <div className="alert alert-warning">
            ⚠️ Your session has expired. Please log in again to continue.
          </div>
        )}

        {authError && !isSessionExpired && (
          <div className="alert alert-warning">
            ⚠️ {authError}
          </div>
        )}

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className="form-control"
              placeholder="e.g. alex.rivera@eng.university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary btn-block btn-lg mt-3"
          >
            {submitting ? 'Logging In...' : 'Log In'}
          </button>
        </form>

        {/* Quick Demo Login Credentials Helper */}
        <div className="demo-credentials-box">
          <p className="demo-label">🧪 Quick Demo Accounts (Seed Data):</p>
          <div className="demo-btn-group">
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => fillCredentials('alex.rivera@eng.university.edu')}
            >
              Fill Student (Alex)
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => fillCredentials('sarah.chen@eng.university.edu')}
            >
              Fill Admin (Dr. Sarah)
            </button>
          </div>
        </div>

        <div className="auth-footer text-center">
          <p>
            Don't have an account yet?{' '}
            <Link to="/register" className="auth-link">
              Create an Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
