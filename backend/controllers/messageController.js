const Message = require('../models/Message');
const Project = require('../models/Project');
const Task = require('../models/Task');

// @desc    Get messages for a task
// @route   GET /api/messages/task/:taskId
// @access  Private
exports.getMessages = async (req, res) => {
    try {
        const messages = await Message.find({ task: req.params.taskId, isDeleted: false })
            .populate('sender', 'name email role')
            .sort({ createdAt: 1 }); // Oldest first (chat style)

        res.status(200).json({
            success: true,
            count: messages.length,
            data: messages
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res) => {
    try {
        const { text, taskId } = req.body;

        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ success: false, error: 'Task not found' });
        }

        const message = await Message.create({
            text,
            task: taskId,
            project: task.project,
            sender: req.user.id
        });

        const populatedMessage = await message.populate('sender', 'name email role');

        res.status(201).json({
            success: true,
            data: populatedMessage
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Edit a message
// @route   PUT /api/messages/:id
// @access  Private (Sender only)
exports.updateMessage = async (req, res) => {
    try {
        let message = await Message.findById(req.params.id);

        if (!message) {
            return res.status(404).json({ success: false, error: 'Message not found' });
        }

        if (message.sender.toString() !== req.user.id) {
            return res.status(403).json({ success: false, error: 'Not authorized to edit this message' });
        }

        message.text = req.body.text;
        message.isEdited = true;
        message.editedAt = Date.now();
        await message.save();

        res.status(200).json({
            success: true,
            data: message
        });

    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Delete a message (Soft)
// @route   DELETE /api/messages/:id
// @access  Private (Sender only)
exports.deleteMessage = async (req, res) => {
    try {
        let message = await Message.findById(req.params.id);

        if (!message) {
            return res.status(404).json({ success: false, error: 'Message not found' });
        }

        if (message.sender.toString() !== req.user.id && req.user.role !== 'Super Admin') {
            return res.status(403).json({ success: false, error: 'Not authorized to delete this message' });
        }

        message.isDeleted = true;
        await message.save();

        res.status(200).json({
            success: true,
            data: {}
        });

    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Toggle Reaction
// @route   POST /api/messages/:id/react
// @access  Private
exports.reactToMessage = async (req, res) => {
    try {
        const { emoji } = req.body;
        const message = await Message.findById(req.params.id);

        if (!message) {
            return res.status(404).json({ success: false, error: 'Message not found' });
        }

        // Check if user already reacted with this emoji
        const existingReactionIndex = message.reactions.findIndex(
            r => r.user.toString() === req.user.id && r.emoji === emoji
        );

        if (existingReactionIndex > -1) {
            // Remove reaction
            message.reactions.splice(existingReactionIndex, 1);
        } else {
            // Add reaction
            message.reactions.push({ emoji, user: req.user.id });
        }

        await message.save();

        res.status(200).json({
            success: true,
            data: message
        });

    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
