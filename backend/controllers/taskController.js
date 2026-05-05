const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const { validateMongoId, validateTaskTitle } = require('../utils/validators');
const { errorResponse, successResponse } = require('../utils/responseHandler');
const { parsePagination, buildPageMeta } = require('../utils/pagination');

// @route   GET /api/tasks
// @desc    Get all tasks for current user
// @access  Private
exports.getAllTasks = async (req, res) => {
  try {
    let query = {};

    // If not admin, only get tasks assigned to the user
    if (req.userRole !== 'admin') {
      query.assignee = req.userId;
    }

    const { page, limit, skip } = parsePagination(req.query);

    const [tasks, total] = await Promise.all([
      Task.find(query)
        .populate('project', 'name')
        .populate('assignee', 'name email')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Task.countDocuments(query)
    ]);

    successResponse(res, 200, 'Tasks fetched successfully', {
      tasks,
      ...buildPageMeta(total, page, limit)
    });
  } catch (error) {
    errorResponse(res, 500, 'Error fetching tasks', error.message);
  }
};

// @route   GET /api/tasks/project/:projectId
// @desc    Get all tasks for a specific project
// @access  Private
exports.getTasksByProject = async (req, res) => {
  try {
    if (!validateMongoId(req.params.projectId)) {
      return errorResponse(res, 400, 'Invalid project ID format');
    }

    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return errorResponse(res, 404, 'Project not found');
    }

    const filter = { project: req.params.projectId };
    const { page, limit, skip } = parsePagination(req.query);

    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .populate('project', 'name')
        .populate('assignee', 'name email')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Task.countDocuments(filter)
    ]);

    successResponse(res, 200, 'Tasks fetched successfully', {
      tasks,
      ...buildPageMeta(total, page, limit)
    });
  } catch (error) {
    errorResponse(res, 500, 'Error fetching tasks', error.message);
  }
};

// @route   POST /api/tasks
// @desc    Create a new task (Admin only)
// @access  Private/Admin
exports.createTask = async (req, res) => {
  try {
    const { title, description, status, dueDate, projectId, assigneeId } = req.body;

    // Validate required fields
    const titleValidation = validateTaskTitle(title);
    if (!titleValidation.valid) {
      return errorResponse(res, 400, titleValidation.message);
    }

    if (!projectId || !validateMongoId(projectId)) {
      return errorResponse(res, 400, 'Valid project ID is required');
    }

    if (!assigneeId || !validateMongoId(assigneeId)) {
      return errorResponse(res, 400, 'Valid assignee ID is required');
    }

    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return errorResponse(res, 404, 'Project not found');
    }

    // Verify assignee exists
    const assignee = await User.findById(assigneeId);
    if (!assignee) {
      return errorResponse(res, 404, 'Assignee not found');
    }

    // Verify assignee is a project member
    if (!project.members.includes(assigneeId) && project.admin.toString() !== assigneeId) {
      return errorResponse(res, 400, 'Assignee must be a project member');
    }

    const task = await Task.create({
      title: title.trim(),
      description: (description || '').trim(),
      status: status || 'todo',
      dueDate: dueDate || null,
      project: projectId,
      assignee: assigneeId,
      createdBy: req.userId
    });

    await task.populate('project', 'name');
    await task.populate('assignee', 'name email');
    await task.populate('createdBy', 'name email');

    successResponse(res, 201, 'Task created successfully', task);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return errorResponse(res, 400, 'Validation error', error.message);
    }
    errorResponse(res, 500, 'Error creating task', error.message);
  }
};

// @route   PUT /api/tasks/:id
// @desc    Update task
// @access  Private
exports.updateTask = async (req, res) => {
  try {
    if (!validateMongoId(req.params.id)) {
      return errorResponse(res, 400, 'Invalid task ID format');
    }

    let task = await Task.findById(req.params.id);

    if (!task) {
      return errorResponse(res, 404, 'Task not found');
    }

    // Check if user is admin or the assignee
    if (req.userRole !== 'admin' && task.assignee.toString() !== req.userId) {
      return errorResponse(res, 403, 'Not authorized to update this task');
    }

    const { title, description, status, dueDate, assigneeId } = req.body;

    // Update title if provided
    if (title) {
      const titleValidation = validateTaskTitle(title);
      if (!titleValidation.valid) {
        return errorResponse(res, 400, titleValidation.message);
      }
      task.title = title.trim();
    }

    // Update description if provided
    if (description !== undefined) {
      task.description = (description || '').trim();
    }

    // Update status if provided
    if (status && ['todo', 'inprogress', 'done'].includes(status)) {
      task.status = status;
    } else if (status) {
      return errorResponse(res, 400, 'Invalid status. Must be: todo, inprogress, or done');
    }

    // Update due date if provided
    if (dueDate !== undefined) {
      task.dueDate = dueDate;
    }

    // Handle task reassignment (Admin only)
    if (assigneeId) {
      // Only admins can reassign tasks
      if (req.userRole !== 'admin') {
        return errorResponse(res, 403, 'Only admins can reassign tasks');
      }

      // Validate assignee ID format
      if (!validateMongoId(assigneeId)) {
        return errorResponse(res, 400, 'Invalid assignee ID format');
      }

      // Verify assignee exists
      const newAssignee = await User.findById(assigneeId);
      if (!newAssignee) {
        return errorResponse(res, 404, 'User not found');
      }

      // Get the project to verify assignee is a member
      const project = await Project.findById(task.project);
      if (!project) {
        return errorResponse(res, 404, 'Project not found');
      }

      // Check if assignee is a member of the project (or is the admin)
      const isMember = project.members.includes(assigneeId) || project.admin.toString() === assigneeId;
      if (!isMember) {
        return errorResponse(res, 400, 'User must be a member of this project to be assigned tasks');
      }

      // Update assignee
      task.assignee = assigneeId;
    }

    task = await task.save();
    await task.populate('project', 'name');
    await task.populate('assignee', 'name email');
    await task.populate('createdBy', 'name email');

    successResponse(res, 200, 'Task updated successfully', task);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return errorResponse(res, 400, 'Validation error', error.message);
    }
    errorResponse(res, 500, 'Error updating task', error.message);
  }
};

// @route   DELETE /api/tasks/:id
// @desc    Delete task (Admin only)
// @access  Private/Admin
exports.deleteTask = async (req, res) => {
  try {
    if (!validateMongoId(req.params.id)) {
      return errorResponse(res, 400, 'Invalid task ID format');
    }

    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return errorResponse(res, 404, 'Task not found');
    }

    successResponse(res, 200, 'Task deleted successfully', null);
  } catch (error) {
    errorResponse(res, 500, 'Error deleting task', error.message);
  }
};
