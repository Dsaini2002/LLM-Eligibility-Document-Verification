const Application = require("../models/Application");
const Opportunity = require("../models/Opportunity");

const applyForOpportunity = async (req, res) => {
    try {
        const { opportunityId } = req.body;

        if (!opportunityId) {
            return res.status(400).json({
                success: false,
                message: "Opportunity ID is required"
            });
        }

        const opportunity = await Opportunity.findOne({
            _id: opportunityId,
            status: "active"
        });

        if (!opportunity) {
            return res.status(404).json({
                success: false,
                message: "Opportunity not found or is no longer active"
            });
        }

        const existingApplication = await Application.findOne({
            applicant: req.user._id,
            opportunity: opportunityId
        });

        if (existingApplication) {
            return res.status(409).json({
                success: false,
                message: "You have already applied for this opportunity"
            });
        }

        const application = await Application.create({
            applicant: req.user._id,
            opportunity: opportunityId
        });

        const populatedApplication = await Application.findById(
            application._id
        ).populate(
            "opportunity",
            "title description deadline organization requiredDocuments status"
        );

        res.status(201).json({
            success: true,
            message: "Application submitted successfully",
            application: populatedApplication
        });

    } catch (error) {
        console.error("Apply Opportunity Error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "You have already applied for this opportunity"
            });
        }

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


const getMyApplications = async (req, res) => {
    try {
        const applications = await Application.find({
            applicant: req.user._id
        })
            .populate(
                "opportunity",
                "title description deadline organization requiredDocuments status"
            )
            .sort({
                appliedAt: -1
            });

        res.status(200).json({
            success: true,
            count: applications.length,
            applications
        });

    } catch (error) {
        console.error("Get Applications Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


const getApplicationById = async (req, res) => {
    try {
        const application = await Application.findOne({
            _id: req.params.id,
            applicant: req.user._id
        }).populate(
            "opportunity",
            "title description deadline organization requiredDocuments status"
        );

        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Application not found"
            });
        }

        res.status(200).json({
            success: true,
            application
        });

    } catch (error) {
        console.error("Get Application Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


module.exports = {
    applyForOpportunity,
    getMyApplications,
    getApplicationById
};