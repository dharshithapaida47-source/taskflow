const express = require('express');
const { 
  getAllTasks, 
  getTasksByProject,
  createTask, 
  updateTask,
  deleteTask
} = require('../controllers/taskController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All routes require authentication

router.get('/', getAllTasks);
router.get('/project/:projectId', getTasksByProject);
router.post('/', adminOnly, createTask);
router.put('/:id', updateTask);
router.delete('/:id', adminOnly, deleteTask);

module.exports = router;
