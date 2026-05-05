const User = require('../models/User');
const { errorResponse, successResponse } = require('../utils/responseHandler');
const { validateMongoId } = require('../utils/validators');

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
