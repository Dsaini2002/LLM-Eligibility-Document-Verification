const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const { updateProfile } = require("../controllers/userController");

const router = express.Router();

router.get("/profile", protect, (req, res) => {
    
    res.json({
        success: true,
        message: "Profile accessed successfully",
        user: req.user
    });
});
router.put("/profile", protect, updateProfile);
router.get(
    "/applicant-area",
    protect,
    authorize("applicant"),
    (req, res) => {
        res.json({
            success: true,
            message: "Welcome to Applicant Area",
            user: req.user
        });
    }
);

router.get(
    "/organization-area",
    protect,
    authorize("organization"),
    (req, res) => {
        res.json({
            success: true,
            message: "Welcome to Organization Area",
            user: req.user
        });
    }
);

router.get(
    "/admin-area",
    protect,
    authorize("admin"),
    (req, res) => {
        res.json({
            success: true,
            message: "Welcome to Admin Area",
            user: req.user
        });
    }
);

module.exports = router;