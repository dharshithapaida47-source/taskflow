import React from 'react';
import './UserPicker.css';

const initialsOf = (name = '') => {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || '?') + (parts[1]?.[0] || '')).toUpperCase();
};

const UserPicker = ({ users, selectedId, onSelect, disabled, emptyMessage }) => {
  if (!users || users.length === 0) {
    return (
      <div className="user-picker">
        <div className="user-picker-empty">
          {emptyMessage || 'No team members available.'}
        </div>
      </div>
    );
  }

  return (
    <div className="user-picker" role="radiogroup" aria-label="Assignee">
      {users.map((u) => {
        const isSelected = u._id === selectedId;
        return (
          <button
            type="button"
            key={u._id}
            className={`user-picker-card${isSelected ? ' is-selected' : ''}`}
            onClick={() => onSelect(u._id)}
            disabled={disabled}
            role="radio"
            aria-checked={isSelected}
            title={u.email}
          >
            <span className="user-picker-avatar" aria-hidden="true">
              {initialsOf(u.name)}
            </span>
            <span className="user-picker-text">
              <span className="user-picker-name">{u.name}</span>
              <span className="user-picker-email">{u.email}</span>
            </span>
            {isSelected && (
              <svg className="user-picker-check" width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7 7a.75.75 0 0 1-1.06 0l-3.5-3.5a.75.75 0 1 1 1.06-1.06L6.25 10.69l6.47-6.47a.75.75 0 0 1 1.06 0Z" />
              </svg>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default UserPicker;
