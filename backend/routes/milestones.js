const express = require('express');
const {
    createMilestone,
    getMilestones,
    getMilestone,
    updateMilestone,
    deleteMilestone,
    createPhase,
    getPhases
} = require('../controllers/milestoneController');

const { protect } = require('../middleware/auth');

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

router
    .route('/:id')
    .get(getMilestone)
    .put(updateMilestone)
    .delete(deleteMilestone);

module.exports = router;
