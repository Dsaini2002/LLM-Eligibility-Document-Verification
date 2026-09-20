const ActivityLog = require("../models/ActivityLog");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const User = require("../models/User");

const signup = async (req, res) => {
    try {
        const { fullName, email, password, role } = req.body;

        if (!fullName || !email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email address"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters"
            });
        }

        const allowedRoles = ["applicant", "organization", "admin"];

        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role"
            });
        }

        const existingUser = await User.findOne({
            email: email.toLowerCase()
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({
            fullName,
            email: email.toLowerCase(),
            password: hashedPassword,
            role,
            provider: "local"
        });

        await ActivityLog.create({
            user: user._id,
            action: "SIGNUP",
            description: "User created an account",
            ipAddress: req.ip,
            userAgent: req.get("User-Agent"),
            success: true
        });

        res.status(201).json({
            success: true,
            message: "Account created successfully",
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Signup Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


const login = async (req, res) => {
    try {
        console.log("\n========== LOGIN TEST ==========");

        const { email, password } = req.body;

        console.log("Email received:", email);
        console.log("Password received:", password ? "YES" : "NO");

        if (!email || !password) {
            console.log("ERROR: Email or password missing");

            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        if (!validator.isEmail(email)) {
            console.log("ERROR: Invalid email");

            return res.status(400).json({
                success: false,
                message: "Invalid email address"
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase()
        });

        console.log("USER FOUND:", !!user);

        if (!user) {
            console.log("ERROR: User not found");

            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        console.log("User ID:", user._id);
        console.log("Account Status:", user.accountStatus);

        if (user.accountStatus !== "active") {
            console.log("ERROR: Account is not active");

            return res.status(403).json({
                success: false,
                message: "Your account is not active"
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        console.log("PASSWORD MATCH:", passwordMatch);

        if (!passwordMatch) {

            console.log("FAILED LOGIN BLOCK REACHED");

            user.failedLoginAttempts =
                (user.failedLoginAttempts || 0) + 1;

            await user.save();

            console.log(
                "Failed login attempts:",
                user.failedLoginAttempts
            );

            try {
                const failedLog = await ActivityLog.create({
                    user: user._id,
                    action: "LOGIN",
                    description: "Failed login attempt",
                    ipAddress: req.ip,
                    userAgent: req.get("User-Agent"),
                    success: false
                });

                console.log(
                    "FAILED LOGIN LOG CREATED:",
                    failedLog._id
                );

            } catch (logError) {
                console.error(
                    "FAILED LOGIN LOG ERROR:",
                    logError
                );
            }

            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        console.log("SUCCESSFUL LOGIN");

        user.failedLoginAttempts = 0;
        user.lastLogin = new Date();

        await user.save();

        try {
            const loginLog = await ActivityLog.create({
                user: user._id,
                action: "LOGIN",
                description: "User logged in successfully",
                ipAddress: req.ip,
                userAgent: req.get("User-Agent"),
                success: true
            });

            console.log(
                "SUCCESS LOGIN LOG CREATED:",
                loginLog._id
            );

        } catch (logError) {
            console.error(
                "SUCCESS LOGIN LOG ERROR:",
                logError
            );
        }

        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );

        console.log("JWT CREATED");
        console.log("========== LOGIN END ==========\n");

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {

        console.error("Login Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


module.exports = {
    signup,
    login
};
