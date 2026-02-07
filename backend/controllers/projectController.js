const Project = require('../models/Project');

// @desc    Create new project
// @route   POST /api/projects
// @access  Private (Admin/Manager)
exports.createProject = async (req, res) => {
    try {
        const { name, description, startDate, endDate, team, status, priority } = req.body;

        const project = await Project.create({
            name,
            description,
            startDate,
            endDate,
            status, // Optional, defaults to Active
            priority, // Optional, defaults to Medium
            team,   // Optional array of users
            manager: req.user.id, // Current user is manager by default (can be changed)
            createdBy: req.user.id
        });

        res.status(201).json({
            success: true,
            data: project
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get all projects (with filtering based on role)
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res) => {
    try {
        let query;

        // RBAC: Super Admin, Project Admin, and Project Manager get all projects
        const userRole = req.user.role;
        const isAdminOrManager = ['Super Admin', 'Project Admin', 'Project Manager'].some(
            role => role.toLowerCase() === userRole?.toLowerCase()
        );

        if (isAdminOrManager) {
            query = Project.find().populate('manager', 'name email').populate('team.user', 'name');
        } else {
            query = Project.find({
                $or: [
                    { manager: req.user.id }, // Projects I manage
                    { 'team.user': req.user.id }, // Projects I'm a member of (Team Member Access)
                    { createdBy: req.user.id } // Projects I created
                ]
            }).populate('manager', 'name email').populate('team.user', 'name');
        }

        const projects = await query;

        res.status(200).json({
            success: true,
            count: projects.length,
            data: projects
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
exports.getProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('manager', 'name email')
            .populate('team.user', 'name email role');

        if (!project) {
            return res.status(404).json({ success: false, error: 'Project not found' });
        }

        // RBAC: Check access
        const isAdminOrManager = ['Super Admin', 'Project Admin', 'Project Manager'].some(
            role => role.toLowerCase() === req.user.role?.toLowerCase()
        );

        if (!isAdminOrManager &&
            project.manager.toString() !== req.user.id &&
            !project.team.some(member => member.user.toString() === req.user.id)) {
            return res.status(403).json({ success: false, error: 'Not authorized to view this project' });
        }

        res.status(200).json({
            success: true,
            data: project
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Manager/Admin)
exports.updateProject = async (req, res) => {
    try {
        let project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ success: false, error: 'Project not found' });
        }

        // RBAC Check
        const isAdminOrManager = ['Super Admin', 'Project Admin', 'Project Manager'].some(
            role => role.toLowerCase() === req.user.role?.toLowerCase()
        );

        if (!isAdminOrManager && project.manager.toString() !== req.user.id) {
            return res.status(403).json({ success: false, error: 'Not authorized to update this project' });
        }

        project = await Project.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: project
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Manager/Admin)
exports.deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ success: false, error: 'Project not found' });
        }

        // RBAC Check
        const isAdminOrManager = ['Super Admin', 'Project Admin', 'Project Manager'].some(
            role => role.toLowerCase() === req.user.role?.toLowerCase()
        );

        if (!isAdminOrManager && project.manager.toString() !== req.user.id) {
            return res.status(403).json({ success: false, error: 'Not authorized to delete this project' });
        }

        await project.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
