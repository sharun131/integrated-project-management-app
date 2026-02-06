const express = require('express');
const { getMessages, sendMessage, updateMessage, deleteMessage, reactToMessage } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
    .post(sendMessage);

router.route('/task/:taskId')
    .get(getMessages);

router.route('/:id')
    .put(updateMessage)
    .delete(deleteMessage);

router.route('/:id/react')
    .post(reactToMessage);

module.exports = router;
