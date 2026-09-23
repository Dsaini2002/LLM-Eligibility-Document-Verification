const Opportunity = require("../models/Opportunity");

const getActiveOpportunities = async (req, res) => {
    try {
        const opportunities = await Opportunity.find({
            status: "active"
        }).sort({
            deadline: 1
        });

        res.status(200).json({
            success: true,
            count: opportunities.length,
            opportunities
        });

    } catch (error) {
        console.error("Get Opportunities Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

module.exports = {
    getActiveOpportunities
};