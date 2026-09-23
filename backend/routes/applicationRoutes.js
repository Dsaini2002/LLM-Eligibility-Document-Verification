const express = require("express");

const {
    applyForOpportunity,
    getMyApplications,
    getApplicationById
} = require("../controllers/applicationController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
    "/",
    protect,
    authorize("applicant"),
    applyForOpportunity
);

router.get(
    "/my",
    protect,
    authorize("applicant"),
    getMyApplications
);

router.get(
    "/:id",
    protect,
    authorize("applicant"),
    getApplicationById
);

module.exports = router;