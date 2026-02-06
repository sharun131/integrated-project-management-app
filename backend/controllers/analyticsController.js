const Project = require('../models/Project');
const Task = require('../models/Task');
const Issue = require('../models/Issue');
const Timesheet = require('../models/Timesheet');

// @desc    Get Overall Analytics
// @route   GET /api/analytics
// @access  Private (Admin/Manager)
exports.getAnalytics = async (req, res) => {
    try {
        // 1. Projects Status Distribution
        const projects = await Project.find({});
        const projectStats = {
            total: projects.length,
            active: projects.filter(p => p.status === 'Active').length,
            completed: projects.filter(p => p.status === 'Completed').length,
            planning: projects.filter(p => p.status === 'Planning').length
        };

        // 2. Task Completion Rate
        const tasks = await Task.find({});
        const taskStats = {
            total: tasks.length,
            completed: tasks.filter(t => t.status === 'Completed').length,
            pending: tasks.filter(t => t.status !== 'Completed').length,
            highPriority: tasks.filter(t => t.priority === 'High' || t.priority === 'Critical').length
        };

        // 3. Issue Severity
        const issues = await Issue.find({});
        const issueStats = {
            total: issues.length,
            open: issues.filter(i => i.status !== 'Closed').length,
            critical: issues.filter(i => i.severity === 'Critical' || i.severity === 'Blocker').length
        };

        // 4. Hours Logged (Last 30 Days) - Simplified
        // Group by Project
        const timesheets = await Timesheet.find({}).populate('project', 'name');
        const hoursByProject = {};

        timesheets.forEach(sheet => {
            const pName = sheet.project?.name || 'Unknown';
            hoursByProject[pName] = (hoursByProject[pName] || 0) + sheet.hours;
        });

        res.status(200).json({
            success: true,
            data: {
                projects: projectStats,
                tasks: taskStats,
                issues: issueStats,
                hoursByProject
            }
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
