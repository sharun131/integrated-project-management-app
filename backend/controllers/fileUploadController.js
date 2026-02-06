const FileUpload = require('../models/FileUpload');
const Project = require('../models/Project');
const Task = require('../models/Task');
const path = require('path');
const fs = require('fs');

// @desc    Upload File
// @route   POST /api/files
// @access  Private
exports.uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'Please upload a file' });
        }

        const { taskId } = req.body;
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ success: false, error: 'Task not found' });
        }

        const file = await FileUpload.create({
            fileName: req.file.filename,
            originalName: req.file.originalname,
            fileType: req.file.mimetype,
            fileSize: req.file.size,
            filePath: req.file.path,
            task: taskId,
            project: task.project,
            uploadedBy: req.user.id
        });

        const populatedFile = await file.populate('uploadedBy', 'name');

        res.status(201).json({
            success: true,
            data: populatedFile
        });

    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get files for task
// @route   GET /api/files/task/:taskId
// @access  Private
exports.getFiles = async (req, res) => {
    try {
        const files = await FileUpload.find({ task: req.params.taskId })
            .populate('uploadedBy', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: files.length,
            data: files
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Delete File
// @route   DELETE /api/files/:id
// @access  Private
exports.deleteFile = async (req, res) => {
    try {
        const file = await FileUpload.findById(req.params.id);

        if (!file) {
            return res.status(404).json({ success: false, error: 'File not found' });
        }

        if (file.uploadedBy.toString() !== req.user.id && req.user.role !== 'Super Admin') {
            return res.status(403).json({ success: false, error: 'Not authorized to delete this file' });
        }

        // Remove from file system
        if (fs.existsSync(file.filePath)) {
            fs.unlinkSync(file.filePath);
        }

        await file.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Download File
// @route   GET /api/files/download/:id
// @access  Private
exports.downloadFile = async (req, res) => {
    try {
        const file = await FileUpload.findById(req.params.id);
        if (!file) {
            return res.status(404).json({ success: false, error: 'File record not found' });
        }

        const filePath = path.resolve(file.filePath);

        if (fs.existsSync(filePath)) {
            res.download(filePath, file.originalName);
        } else {
            res.status(404).json({ success: false, error: 'File not found on server' });
        }
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
