import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import AuthBrandPanel from '../components/AuthBrandPanel';
import { EyeIcon, EyeOffIcon } from '../components/Icons';
import './Auth.css';

const Signup = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
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
      const response = await signup(formData);
      setSession(response.data.user, response.data.token);
      navigate('/dashboard');
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (err.request ? 'Unable to reach the server. Please try again.' : err.message) ||
        'Signup failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <AuthBrandPanel
        headline="Start collaborating in minutes."
        subhead="Create your TaskFlow account to manage projects, assign tasks, and ship faster."
      />

      <main className="auth-form-panel">
        <div className="auth-card">
          <div className="auth-card-mobile-brand">
            <span className="auth-brand-top-logo">T</span>
            TaskFlow
          </div>

          <h2 className="auth-heading">Create your account</h2>
          <p className="auth-subheading">It only takes a minute.</p>

          <div className="alert alert-info" style={{ marginBottom: 16 }}>
            New accounts are created as members. An admin can promote you later.
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="signup-name">Full name</label>
              <input
                id="signup-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-control"
                placeholder="Jane Doe"
                autoComplete="name"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="signup-email">Email</label>
              <input
                id="signup-email"
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
              <label className="form-label" htmlFor="signup-password">Password</label>
              <div className="auth-input-wrapper">
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  minLength={6}
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
                  Creating account…
                </>
              ) : (
                <>
                  Sign up
                  <span className="auth-submit-arrow">→</span>
                </>
              )}
            </button>
          </form>

          <div className="auth-divider">or</div>

          <div className="auth-footer">
            Already have an account? <Link to="/login">Log in</Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Signup;
