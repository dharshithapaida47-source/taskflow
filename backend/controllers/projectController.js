const Project = require('../models/Project');
const Task = require('../models/Task');
const { validateMongoId, validateProjectName } = require('../utils/validators');
const { errorResponse, successResponse } = require('../utils/responseHandler');
const { parsePagination, buildPageMeta } = require('../utils/pagination');

// @route   GET /api/projects
// @desc    Get all projects
// @access  Private
exports.getAllProjects = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);

    const [projects, total] = await Promise.all([
      Project.find()
        .populate('admin', 'name email')
        .populate('members', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Project.countDocuments()
    ]);

    successResponse(res, 200, 'Projects fetched successfully', {
      projects,
      ...buildPageMeta(total, page, limit)
    });
  } catch (error) {
    errorResponse(res, 500, 'Error fetching projects', error.message);
  }
};

// @route   POST /api/projects
// @desc    Create a new project (Admin only)
// @access  Private/Admin
exports.createProject = async (req, res) => {
  try {
    const { name, description, members } = req.body;

    // Validate project name
    const nameValidation = validateProjectName(name);
    if (!nameValidation.valid) {
      return errorResponse(res, 400, nameValidation.message);
    }

    const project = await Project.create({
      name: name.trim(),
      description: description || '',
      admin: req.userId,
      members: members || []
    });

    await project.populate('admin', 'name email');
    await project.populate('members', 'name email');

    successResponse(res, 201, 'Project created successfully', project);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return errorResponse(res, 400, 'Validation error', error.message);
    }
    errorResponse(res, 500, 'Error creating project', error.message);
  }
};

// @route   GET /api/projects/:id
// @desc    Get project by ID
// @access  Private
exports.getProjectById = async (req, res) => {
  try {
    if (!validateMongoId(req.params.id)) {
      return errorResponse(res, 400, 'Invalid project ID format');
    }

    const project = await Project.findById(req.params.id)
      .populate('admin', 'name email')
      .populate('members', 'name email');

    if (!project) {
      return errorResponse(res, 404, 'Project not found');
    }

    successResponse(res, 200, 'Project fetched successfully', project);
  } catch (error) {
    errorResponse(res, 500, 'Error fetching project', error.message);
  }
};

// @route   PUT /api/projects/:id
// @desc    Update project (Admin only)
// @access  Private/Admin
exports.updateProject = async (req, res) => {
  try {
    if (!validateMongoId(req.params.id)) {
      return errorResponse(res, 400, 'Invalid project ID format');
    }

    let project = await Project.findById(req.params.id);

    if (!project) {
      return errorResponse(res, 404, 'Project not found');
    }

    if (project.admin.toString() !== req.userId) {
      return errorResponse(res, 403, 'Not authorized to update this project');
    }

    const { name, description, members } = req.body;

    if (name) {
      const nameValidation = validateProjectName(name);
      if (!nameValidation.valid) {
        return errorResponse(res, 400, nameValidation.message);
      }
      project.name = name.trim();
    }
    
    if (description !== undefined) project.description = description;
    if (members) project.members = members;

    project = await project.save();
    await project.populate('admin', 'name email');
    await project.populate('members', 'name email');

    successResponse(res, 200, 'Project updated successfully', project);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return errorResponse(res, 400, 'Validation error', error.message);
    }
    errorResponse(res, 500, 'Error updating project', error.message);
  }
};

// @route   DELETE /api/projects/:id
// @desc    Delete project (Admin only) - cascade deletes tasks
// @access  Private/Admin
exports.deleteProject = async (req, res) => {
  try {
    if (!validateMongoId(req.params.id)) {
      return errorResponse(res, 400, 'Invalid project ID format');
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return errorResponse(res, 404, 'Project not found');
    }

    if (project.admin.toString() !== req.userId) {
      return errorResponse(res, 403, 'Not authorized to delete this project');
    }

    // Delete all tasks associated with this project
    await Task.deleteMany({ project: req.params.id });

    // Delete the project
    await Project.findByIdAndDelete(req.params.id);

    successResponse(res, 200, 'Project deleted successfully', null);
  } catch (error) {
    errorResponse(res, 500, 'Error deleting project', error.message);
  }
};

// @route   POST /api/projects/:id/members
// @desc    Add member to project
// @access  Private/Admin
exports.addMemberToProject = async (req, res) => {
  try {
    if (!validateMongoId(req.params.id)) {
      return errorResponse(res, 400, 'Invalid project ID format');
    }

    const { memberId } = req.body;

    if (!memberId || !validateMongoId(memberId)) {
      return errorResponse(res, 400, 'Valid member ID is required');
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return errorResponse(res, 404, 'Project not found');
    }

    if (project.admin.toString() !== req.userId) {
      return errorResponse(res, 403, 'Not authorized to manage this project');
    }

    // Check if member is already in the project
    if (project.members.includes(memberId)) {
      return errorResponse(res, 400, 'Member already added to this project');
    }

    project.members.push(memberId);
    await project.save();
    await project.populate('admin', 'name email');
    await project.populate('members', 'name email');

    successResponse(res, 200, 'Member added successfully', project);
  } catch (error) {
    errorResponse(res, 500, 'Error adding member', error.message);
  }
};

// @route   DELETE /api/projects/:id/members/:memberId
// @desc    Remove member from project
// @access  Private/Admin
exports.removeMemberFromProject = async (req, res) => {
  try {
    if (!validateMongoId(req.params.id) || !validateMongoId(req.params.memberId)) {
      return errorResponse(res, 400, 'Invalid project or member ID format');
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return errorResponse(res, 404, 'Project not found');
    }

    if (project.admin.toString() !== req.userId) {
      return errorResponse(res, 403, 'Not authorized to manage this project');
    }

    project.members = project.members.filter(id => id.toString() !== req.params.memberId);
    await project.save();
    await project.populate('admin', 'name email');
    await project.populate('members', 'name email');

    successResponse(res, 200, 'Member removed successfully', project);
  } catch (error) {
    errorResponse(res, 500, 'Error removing member', error.message);
  }
};
