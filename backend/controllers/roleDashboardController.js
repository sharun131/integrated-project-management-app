const Project = require('../models/Project');
const Task = require('../models/Task');
const Milestone = require('../models/Milestone');
const Timesheet = require('../models/Timesheet');
const User = require('../models/User');

// @desc    Get Project Manager Dashboard Stats
// @route   GET /api/role-dashboard/manager
// @access  Private (Manager Only)
exports.getManagerStats = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Find Projects managed by this user
        const projects = await Project.find({ manager: userId }).select('name status team');
        const projectIds = projects.map(p => p._id);

        // 2. Fetch Tasks for these projects
        const tasks = await Task.find({ project: { $in: projectIds } })
            .populate('assignedTo', 'name email')
            .select('status priority dueDate project assignedTo');

        // 3. Fetch Milestones
        const milestones = await Milestone.find({ project: { $in: projectIds } });

        // --- Calculate Logic ---

        // A. Project Progress
        // We need totals for each project.
        const projectProgress = projects.map(project => {
            const pTasks = tasks.filter(t => t.project.toString() === project._id.toString());
            const total = pTasks.length;
            const completed = pTasks.filter(t => t.status === 'Completed').length;
            const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
            return {
                id: project._id,
                name: project.name,
                progress: percentage,
                totalTasks: total,
                completedTasks: completed,
                status: project.status
            };
        });

        // B. Overdue Tasks
        const now = new Date();
        const overdueTasks = tasks.filter(t => 
            new Date(t.dueDate) < now && 
            t.status !== 'Completed'
        ).slice(0, 5); // Top 5

        // C. Milestone Status
        const milestoneStats = {
            completed: milestones.filter(m => m.status === 'COMPLETED').length,
            pending: milestones.filter(m => m.status !== 'COMPLETED' && m.status !== 'BLOCKED').length, // Assuming others are pending/in-progress
            delayed: milestones.filter(m => new Date(m.dueDate) < now && m.status !== 'COMPLETED').length
        };

        // D. Team Workload
        const workloadMap = {};
        tasks.forEach(task => {
            if (task.assignedTo) { // specific user
                const name = task.assignedTo.name;
                if (!workloadMap[name]) workloadMap[name] = 0;
                workloadMap[name]++;
            }
        });
        
        const teamWorkload = Object.keys(workloadMap).map(key => ({
            name: key,
            tasks: workloadMap[key]
        })).sort((a, b) => b.tasks - a.tasks).slice(0, 8); // Top 8 busy bees

        res.status(200).json({
            success: true,
            data: {
                totalProjects: projects.length,
                projectProgress,
                overdueTasks,
                milestoneStats,
                teamWorkload
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get Team Member Dashboard Stats
// @route   GET /api/role-dashboard/member
// @access  Private (Member Only)
exports.getMemberStats = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Assigned Tasks
        const tasks = await Task.find({ assignedTo: userId })
            .sort({ dueDate: 1 }) // Soonest due first
            .populate('project', 'name');

        const now = new Date();
        
        // 2. Deadlines (Next 7 days)
        const nextWeek = new Date();
        nextWeek.setDate(now.getDate() + 7);

        const deadlines = tasks.filter(t => 
            t.dueDate && 
            new Date(t.dueDate) > now && 
            new Date(t.dueDate) <= nextWeek &&
            t.status !== 'Completed'
        );

        // 3. Logged Hours (Total)
        const timesheets = await Timesheet.find({ user: userId });
        const totalHours = timesheets.reduce((acc, curr) => acc + (curr.hours || 0), 0);

        // 4. Overdue (for Highlight)
        const overdueCount = tasks.filter(t => new Date(t.dueDate) < now && t.status !== 'Completed').length;

        // 5. Recent/Current Tasks
        const myTasks = tasks.map(t => ({
            _id: t._id,
            title: t.title,
            priority: t.priority,
            status: t.status,
            dueDate: t.dueDate,
            projectName: t.project ? t.project.name : 'Unknown'
        }));

        res.status(200).json({
            success: true,
            data: {
                taskCounts: {
                    total: tasks.length,
                    completed: tasks.filter(t => t.status === 'Completed').length,
                    pending: tasks.filter(t => t.status !== 'Completed').length,
                    overdue: overdueCount
                },
                totalHours: Math.round(totalHours * 10) / 10,
                upcomingDeadlines: deadlines.map(t => ({
                    id: t._id,
                    title: t.title,
                    dueDate: t.dueDate,
                    priority: t.priority
                })),
                myTasks: myTasks.filter(t => t.status !== 'Completed').slice(0, 10)
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
