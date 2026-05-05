const express = require('express');
const {
  getAllTasks,
  getTasksByProject,
  createTask,
  updateTask,
  deleteTask,
  downloadTaskAttachment
} = require('../controllers/taskController');
const { protect, adminOnly } = require('../middleware/auth');
const { singleAttachment } = require('../middleware/upload');

const router = express.Router();

router.use(protect); // All routes require authentication

router.get('/', getAllTasks);
router.get('/project/:projectId', getTasksByProject);
router.post('/', adminOnly, singleAttachment, createTask);
router.put('/:id', singleAttachment, updateTask);
router.delete('/:id', adminOnly, deleteTask);
router.get('/:id/attachment', downloadTaskAttachment);

module.exports = router;
