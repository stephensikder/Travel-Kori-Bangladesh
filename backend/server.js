
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json());

let db;

// =========================
// TEST ROUTE
// =========================

app.get("/", function (req, res) {
    res.send("Travel Kori Bangladesh Backend is running!");
});

// =========================
// HEALTH CHECK
// =========================

app.get("/api/health", function (req, res) {
    res.json({
        success: true,
        databaseConnected: Boolean(db),
        message: db
            ? "Backend and MongoDB are connected!"
            : "Database is not connected."
    });
});

// =========================
// USER REGISTRATION API
// =========================

app.post("/api/auth/register", async function (req, res) {
    try {
        const { fullName, email, password } = req.body;

        if (!fullName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required."
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 8 characters."
            });
        }

        const users = db.collection("users");
        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await users.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await users.insertOne({
            fullName: fullName.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            favorites: [],
            createdAt: new Date()
        });

        res.status(201).json({
            success: true,
            message: "Account created successfully!",
            userId: result.insertedId
        });

    } catch (error) {
        console.error("Registration error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to create account right now."
        });
    }
});

// =========================
// USER LOGIN API
// =========================

app.post("/api/auth/login", async function (req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await db.collection("users").findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const passwordMatches = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatches) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        res.json({
            success: true,
            message: "Login successful!",
            user: {
                id: user._id.toString(),
                fullName: user.fullName,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Login error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to log in right now."
        });
    }
});

// =========================
// FAVORITES API 1
// GET USER FAVORITES
// =========================

app.get("/api/favorites/:userId", async function (req, res) {
    try {
        const { userId } = req.params;

        if (!ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID."
            });
        }

        const user = await db.collection("users").findOne(
            { _id: new ObjectId(userId) },
            { projection: { favorites: 1 } }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        res.json({
            success: true,
            favorites: user.favorites || []
        });

    } catch (error) {
        console.error("Get favorites error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to load favorites."
        });
    }
});

// =========================
// FAVORITES API 2
// ADD A FAVORITE DISTRICT
// =========================

app.post("/api/favorites", async function (req, res) {
    try {
        const { userId, district } = req.body;

        if (
            typeof userId !== "string" ||
            typeof district !== "string" ||
            !district.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid user ID and district are required."
            });
        }

        if (!ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID."
            });
        }

        const result = await db.collection("users").updateOne(
            { _id: new ObjectId(userId) },
            { $addToSet: { favorites: district.trim() } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        res.json({
            success: true,
            message: "Favorite district saved successfully."
        });

    } catch (error) {
        console.error("Add favorite error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to save favorite."
        });
    }
});

// =========================
// FAVORITES API 3
// REMOVE A FAVORITE DISTRICT
// =========================

app.delete(
    "/api/favorites/:userId/:district",
    async function (req, res) {
        try {
            const { userId, district } = req.params;

            if (!ObjectId.isValid(userId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid user ID."
                });
            }

            const result = await db.collection("users").updateOne(
                { _id: new ObjectId(userId) },
                { $pull: { favorites: district } }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({
                    success: false,
                    message: "User not found."
                });
            }

            res.json({
                success: true,
                message: "Favorite district removed successfully."
            });

        } catch (error) {
            console.error("Remove favorite error:", error.message);

            res.status(500).json({
                success: false,
                message: "Unable to remove favorite."
            });
        }
    }
);

// =========================
// CONNECT TO MONGODB
// =========================

async function startServer() {
    if (!MONGODB_URI) {
        console.error("MONGODB_URI is missing from the .env file.");
        process.exit(1);
    }

    try {
        const client = new MongoClient(MONGODB_URI);

        await client.connect();

        db = client.db("travelkoribangladesh");

        console.log("MongoDB connected successfully!");

        app.listen(PORT, function () {
            console.log(
                `Server is running at http://localhost:${PORT}`
            );
        });

    } catch (error) {
        console.error(
            "Failed to connect to MongoDB:",
            error.message
        );
        process.exit(1);
    }
}

startServer();
