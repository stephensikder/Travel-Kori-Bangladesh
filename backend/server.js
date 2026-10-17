
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json());

let db;

// Test route
app.get("/", function (req, res) {
    res.send("Travel Kori Bangladesh Backend is running!");
});

// Health check
app.get("/api/health", function (req, res) {
    res.json({
        success: true,
        databaseConnected: Boolean(db),
        message: db
            ? "Backend and MongoDB are connected!"
            : "Backend is running, but database is not connected."
    });
});



const bcrypt = require("bcrypt");

// User Registration API
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



app.post("/api/auth/login", async function (req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }

        const users = db.collection("users");

        const normalizedEmail = email.trim().toLowerCase();

        const user = await users.findOne({
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
                id: user._id,
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



// Connect to MongoDB and start server
async function startServer() {
    try {
        const client = new MongoClient(MONGODB_URI);

        await client.connect();

        db = client.db("travelkoribangladesh");

        console.log("MongoDB connected successfully!");

        app.listen(PORT, function () {
            console.log(`Server is running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error.message);
        process.exit(1);
    }
}

startServer();
