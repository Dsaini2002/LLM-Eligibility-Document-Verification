const User = require("../models/User");

const updateProfile = async (req, res) => {
    try {
        const { fullName } = req.body;

        if (!fullName || !fullName.trim()) {
            return res.status(400).json({
                success: false,
                message: "Full name is required"
            });
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        user.fullName = fullName.trim();

        await user.save();

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                provider: user.provider,
                isVerified: user.isVerified,
                accountStatus: user.accountStatus
            }
        });

    } catch (error) {
        console.error("Update Profile Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

module.exports = {
    updateProfile
};