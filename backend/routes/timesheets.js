const express = require('express');
const { logTime, getTimesheets, updateTimesheetStatus } = require('../controllers/timesheetController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
    .post(logTime)
    .get(getTimesheets);

router.route('/:id/status')
    .put(updateTimesheetStatus);

module.exports = router;
