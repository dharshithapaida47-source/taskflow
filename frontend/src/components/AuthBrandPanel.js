import React from 'react';
import { CheckIcon, SparkleIcon } from './Icons';

const features = [
  'Organize tasks across projects',
  'Track real-time progress on a Kanban board',
  'Stay on top of deadlines with overdue alerts'
];

const AuthBrandPanel = ({ headline, subhead }) => (
  <aside className="auth-brand-panel">
    <span className="auth-blob auth-blob-1" aria-hidden="true" />
    <span className="auth-blob auth-blob-2" aria-hidden="true" />
    <span className="auth-blob auth-blob-3" aria-hidden="true" />

    <div className="auth-brand-top">
      <span className="auth-brand-top-logo">T</span>
      TaskFlow
    </div>

    <div className="auth-brand-content">
      <span className="auth-brand-eyebrow">
        <SparkleIcon width={14} height={14} />
        Built for modern teams
      </span>
      <h1 className="auth-brand-headline">{headline}</h1>
      <p className="auth-brand-subhead">{subhead}</p>

      <ul className="auth-feature-list">
        {features.map((feature) => (
          <li className="auth-feature" key={feature}>
            <span className="auth-feature-check" aria-hidden="true">
              <CheckIcon width={14} height={14} />
            </span>
            {feature}
          </li>
        ))}
      </ul>

      {/* Floating product preview — gives the brand panel a tangible glimpse
          of what TaskFlow actually looks like inside the app. */}
      <div className="auth-preview-card" aria-hidden="true">
        <div className="auth-preview-header">
          <span>Frontend</span>
          <span className="auth-preview-status-pill">In Progress</span>
        </div>
        <div className="auth-preview-title">Build hero section</div>
        <div className="auth-preview-meta">Due in 3 days · assigned to Alice</div>
        <div className="auth-preview-progress-track">
          <div className="auth-preview-progress-fill" />
        </div>
        <div className="auth-preview-row">
          <span>2 of 3 subtasks done</span>
          <span>68%</span>
        </div>
      </div>
    </div>

    <div className="auth-brand-footer">
      © {new Date().getFullYear()} TaskFlow · Built with care
    </div>
  </aside>
);

export default AuthBrandPanel;
