// Validation helpers
const validateEmail = (email) => {
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  if (!password || password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters' };
  }
  return { valid: true };
};

const validateProjectName = (name) => {
  if (!name || name.trim().length === 0) {
    return { valid: false, message: 'Project name is required' };
  }
  if (name.length > 100) {
    return { valid: false, message: 'Project name must be less than 100 characters' };
  }
  return { valid: true };
};

const validateTaskTitle = (title) => {
  if (!title || title.trim().length === 0) {
    return { valid: false, message: 'Task title is required' };
  }
  if (title.length > 200) {
    return { valid: false, message: 'Task title must be less than 200 characters' };
  }
  return { valid: true };
};

const validateMongoId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

module.exports = {
  validateEmail,
  validatePassword,
  validateProjectName,
  validateTaskTitle,
  validateMongoId
};
