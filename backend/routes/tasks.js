const express = require('express');
const {
    createTask,
    getTasks,
    getTask,
    updateTask,
    deleteTask,
    addTaskComment,
    updateTaskComment,
    deleteTaskComment,
    addTaskAttachment,
    deleteTaskAttachment
} = require('../controllers/taskController');

const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router
    .route('/')
    .get(getTasks)
    .post(createTask);

router
    .route('/:id')
    .get(getTask)
    .put(updateTask)
    .delete(deleteTask);

router.route('/:id/comments').post(addTaskComment);
router.route('/:id/comments/:commentId')
    .put(updateTaskComment)
    .delete(deleteTaskComment);
router.route('/:id/attachments').post(addTaskAttachment);
router.route('/:id/attachments/:attachmentId').delete(deleteTaskAttachment);

module.exports = router;
