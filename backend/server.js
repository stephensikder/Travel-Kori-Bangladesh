
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
    email: user.email,
    userType: user.userType || "traveler"
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
// UPDATE USER PROFILE API
// =========================

app.put("/api/users/:userId", async function (req, res) {
    try {
        const { userId } = req.params;
        const { fullName, email } = req.body;

        if (!ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID."
            });
        }

        if (
            typeof fullName !== "string" ||
            typeof email !== "string" ||
            !fullName.trim() ||
            !email.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Name and email are required."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const users = db.collection("users");

        const existingUser = await users.findOne({
            email: normalizedEmail,
            _id: { $ne: new ObjectId(userId) }
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "This email is already registered."
            });
        }

        const result = await users.updateOne(
            { _id: new ObjectId(userId) },
            {
                $set: {
                    fullName: fullName.trim(),
                    email: normalizedEmail
                }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        res.json({
            success: true,
            message: "Profile updated successfully!",
            user: {
                id: userId,
                fullName: fullName.trim(),
                email: normalizedEmail
            }
        });

    } catch (error) {
        console.error("Profile update error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to update profile."
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
// ADMIN BOOKING MANAGEMENT
// =========================

// Get all bookings (Admin only)
app.get("/api/admin/bookings/:adminId", async function (req, res) {
    try {
        const { adminId } = req.params;

        if (!ObjectId.isValid(adminId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid admin ID."
            });
        }

        const admin = await db.collection("users").findOne({
            _id: new ObjectId(adminId),
            userType: "admin"
        });

        if (!admin) {
            return res.status(403).json({
                success: false,
                message: "Admin access denied."
            });
        }

        const bookings = await db.collection("bookings")
            .find({})
            .sort({ createdAt: -1 })
            .toArray();

        res.json({
            success: true,
            bookings: bookings.map(function (booking) {
                return {
                    ...booking,
                    id: booking._id.toString(),
                    userId: booking.userId.toString()
                };
            })
        });

    } catch (error) {
        console.error("Admin bookings error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to load bookings."
        });
    }
});


// Update booking status (Admin only)
app.put(
    "/api/admin/bookings/:adminId/:bookingId/status",
    async function (req, res) {
        try {
            const { adminId, bookingId } = req.params;
            const { status } = req.body;

            if (
                !ObjectId.isValid(adminId) ||
                !ObjectId.isValid(bookingId)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid ID."
                });
            }

            if (
                !["Pending", "Confirmed", "Cancelled"].includes(status)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid booking status."
                });
            }

            const admin = await db.collection("users").findOne({
                _id: new ObjectId(adminId),
                userType: "admin"
            });

            if (!admin) {
                return res.status(403).json({
                    success: false,
                    message: "Admin access denied."
                });
            }

            const result = await db.collection("bookings").updateOne(
                { _id: new ObjectId(bookingId) },
                { $set: { status: status } }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Booking not found."
                });
            }

            res.json({
                success: true,
                message: "Booking status updated successfully."
            });

        } catch (error) {
            console.error("Update booking status error:", error.message);

            res.status(500).json({
                success: false,
                message: "Unable to update booking status."
            });
        }
    }
);


// =========================
// TRAVEL BOOKING API
// =========================

// Create a booking
app.post("/api/bookings", async function (req, res) {
    try {
        const {
            userId,
            district,
            touristSpot,
            visitDate,
            people
        } = req.body;

        if (
            !userId ||
            !ObjectId.isValid(userId) ||
            !district?.trim() ||
            !touristSpot?.trim() ||
            !visitDate ||
            !Number.isInteger(Number(people)) ||
            Number(people) < 1
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide valid booking information."
            });
        }

        const selectedDate = new Date(visitDate);

        if (
            Number.isNaN(selectedDate.getTime()) ||
            visitDate < new Date().toISOString().slice(0, 10)
        ) {
            return res.status(400).json({
                success: false,
                message: "Please select a valid future date."
            });
        }

        const user = await db.collection("users").findOne({
            _id: new ObjectId(userId)
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        const reference =
    "TKB-" +
    new Date().toISOString().slice(0, 10).replace(/-/g, "") +
    "-" +
    Math.random().toString(36).slice(2, 8).toUpperCase();

const booking = {
    reference: reference,
    userId: user._id,
    district: district.trim(),
    touristSpot: touristSpot.trim(),
    visitDate,
    people: Number(people),
    status: "Pending",
    createdAt: new Date()
};

        const result = await db
            .collection("bookings")
            .insertOne(booking);

        res.status(201).json({
            success: true,
            message: "Booking request submitted successfully!",
            booking: {
                id: result.insertedId.toString(),
                ...booking,
                userId: user._id.toString()
            }
        });

    } catch (error) {
        console.error("Create booking error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to submit booking request."
        });
    }
});


// Get bookings for a user
app.get("/api/bookings/:userId", async function (req, res) {
    try {
        const { userId } = req.params;

        if (!ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID."
            });
        }

        const bookings = await db
            .collection("bookings")
            .find({
                userId: new ObjectId(userId)
            })
            .sort({ createdAt: -1 })
            .toArray();

        res.json({
            success: true,
            bookings: bookings.map(function (booking) {
                return {
                    ...booking,
                    id: booking._id.toString(),
                    userId: booking.userId.toString()
                };
            })
        });

    } catch (error) {
        console.error("Get bookings error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to load bookings."
        });
    }
});


// =========================
// HOTEL BOOKING API
// =========================

