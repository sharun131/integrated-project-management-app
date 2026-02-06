const Document = require('../models/Document');
const Project = require('../models/Project');
const path = require('path');
const fs = require('fs');

// @desc    Upload Document
// @route   POST /api/documents
// @access  Private
exports.uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'Please upload a file' });
        }

        const { projectId, description, tags } = req.body;

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ success: false, error: 'Project not found' });
        }

        const document = await Document.create({
            project: projectId,
            uploader: req.user.id,
            name: req.body.name || req.file.originalname,
            originalName: req.file.originalname,
            filePath: req.file.path,
            fileType: req.file.mimetype,
            fileSize: req.file.size,
            description,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : []
        });

        res.status(201).json({
            success: true,
            data: document
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get Project Documents
// @route   GET /api/documents/project/:projectId
// @access  Private
exports.getProjectDocuments = async (req, res) => {
    try {
        const documents = await Document.find({ project: req.params.projectId })
            .populate('uploader', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: documents.length,
            data: documents
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Download Document
// @route   GET /api/documents/download/:id
// @access  Private
exports.downloadDocument = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);
        if (!document) {
            return res.status(404).json({ success: false, error: 'Document not found' });
        }

        // Construct absolute path
        const filepath = path.resolve(document.filePath);
        res.download(filepath, document.originalName);
    } catch (err) {
        res.status(500).json({ success: false, error: "Download failed" });
    }
};

// @desc    Delete Document
// @route   DELETE /api/documents/:id
// @access  Private
exports.deleteDocument = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);
        if (!document) {
            return res.status(404).json({ success: false, error: 'Document not found' });
        }

        // Verify ownership or admin
        if (req.user.role !== 'Super Admin' &&
            document.uploader.toString() !== req.user.id) {
            return res.status(403).json({ success: false, error: 'Not authorized to delete' });
        }

        // Remove from DB
        await document.deleteOne();

        // Optional: Remove from filesystem (ignoring error if missing)
        fs.unlink(document.filePath, (err) => {
            if (err) console.error("Failed to delete file from disk:", err);
        });

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
