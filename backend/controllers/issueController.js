const Issue = require('../models/Issue');
const Project = require('../models/Project');

// @desc    Get all issues (or filter by project)
// @route   GET /api/issues
// @access  Private
exports.getIssues = async (req, res) => {
    try {
        const { projectId } = req.query;
        let query = {};

        if (projectId) {
            query.project = projectId;
        }

        // RBAC: If Team Member, only show issues from their projects
        const isTeamMember = req.user.role?.toLowerCase() === 'team member';
        if (isTeamMember) {
            // Find projects where user is a team member
            const projects = await Project.find({ 'team.user': req.user.id });
            const projectIds = projects.map(p => p._id);

            // If a specific project was requested, ensure they have access to it
            if (projectId && !projectIds.some(id => id.toString() === projectId)) {
                return res.status(403).json({ success: false, error: 'Not authorized to view issues for this project' });
            }

            // If no specific project, filter by all their projects
            if (!projectId) {
                query.project = { $in: projectIds };
            }
        }

        const issues = await Issue.find(query)
            .populate('project', 'name')
            .populate('reportedBy', 'name')
            .populate('assignedTo', 'name')
            .sort({ priority: 1, createdAt: -1 }); // Critical first

        res.status(200).json({
            success: true,
            count: issues.length,
            data: issues
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Create new issue
// @route   POST /api/issues
// @access  Private
exports.createIssue = async (req, res) => {
    try {
        req.body.reportedBy = req.user.id;

        // Basic validation on project
        const project = await Project.findById(req.body.project);
        if (!project) {
            return res.status(404).json({ success: false, error: 'Project not found' });
        }

        const issue = await Issue.create(req.body);

        res.status(201).json({
            success: true,
            data: issue
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Update issue
// @route   PUT /api/issues/:id
// @access  Private
exports.updateIssue = async (req, res) => {
    try {
        let issue = await Issue.findById(req.params.id);
        if (!issue) {
            return res.status(404).json({ success: false, error: 'Issue not found' });
        }

        // Add history/comments logic here later if needed

        issue = await Issue.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: issue
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Delete issue
// @route   DELETE /api/issues/:id
// @access  Private
exports.deleteIssue = async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id);
        if (!issue) {
            return res.status(404).json({ success: false, error: 'Issue not found' });
        }

        // RBAC: Deny deletion for Admin roles as requested
        const isAdmin = ['Super Admin', 'Project Admin'].some(
            role => role.toLowerCase() === req.user.role?.toLowerCase()
        );

        if (isAdmin) {
            return res.status(403).json({ success: false, error: 'Admins are restricted from deleting issues' });
        }

        // Only Reporter or Manager can delete
        const project = await Project.findById(issue.project);

        if (project.manager.toString() !== req.user.id &&
            issue.reportedBy.toString() !== req.user.id) {
            return res.status(403).json({ success: false, error: 'Not authorized to delete this issue' });
        }

        await issue.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
