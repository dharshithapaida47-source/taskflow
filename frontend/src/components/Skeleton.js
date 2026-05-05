import React from 'react';
import './Skeleton.css';

export const SkeletonTaskCard = () => (
  <div className="skeleton-task" aria-hidden="true">
    <div className="skeleton skeleton-line skeleton-line-title" />
    <div className="skeleton skeleton-line skeleton-line-full" />
    <div className="skeleton skeleton-line skeleton-line-half" />
    <div className="skeleton skeleton-line skeleton-line-third" />
    <div className="skeleton-action-row">
      <div className="skeleton skeleton-action" />
    </div>
  </div>
);

export const SkeletonTaskGrid = ({ count = 3 }) => (
  <div className="skeleton-grid" aria-label="Loading tasks">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonTaskCard key={i} />
    ))}
  </div>
);

export const SkeletonStatsRow = ({ count = 4 }) => (
  <div className="skeleton-stats-grid" aria-label="Loading stats">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="skeleton-stat">
        <div className="skeleton skeleton-line" />
        <div className="skeleton skeleton-line" />
      </div>
    ))}
  </div>
);

export const SkeletonProjectCard = () => (
  <div className="skeleton-task" aria-hidden="true">
    <div className="skeleton skeleton-line skeleton-line-title" />
    <div className="skeleton skeleton-line skeleton-line-full" />
    <div className="skeleton skeleton-line skeleton-line-half" />
  </div>
);

export const SkeletonProjectGrid = ({ count = 3 }) => (
  <div className="skeleton-grid" aria-label="Loading projects">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonProjectCard key={i} />
    ))}
  </div>
);
