const express = require('express');
const { getIssues, createIssue, updateIssue, deleteIssue } = require('../controllers/issueController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getIssues)
    .post(createIssue);

router.route('/:id')
    .put(updateIssue)
    .delete(deleteIssue);

module.exports = router;
