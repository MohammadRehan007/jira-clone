const express = require('express');
const router = express.Router();
const { getProjects, getProjectById, createProject, updateProject } = require('../controllers/projectController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.get('/', protect, getProjects);
router.get('/:id', protect, getProjectById);
router.post('/', protect, authorize('Admin', 'ProjectLead'), createProject);
router.put('/:id', protect, authorize('Admin', 'ProjectLead'), updateProject);

module.exports = router;
