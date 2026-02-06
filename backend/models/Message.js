const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
    {
        text: {
            type: String,
            required: true,
        },
        task: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Task",
            required: true,
        },
        // Project reference for quicker lookups/scoping
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true,
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        // Reactions: array of emojis and who reacted
        reactions: [
            {
                emoji: String,
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User"
                }
            },
        ],
        isEdited: {
            type: Boolean,
            default: false,
        },
        editedAt: Date,
        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
