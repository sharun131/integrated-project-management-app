const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res) => {
    try {
        const { title, description, project, assignedTo, priority, dueDate, estimatedHours } = req.body;

        // Verify Project Exists
        const projectExists = await Project.findById(project);
        if (!projectExists) {
            return res.status(404).json({ success: false, error: 'Project not found' });
        }

        // Create task
        const task = await Task.create({
            title,
            description,
            project,
            assignedTo: assignedTo || req.user.id, // Default to self if not provided
            priority,
            dueDate,
            estimatedHours,
            createdBy: req.user.id
        });

        res.status(201).json({
            success: true,
            data: task
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get tasks (Filtered by Project or User)
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res) => {
    try {
        let queryObj = {};

        if (req.query.projectId) {
            queryObj.project = req.query.projectId;
        }

        // If not Admin/Manager, only see tasks assigned to me or in my projects
        // For simplicity in this demo, Team Members see all tasks in their projects.

        // If not Admin/Manager, only see tasks assigned to me
        if (req.user.role === 'Team Member') {
            queryObj.assignedTo = req.user.id;
        }

        const tasks = await Task.find(queryObj)
            .populate('assignedTo', 'name email')
            .populate('project', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: tasks.length,
            data: tasks
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('assignedTo', 'name email')
            .populate('project', 'name')
            .populate('dependencies', 'title status');

        if (!task) {
            return res.status(404).json({ success: false, error: 'Task not found' });
        }

        res.status(200).json({
            success: true,
            data: task
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res) => {
    try {
        let task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ success: false, error: 'Task not found' });
        }

        // RBAC: Team Member can only update Status, Admin/Manager can update all
        // Simplification: Allow update for now, refine logic later for field-level access

        task = await Task.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: task
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private (Admin/Manager)
exports.deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ success: false, error: 'Task not found' });
        }

        // Allow creator or admin/manager to delete
        if (req.user.role === 'Team Member' && task.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ success: false, error: 'Not authorized to delete this task' });
        }

        await task.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
// @desc    Add comment to task
// @route   POST /api/tasks/:id/comments
// @access  Private
exports.addTaskComment = async (req, res) => {
    try {
        const { text } = req.body;
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ success: false, error: 'Task not found' });
        }

        const newComment = {
            user: req.user.id,
            text,
            createdAt: Date.now()
        };

        task.comments.push(newComment);
        await task.save();

        // Populate user details for immediate return
        await task.populate('comments.user', 'name email');

        res.status(200).json({
            success: true,
            data: task.comments
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Update task comment
// @route   PUT /api/tasks/:id/comments/:commentId
// @access  Private
exports.updateTaskComment = async (req, res) => {
    try {
        const { text } = req.body;
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ success: false, error: 'Task not found' });
        }

        const comment = task.comments.id(req.params.commentId);

        if (!comment) {
            return res.status(404).json({ success: false, error: 'Comment not found' });
        }

        // Check ownership
        if (comment.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'User not authorized to update this comment' });
        }

        comment.text = text;
        await task.save();

        await task.populate('comments.user', 'name email');

        res.status(200).json({
            success: true,
            data: task.comments
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Delete task comment
// @route   DELETE /api/tasks/:id/comments/:commentId
// @access  Private
exports.deleteTaskComment = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ success: false, error: 'Task not found' });
        }

        const comment = task.comments.id(req.params.commentId);

        if (!comment) {
            return res.status(404).json({ success: false, error: 'Comment not found' });
        }

        // Check ownership
        if (comment.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'User not authorized to delete this comment' });
        }

        task.comments.pull(req.params.commentId);
        await task.save();

        res.status(200).json({
            success: true,
            data: task.comments
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};


// @desc    Add attachment to task
// @route   POST /api/tasks/:id/attachments
// @access  Private
exports.addTaskAttachment = async (req, res) => {
    try {
        const { name, url } = req.body;
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ success: false, error: 'Task not found' });
        }

        const newAttachment = {
            name,
            url: url || '#',
            uploadedBy: req.user.id,
            uploadedAt: Date.now()
        };

        if (!task.attachments) {
            task.attachments = [];
        }

        task.attachments.push(newAttachment);
        await task.save();

        // Re-fetch to ensure clean population
        const updatedTask = await Task.findById(req.params.id).populate('attachments.uploadedBy', 'name');

        res.status(200).json({
            success: true,
            data: updatedTask.attachments
        });
    } catch (err) {
        console.error('Attachment error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
// @desc    Delete attachment from task
// @route   DELETE /api/tasks/:id/attachments/:attachmentId
// @access  Private
exports.deleteTaskAttachment = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ success: false, error: 'Task not found' });
        }

        // Idempotent Deletion: Check if it exists for logging, but don't error if missing.
        // Just ensure it is removed from the array.
        const originalLength = task.attachments.length;
        task.attachments = task.attachments.filter(att => att._id.toString() !== req.params.attachmentId);

        if (task.attachments.length === originalLength) {
            console.log(`Attachment ${req.params.attachmentId} not found in task ${req.params.id}. Assuming already deleted.`);
        }

        await task.save();

        // Re-fetch to valid population
        const updatedTask = await Task.findById(req.params.id).populate('attachments.uploadedBy', 'name');

        res.status(200).json({
            success: true,
            data: updatedTask.attachments
        });
    } catch (err) {
        console.error('Delete Attachment error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
