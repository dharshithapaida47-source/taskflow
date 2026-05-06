import React, { useState } from 'react';
import { FolderTagIcon, UserIcon, CalendarIcon, TrashIcon } from './Icons';
import './TaskItem.css';

const statusBadgeMap = {
  todo: { className: 'badge badge-todo', label: 'Pending' },
  inprogress: { className: 'badge badge-inprogress', label: 'In Progress' },
  done: { className: 'badge badge-done', label: 'Completed' }
};

const workTypeLabelMap = {
  frontend: 'Frontend',
  backend: 'Backend',
  fullstack: 'Fullstack',
  testing: 'Testing',
  design: 'Design'
};

const formatDate = (date) => {
  if (!date) return 'No due date';
  const d = new Date(date);
  // Show date + time if a meaningful time is present (not midnight)
  const hasTime = d.getHours() !== 0 || d.getMinutes() !== 0;
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...(hasTime ? { hour: '2-digit', minute: '2-digit' } : {})
  });
};

const TaskItem = ({ task, onStatusChange, onDelete, onOpen, userRole, onDragStart }) => {
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleCardClick = (e) => {
    // Ignore clicks that originate from interactive controls inside the card
    if (e.target.closest('select, button, a, input')) return;
    onOpen?.(task);
  };

  const handleCardKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpen?.(task);
    }
  };

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

  const canDrag = userRole === 'member';

  return (
    <article
      className={`task-item ${statusClass}${isOverdue ? ' task-item-overdue' : ''}${onOpen ? ' is-clickable' : ''}${canDrag ? ' is-draggable' : ''}`}
      onClick={onOpen ? handleCardClick : undefined}
      onKeyDown={onOpen ? handleCardKey : undefined}
      tabIndex={onOpen ? 0 : undefined}
      role={onOpen ? 'button' : undefined}
      aria-label={onOpen ? `Open task ${task.title}` : undefined}
      draggable={canDrag}
      onDragStart={canDrag ? (e) => onDragStart?.(e, task) : undefined}
    >
      <div className="task-item-header">
        <div className="task-item-title">{task.title}</div>
        <div className="task-item-badges">
          {task.attachment?.filename && (
            <span className="badge badge-member" title={`Has attachment: ${task.attachment.originalName || ''}`}>
              📎 File
            </span>
          )}
          {isOverdue && <span className="badge badge-overdue">Overdue</span>}
          <span className={status.className}>{status.label}</span>
        </div>
      </div>

      {task.workType && (
        <div className="task-item-worktype" data-type={task.workType}>
          {workTypeLabelMap[task.workType] || task.workType}
        </div>
      )}

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
          disabled={updating || userRole === 'admin'}
          title={userRole === 'admin' ? 'Only the assigned member can change status' : ''}
          aria-label={`Change status of ${task.title}`}
        >
          <option value="todo">Pending</option>
          <option value="inprogress">In Progress</option>
          <option value="done">Completed</option>
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
