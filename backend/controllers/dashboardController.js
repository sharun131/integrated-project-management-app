const Project = require('../models/Project');
const Task = require('../models/Task');
const Milestone = require('../models/Milestone');
const User = require('../models/User');

// @desc    Get Admin/Manager Dashboard Stats
// @route   GET /api/dashboard/summary
// @access  Private
exports.getDashboardSummary = async (req, res) => {
    try {
        const stats = {
            projectCounts: {
                total: 0,
                active: 0,
                completed: 0
            },
            taskCounts: {
                total: 0,
                completed: 0,
                pending: 0,
                highPriority: 0
            },
            recentProjects: [],
            recentTasks: [] // Tasks assigned to the user or global if admin
        };

        // Filter based on Role
        let projectQuery = {};
        if (req.user.role !== 'Super Admin') {
            projectQuery = {
                $or: [
                    { manager: req.user.id },
                    { 'team.user': req.user.id },
                    { createdBy: req.user.id }
                ]
            };
        }

        // Projects Stats
        const projects = await Project.find(projectQuery).sort({ createdAt: -1 });
        stats.projectCounts.total = projects.length;
        stats.projectCounts.active = projects.filter(p => p.status === 'Active').length;
        stats.projectCounts.completed = projects.filter(p => p.status === 'Completed').length;
        stats.recentProjects = projects.slice(0, 5);

        // Tasks Stats
        // If Admin/Manager, see broad stats. If Team Member, see own.
        let taskQuery = {};
        if (req.user.role === 'Team Member') {
            taskQuery = { assignedTo: req.user.id };
        } else {
            // Project Managers should essentially see tasks for their projects, 
            // but for now simplified to Global or Project-based if we had time.
            // Let's filter tasks belonging to the visible projects
            const projectIds = projects.map(p => p._id);
            taskQuery = { project: { $in: projectIds } };
        }

        const tasks = await Task.find(taskQuery).sort({ createdAt: -1 });
        stats.taskCounts.total = tasks.length;
        stats.taskCounts.completed = tasks.filter(t => t.status === 'Completed').length;
        stats.taskCounts.pending = tasks.filter(t => t.status !== 'Completed').length;
        stats.taskCounts.highPriority = tasks.filter(t => t.priority === 'High' || t.priority === 'Critical').length;
        stats.recentTasks = tasks.slice(0, 5);

        // Issues Stats (Enhancement)
        const Issue = require('../models/Issue');
        let issueQuery = {};
        if (req.user.role !== 'Super Admin') {
            // Managers see their project issues, Team Members see ... maybe detailed access logic, 
            // but for now let's keep it simple or aligned with previous logic
            const projectIds = projects.map(p => p._id);
            issueQuery = { project: { $in: projectIds } };
        }

        const issues = await Issue.find(issueQuery);
        stats.issueCounts = {
            total: issues.length,
            pending: issues.filter(i => i.status === 'Open' || i.status === 'In Progress').length,
            rectified: issues.filter(i => i.status === 'Resolved' || i.status === 'Closed').length
        };

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
