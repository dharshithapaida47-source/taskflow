import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getAllProjects,
  getAllTasks,
  updateTask,
  deleteTask,
  createTask,
  getAllUsers
} from '../utils/api';
import TaskItem from '../components/TaskItem';
import { SkeletonTaskCard, SkeletonStatsRow } from '../components/Skeleton';
import { InboxIcon, PlayIcon, CheckIcon, AlertIcon, PlusIcon } from '../components/Icons';
import Modal from '../components/Modal';
import UserPicker from '../components/UserPicker';
import './Dashboard.css';

const TASKS_PER_PAGE = 20;

const isTaskOverdue = (task) =>
  !!task.dueDate &&
  task.status !== 'done' &&
  new Date(task.dueDate).getTime() < Date.now();

const KanbanColumn = ({
  title, dotClass, count, children, emptyIcon, emptyMessage
}) => (
  <div className="kanban-column">
    <div className="kanban-column-header">
      <div className="kanban-column-title">
        <span className={`kanban-column-dot ${dotClass}`} />
        {title}
      </div>
      <span className="kanban-column-count">{count}</span>
    </div>
    <div className="kanban-column-cards">
      {count === 0 ? (
        <div className="kanban-empty">
          <span className="kanban-empty-icon" aria-hidden="true">{emptyIcon}</span>
          <span>{emptyMessage}</span>
        </div>
      ) : (
        children
      )}
    </div>
  </div>
);

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    projectId: '',
    assigneeId: '',
    dueDate: ''
  });

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const flashSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };
  const flashError = (msg) => {
    setError(msg);
    setTimeout(() => setError(''), 4000);
  };

  const loadTasks = useCallback(async (targetPage = page) => {
    try {
      const response = await getAllTasks({ page: targetPage, limit: TASKS_PER_PAGE });
      const payload = response.data.data || response.data;
      setTasks(payload.tasks || []);
      setTotalPages(payload.pages || 1);
      setTotalCount(payload.total || (payload.tasks || []).length);
    } catch (err) {
      flashError('Failed to load tasks');
    }
  }, [page]);

  const loadProjects = useCallback(async () => {
    try {
      const response = await getAllProjects();
      const payload = response.data.data || response.data;
      setProjects(payload.projects || []);
    } catch (err) { /* not fatal */ }
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      const response = await getAllUsers();
      const payload = response.data.data || response.data;
      setUsers(payload.users || []);
    } catch (err) { /* not fatal */ }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await Promise.all([loadTasks(1), loadProjects(), loadUsers()]);
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (loading) return;
    loadTasks(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleStatusChange = useCallback(async (taskId, newStatus) => {
    try {
      await updateTask(taskId, { status: newStatus });
      flashSuccess('Task updated');
      await loadTasks(page);
    } catch (err) {
      flashError(err.response?.data?.message || 'Failed to update task');
    }
  }, [loadTasks, page]);

  const handleDeleteTask = useCallback(async (taskId) => {
    if (!window.confirm('Delete this task? This cannot be undone.')) return;
    try {
      await deleteTask(taskId);
      flashSuccess('Task deleted');
      await loadTasks(page);
    } catch (err) {
      flashError('Failed to delete task');
    }
  }, [loadTasks, page]);

  const resetTaskForm = () => {
    setNewTask({ title: '', description: '', projectId: '', assigneeId: '', dueDate: '' });
  };

  const closeCreateModal = () => {
    if (creating) return;
    setShowCreateForm(false);
    resetTaskForm();
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title || !newTask.projectId || !newTask.assigneeId) {
      flashError('Please fill in all required fields');
      return;
    }
    setCreating(true);
    try {
      await createTask({
        title: newTask.title,
        description: newTask.description,
        projectId: newTask.projectId,
        assigneeId: newTask.assigneeId,
        dueDate: newTask.dueDate || null
      });
      flashSuccess('Task created');
      resetTaskForm();
      setShowCreateForm(false);
      if (page !== 1) setPage(1);
      else await loadTasks(1);
    } catch (err) {
      flashError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setCreating(false);
    }
  };

  const grouped = useMemo(() => ({
    todo: tasks.filter(t => t.status === 'todo'),
    inprogress: tasks.filter(t => t.status === 'inprogress'),
    done: tasks.filter(t => t.status === 'done')
  }), [tasks]);

  const overdueCount = useMemo(
    () => tasks.filter(isTaskOverdue).length,
    [tasks]
  );

  const assignableUsers = useMemo(() => {
    if (!newTask.projectId) return users;
    const project = projects.find((p) => p._id === newTask.projectId);
    if (!project) return users;
    const allowedIds = new Set([
      project.admin?._id || project.admin,
      ...(project.members || []).map((m) => m._id || m)
    ]);
    return users.filter((u) => allowedIds.has(u._id));
  }, [newTask.projectId, projects, users]);

  const userRole = isAdmin ? 'admin' : 'member';
  const noProjectsYet = isAdmin && projects.length === 0;

  if (loading) {
    return (
      <div>
        <div className="dashboard-header">
          <div className="dashboard-header-text">
            <h1>Loading your dashboard…</h1>
            <p>Just a moment.</p>
          </div>
        </div>
        <SkeletonStatsRow />
        <div className="kanban-board">
          {[0, 1, 2].map((i) => (
            <div key={i} className="kanban-column">
              <SkeletonTaskCard />
              <SkeletonTaskCard />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const renderTask = (task) => (
    <TaskItem
      key={task._id}
      task={task}
      onStatusChange={handleStatusChange}
      onDelete={handleDeleteTask}
      userRole={userRole}
    />
  );

  return (
    <div>
      <div className="dashboard-header">
        <div className="dashboard-header-text">
          <h1>Welcome back, {user?.name?.split(' ')[0] || 'there'}</h1>
          <p>
            {totalCount} task{totalCount === 1 ? '' : 's'} total
            {isAdmin ? ' across your team' : ' assigned to you'}.
          </p>
        </div>
        {isAdmin && !showCreateForm && (
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateForm(true)}
            disabled={noProjectsYet}
            title={noProjectsYet ? 'Create a project first' : ''}
          >
            <PlusIcon width={16} height={16} />
            New Task
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {noProjectsYet && (
        <div className="alert alert-info">
          You don't have any projects yet. Head to the <a href="/projects">Projects</a> tab to
          create one — you'll need a project before you can create tasks.
        </div>
      )}

      <div className="dashboard-stats">
        <div className="stat-card stat-card-todo">
          <div className="stat-card-header">
            <span className="stat-card-label">To Do</span>
            <span className="stat-card-icon"><InboxIcon /></span>
          </div>
          <div className="stat-card-value">{grouped.todo.length}</div>
        </div>

        <div className="stat-card stat-card-progress">
          <div className="stat-card-header">
            <span className="stat-card-label">In Progress</span>
            <span className="stat-card-icon"><PlayIcon width={14} height={14} /></span>
          </div>
          <div className="stat-card-value">{grouped.inprogress.length}</div>
        </div>

        <div className="stat-card stat-card-done">
          <div className="stat-card-header">
            <span className="stat-card-label">Completed</span>
            <span className="stat-card-icon"><CheckIcon /></span>
          </div>
          <div className="stat-card-value">{grouped.done.length}</div>
        </div>

        <div className={`stat-card stat-card-overdue${overdueCount > 0 ? ' has-overdue' : ''}`}>
          <div className="stat-card-header">
            <span className="stat-card-label">Overdue</span>
            <span className="stat-card-icon"><AlertIcon /></span>
          </div>
          <div className="stat-card-value">{overdueCount}</div>
        </div>
      </div>

      {isAdmin && (
        <Modal
          open={showCreateForm}
          title="Create a new task"
          onClose={closeCreateModal}
          footer={
            <>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={closeCreateModal}
                disabled={creating}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="create-task-form"
                className="btn btn-primary"
                disabled={creating}
              >
                {creating ? <><span className="spinner" /> Creating…</> : 'Create task'}
              </button>
            </>
          }
        >
          <form id="create-task-form" onSubmit={handleCreateTask}>
            <div className="form-group">
              <label className="form-label" htmlFor="task-title">Task name *</label>
              <input
                id="task-title"
                type="text"
                className="form-control"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="e.g. Design landing page hero"
                autoFocus
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="task-description">Description</label>
              <textarea
                id="task-description"
                className="form-control"
                rows="3"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Add any notes, requirements, or links…"
                maxLength={1000}
              />
            </div>

            <div className="dashboard-form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="task-project">Project *</label>
                <select
                  id="task-project"
                  className="form-control"
                  value={newTask.projectId}
                  onChange={(e) =>
                    setNewTask({ ...newTask, projectId: e.target.value, assigneeId: '' })
                  }
                  required
                >
                  <option value="">Select a project</option>
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="task-due">Due date</label>
                <input
                  id="task-due"
                  type="date"
                  className="form-control"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Assign to *</label>
              {!newTask.projectId ? (
                <div className="user-picker-empty">
                  Pick a project above to see its members.
                </div>
              ) : (
                <UserPicker
                  users={assignableUsers}
                  selectedId={newTask.assigneeId}
                  onSelect={(id) => setNewTask({ ...newTask, assigneeId: id })}
                  emptyMessage="This project has no members yet. Add one from the Projects tab."
                />
              )}
            </div>
          </form>
        </Modal>
      )}

      <div className="kanban-board">
        <KanbanColumn
          title="To Do"
          dotClass="kanban-column-dot-todo"
          count={grouped.todo.length}
          emptyIcon="📥"
          emptyMessage="No tasks waiting"
        >
          {grouped.todo.map(renderTask)}
        </KanbanColumn>

        <KanbanColumn
          title="In Progress"
          dotClass="kanban-column-dot-progress"
          count={grouped.inprogress.length}
          emptyIcon="🛠"
          emptyMessage="Nothing in progress"
        >
          {grouped.inprogress.map(renderTask)}
        </KanbanColumn>

        <KanbanColumn
          title="Completed"
          dotClass="kanban-column-dot-done"
          count={grouped.done.length}
          emptyIcon="🏁"
          emptyMessage="No completed tasks"
        >
          {grouped.done.map(renderTask)}
        </KanbanColumn>
      </div>

      {totalPages > 1 && (
        <div className="dashboard-pagination">
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            ← Previous
          </button>
          <span className="dashboard-pagination-info">
            Page {page} of {totalPages}
          </span>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
