const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a project name'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    status: {
        type: String,
        enum: ['Active', 'On Hold', 'Completed', 'Archived', 'Planning', 'Pending Approval'],
        default: 'Planning'
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    team: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        role: {
            type: String, // 'Team Lead', 'Developer', 'Designer' - valid project-level roles
            default: 'Developer'
        }
    }],
    budget: Number,
    client: {
        type: mongoose.Schema.Types.ObjectId, // If linking to a Client User
        ref: 'User'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Cascade delete milestones/tasks when project is deleted? 
// For now, we'll keep them but orphan them or handle via pre-remove hook later.

module.exports = mongoose.model('Project', projectSchema);
