const express = require("express");

const {
    getActiveOpportunities
} = require("../controllers/opportunityController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
    "/",
    protect,
    authorize("applicant"),
    getActiveOpportunities
);

module.exports = router;