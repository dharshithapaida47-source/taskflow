import React, { useState } from 'react';
import { FolderTagIcon, UserIcon, CalendarIcon, TrashIcon } from './Icons';
import './TaskItem.css';

const statusBadgeMap = {
  todo: { className: 'badge badge-todo', label: 'To Do' },
  inprogress: { className: 'badge badge-inprogress', label: 'In Progress' },
  done: { className: 'badge badge-done', label: 'Done' }
};

const formatDate = (date) => {
  if (!date) return 'No due date';
  return new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const TaskItem = ({ task, onStatusChange, onDelete, userRole }) => {
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOverdue =
    task.dueDate &&
    task.status !== 'done' &&
    new Date(task.dueDate).getTime() < Date.now();

  const handleStatusChange = async (e) => {
    setUpdating(true);
    try {
      await onStatusChange(task._id, e.target.value);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(task._id);
    } finally {
      setDeleting(false);
    }
  };

  const projectName = task.project?.name || 'Unknown project';
  const assigneeName = task.assignee?.name || 'Unassigned';
  const status = statusBadgeMap[task.status] || statusBadgeMap.todo;
  const statusClass = `task-item-status-${task.status}`;

  return (
    <article
      className={`task-item ${statusClass}${isOverdue ? ' task-item-overdue' : ''}`}
    >
      <div className="task-item-header">
        <div className="task-item-title">{task.title}</div>
        <div className="task-item-badges">
          {isOverdue && <span className="badge badge-overdue">Overdue</span>}
          <span className={status.className}>{status.label}</span>
        </div>
      </div>

      {task.description && (
        <p className="task-item-description">{task.description}</p>
      )}

      <div className="task-item-meta">
        <div className="task-item-meta-row">
          <span className="task-item-meta-icon"><FolderTagIcon width={14} height={14} /></span>
          <span className="task-item-meta-value">{projectName}</span>
        </div>
        <div className="task-item-meta-row">
          <span className="task-item-meta-icon"><UserIcon width={14} height={14} /></span>
          <span className="task-item-meta-value">{assigneeName}</span>
        </div>
        <div className="task-item-meta-row">
          <span className="task-item-meta-icon"><CalendarIcon width={14} height={14} /></span>
          <span
            className={
              isOverdue ? 'task-item-meta-value-overdue' : 'task-item-meta-value'
            }
          >
            {formatDate(task.dueDate)}
          </span>
        </div>
      </div>

      <div className="task-item-actions">
        <select
          className="form-control"
          value={task.status}
          onChange={handleStatusChange}
          disabled={updating}
          aria-label={`Change status of ${task.title}`}
        >
          <option value="todo">To Do</option>
          <option value="inprogress">In Progress</option>
          <option value="done">Done</option>
        </select>
        {userRole === 'admin' && (
          <button
            type="button"
            className="task-item-delete-btn"
            onClick={handleDelete}
            disabled={deleting}
            aria-label={`Delete ${task.title}`}
            title="Delete task"
          >
            <TrashIcon width={16} height={16} />
          </button>
        )}
      </div>
    </article>
  );
};

export default React.memo(TaskItem);
