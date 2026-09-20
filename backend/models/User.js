const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },

        role: {
            type: String,
            enum: ["applicant", "organization", "admin"],
            default: "applicant"
        },

        provider: {
            type: String,
            enum: ["local", "google", "apple"],
            default: "local"
        },

        isVerified: {
            type: Boolean,
            default: false
        },

        accountStatus: {
            type: String,
            enum: ["active", "blocked", "deleted"],
            default: "active"
        },

        failedLoginAttempts: {
            type: Number,
            default: 0
        },

        lastLogin: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);