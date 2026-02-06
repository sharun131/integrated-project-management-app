const mongoose = require('mongoose');

const timesheetSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    hours: {
        type: Number,
        required: true,
        min: 0.1,
        max: 24
    },
    description: {
        type: String,
        maxLength: 500
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    rejectionReason: String
}, { timestamps: true });

// Prevent duplicate entries for same task/day if needed, but allowing multiple chunks is better.
// Indexing for faster queries
timesheetSchema.index({ user: 1, date: -1 });
timesheetSchema.index({ project: 1 });

module.exports = mongoose.model('Timesheet', timesheetSchema);
