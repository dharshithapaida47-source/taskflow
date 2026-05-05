const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validateEmail, validatePassword } = require('../utils/validators');

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// @route   POST /api/auth/signup
// @desc    Register user
// @access  Public
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if all required fields are provided
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide name, email, and password' 
      });
    }

    // Check if name is not empty or just spaces
    if (name.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name cannot be empty' 
      });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a valid email address (e.g., user@example.com)' 
      });
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ 
        success: false, 
        message: passwordValidation.message 
      });
    }

    // Check if email already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'This email is already registered. Please login or use a different email.' 
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password,
      role: 'member' // All new users are created as members
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome aboard.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Please check your input: ' + Object.values(error.errors).map(e => e.message).join(', ')
      });
    }
    res.status(500).json({ success: false, message: 'Something went wrong during signup. Please try again.' });
  }
};

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password'
      });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // If a role was specified at login, it must be valid
    if (role !== undefined && !['admin', 'member'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be either admin or member'
      });
    }

    // Find user and include password (normally hidden)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email or password is incorrect'
      });
    }

    // Compare entered password with stored hash
    const isPasswordMatch = await user.matchPassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email or password is incorrect'
      });
    }

    // If the login form picked a role, it must match the stored role.
    if (role && role !== user.role) {
      const friendly = user.role === 'admin' ? 'Admin' : 'Member';
      return res.status(403).json({
        success: false,
        message: `This account is registered as a ${friendly}. Please switch the role selector and try again.`
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Login successful! Welcome back.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Something went wrong during login. Please try again.' });
  }
};

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
