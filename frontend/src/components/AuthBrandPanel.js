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
    </div>

    <div className="auth-brand-footer">
      © {new Date().getFullYear()} TaskFlow · Built with care
    </div>
  </aside>
);

export default AuthBrandPanel;
