const mongoose = require("mongoose");

const milestoneSchema = new mongoose.Schema(
    {
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: String,
        dueDate: Date,

        // Progress Control
        progress: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        progressCalculationMethod: {
            type: String,
            enum: ["MANUAL", "AUTO_FROM_TASKS"],
            default: "AUTO_FROM_TASKS",
        },

        // Status Control
        status: {
            type: String,
            enum: ["NOT_STARTED", "IN_PROGRESS", "BLOCKED", "COMPLETED"],
            default: "NOT_STARTED",
        },

        // Assignment & Control
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        assignedUsers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        // Lock & Archive (Zoho-style freezing)
        isLocked: {
            type: Boolean,
            default: false,
        },
        lockedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        lockedAt: Date,

        // Soft Delete
        isDeleted: {
            type: Boolean,
            default: false,
        },
        deletedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        deletedAt: Date,

        // Progress History for Rollback
        progressHistory: [
            {
                progress: Number,
                changedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
                changedAt: {
                    type: Date,
                    default: Date.now,
                },
                reason: String,
            },
        ],
    },
    { timestamps: true }
);

// Index for filtering non-deleted milestones
milestoneSchema.index({ isDeleted: 1, project: 1 });

module.exports = mongoose.model("Milestone", milestoneSchema);
