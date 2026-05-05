const User = require('../models/User');
const { errorResponse, successResponse } = require('../utils/responseHandler');
const { validateMongoId, validateEmail, validatePassword } = require('../utils/validators');

// @route   GET /api/users
// @desc    Get all users (for admin to assign tasks)
// @access  Private
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, 'id name email role');

    successResponse(res, 200, 'Users fetched successfully', {
      count: users.length,
      users
    });
  } catch (error) {
    errorResponse(res, 500, 'Error fetching users', error.message);
  }
};

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    successResponse(res, 200, 'User fetched successfully', user);
  } catch (error) {
    errorResponse(res, 500, 'Error fetching user', error.message);
  }
};

// @route   POST /api/users
// @desc    Admin creates a new user account directly (with chosen role)
// @access  Private/Admin
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !name.trim()) {
      return errorResponse(res, 400, 'Name is required');
    }
    if (!validateEmail(email)) {
      return errorResponse(res, 400, 'A valid email is required');
    }
    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      return errorResponse(res, 400, passwordCheck.message);
    }
    const finalRole = role === 'admin' ? 'admin' : 'member';

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return errorResponse(res, 409, 'A user with this email already exists');
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: finalRole
    });

    successResponse(res, 201, 'User created successfully', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return errorResponse(res, 400, 'Validation error', error.message);
    }
    errorResponse(res, 500, 'Error creating user', error.message);
  }
};

// @route   PUT /api/users/:id/promote
// @desc    Promote member to admin (Admin only)
// @access  Private/Admin
exports.promoteToAdmin = async (req, res) => {
  try {
    // Validate user ID format
    if (!validateMongoId(req.params.id)) {
      return errorResponse(res, 400, 'Invalid user ID format');
    }

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    // Check if user is already admin
    if (user.role === 'admin') {
      return errorResponse(res, 400, 'User is already an admin');
    }

    // Update user role to admin
    user.role = 'admin';
    await user.save();

    successResponse(res, 200, 'User promoted to admin successfully', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    errorResponse(res, 500, 'Error promoting user', error.message);
  }
};

// @route   PUT /api/users/:id/demote
// @desc    Demote admin to member (Admin only)
// @access  Private/Admin
exports.demoteToMember = async (req, res) => {
  try {
    // Validate user ID format
    if (!validateMongoId(req.params.id)) {
      return errorResponse(res, 400, 'Invalid user ID format');
    }

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    // Check if user is already member
    if (user.role === 'member') {
      return errorResponse(res, 400, 'User is already a member');
    }

    // Update user role to member
    user.role = 'member';
    await user.save();

    successResponse(res, 200, 'User demoted to member successfully', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    errorResponse(res, 500, 'Error demoting user', error.message);
  }
};
