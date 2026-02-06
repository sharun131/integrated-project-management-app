const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getManagerStats, getMemberStats } = require('../controllers/roleDashboardController');

const router = express.Router();

router.use(protect); // All routes protected

// Manager Routes
router.get('/manager', authorize('Project Manager', 'Project Admin', 'Super Admin'), getManagerStats);

// Member Routes
router.get('/member', authorize('Team Member', 'Team Lead'), getMemberStats);

module.exports = router;
