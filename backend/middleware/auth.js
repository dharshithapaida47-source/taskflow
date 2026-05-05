const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Always read the canonical role from the DB — never trust the JWT's
    // role claim (the user may have been demoted/promoted since the token
    // was issued, or the token may be from a previous deploy).
    const user = await User.findById(decoded.id).select('role');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Account no longer exists' });
    }

    req.userId = String(user._id);
    req.userRole = user.role;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
  }
  next();
};

module.exports = { protect, adminOnly };
