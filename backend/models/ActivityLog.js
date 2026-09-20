const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        action: {
            type: String,
            required: true,
            enum: [
                "SIGNUP",
                "LOGIN",
                "LOGOUT",
                "DOCUMENT_UPLOAD",
                "ELIGIBILITY_CHECK",
                "PROFILE_UPDATE"
            ]
        },

        description: {
            type: String,
            default: ""
        },

        ipAddress: {
            type: String,
            default: ""
        },

        userAgent: {
            type: String,
            default: ""
        },

        success: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);

module.exports = ActivityLog;