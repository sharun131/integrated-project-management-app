const Milestone = require('../models/Milestone');
const Project = require('../models/Project');
const Phase = require('../models/Phase');

// @desc    Create new milestone
// @route   POST /api/milestones
// @access  Private (Admin/Manager/Team Lead)
exports.createMilestone = async (req, res) => {
    try {
        const { name, description, dueDate, project, assignedUsers, status } = req.body;

        const projectExists = await Project.findById(project);
        if (!projectExists) {
            return res.status(404).json({ success: false, error: 'Project not found' });
        }

        // RBAC: Check if user is Super Admin, Project Admin/Manager, project manager, or team member
        const isAuthorized =
            req.user.role === 'Super Admin' ||
            req.user.role === 'Project Admin' ||
            req.user.role === 'Project Manager' ||
            projectExists.manager.toString() === req.user.id ||
            req.user.role === 'Team Lead' ||
            projectExists.team.some(m => m.user.toString() === req.user.id);

        if (!isAuthorized) {
            return res.status(403).json({ success: false, error: 'Not authorized to create milestone in this project' });
        }

        // Limit to max 5 milestones per project
        const milestoneCount = await Milestone.countDocuments({ project, isDeleted: false });
        if (milestoneCount >= 5) {
            return res.status(400).json({ success: false, error: 'Maximum limit of 5 milestones per project reached.' });
        }

        const milestone = await Milestone.create({
            name,
            description,
            dueDate,
            project,
            assignedUsers,
            status: status || 'NOT_STARTED',
            createdBy: req.user.id
        });

        res.status(201).json({
            success: true,
            data: milestone
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get all milestones
// @route   GET /api/milestones
// @access  Private
exports.getMilestones = async (req, res) => {
    try {
        const { projectId } = req.query;
        let query = { isDeleted: false };

        if (projectId) {
            query.project = projectId;
        }

        const milestones = await Milestone.find(query)
            .populate('assignedUsers', 'name email')
            .populate('project', 'name')
            .sort({ dueDate: 1 });

        res.status(200).json({
            success: true,
            count: milestones.length,
            data: milestones
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get single milestone
// @route   GET /api/milestones/:id
// @access  Private
exports.getMilestone = async (req, res) => {
    try {
        const milestone = await Milestone.findById(req.params.id)
            .populate('assignedUsers', 'name email')
            .populate('project', 'name');

        if (!milestone) {
            return res.status(404).json({ success: false, error: 'Milestone not found' });
        }

        res.status(200).json({
            success: true,
            data: milestone
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Update milestone
// @route   PUT /api/milestones/:id
// @access  Private
exports.updateMilestone = async (req, res) => {
    try {
        let milestone = await Milestone.findById(req.params.id);

        if (!milestone) {
            return res.status(404).json({ success: false, error: 'Milestone not found' });
        }

        if (milestone.isLocked && req.user.id !== milestone.lockedBy.toString() && req.user.role !== 'Super Admin') {
            return res.status(403).json({ success: false, error: 'Milestone is locked' });
        }

        milestone = await Milestone.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: milestone
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Delete milestone (Soft)
// @route   DELETE /api/milestones/:id
// @access  Private (Admin/Manager)
exports.deleteMilestone = async (req, res) => {
    try {
        const milestone = await Milestone.findById(req.params.id);

        if (!milestone) {
            return res.status(404).json({ success: false, error: 'Milestone not found' });
        }

        // Soft delete
        milestone.isDeleted = true;
        milestone.deletedBy = req.user.id;
        milestone.deletedAt = Date.now();
        await milestone.save();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Create Phase
// @route   POST /api/milestones/phases
// @access  Private
exports.createPhase = async (req, res) => {
    try {
        const { name, milestone, project, order } = req.body;

        const phase = await Phase.create({
            name,
            milestone,
            project,
            order,
            createdBy: req.user.id
        });

        res.status(201).json({
            success: true,
            data: phase
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get Phases
// @route   GET /api/milestones/:milestoneId/phases
// @access  Private
exports.getPhases = async (req, res) => {
    try {
        const phases = await Phase.find({ milestone: req.params.milestoneId }).sort({ order: 1 });

        res.status(200).json({
            success: true,
            count: phases.length,
            data: phases
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
// @desc    Request Milestone Approval
// @route   PUT /api/milestones/:id/request-approval
// @access  Private (Team Lead/Member)
exports.requestMilestoneApproval = async (req, res) => {
    try {
        const milestone = await Milestone.findById(req.params.id);

        if (!milestone) {
            return res.status(404).json({ success: false, error: 'Milestone not found' });
        }

        if (milestone.status !== 'IN_PROGRESS' && milestone.status !== 'NOT_STARTED') {
            return res.status(400).json({ success: false, error: 'Milestone must be active to request approval' });
        }

        milestone.status = 'PENDING_APPROVAL';
        milestone.approvalRequestedBy = req.user.id;
        milestone.approvalRequestedAt = Date.now();
        await milestone.save();

        res.status(200).json({
            success: true,
            data: milestone
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Review Milestone (Approve/Reject)
// @route   PUT /api/milestones/:id/review
// @access  Private (Admin/Manager)
exports.reviewMilestone = async (req, res) => {
    try {
        const { action } = req.body; // 'APPROVE' or 'REJECT'
        const milestone = await Milestone.findById(req.params.id);

        if (!milestone) {
            return res.status(404).json({ success: false, error: 'Milestone not found' });
        }

        // RBAC: Only Admin or Project Manager
        const isAuthorized = ['Super Admin', 'Project Admin', 'Project Manager'].some(
            role => role.toLowerCase() === req.user.role?.toLowerCase()
        );

        if (!isAuthorized) {
            return res.status(403).json({ success: false, error: 'Not authorized to review milestones' });
        }

        if (action === 'APPROVE') {
            milestone.status = 'COMPLETED';
            milestone.approvedBy = req.user.id;
            milestone.approvedAt = Date.now();
            milestone.progress = 100; // Auto-complete
        } else if (action === 'REJECT') {
            milestone.status = 'IN_PROGRESS';
            milestone.approvalRequestedBy = undefined;
            milestone.approvalRequestedAt = undefined;
        } else {
            return res.status(400).json({ success: false, error: 'Invalid action' });
        }

        await milestone.save();

        res.status(200).json({
            success: true,
            data: milestone
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
