require("dotenv").config();

const mongoose = require("mongoose");

const Opportunity = require("./models/Opportunity");

const opportunities = [
    {
        title: "Merit Scholarship 2026",
        description: "Financial assistance program for eligible students based on academic merit.",
        deadline: new Date("2026-10-15"),
        requiredDocuments: 5,
        status: "active",
        organization: "Education Welfare Foundation"
    },
    {
        title: "Education Support Scheme",
        description: "Educational support program for students who meet the required eligibility criteria.",
        deadline: new Date("2026-10-22"),
        requiredDocuments: 4,
        status: "active",
        organization: "National Education Support Organization"
    },
    {
        title: "Student Welfare Program",
        description: "Student welfare opportunity providing financial and educational assistance.",
        deadline: new Date("2026-11-03"),
        requiredDocuments: 6,
        status: "active",
        organization: "Student Welfare Department"
    }
];

const seedOpportunities = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB Connected");

        await Opportunity.deleteMany({});

        await Opportunity.insertMany(opportunities);

        console.log("Opportunities seeded successfully");

        await mongoose.disconnect();

        console.log("MongoDB Disconnected");

    } catch (error) {
        console.error("Seeding Error:", error);
        process.exit(1);
    }
};

seedOpportunities();