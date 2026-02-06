const Timesheet = require('../models/Timesheet');
const Project = require('../models/Project');

// @desc    Log Time
// @route   POST /api/timesheets
// @access  Private
exports.logTime = async (req, res) => {
    try {
        const { project, task, date, hours, description } = req.body;

        const projectExists = await Project.findById(project);
        if (!projectExists) {
            return res.status(404).json({ success: false, error: 'Project not found' });
        }

        const timesheet = await Timesheet.create({
            user: req.user.id,
            project,
            task,
            date,
            hours,
            description
        });

        res.status(201).json({
            success: true,
            data: timesheet
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get Timesheets (My Logs or Project Logs if Manager)
// @route   GET /api/timesheets
// @access  Private
exports.getTimesheets = async (req, res) => {
    try {
        const { projectId, start, end } = req.query;
        let query = {};

        // Date Range
        if (start && end) {
            query.date = { $gte: new Date(start), $lte: new Date(end) };
        }

        // Access Control
        if (projectId) {
            // Check if user has access to this project
            const project = await Project.findById(projectId);
            if (!project) return res.status(404).json({ success: false, error: 'Project not found' });

            if (req.user.role === 'Super Admin' ||
                project.manager.toString() === req.user.id ||
                req.user.role === 'Project Manager') { // Simplified check
                query.project = projectId;
            } else {
                // Regular users can only see their own logs even in a project
                query.project = projectId;
                query.user = req.user.id;
            }
        } else {
            // Default: Show own logs
            query.user = req.user.id;
        }

        const logs = await Timesheet.find(query)
            .populate('project', 'name')
            .populate('task', 'title')
            .populate('user', 'name role')
            .sort({ date: -1 });

        res.status(200).json({
            success: true,
            count: logs.length,
            data: logs
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Approve/Reject Timesheet
// @route   PUT /api/timesheets/:id/status
// @access  Private (Manager/Admin)
exports.updateTimesheetStatus = async (req, res) => {
    try {
        const { status, rejectionReason } = req.body; // 'Approved' or 'Rejected'

        const timesheet = await Timesheet.findById(req.params.id).populate('project');
        if (!timesheet) {
            return res.status(404).json({ success: false, error: 'Timesheet not found' });
        }

        // Verify Authority
        if (req.user.role !== 'Super Admin' && timesheet.project.manager.toString() !== req.user.id) {
            return res.status(403).json({ success: false, error: 'Not authorized to approve/reject' });
        }

        timesheet.status = status;
        if (status === 'Approved') timesheet.approvedBy = req.user.id;
        if (status === 'Rejected') {
            timesheet.rejectionReason = rejectionReason || 'No reason provided';
            timesheet.approvedBy = null; // Clear approval if rejected after approval
        }

        await timesheet.save();

        res.status(200).json({
            success: true,
            data: timesheet
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
