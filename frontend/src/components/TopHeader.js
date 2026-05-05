import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogoutIcon } from './Icons';
import ThemeToggle from './ThemeToggle';
import './TopHeader.css';

const initialsOf = (name = '') => {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || '?') + (parts[1]?.[0] || '')).toUpperCase();
};

const firstNameOf = (name = '') => name.trim().split(/\s+/)[0] || 'there';

const TopHeader = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="top-header">
      {/* Left: brand only */}
      <Link to="/dashboard" className="top-header-brand">
        <span className="top-header-logo">T</span>
        <span className="top-header-name">TaskFlow</span>
      </Link>

      {/* Right: theme toggle + user pill + logout, grouped */}
      <div className="top-header-right">
        <ThemeToggle />
        {user && (
          <div
            className="top-header-user"
            title={isAdmin ? 'Admin' : 'Member'}
          >
            <div className="top-header-avatar" aria-hidden="true">
              {initialsOf(user.name)}
              <span
                className={`top-header-role-dot${isAdmin ? ' is-admin' : ''}`}
                aria-hidden="true"
              />
            </div>
            <div className="top-header-user-text">
              <div className="top-header-greeting">Hi, {firstNameOf(user.name)} 👋</div>
              <div className="top-header-user-role">{isAdmin ? 'Admin' : 'Member'}</div>
            </div>
          </div>
        )}

        <button
          type="button"
          className="top-header-logout"
          onClick={handleLogout}
          aria-label="Log out"
          title="Log out"
        >
          <LogoutIcon />
          <span className="top-header-logout-label">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default TopHeader;
