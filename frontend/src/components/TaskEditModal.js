import React, { useState, useMemo, useEffect } from 'react';
import Modal from './Modal';
import UserPicker from './UserPicker';
import { updateTask } from '../utils/api';
import './TaskEditModal.css';

const formatSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Convert an ISO date back to the value that <input type="datetime-local">
// expects: YYYY-MM-DDTHH:mm in local time.
const toLocalDatetimeValue = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
};

const TaskEditModal = ({ open, task, projects, users, onClose, onSaved }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    workType: 'fullstack',
    assigneeId: '',
    dueDate: ''
  });
  const [newAttachment, setNewAttachment] = useState(null);
  const [removeAttachment, setRemoveAttachment] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Reset form whenever the modal is opened on a different task
  useEffect(() => {
    if (!open || !task) return;
    setForm({
      title: task.title || '',
      description: task.description || '',
      workType: task.workType || 'fullstack',
      assigneeId: task.assignee?._id || '',
      dueDate: toLocalDatetimeValue(task.dueDate)
    });
    setNewAttachment(null);
    setRemoveAttachment(false);
    setError('');
  }, [open, task]);

  // Show all users with the task's project members listed first
  const project = useMemo(
    () => (task && projects ? projects.find((p) => p._id === (task.project?._id || task.project)) : null),
    [task, projects]
  );

  const sortedUsers = useMemo(() => {
    if (!project) return users || [];
    const memberIds = new Set([
      project.admin?._id || project.admin,
      ...(project.members || []).map((m) => m._id || m)
    ]);
    return [...(users || [])].sort((a, b) => {
      const aIn = memberIds.has(a._id) ? 0 : 1;
      const bIn = memberIds.has(b._id) ? 0 : 1;
      if (aIn !== bIn) return aIn - bIn;
      return a.name.localeCompare(b.name);
    });
  }, [project, users]);

  const assigneeIsTeamMember = useMemo(() => {
    if (!project || !form.assigneeId) return true;
    const memberIds = new Set([
      project.admin?._id || project.admin,
      ...(project.members || []).map((m) => m._id || m)
    ]);
    return memberIds.has(form.assigneeId);
  }, [project, form.assigneeId]);

  const handleClose = () => {
    if (saving) return;
    onClose?.();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.assigneeId) {
      setError('Title and assignee are required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        title: form.title,
        description: form.description,
        workType: form.workType,
        assigneeId: form.assigneeId,
        dueDate: form.dueDate || null
      };
      if (newAttachment) payload.attachment = newAttachment;
      else if (removeAttachment) payload.removeAttachment = true;

      await updateTask(task._id, payload);
      onSaved?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task');
    } finally {
      setSaving(false);
    }
  };

  if (!task) return null;

  const hasExistingFile = !!task.attachment?.filename && !removeAttachment;

  return (
    <Modal
      open={open}
      title="Edit task"
      onClose={handleClose}
      size="lg"
      footer={
        <>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="task-edit-form"
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? <><span className="spinner" /> Saving…</> : 'Save changes'}
          </button>
        </>
      }
    >
      <form id="task-edit-form" className="task-edit-form" onSubmit={handleSubmit}>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" htmlFor="edit-task-title">Task name *</label>
          <input
            id="edit-task-title"
            type="text"
            className="form-control"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" htmlFor="edit-task-description">Description</label>
          <textarea
            id="edit-task-description"
            rows="3"
            className="form-control"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            maxLength={1000}
          />
        </div>

        <div className="task-edit-row">
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" htmlFor="edit-task-worktype">Work type *</label>
            <select
              id="edit-task-worktype"
              className="form-control"
              value={form.workType}
              onChange={(e) => setForm({ ...form, workType: e.target.value })}
              required
            >
              <option value="frontend">Frontend</option>
              <option value="backend">Backend</option>
              <option value="fullstack">Fullstack</option>
              <option value="testing">Testing</option>
              <option value="design">Design</option>
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" htmlFor="edit-task-due">Due date &amp; time</label>
            <input
              id="edit-task-due"
              type="datetime-local"
              className="form-control"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
          </div>
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Assigned to *</label>
          <UserPicker
            users={sortedUsers}
            selectedId={form.assigneeId}
            onSelect={(id) => setForm({ ...form, assigneeId: id })}
          />
          {form.assigneeId && !assigneeIsTeamMember && (
            <div className="assignee-auto-add-hint">
              ℹ️ This user isn't on the project team yet — they'll be added
              automatically when you save.
            </div>
          )}
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">
            Attachment <span className="form-label-hint">(optional — PDF, Word, TXT, PNG, JPG · max 10 MB)</span>
          </label>

          {hasExistingFile && !newAttachment && (
            <div className="task-edit-existing-attachment">
              <span aria-hidden="true" style={{ fontSize: 20 }}>📎</span>
              <span className="task-edit-existing-attachment-meta">
                <span className="task-edit-existing-attachment-name">
                  {task.attachment.originalName}
                </span>
                <span className="task-edit-existing-attachment-size">
                  {formatSize(task.attachment.size)}
                </span>
              </span>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setRemoveAttachment(true)}
                style={{ color: 'var(--color-danger)' }}
              >
                Remove
              </button>
            </div>
          )}

          {!newAttachment ? (
            <label
              htmlFor="edit-task-attachment"
              className="file-dropzone"
              style={{ marginTop: hasExistingFile ? 8 : 0 }}
            >
              <span className="file-dropzone-icon" aria-hidden="true">📎</span>
              <span className="file-dropzone-text">
                <strong>Click to upload</strong>
                {hasExistingFile ? ' to replace the current file' : ' a spec or requirements document'}
              </span>
              <input
                id="edit-task-attachment"
                type="file"
                accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,image/png,image/jpeg"
                onChange={(e) => {
                  setNewAttachment(e.target.files?.[0] || null);
                  setRemoveAttachment(false);
                }}
                style={{ display: 'none' }}
              />
            </label>
          ) : (
            <div className="file-selected">
              <span className="file-selected-icon" aria-hidden="true">📎</span>
              <span className="file-selected-meta">
                <span className="file-selected-name">{newAttachment.name}</span>
                <span className="file-selected-size">{formatSize(newAttachment.size)}</span>
              </span>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setNewAttachment(null)}
              >
                Remove
              </button>
            </div>
          )}

          {removeAttachment && !newAttachment && (
            <div className="alert alert-info" style={{ marginTop: 8 }}>
              The existing file will be removed when you save.{' '}
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setRemoveAttachment(false)}
              >
                Undo
              </button>
            </div>
          )}
        </div>

        {error && <div className="alert alert-error">{error}</div>}
      </form>
    </Modal>
  );
};

export default TaskEditModal;
