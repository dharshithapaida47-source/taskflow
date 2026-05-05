const express = require('express');
const { 
  getAllProjects, 
  createProject, 
  getProjectById, 
  updateProject,
  deleteProject,
  addMemberToProject,
  removeMemberFromProject
} = require('../controllers/projectController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All routes require authentication

router.get('/', getAllProjects);
router.post('/', adminOnly, createProject);
router.get('/:id', getProjectById);
router.put('/:id', adminOnly, updateProject);
router.delete('/:id', adminOnly, deleteProject);
router.post('/:id/members', adminOnly, addMemberToProject);
router.delete('/:id/members/:memberId', adminOnly, removeMemberFromProject);

module.exports = router;
