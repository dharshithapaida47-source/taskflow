const path = require('path');
const fs = require('fs');
const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const { validateMongoId, validateTaskTitle } = require('../utils/validators');
const { errorResponse, successResponse } = require('../utils/responseHandler');
const { parsePagination, buildPageMeta } = require('../utils/pagination');
const { UPLOAD_DIR } = require('../middleware/upload');

// Best-effort delete of an attachment from disk. Errors are logged but
// never propagate (a missing file shouldn't block a task delete).
const removeAttachmentFile = (filename) => {
  if (!filename) return;
  const target = path.join(UPLOAD_DIR, path.basename(filename));
  fs.unlink(target, (err) => {
    if (err && err.code !== 'ENOENT') {
      console.warn('Failed to delete attachment file:', target, err.message);
    }
  });
};

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

    // Optional ?workType= filter
    const VALID_WORK_TYPES = ['frontend', 'backend', 'fullstack', 'testing', 'design'];
    if (req.query.workType && VALID_WORK_TYPES.includes(req.query.workType)) {
      query.workType = req.query.workType;
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
    const { title, description, workType, status, dueDate, projectId, assigneeId } = req.body;
    const VALID_WORK_TYPES = ['frontend', 'backend', 'fullstack', 'testing', 'design'];

    if (workType && !VALID_WORK_TYPES.includes(workType)) {
      return errorResponse(res, 400, `workType must be one of: ${VALID_WORK_TYPES.join(', ')}`);
    }

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

    // If the assignee isn't part of the project yet, add them automatically.
    // This matches the natural admin flow: "assign to anyone; the system
    // keeps the project's team in sync."
    const isAlreadyOnTeam =
      project.admin.toString() === assigneeId ||
      project.members.some((m) => m.toString() === assigneeId);
    if (!isAlreadyOnTeam) {
      project.members.push(assigneeId);
      await project.save();
    }

    const taskDoc = {
      title: title.trim(),
      description: (description || '').trim(),
      workType: workType || 'fullstack',
      status: status || 'todo',
      dueDate: dueDate || null,
      project: projectId,
      assignee: assigneeId,
      createdBy: req.userId
    };

    // If multer parsed an uploaded file, attach its metadata
    if (req.file) {
      taskDoc.attachment = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        uploadedAt: new Date()
      };
    }

    const task = await Task.create(taskDoc);

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

    const { title, description, workType, status, dueDate, assigneeId } = req.body;
    const VALID_WORK_TYPES = ['frontend', 'backend', 'fullstack', 'testing', 'design'];

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

    // Update workType if provided (admin only — users cannot change it)
    if (workType !== undefined) {
      if (req.userRole !== 'admin') {
        return errorResponse(res, 403, 'Only admins can change task work type');
      }
      if (!VALID_WORK_TYPES.includes(workType)) {
        return errorResponse(res, 400, `workType must be one of: ${VALID_WORK_TYPES.join(', ')}`);
      }
      task.workType = workType;
    }

    // Update status if provided
    // Rule: only the assignee (a member) can change status. Admins are
    // explicitly blocked from changing status, even on tasks assigned to them.
    if (status !== undefined) {
      if (req.userRole === 'admin') {
        return errorResponse(
          res,
          403,
          'Admins cannot change task status — only the assigned member can'
        );
      }
      if (task.assignee.toString() !== req.userId) {
        return errorResponse(res, 403, 'You can only update your own task status');
      }
      if (!['todo', 'inprogress', 'done'].includes(status)) {
        return errorResponse(res, 400, 'Invalid status. Must be: todo, inprogress, or done');
      }
      task.status = status;
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

      // Auto-add the new assignee to the project's team if they aren't already.
      const isMember =
        project.admin.toString() === assigneeId ||
        project.members.some((m) => m.toString() === assigneeId);
      if (!isMember) {
        project.members.push(assigneeId);
        await project.save();
      }

      // Update assignee
      task.assignee = assigneeId;
    }

    // Handle attachment changes (Admin only)
    // - If multer parsed a new file (req.file): replace any existing attachment
    // - Else if req.body.removeAttachment === 'true': clear attachment
    const wantsRemoveAttachment =
      req.body.removeAttachment === true ||
      req.body.removeAttachment === 'true';

    if (req.file || wantsRemoveAttachment) {
      if (req.userRole !== 'admin') {
        // Drop the just-uploaded file if a non-admin somehow got here
        if (req.file) removeAttachmentFile(req.file.filename);
        return errorResponse(res, 403, 'Only admins can change task attachments');
      }
      // Clean up the previous file (if any)
      if (task.attachment?.filename) {
        removeAttachmentFile(task.attachment.filename);
      }
      if (req.file) {
        task.attachment = {
          filename: req.file.filename,
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
          size: req.file.size,
          uploadedAt: new Date()
        };
      } else {
        task.attachment = undefined;
      }
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

    // Clean up the attachment file from disk if there was one
    removeAttachmentFile(task.attachment?.filename);

    successResponse(res, 200, 'Task deleted successfully', null);
  } catch (error) {
    errorResponse(res, 500, 'Error deleting task', error.message);
  }
};

// @route   GET /api/tasks/:id/attachment
// @desc    Stream the task's uploaded attachment back to the caller.
//          Anyone with access to the task (admin or assignee) can download.
// @access  Private (admin OR assignee)
exports.downloadTaskAttachment = async (req, res) => {
  try {
    if (!validateMongoId(req.params.id)) {
      return errorResponse(res, 400, 'Invalid task ID format');
    }

    const task = await Task.findById(req.params.id);
    if (!task) return errorResponse(res, 404, 'Task not found');
    if (!task.attachment || !task.attachment.filename) {
      return errorResponse(res, 404, 'No attachment on this task');
    }

    // Authorization — admin or the assignee can download
    const isAdmin = req.userRole === 'admin';
    const isAssignee = task.assignee?.toString() === req.userId;
    if (!isAdmin && !isAssignee) {
      return errorResponse(res, 403, 'Not authorized to download this attachment');
    }

    const filePath = path.join(UPLOAD_DIR, path.basename(task.attachment.filename));
    if (!fs.existsSync(filePath)) {
      return errorResponse(res, 410, 'Attachment file is no longer available');
    }

    res.setHeader('Content-Type', task.attachment.mimeType || 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(task.attachment.originalName || 'attachment')}"`
    );
    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    errorResponse(res, 500, 'Error downloading attachment', error.message);
  }
};
