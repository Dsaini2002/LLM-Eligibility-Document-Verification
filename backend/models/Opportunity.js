const mongoose = require("mongoose");

const opportunitySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        deadline: {
            type: Date,
            required: true
        },

        requiredDocuments: {
            type: Number,
            required: true,
            min: 0
        },

        status: {
            type: String,
            enum: ["active", "closed", "draft"],
            default: "active"
        },

        organization: {
            type: String,
            required: true,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Opportunity", opportunitySchema);