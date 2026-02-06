const mongoose = require("mongoose");

const phaseSchema = new mongoose.Schema({
    milestone: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Milestone",
        required: true,
    },
    project: { // Denormalized for easier querying
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    order: Number,
    status: {
        type: String,
        enum: ["Pending", "Active", "Completed"],
        default: "Pending",
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true });

module.exports = mongoose.model("Phase", phaseSchema);
