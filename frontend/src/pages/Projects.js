import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getAllProjects,
  createProject,
  deleteProject,
  addProjectMember,
  removeProjectMember,
  getAllUsers,
  getProjectProgress
} from '../utils/api';
import { SkeletonProjectGrid } from '../components/Skeleton';
import { PlusIcon, TrashIcon } from '../components/Icons';
import Modal from '../components/Modal';
import './Projects.css';

const Projects = () => {
  const { isAdmin, user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [memberInputs, setMemberInputs] = useState({}); // { [projectId]: userId }
  const [progressOpen, setProgressOpen] = useState(false);
  const [progressLoading, setProgressLoading] = useState(false);
  const [progressData, setProgressData] = useState(null);

  const openProgress = useCallback(async (project) => {
    setProgressOpen(true);
    setProgressLoading(true);
    setProgressData({ project: { name: project.name }, members: [], totals: null });
    try {
      const response = await getProjectProgress(project._id);
      const payload = response.data.data || response.data;
      setProgressData(payload);
    } catch (err) {
      setProgressData(null);
      setProgressOpen(false);
      setError(err.response?.data?.message || 'Failed to load project progress');
      setTimeout(() => setError(''), 4000);
    } finally {
      setProgressLoading(false);
    }
  }, []);

  const closeProgress = () => {
    setProgressOpen(false);
    setProgressData(null);
  };

  const flashSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  const flashError = (msg) => {
    setError(msg);
    setTimeout(() => setError(''), 4000);
  };

  const loadProjects = useCallback(async () => {
    try {
      const response = await getAllProjects();
      const payload = response.data.data || response.data;
      setProjects(payload.projects || []);
    } catch (err) {
      flashError('Failed to load projects');
    }
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      const response = await getAllUsers();
      const payload = response.data.data || response.data;
      setUsers(payload.users || []);
    } catch (err) {
      // not fatal
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await Promise.all([loadProjects(), loadUsers()]);
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [loadProjects, loadUsers]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      flashError('Project name is required');
      return;
    }
    setCreating(true);
    try {
      await createProject({ name: form.name.trim(), description: form.description.trim() });
      setForm({ name: '', description: '' });
      setShowCreate(false);
      flashSuccess('Project created');
      await loadProjects();
    } catch (err) {
      flashError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (project) => {
    if (!window.confirm(`Delete project "${project.name}"? This will also delete all its tasks.`)) {
      return;
    }
    try {
      await deleteProject(project._id);
      flashSuccess('Project deleted');
      await loadProjects();
    } catch (err) {
      flashError(err.response?.data?.message || 'Failed to delete project');
    }
  };

  const handleAddMember = async (project) => {
    const memberId = memberInputs[project._id];
    if (!memberId) return;
    try {
      await addProjectMember(project._id, memberId);
      setMemberInputs({ ...memberInputs, [project._id]: '' });
      flashSuccess('Member added');
      await loadProjects();
    } catch (err) {
      flashError(err.response?.data?.message || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (project, memberId) => {
    try {
      await removeProjectMember(project._id, memberId);
      flashSuccess('Member removed');
      await loadProjects();
    } catch (err) {
      flashError(err.response?.data?.message || 'Failed to remove member');
    }
  };

  const renderMembers = (project) => {
    const adminId = project.admin?._id || project.admin;
    const memberIds = new Set([
      adminId,
      ...(project.members || []).map((m) => m._id || m)
    ]);
    const availableUsers = users.filter((u) => !memberIds.has(u._id));
    const isProjectOwner = adminId === user?.id || adminId === user?._id;

    return (
      <div className="project-members">
        <div className="project-members-label">Team</div>
        <div className="project-members-list">
          <div className="project-member-row">
            <span>
              {project.admin?.name || 'Unknown'}{' '}
              <span className="badge badge-admin">Admin</span>
            </span>
            <span className="meta">{project.admin?.email}</span>
          </div>
          {(project.members || []).map((m) => (
            <div key={m._id} className="project-member-row">
              <span>
                {m.name} <span className="badge badge-member">Member</span>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="meta">{m.email}</span>
                {isAdmin && isProjectOwner && (
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleRemoveMember(project, m._id)}
                    aria-label={`Remove ${m.name}`}
                  >
                    Remove
                  </button>
                )}
              </span>
            </div>
          ))}
          {(project.members || []).length === 0 && (
            <div className="meta">No additional members yet</div>
          )}
        </div>

        {isAdmin && isProjectOwner && availableUsers.length > 0 && (
          <div className="project-add-member">
            <select
              className="form-control"
              value={memberInputs[project._id] || ''}
              onChange={(e) =>
                setMemberInputs({ ...memberInputs, [project._id]: e.target.value })
              }
              aria-label="Select a user to add"
            >
              <option value="">Add a member…</option>
              {availableUsers.map((u) => (
                <option key={u._id} value={u._id}>{u.name} — {u.email}</option>
              ))}
            </select>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => handleAddMember(project)}
              disabled={!memberInputs[project._id]}
            >
              Add
            </button>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div>
        <div className="projects-header">
          <div>
            <h1 className="section-title">My Projects</h1>
            <p className="section-subtitle">Loading…</p>
          </div>
        </div>
        <SkeletonProjectGrid count={3} />
      </div>
    );
  }

  return (
    <div>
      <div className="projects-header">
        <div>
          <h1 className="section-title">My Projects</h1>
          <p className="section-subtitle">
            {isAdmin
              ? 'Projects you administer or belong to. Create new ones and manage your teams.'
              : 'Projects you have been added to.'}
          </p>
        </div>
        {isAdmin && !showCreate && (
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            <PlusIcon width={16} height={16} />
            New Project
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {isAdmin && showCreate && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <strong>Create a new project</strong>
          </div>
          <div className="card-body">
            <form className="create-project-form" onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label" htmlFor="project-name">Name *</label>
                <input
                  id="project-name"
                  className="form-control"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Marketing Website Redesign"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="project-description">Description</label>
                <textarea
                  id="project-description"
                  className="form-control"
                  rows="3"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="What's this project about?"
                />
              </div>
              <div className="create-project-form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowCreate(false);
                    setForm({ name: '', description: '' });
                  }}
                  disabled={creating}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? 'Creating…' : 'Create project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon" aria-hidden="true">📁</div>
            <div className="empty-state-title">
              {isAdmin ? 'No projects yet' : 'No projects assigned'}
            </div>
            <div className="empty-state-text">
              {isAdmin
                ? 'Create your first project to start organizing tasks and assigning them to your team.'
                : "You're not part of any project yet. Ask an admin to add you to one."}
            </div>
            {isAdmin && !showCreate && (
              <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                <PlusIcon width={16} height={16} />
                Create your first project
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((project) => {
            const adminId = project.admin?._id || project.admin;
            const isProjectOwner = adminId === user?.id || adminId === user?._id;
            return (
              <div className="card" key={project._id}>
                <div className="card-body project-card">
                  <div className="project-card-header">
                    <div className="project-card-title">{project.name}</div>
                    <span className="badge badge-admin">
                      {(project.members?.length || 0) + 1} member
                      {(project.members?.length || 0) + 1 !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {project.description && (
                    <div className="project-card-description">{project.description}</div>
                  )}
                  {renderMembers(project)}
                  <div className="project-card-actions">
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => openProgress(project)}
                    >
                      View progress
                    </button>
                    {isAdmin && isProjectOwner && (
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleDelete(project)}
                        style={{ color: 'var(--color-danger)' }}
                      >
                        <TrashIcon width={14} height={14} />
                        Delete project
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={progressOpen}
        title={progressData?.project?.name ? `Progress · ${progressData.project.name}` : 'Project progress'}
        onClose={closeProgress}
        size="lg"
        footer={
          <button type="button" className="btn btn-secondary" onClick={closeProgress}>
            Close
          </button>
        }
      >
        {progressLoading ? (
          <div className="loading-state">Loading team progress…</div>
        ) : !progressData?.members?.length ? (
          <div className="empty-state">
            <div className="empty-state-text">No team members on this project yet.</div>
          </div>
        ) : (
          <>
            {progressData.totals && (
              <div className="progress-totals">
                <div>
                  <strong>{progressData.totals.tasks}</strong> total tasks
                </div>
                <div>
                  <strong>{progressData.totals.completed}</strong> completed
                </div>
                <div className={progressData.totals.overdue > 0 ? 'is-warning' : ''}>
                  <strong>{progressData.totals.overdue}</strong> overdue
                </div>
              </div>
            )}
            <table className="progress-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Pending</th>
                  <th>In Progress</th>
                  <th>Completed</th>
                  <th>Overdue</th>
                  <th>%</th>
                </tr>
              </thead>
              <tbody>
                {progressData.members.map((row) => (
                  <tr key={row.user._id}>
                    <td>
                      <div className="progress-member">
                        <div className="progress-member-name">{row.user.name}</div>
                        <div className="progress-member-email">{row.user.email}</div>
                      </div>
                    </td>
                    <td><span className="badge badge-todo">{row.pending}</span></td>
                    <td><span className="badge badge-inprogress">{row.inprogress}</span></td>
                    <td><span className="badge badge-done">{row.completed}</span></td>
                    <td>
                      {row.overdue > 0
                        ? <span className="badge badge-overdue">{row.overdue}</span>
                        : <span className="muted">0</span>}
                    </td>
                    <td>
                      <div className="progress-bar" aria-label={`${row.completionPct}% complete`}>
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${row.completionPct}%` }}
                        />
                        <span className="progress-bar-label">{row.completionPct}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </Modal>
    </div>
  );
};

export default Projects;
