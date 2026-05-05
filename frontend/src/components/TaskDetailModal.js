import React, { useState } from 'react';
import Modal from './Modal';
import { downloadTaskAttachment } from '../utils/api';
import './TaskDetailModal.css';

const STATUS_LABELS = {
  todo: 'Pending',
  inprogress: 'In Progress',
  done: 'Completed'
};

const WORKTYPE_LABELS = {
  frontend: 'Frontend',
  backend: 'Backend',
  fullstack: 'Fullstack',
  testing: 'Testing',
  design: 'Design'
};

const formatDateTime = (date) => {
  if (!date) return 'No due date';
  const d = new Date(date);
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const TaskDetailModal = ({ task, open, onClose, onEdit, canEdit = false }) => {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  if (!task) return null;

  const isOverdue =
    task.dueDate &&
    task.status !== 'done' &&
    new Date(task.dueDate).getTime() < Date.now();

  const handleDownload = async () => {
    if (!task.attachment?.filename) return;
    setDownloading(true);
    setError('');
    try {
      await downloadTaskAttachment(task._id, task.attachment.originalName);
    } catch (err) {
      setError(err.response?.data?.message || 'Download failed');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Modal
      open={open}
      title={task.title}
      onClose={onClose}
      size="lg"
      footer={
        <>
          {canEdit && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => onEdit?.(task)}
              style={{ marginRight: 'auto' }}
            >
              Edit task
            </button>
          )}
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </>
      }
    >
      <div className="task-detail-section">
        <div className="task-detail-meta-grid">
          <div className="task-detail-meta-row">
            <span className="task-detail-meta-label">Project</span>
            <span className="task-detail-meta-value">{task.project?.name || '—'}</span>
          </div>
          <div className="task-detail-meta-row">
            <span className="task-detail-meta-label">Assigned to</span>
            <span className="task-detail-meta-value">{task.assignee?.name || '—'}</span>
          </div>
          <div className="task-detail-meta-row">
            <span className="task-detail-meta-label">Work type</span>
            <span className="task-detail-meta-value">
              {WORKTYPE_LABELS[task.workType] || task.workType || '—'}
            </span>
          </div>
          <div className="task-detail-meta-row">
            <span className="task-detail-meta-label">Status</span>
            <span className="task-detail-meta-value">
              {isOverdue
                ? <span className="badge badge-overdue">Overdue</span>
                : <span className={`badge badge-${task.status === 'inprogress' ? 'inprogress' : task.status === 'done' ? 'done' : 'todo'}`}>
                    {STATUS_LABELS[task.status] || task.status}
                  </span>
              }
            </span>
          </div>
          <div className="task-detail-meta-row">
            <span className="task-detail-meta-label">Due date</span>
            <span className="task-detail-meta-value">{formatDateTime(task.dueDate)}</span>
          </div>
          <div className="task-detail-meta-row">
            <span className="task-detail-meta-label">Created by</span>
            <span className="task-detail-meta-value">{task.createdBy?.name || '—'}</span>
          </div>
        </div>

        <div>
          <div className="task-detail-meta-label" style={{ marginBottom: 6 }}>Description</div>
          <div
            className={`task-detail-description${task.description ? '' : ' is-empty'}`}
          >
            {task.description || 'No description provided.'}
          </div>
        </div>

        {task.attachment?.filename && (
          <div>
            <div className="task-detail-meta-label" style={{ marginBottom: 6 }}>Attachment</div>
            <div className="task-detail-attachment">
              <span className="task-detail-attachment-icon" aria-hidden="true">📎</span>
              <span className="task-detail-attachment-meta">
                <span className="task-detail-attachment-name">
                  {task.attachment.originalName}
                </span>
                <span className="task-detail-attachment-size">
                  {formatSize(task.attachment.size)}
                  {task.attachment.uploadedAt
                    ? ` · uploaded ${new Date(task.attachment.uploadedAt).toLocaleDateString()}`
                    : ''}
                </span>
              </span>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleDownload}
                disabled={downloading}
              >
                {downloading ? 'Downloading…' : 'Download'}
              </button>
            </div>
            {error && (
              <div className="alert alert-error" style={{ marginTop: 8 }}>{error}</div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default TaskDetailModal;
