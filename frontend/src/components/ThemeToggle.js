import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { SunIcon, MoonIcon } from './Icons';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className="theme-toggle"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={toggleTheme}
    >
      <span className="theme-toggle-side">
        <SunIcon />
      </span>
      <span className="theme-toggle-side">
        <MoonIcon />
      </span>
      <span className="theme-toggle-thumb" aria-hidden="true">
        {isDark ? <MoonIcon width={14} height={14} /> : <SunIcon width={14} height={14} />}
      </span>
    </button>
  );
};

export default ThemeToggle;