// Create a hotel booking request
app.post("/api/hotel-bookings", async function (req, res) {
    try {
        const {
            userId,
            hotelId,
            hotelName,
            district,
            roomType,
            checkIn,
            checkOut,
            rooms,
            guests,
            guestName,
            guestPhone
        } = req.body;

        if (!userId || !ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Please log in with a valid account."
            });
        }

        if (
            typeof hotelId !== "string" ||
            typeof hotelName !== "string" ||
            typeof district !== "string" ||
            !hotelId.trim() ||
            !hotelName.trim() ||
            !district.trim() ||
            !["Standard", "Deluxe", "Family"].includes(roomType) ||
            typeof checkIn !== "string" ||
            typeof checkOut !== "string" ||
            !/^\d{4}-\d{2}-\d{2}$/.test(checkIn) ||
            !/^\d{4}-\d{2}-\d{2}$/.test(checkOut) ||
            !Number.isInteger(rooms) ||
            rooms < 1 ||
            rooms > 10 ||
            !Number.isInteger(guests) ||
            guests < 1 ||
            guests > 20 ||
            typeof guestName !== "string" ||
            !guestName.trim() ||
            guestName.trim().length > 100 ||
            typeof guestPhone !== "string" ||
            !guestPhone.trim() ||
            guestPhone.trim().length > 20
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide valid hotel booking information."
            });
        }

        // Strict calendar-date validation.
        function validDateString(value) {
            const date = new Date(`${value}T00:00:00.000Z`);

            return !Number.isNaN(date.getTime()) &&
                date.toISOString().slice(0, 10) === value;
        }

        const today = new Date().toISOString().slice(0, 10);

        if (
            !validDateString(checkIn) ||
            !validDateString(checkOut) ||
            checkIn < today ||
            checkOut <= checkIn
        ) {
            return res.status(400).json({
                success: false,
                message: "Please select valid check-in and check-out dates."
            });
        }

        const user = await db.collection("users").findOne({
            _id: new ObjectId(userId)
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User account not found."
            });
        }

        // Prices are server-controlled demo prices.
        const demoHotels = {
            "hotel-dhaka-1": {
                name: "Dhaka Comfort Stay",
                district: "Dhaka",
                prices: { Standard: 2500, Deluxe: 4000, Family: 5500 }
            },
            "hotel-cox-1": {
                name: "Cox's Bay Retreat",
                district: "Cox's Bazar",
                prices: { Standard: 3000, Deluxe: 5000, Family: 7000 }
            },
            "hotel-sylhet-1": {
                name: "Sylhet Green Escape",
                district: "Sylhet",
                prices: { Standard: 2200, Deluxe: 3500, Family: 5000 }
            },
            "hotel-chattogram-1": {
                name: "Chattogram City Lodge",
                district: "Chattogram",
                prices: { Standard: 2000, Deluxe: 3300, Family: 4800 }
            },
            "hotel-rajshahi-1": {
                name: "Rajshahi Riverside Stay",
                district: "Rajshahi",
                prices: { Standard: 1800, Deluxe: 2800, Family: 4000 }
            },
            "hotel-khulna-1": {
                name: "Khulna Gateway Hotel",
                district: "Khulna",
                prices: { Standard: 1900, Deluxe: 3000, Family: 4500 }
            }
        };

        const hotel = demoHotels[hotelId];

        if (
            !hotel ||
            hotel.name !== hotelName ||
            hotel.district !== district ||
            !hotel.prices[roomType]
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid hotel or room selection."
            });
        }

        const startDate = new Date(`${checkIn}T00:00:00.000Z`);
        const endDate = new Date(`${checkOut}T00:00:00.000Z`);

        const nights = Math.round(
            (endDate.getTime() - startDate.getTime()) / 86400000
        );

        if (!Number.isInteger(nights) || nights < 1 || nights > 365) {
            return res.status(400).json({
                success: false,
                message: "The booking duration is invalid."
            });
        }

        const pricePerNight = hotel.prices[roomType];
        const totalPrice = pricePerNight * rooms * nights;

        const reference =
            "TKH-" +
            new Date().toISOString().slice(0, 10).replace(/-/g, "") +
            "-" +
            require("crypto").randomBytes(4).toString("hex").toUpperCase();

        const booking = {
            reference,
            userId: user._id,
            hotelId,
            hotelName: hotel.name,
            district: hotel.district,
            roomType,
            checkIn,
            checkOut,
            nights,
            rooms,
            guests,
            guestName: guestName.trim(),
            guestPhone: guestPhone.trim(),
            pricePerNight,
            totalPrice,
            currency: "BDT",
            status: "Pending",
            bookingType: "hotel",
            createdAt: new Date()
        };

        const result = await db
            .collection("hotelBookings")
            .insertOne(booking);

        res.status(201).json({
            success: true,
            message: "Hotel booking request submitted successfully!",
            booking: {
                ...booking,
                id: result.insertedId.toString(),
                userId: user._id.toString()
            }
        });

    } catch (error) {
        console.error("Create hotel booking error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to submit hotel booking."
        });
    }
});


// Get hotel bookings for a user
app.get("/api/hotel-bookings/:userId", async function (req, res) {
    try {
        const { userId } = req.params;

        if (!ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID."
            });
        }

        const bookings = await db.collection("hotelBookings")
            .find({ userId: new ObjectId(userId) })
            .sort({ createdAt: -1 })
            .toArray();

        res.json({
            success: true,
            bookings: bookings.map(function (booking) {
                return {
                    ...booking,
                    id: booking._id.toString(),
                    userId: booking.userId.toString()
                };
            })
        });

    } catch (error) {
        console.error("Get hotel bookings error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to load hotel bookings."
        });
    }
});



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
