const User = require('../models/User');
const jwt = require('jsonwebtoken');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role // In production, we might want to restrict role creation
        });

        sendTokenResponse(user, 200, res);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ success: false, error: 'Email already exists' });
        }
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate email & password
        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Please provide an email and password' });
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        // Update last login and start session
        user.lastLogin = Date.now();
        user.currentSessionStart = Date.now();
        await user.save();

        sendTokenResponse(user, 200, res);
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    const user = await User.findById(req.user.id);
    res.status(200).json({
        success: true,
        data: user
    });
};

// @desc    Get all users (for assignment)
// @route   GET /api/auth/users
// @access  Private
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Logout user / Clear cookie
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user && user.currentSessionStart) {
            const now = Date.now();
            const sessionStart = new Date(user.currentSessionStart).getTime();
            const durationMs = now - sessionStart;
            const durationHours = durationMs / (1000 * 60 * 60);

            // Only log if duration is significant (> 1 minute)
            if (durationHours > 0.016) {
                // Find a default project to log against (e.g., first active project)
                // In a real app, user might select project on logout or tracking
                const Timesheet = require('../models/Timesheet');
                const Project = require('../models/Project'); // Ensure Project model is imported if needed

                // Find a project the user is assigned to
                const project = await Project.findOne({
                    team: { $elemMatch: { user: user._id } },
                    status: { $ne: 'Completed' }
                });

                if (project) {
                    await Timesheet.create({
                        user: user._id,
                        project: project._id,
                        date: now,
                        hours: parseFloat(durationHours.toFixed(2)),
                        description: 'Automated Session Log',
                        status: 'Pending'
                    });
                }
            }

            user.currentSessionStart = null;
            await user.save();
        }

        res.cookie('token', 'none', {
            expires: new Date(Date.now() + 10 * 1000),
            httpOnly: true
        });

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        console.error("Logout Error:", err);
        res.status(500).json({ success: false, error: 'Server Error during logout' });
    }
};

// Helper to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });

    const options = {
        expires: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days hardcoded for now, parse env later
        ),
        httpOnly: true
    };

    res
        .status(statusCode)
        // .cookie('token', token, options) // Optional: Use cookies for extra security
        .json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
};
