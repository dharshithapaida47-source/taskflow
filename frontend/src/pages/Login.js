import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import AuthBrandPanel from '../components/AuthBrandPanel';
import { EyeIcon, EyeOffIcon } from '../components/Icons';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [role, setRole] = useState('member');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login: setSession } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await login({ ...formData, role });
      setSession(response.data.user, response.data.token);
      navigate('/dashboard');
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (err.request ? 'Unable to reach the server. Please try again.' : err.message) ||
        'Login failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <AuthBrandPanel
        headline="Welcome back, get back to shipping."
        subhead="Sign in to manage your team's projects and tasks — all in one place."
      />

      <main className="auth-form-panel">
        <div className="auth-card">
          <div className="auth-card-mobile-brand">
            <span className="auth-brand-top-logo">T</span>
            TaskFlow
          </div>

          <h2 className="auth-heading">Log in to your account</h2>
          <p className="auth-subheading">Enter your credentials to continue.</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <span className="form-label">Sign in as</span>
              <div className="role-toggle" role="radiogroup" aria-label="Sign in as">
                <button
                  type="button"
                  role="radio"
                  aria-checked={role === 'member'}
                  className={`role-toggle-option${role === 'member' ? ' is-active' : ''}`}
                  onClick={() => setRole('member')}
                >
                  Member
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={role === 'admin'}
                  className={`role-toggle-option${role === 'admin' ? ' is-active' : ''}`}
                  onClick={() => setRole('admin')}
                >
                  Admin
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-control"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <div className="auth-input-wrapper">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="auth-input-toggle"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOffIcon width={16} height={16} /> : <EyeIcon width={16} height={16} />}
                </button>
              </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <button
              type="submit"
              className="btn btn-primary auth-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  Signing in…
                </>
              ) : (
                <>
                  Log in
                  <span className="auth-submit-arrow">→</span>
                </>
              )}
            </button>
          </form>

          <div className="auth-divider">or</div>

          <div className="auth-footer">
            New here? <Link to="/signup">Create an account</Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
