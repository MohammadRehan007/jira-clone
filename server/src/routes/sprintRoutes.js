const express = require('express');
const router = express.Router();
const { getSprintsByProject, createSprint, updateSprintStatus } = require('../controllers/sprintController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.get('/', protect, getSprintsByProject);
router.post('/', protect, authorize('Admin', 'ProjectLead'), createSprint);
router.put('/:id/status', protect, authorize('Admin', 'ProjectLead'), updateSprintStatus);

module.exports = router;
