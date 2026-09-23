const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
    {
        applicant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        opportunity: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Opportunity",
            required: true
        },

        status: {
            type: String,
            enum: [
                "submitted",
                "under_review",
                "approved",
                "rejected"
            ],
            default: "submitted"
        },

        appliedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "Application",
    applicationSchema
);