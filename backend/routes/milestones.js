const express = require('express');
const {
    createMilestone,
    getMilestones,
    getMilestone,
    updateMilestone,
    deleteMilestone,
    createPhase,
    getPhases,
    requestMilestoneApproval,
    reviewMilestone
} = require('../controllers/milestoneController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router
    .route('/')
    .get(getMilestones)
    .post(createMilestone);

router
    .route('/phases')
    .post(createPhase);

router
    .route('/:milestoneId/phases')
    .get(getPhases);

router.route('/:id')
    .get(protect, getMilestone)
    .put(protect, authorize('Super Admin', 'Project App-Admin', 'Project Admin', 'Project Manager', 'Team Lead'), updateMilestone)
    .delete(protect, authorize('Super Admin', 'Project App-Admin', 'Project Admin', 'Project Manager'), deleteMilestone);

router.route('/:id/request-approval')
    .put(protect, requestMilestoneApproval);

router.route('/:id/review')
    .put(protect, authorize('Super Admin', 'Project App-Admin', 'Project Admin', 'Project Manager'), reviewMilestone);

module.exports = router;
