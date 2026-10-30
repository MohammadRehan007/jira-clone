const express = require('express');
const router = express.Router();
const { getUsers, getUserById, createUser, updateUser, deleteUser } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.get('/', protect, getUsers);
router.get('/:id', protect, getUserById);
router.post('/', protect, authorize('Admin', 'ProjectLead'), createUser);
router.put('/:id', protect, authorize('Admin', 'ProjectLead'), updateUser);
router.patch('/:id', protect, authorize('Admin', 'ProjectLead'), updateUser);
router.post('/:id', protect, authorize('Admin', 'ProjectLead'), updateUser);
router.delete('/:id', protect, authorize('Admin'), deleteUser);

module.exports = router;
