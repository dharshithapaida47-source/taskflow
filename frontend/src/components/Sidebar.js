import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, FolderIcon } from './Icons';
import './Sidebar.css';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', Icon: HomeIcon },
  { to: '/projects', label: 'My Projects', Icon: FolderIcon }
];

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-section-label">Workspace</div>
      <nav className="sidebar-nav">
        {navLinks.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar-link${isActive ? ' active' : ''}`
            }
          >
            <span className="sidebar-link-icon">
              <Icon />
            </span>
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-spacer" />

      <div className="sidebar-footer">
        <span>v1.0 · TaskFlow</span>
      </div>
    </aside>
  );
};

export default Sidebar;
