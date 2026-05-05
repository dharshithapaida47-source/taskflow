const express = require('express');
const {
  getAllUsers,
  getUserById,
  createUser,
  promoteToAdmin,
  demoteToMember
} = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All routes require authentication

router.get('/', getAllUsers);
router.post('/', adminOnly, createUser);
router.get('/:id', getUserById);
router.put('/:id/promote', adminOnly, promoteToAdmin);
router.put('/:id/demote', adminOnly, demoteToMember);

module.exports = router;
