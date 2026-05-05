import React from 'react';
import './TaskList.css';

const TaskList = ({ tasks, children, title, emptyIcon = '📭', emptyMessage = 'No tasks here yet' }) => {
  return (
    <section className="task-list-section">
      <div className="task-list-header">
        <h3 className="task-list-title">{title}</h3>
        <span className="task-list-count">({tasks.length})</span>
      </div>
      {tasks.length === 0 ? (
        <div className="task-list-empty">
          <span className="task-list-empty-icon" aria-hidden="true">{emptyIcon}</span>
          <span>{emptyMessage}</span>
        </div>
      ) : (
        <div className="task-list-grid">
          {tasks.map((task) => (
            <div key={task._id}>{children(task)}</div>
          ))}
        </div>
      )}
    </section>
  );
};

export default React.memo(TaskList);
