const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
let emailService;
try {
    emailService = require("./services/emailService");
} catch (e) {
    emailService = null;
}

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/travelkoribangladesh";

app.use(cors());
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, "../frontend")));

let db;

// ============================================
// EMAIL CONFIRMATION SYSTEM (SMTP / GMAIL)
// ============================================
let nodemailer;
try {
    nodemailer = require("nodemailer");
} catch (e) {
    nodemailer = null;
}

let mailTransporter = null;
function getMailTransporter() {
    if (!nodemailer || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        return null;
    }
    if (!mailTransporter) {
        mailTransporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: Number(process.env.SMTP_PORT) || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }
    return mailTransporter;
}

async function sendBookingConfirmationEmail(toEmail, subject, htmlBody) {
    try {
        const transporter = getMailTransporter();
        if (!transporter) {
            console.log(`[SMTP Notice] Email confirmation logged for ${toEmail} (Set SMTP_PASS in backend/.env for live sending).`);
            return { success: false, reason: "SMTP_PASS not set" };
        }
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || `"Travel Kori Bangladesh" <${process.env.SMTP_USER || "touristhridoy2004@gmail.com"}>`,
            to: toEmail,
            subject: subject,
            html: htmlBody
        });
        console.log(`[SMTP Success] Email sent to ${toEmail}: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (err) {
        console.error(`[SMTP Error] Failed sending email to ${toEmail}:`, err.message);
        return { success: false, error: err.message };
    }
}

// =========================
// TEST ROUTE
// =========================

app.get("/api/status", function (req, res) {
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
// New registrations are travelers only.
// =========================

app.post("/api/auth/register", async function (req, res) {
    try {
        const { fullName, email, password } = req.body;

        if (
            typeof fullName !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string" ||
            !fullName.trim() ||
            !email.trim() ||
            !password
        ) {
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
        const now = new Date();

        const result = await users.insertOne({
            fullName: fullName.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            userType: "traveler",
            isActive: true,
            phone: "",
            address: "",
            favorites: [],
            savedAttractions: [],
            createdAt: now,
            updatedAt: now
        });

        res.status(201).json({
            success: true,
            message: "Account created successfully!",
            userId: result.insertedId.toString()
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
// TOUR GUIDE REGISTRATION API
// Collects profile info; requires admin approval before being public.
// =========================

app.post("/api/auth/guide/register", async function (req, res) {
    try {
        if (!db) return res.status(503).json({ success: false, message: "Database not connected." });
        const { fullName, email, password, phone, languages, experience, specialization, bio, dailyRate } = req.body;

        if (
            typeof fullName !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string" ||
            !fullName.trim() ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "Full name, email and password are required."
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 8 characters."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await db.collection("users").findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const now = new Date();

        // 1. Insert into users collection with userType: "guide" and isApproved: false
        const userInsert = await db.collection("users").insertOne({
            fullName: fullName.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            userType: "guide",
            isActive: true,
            isApproved: false, // Requires admin approval
            phone: (phone || "").trim(),
            createdAt: now,
            updatedAt: now
        });

        // 2. Parse languages and specialization districts
        const langArray = Array.isArray(languages)
            ? languages
            : (typeof languages === "string" ? languages.split(",").map(s => s.trim()).filter(Boolean) : ["Bengali", "English"]);

        const specArray = Array.isArray(specialization)
            ? specialization
            : (typeof specialization === "string" ? specialization.split(",").map(s => s.trim()).filter(Boolean) : ["Dhaka"]);

        // 3. Insert into tourguides collection
        const guideDoc = {
            userId: userInsert.insertedId,
            name: fullName.trim(),
            email: normalizedEmail,
            phone: (phone || "").trim(),
            specialization: specArray.length ? specArray : ["Dhaka"],
            experience: Number(experience) || 1,
            languages: langArray.length ? langArray : ["Bengali", "English"],
            rating: 5.0,
            reviews: 0,
            seedRating: true,
            dailyRate: Number(dailyRate) || 2000,
            bio: (bio || "Licensed professional local tour guide ready to offer authentic cultural and nature tours.").trim(),
            isApproved: false, // Pending admin approval
            isAvailable: false, // Unavailable until approved
            isActive: true,
            createdAt: now,
            updatedAt: now
        };

        const guideInsert = await db.collection("tourguides").insertOne(guideDoc);

        res.status(201).json({
            success: true,
            message: "Guide registration submitted successfully! Your account is pending administrator verification before becoming active.",
            userId: userInsert.insertedId.toString(),
            guideId: guideInsert.insertedId.toString()
        });

    } catch (error) {
        console.error("Guide registration error:", error.message);
        res.status(500).json({
            success: false,
            message: "Unable to register tour guide right now."
        });
    }
});

// =========================
// HOTEL PARTNER REGISTRATION API
// =========================
app.post("/api/auth/hotel/register", async function (req, res) {
    try {
        if (!db) return res.status(503).json({ success: false, message: "Database not connected." });
        const { fullName, email, password, hotelName, district, phone, stars, minPrice, address, description } = req.body;

        if (!fullName || !email || !password || !hotelName || !district) {
            return res.status(400).json({
                success: false,
                message: "Full name, email, password, hotel name, and district are required."
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 8 characters."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await db.collection("users").findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const now = new Date();

        const userInsert = await db.collection("users").insertOne({
            fullName: fullName.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            userType: "hotel",
            hotelName: hotelName.trim(),
            district: district.trim(),
            phone: (phone || "").trim(),
            address: (address || "").trim(),
            isActive: true,
            createdAt: now,
            updatedAt: now
        });

        // Insert or link to hotels collection
        const existingHotel = await db.collection("hotels").findOne({ name: hotelName.trim() });
        let hotelId = existingHotel ? existingHotel._id.toString() : null;
        if (!existingHotel) {
            const hotelDoc = {
                name: hotelName.trim(),
                district: district.trim(),
                districtName: district.trim(),
                stars: Number(stars) || 3,
                pricePerNight: Number(minPrice) || 2500,
                rating: 4.8,
                reviews: 1,
                location: (address || `${district.trim()}, Bangladesh`).trim(),
                description: (description || `Premier hospitality and comfortable stay in ${district.trim()}.`).trim(),
                amenities: ["Free Wi-Fi", "Air Conditioning", "Breakfast Included", "24/7 Room Service"],
                packages: [
                    { name: "Standard Deluxe", price: Number(minPrice) || 2500, description: "AC Room, Free Breakfast" },
                    { name: "Executive Suite", price: Math.round((Number(minPrice) || 2500) * 1.6), description: "Balcony View, King Bed" }
                ],
                partnerUserId: userInsert.insertedId,
                createdAt: now,
                updatedAt: now
            };
            const hInsert = await db.collection("hotels").insertOne(hotelDoc);
            hotelId = hInsert.insertedId.toString();
        }

        res.status(201).json({
            success: true,
            message: "Hotel Partner account registered successfully! You can now log in.",
            userId: userInsert.insertedId.toString(),
            hotelId: hotelId
        });

    } catch (error) {
        console.error("Hotel partner registration error:", error.message);
        res.status(500).json({ success: false, message: "Unable to register hotel partner." });
    }
});

// =========================
// TRANSPORT OPERATOR REGISTRATION API
// =========================
app.post("/api/auth/transport/register", async function (req, res) {
    try {
        if (!db) return res.status(503).json({ success: false, message: "Database not connected." });
        const { fullName, email, password, operatorName, transportType, routes, phone, fare, licenseNumber } = req.body;

        if (!fullName || !email || !password || !operatorName || !transportType) {
            return res.status(400).json({
                success: false,
                message: "Full name, email, password, operator name, and transport type are required."
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 8 characters."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await db.collection("users").findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const now = new Date();

        const userInsert = await db.collection("users").insertOne({
            fullName: fullName.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            userType: "transport",
            operatorName: operatorName.trim(),
            transportType: transportType.trim(),
            routes: (routes || "").trim(),
            phone: (phone || "").trim(),
            licenseNumber: (licenseNumber || "").trim(),
            isActive: true,
            createdAt: now,
            updatedAt: now
        });

        // Insert demo route into transportations if needed
        const routeParts = (routes || "Dhaka - Cox's Bazar").split("-").map(s => s.trim());
        const fromCity = routeParts[0] || "Dhaka";
        const toCity = routeParts[1] || "Cox's Bazar";

        await db.collection("transportations").insertOne({
            type: transportType.trim(),
            operator: operatorName.trim(),
            from: fromCity,
            to: toCity,
            fare: Number(fare) || 1200,
            farePerSeat: Number(fare) || 1200,
            availableSeats: 40,
            departureTime: "08:00 AM",
            partnerUserId: userInsert.insertedId,
            createdAt: now,
            updatedAt: now
        });

        res.status(201).json({
            success: true,
            message: "Transport Operator account registered successfully! You can now log in.",
            userId: userInsert.insertedId.toString()
        });

    } catch (error) {
        console.error("Transport registration error:", error.message);
        res.status(500).json({ success: false, message: "Unable to register transport operator." });
    }
});

// =========================
// USER LOGIN API
// =========================

app.post("/api/auth/login", async function (req, res) {
    try {
        const { email, password } = req.body;

        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await db.collection("users").findOne({
            email: normalizedEmail
        });

        if (!user || typeof user.password !== "string") {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        // Section C / NFR-06: Check account lock after 5 consecutive failed attempts (30-second temporary lock)
        const now = new Date();
        if (user.lockUntil && new Date(user.lockUntil) > now) {
            const remainingSeconds = Math.ceil((new Date(user.lockUntil).getTime() - now.getTime()) / 1000);
            return res.status(403).json({
                success: false,
                locked: true,
                remainingSeconds: remainingSeconds > 0 ? remainingSeconds : 1,
                message: `This account is temporarily locked due to 5 consecutive failed login attempts. Please wait ${remainingSeconds > 0 ? remainingSeconds : 1} second(s) before trying again.`
            });
        }

        // If lock period has expired, automatically unlock and reset counter
        if (user.lockUntil && new Date(user.lockUntil) <= now) {
            await db.collection("users").updateOne(
                { _id: user._id },
                { $set: { failedLoginAttempts: 0, lockUntil: null, isLocked: false, isActive: true } }
            );
            user.failedLoginAttempts = 0;
            user.isLocked = false;
            user.isActive = true;
        }

        if (user.isActive === false && !user.isLocked) {
            return res.status(403).json({
                success: false,
                message: "This account has been deactivated."
            });
        }

        const passwordMatches = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatches) {
            const attempts = (user.failedLoginAttempts || 0) + 1;
            const updateDoc = { failedLoginAttempts: attempts };
            if (attempts >= 5) {
                const lockUntil = new Date(Date.now() + 30 * 1000); // 30-second temporary lock
                updateDoc.isLocked = true;
                updateDoc.lockUntil = lockUntil;

                // Send Security Alert notification to Admin
                try {
                    await db.collection("notifications").insertOne({
                        type: "security_alert",
                        role: "admin",
                        title: "Security Alert: Account Locked",
                        message: `Account ${user.email} (${user.fullName || user.userType || "User"}) was temporarily locked for 30s after 5 failed login attempts.`,
                        isRead: false,
                        read: false,
                        createdAt: new Date().toISOString()
                    });
                } catch (notifErr) {
                    console.error("Failed to insert security alert:", notifErr.message);
                }

                await db.collection("users").updateOne(
                    { _id: user._id },
                    { $set: updateDoc }
                );

                return res.status(403).json({
                    success: false,
                    locked: true,
                    remainingSeconds: 30,
                    message: "You have entered an incorrect email or password. 5 failed attempts reached. Account temporarily locked for 30 seconds."
                });
            }

            await db.collection("users").updateOne(
                { _id: user._id },
                { $set: updateDoc }
            );

            return res.status(401).json({
                success: false,
                remainingAttempts: 5 - attempts,
                message: `You have entered an incorrect email or password. Attempt ${attempts} of 5 before 30-second lockout.`
            });
        }

        // Reset failed login attempts and clear lock on successful authentication
        await db.collection("users").updateOne(
            { _id: user._id },
            { $set: { failedLoginAttempts: 0, lockUntil: null, isLocked: false, isActive: true } }
        );

        const userType = user.userType || "traveler";

        if (!["admin", "traveler", "guide", "hotel", "transport"].includes(userType)) {
            return res.status(403).json({
                success: false,
                message: "Invalid account role."
            });
        }

        // For tour guides, verify admin approval
        let guideProfile = null;
        if (userType === "guide") {
            guideProfile = await db.collection("tourguides").findOne({
                $or: [
                    { userId: user._id },
                    { email: user.email }
                ]
            });

            if (user.isApproved === false || (guideProfile && guideProfile.isApproved === false)) {
                return res.status(403).json({
                    success: false,
                    message: "Your tour guide account is currently pending administrator verification. Please check back soon."
                });
            }
        }

        res.json({
            success: true,
            message: "Login successful!",
            user: {
                id: user._id.toString(),
                guideId: guideProfile ? guideProfile._id.toString() : null,
                fullName: user.fullName || user.name || "User",
                email: user.email,
                avatar: user.avatar || (guideProfile && (guideProfile.photo || guideProfile.avatar)) || "",
                userType: userType,
                hotelName: user.hotelName || "",
                operatorName: user.operatorName || "",
                transportType: user.transportType || "",
                district: user.district || ""
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

// ============================================
// FORGOT PASSWORD API (Crypto Token + Gmail SMTP)
// ============================================
app.post("/api/auth/forgot-password", async function (req, res) {
    try {
        if (!db) return res.status(503).json({ success: false, message: "Database not connected." });
        const { email } = req.body;

        if (typeof email !== "string" || !email.trim()) {
            return res.status(400).json({ success: false, message: "Please provide a valid email address." });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = await db.collection("users").findOne({ email: normalizedEmail });

        // Neutral generic response if user not found to prevent user enumeration
        if (!user) {
            return res.json({
                success: true,
                message: "If an account with that email exists, password reset instructions have been sent."
            });
        }

        // Generate high-entropy 32-byte crypto token
        const rawToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry

        await db.collection("users").updateOne(
            { _id: user._id },
            {
                $set: {
                    resetPasswordToken: hashedToken,
                    resetPasswordExpires: expiresAt,
                    updatedAt: new Date()
                }
            }
        );

        // Send email via emailService
        let sendResult = { success: true };
        if (emailService && typeof emailService.sendPasswordResetEmail === "function") {
            sendResult = await emailService.sendPasswordResetEmail(
                user.email,
                rawToken,
                user.fullName || user.name || "Traveler"
            );
        }

        const responseData = {
            success: true,
            message: "If an account with that email exists, password reset instructions have been sent."
        };
        if (sendResult && (sendResult.sandbox || sendResult.resetUrl)) {
            responseData.devResetUrl = sendResult.resetUrl;
        }

        res.json(responseData);
    } catch (err) {
        console.error("Forgot password error:", err.message);
        res.status(500).json({ success: false, message: "Unable to process password reset request." });
    }
});

// ============================================
// RESET PASSWORD API (Token Verification & Bcrypt Update)
// ============================================
app.post("/api/auth/reset-password", async function (req, res) {
    try {
        if (!db) return res.status(503).json({ success: false, message: "Database not connected." });
        const { token, email, newPassword } = req.body;

        if (!token || typeof token !== "string" || !email || typeof email !== "string" || !newPassword || typeof newPassword !== "string") {
            return res.status(400).json({ success: false, message: "All fields are required." });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: "Password must be at least 6 characters long." });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const hashedToken = crypto.createHash("sha256").update(token.trim()).digest("hex");

        const user = await db.collection("users").findOne({
            email: normalizedEmail,
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Password reset link is invalid or has expired. Please request a new one."
            });
        }

        // Hash new password using bcrypt
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password and invalidate single-use token immediately
        await db.collection("users").updateOne(
            { _id: user._id },
            {
                $set: {
                    password: hashedPassword,
                    failedLoginAttempts: 0,
                    isLocked: false,
                    lockUntil: null,
                    updatedAt: new Date()
                },
                $unset: {
                    resetPasswordToken: "",
                    resetPasswordExpires: ""
                }
            }
        );

        // Security audit log
        try {
            await db.collection("security_logs").insertOne({
                action: "password_reset",
                userId: user._id.toString(),
                email: user.email,
                ip: req.ip || req.headers["x-forwarded-for"] || "127.0.0.1",
                timestamp: new Date()
            });
        } catch (e) {}

        res.json({
            success: true,
            message: "Your password has been successfully reset! You can now log in with your new password."
        });
    } catch (err) {
        console.error("Reset password error:", err.message);
        res.status(500).json({ success: false, message: "Unable to reset password right now." });
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
                    email: normalizedEmail,
                    updatedAt: new Date()
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

// ============================================
// 64 DISTRICTS OF BANGLADESH API (FR-06, FR-07, FR-08)
// ============================================

app.get("/api/districts", async function (req, res) {
    try {
        if (!db) return res.status(503).json({ success: false, message: "Database not connected." });

        const { division, search } = req.query;
        const filter = {};

        if (division && division !== "all") {
            filter.division = new RegExp(division.trim(), "i");
        }

        if (search && search.trim()) {
            filter.name = new RegExp(search.trim(), "i");
        }

        const list = await db.collection("districts")
            .find(filter)
            .sort({ name: 1 })
            .toArray();

        // Get count of attractions per district
        const attractions = await db.collection("attractions").find({}).toArray();
        const counts = {};
        attractions.forEach(a => {
            const dName = a.districtName || (a.district && a.district.toString()) || "";
            counts[dName.toLowerCase()] = (counts[dName.toLowerCase()] || 0) + 1;
        });

        const formatted = list.map(d => ({
            id: d._id.toString(),
            name: d.name,
            division: d.division || "Bangladesh",
            population: d.population || 0,
            area: d.area || 0,
            description: d.description || `Explore tourist spots, culture, and nature in ${d.name}.`,
            latitude: d.latitude || 23.8103,
            longitude: d.longitude || 90.4125,
            spotsCount: counts[d.name.toLowerCase()] || 3
        }));

        res.json({
            success: true,
            total: formatted.length,
            districts: formatted
        });
    } catch (error) {
        console.error("Get districts error:", error.message);
        res.status(500).json({ success: false, message: "Unable to load districts." });
    }
});

app.get("/api/districts/:name", async function (req, res) {
    try {
        if (!db) return res.status(503).json({ success: false, message: "Database not connected." });
        const { name } = req.params;

        const district = await db.collection("districts").findOne({
            name: new RegExp("^" + name.trim() + "$", "i")
        });

        if (!district) {
            return res.status(404).json({ success: false, message: "District not found." });
        }

        // Fetch attractions for this district
        const attractions = await db.collection("attractions").find({
            $or: [
                { district: district._id },
                { district: district._id.toString() },
                { districtName: new RegExp("^" + district.name + "$", "i") },
                { district: new RegExp("^" + district.name + "$", "i") }
            ]
        }).toArray();

        // Fetch hotels for this district
        const hotels = await db.collection("hotels").find({
            $or: [
                { district: district._id },
                { districtName: new RegExp("^" + district.name + "$", "i") }
            ]
        }).toArray();

        res.json({
            success: true,
            district: {
                id: district._id.toString(),
                name: district.name,
                division: district.division,
                population: district.population,
                area: district.area,
                description: district.description,
                latitude: district.latitude,
                longitude: district.longitude,
                attractions: attractions.map(a => ({
                    id: a._id.toString(),
                    name: a.name,
                    category: a.category || "attraction",
                    description: a.description,
                    latitude: a.latitude || district.latitude,
                    longitude: a.longitude || district.longitude,
                    entranceFee: a.entranceFee || 0,
                    openingHours: a.openingHours || "09:00 AM - 06:00 PM"
                })),
                hotels: hotels.map(h => ({
                    id: h._id.toString(),
                    name: h.name,
                    address: h.address,
                    image: h.image || null,
                    starRating: h.starRating || 4,
                    priceStandard: h.priceStandard || (h.packages?.[0]?.pricePerNight) || 2500,
                    phone: h.phone || "+8801700000000"
                }))
            }
        });
    } catch (error) {
        console.error("Get district details error:", error.message);
        res.status(500).json({ success: false, message: "Unable to load district details." });
    }
});

// ============================================
// ROUTE SEARCH & ESTIMATION API (FR-15 to FR-19)
// Calculates road distance & travel durations between districts
// ============================================

function haversineDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 1.28); // 1.28 multiplier for real road curvature in Bangladesh
}

app.get("/api/routes", async function (req, res) {
    try {
        if (!db) return res.status(503).json({ success: false, message: "Database not connected." });
        const { from, to } = req.query;

        if (!from || !to) {
            return res.status(400).json({ success: false, message: "Both 'from' and 'to' districts are required." });
        }

        const distFrom = await db.collection("districts").findOne({ name: new RegExp("^" + from.trim() + "$", "i") });
        const distTo = await db.collection("districts").findOne({ name: new RegExp("^" + to.trim() + "$", "i") });

        const fromLat = distFrom?.latitude || 23.8103;
        const fromLng = distFrom?.longitude || 90.4125;
        const toLat = distTo?.latitude || 21.4272;
        const toLng = distTo?.longitude || 91.9722;

        let distanceKm = haversineDistanceKm(fromLat, fromLng, toLat, toLng);
        if (distanceKm < 15 && from.toLowerCase() !== to.toLowerCase()) distanceKm = 25;

        // Realistic estimated duration in minutes
        const busMinutes = Math.round((distanceKm / 42) * 60); // Average bus speed 42 km/h
        const trainMinutes = Math.round((distanceKm / 55) * 60) + 30; // Average train speed 55 km/h + stops

        // Airport hubs in Bangladesh
        const airportDistricts = ["dhaka", "chattogram", "cox's bazar", "sylhet", "rajshahi", "jashore", "saidpur", "barishal"];
        const hasFlight = airportDistricts.includes(from.trim().toLowerCase()) &&
                          airportDistricts.includes(to.trim().toLowerCase()) &&
                          distanceKm > 100;
        const flightMinutes = hasFlight ? 50 : null;

        const formatHours = (mins) => {
            const h = Math.floor(mins / 60);
            const m = mins % 60;
            return h > 0 ? `${h}h ${m > 0 ? m + 'm' : ''}` : `${m} mins`;
        };

        const googleMapsDirUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(from + ', Bangladesh')}&destination=${encodeURIComponent(to + ', Bangladesh')}&travelmode=driving`;

        res.json({
            success: true,
            from: distFrom?.name || from,
            to: distTo?.name || to,
            distanceKm: distanceKm,
            estimatedDistanceText: `${distanceKm} km (approx. by road)`,
            durations: {
                bus: formatHours(busMinutes),
                busMinutes: busMinutes,
                train: formatHours(trainMinutes),
                trainMinutes: trainMinutes,
                flight: flightMinutes ? `${flightMinutes} mins` : "No direct domestic flight",
                flightAvailable: Boolean(hasFlight)
            },
            directionsUrl: googleMapsDirUrl
        });
    } catch (error) {
        console.error("Get routes error:", error.message);
        res.status(500).json({ success: false, message: "Unable to calculate route." });
    }
});

// ============================================
// TOUR GUIDES API (FR-48 to FR-56)
// ============================================

// ============================================
// TOUR GUIDES API (FR-48 to FR-56)
// ============================================

app.get("/api/tourguides", async function (req, res) {
    try {
        if (!db) return res.status(503).json({ success: false, message: "Database not connected." });
        const { district } = req.query;

        // Show approved guides (or legacy seed guides without isApproved flag)
        const filter = {
            isActive: { $ne: false },
            isApproved: { $ne: false }
        };

        if (district && district.trim()) {
            filter.specialization = new RegExp(district.trim(), "i");
        }

        const guides = await db.collection("tourguides").find(filter).toArray();

        res.json({
            success: true,
            guides: guides.map(g => ({
                id: g._id.toString(),
                name: g.name,
                specialization: Array.isArray(g.specialization) ? g.specialization : [g.specialization || "All Bangladesh"],
                experience: g.experience || 3,
                languages: Array.isArray(g.languages) ? g.languages : ["Bengali", "English"],
                rating: Number(g.rating) || 4.8,
                reviews: Number(g.reviews) || 0,
                isSeedRating: Boolean(g.seedRating !== false && (!g.userId || g.reviews === 0)),
                dailyRate: Number(g.dailyRate) || 2000,
                bio: g.bio || "Passionate local tour guide with extensive knowledge of history, culture and nature.",
                phone: g.phone || "+8801700000000",
                isAvailable: g.isAvailable !== false,
                photo: g.photo || g.avatar || g.image || "",
                avatar: g.avatar || g.photo || g.image || ""
            }))
        });
    } catch (error) {
        console.error("Get tourguides error:", error.message);
        res.status(500).json({ success: false, message: "Unable to load tour guides." });
    }
});

// Guide Booking Request (Traveler submits)
app.post("/api/tourguide-bookings", async function (req, res) {
    try {
        if (!db) return res.status(503).json({ success: false, message: "Database not connected." });
        const { userId, guideId, guideName, destination, date, days, notes, guestName, guestPhone, paymentMethod } = req.body;

        if (!guideName || !destination || !date) {
            return res.status(400).json({ success: false, message: "Guide, destination, and tour date are required." });
        }

        // Check if guide exists and get daily rate
        let guide = null;
        if (guideId && ObjectId.isValid(guideId)) {
            guide = await db.collection("tourguides").findOne({ _id: new ObjectId(guideId) });
        }
        if (!guide) {
            guide = await db.collection("tourguides").findOne({ name: guideName.trim() });
        }

        // Avoid conflicting bookings for the same guide on the same date
        const conflictQuery = {
            type: "tourguide",
            tourDate: date,
            status: { $in: ["Pending", "Confirmed"] },
            $or: [
                { guideName: guideName.trim() }
            ]
        };
        if (guideId) {
            conflictQuery.$or.push({ guideId: String(guideId) });
        }

        const conflicting = await db.collection("bookings").findOne(conflictQuery);
        if (conflicting) {
            return res.status(409).json({
                success: false,
                message: `Guide "${guideName}" already has a ${conflicting.status.toLowerCase()} booking on ${date}. Please choose another date or guide.`
            });
        }

        const numDays = Math.max(1, Number(days) || 1);
        const ratePerDay = guide ? (Number(guide.dailyRate) || 2000) : 2000;
        const totalAmount = ratePerDay * numDays;
        const reference = "TKB-TG-" + Date.now().toString().slice(-6) + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();

        const bookingDoc = {
            reference,
            type: "tourguide",
            userId: userId && ObjectId.isValid(userId) ? new ObjectId(userId) : null,
            guideId: guide ? guide._id.toString() : (guideId ? String(guideId) : null),
            guideName: guide ? guide.name : guideName.trim(),
            destination: destination.trim(),
            tourDate: date,
            days: numDays,
            dailyRate: ratePerDay,
            totalAmount: totalAmount,
            guestName: (guestName || "Traveler").trim(),
            guestPhone: (guestPhone || "").trim(),
            notes: (notes || "").trim(),
            paymentMethod: paymentMethod || "cash",
            paymentStatus: paymentMethod === "cash" ? "Pay on arrival" : "Demo Paid",
            status: "Pending", // Pending guide confirmation in Guide Operations Portal
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await db.collection("bookings").insertOne(bookingDoc);

        // Add user notification
        if (userId && ObjectId.isValid(userId)) {
            await db.collection("notifications").insertOne({
                userId: new ObjectId(userId),
                title: "Tour Guide Booking Submitted",
                message: `Your booking request for ${guideName} on ${date} (Ref: ${reference}) is pending guide confirmation.`,
                read: false,
                createdAt: new Date()
            });
        }

        res.status(201).json({
            success: true,
            message: "Guide booking request submitted! The guide will review and confirm your request.",
            reference: reference,
            booking: bookingDoc
        });
    } catch (error) {
        console.error("Tour guide booking error:", error.message);
        res.status(500).json({ success: false, message: "Unable to submit guide booking." });
    }
});

// Get Tour Guide Bookings for a specific traveler
app.get("/api/tourguide-bookings/user/:userId", async function (req, res) {
    try {
        if (!db) return res.status(503).json({ success: false, message: "Database not connected." });
        const { userId } = req.params;

        const query = {
            type: "tourguide"
        };
        if (ObjectId.isValid(userId)) {
            query.$or = [
                { userId: new ObjectId(userId) },
                { userId: String(userId) }
            ];
        } else {
            query.userId = String(userId);
        }

        const bookings = await db.collection("bookings")
            .find(query)
            .sort({ createdAt: -1 })
            .toArray();

        // Check which bookings have existing reviews
        const references = bookings.map(b => b.reference).filter(Boolean);
        const existingReviews = references.length > 0
            ? await db.collection("guidereviews").find({ bookingReference: { $in: references } }).toArray()
            : [];
        const reviewMap = new Map();
        existingReviews.forEach(r => reviewMap.set(r.bookingReference, r));

        // Resolve guide photos from tourguides
        const guideIds = bookings.map(b => b.guideId).filter(Boolean);
        const guideNames = bookings.map(b => b.guideName).filter(Boolean);
        const objGuideIds = guideIds.filter(id => ObjectId.isValid(id)).map(id => new ObjectId(id));
        const matchedGuides = (objGuideIds.length > 0 || guideNames.length > 0)
            ? await db.collection("tourguides").find({
                $or: [
                    { _id: { $in: objGuideIds } },
                    { name: { $in: guideNames } }
                ]
            }).toArray()
            : [];
        const guidePhotoMap = new Map();
        matchedGuides.forEach(g => {
            const p = g.photo || g.avatar || "";
            guidePhotoMap.set(g._id.toString(), p);
            guidePhotoMap.set(g.name, p);
        });

        const enriched = bookings.map(b => {
            const rev = reviewMap.get(b.reference);
            const guidePhoto = guidePhotoMap.get(b.guideId ? b.guideId.toString() : "") || guidePhotoMap.get(b.guideName) || "";
            return {
                ...b,
                id: b._id.toString(),
                guidePhoto: guidePhoto,
                guideAvatar: guidePhoto,
                isReviewed: Boolean(rev),
                review: rev ? {
                    id: rev._id.toString(),
                    rating: rev.rating,
                    comment: rev.comment,
                    createdAt: rev.createdAt
                } : null
            };
        });

        res.json({
            success: true,
            bookings: enriched
        });
    } catch (error) {
        console.error("Get traveler tourguide bookings error:", error.message);
        res.status(500).json({ success: false, message: "Unable to load tour guide bookings." });
    }
});

// ============================================
// GUIDE OPERATIONS PORTAL APIS
// Scoped to the logged-in tour guide
// ============================================

// Get Guide Profile and Overview Stats
app.get("/api/guide/profile/:guideId", async function (req, res) {
    try {
        if (!db) return res.status(503).json({ success: false, message: "Database not connected." });
        const { guideId } = req.params;

        let guide = null;
        if (ObjectId.isValid(guideId)) {
            guide = await db.collection("tourguides").findOne({ _id: new ObjectId(guideId) });
        }
        if (!guide && ObjectId.isValid(guideId)) {
            guide = await db.collection("tourguides").findOne({ userId: new ObjectId(guideId) });
        }

        if (!guide) {
            return res.status(404).json({ success: false, message: "Tour guide profile not found." });
        }

        // Count total tours/bookings handled by this guide
        const totalBookings = await db.collection("bookings").countDocuments({
            type: "tourguide",
            $or: [
                { guideId: guide._id.toString() },
                { guideName: guide.name }
            ]
        });

        // Count completed tours
        const completedTours = await db.collection("bookings").countDocuments({
            type: "tourguide",
            status: "Completed",
            $or: [
                { guideId: guide._id.toString() },
                { guideName: guide.name }
            ]
        });

        res.json({
            success: true,
            guide: {
                id: guide._id.toString(),
                name: guide.name,
                email: guide.email || "",
                phone: guide.phone || "",
                photo: guide.photo || guide.avatar || "",
                avatar: guide.avatar || guide.photo || "",
                bio: guide.bio || "",
                specialization: Array.isArray(guide.specialization) ? guide.specialization : [guide.specialization || "Bangladesh"],
                languages: Array.isArray(guide.languages) ? guide.languages : ["Bengali", "English"],
                experience: guide.experience || 1,
                dailyRate: Number(guide.dailyRate) || 2000,
                rating: Number(guide.rating) || 5.0,
                reviews: Number(guide.reviews) || 0,
                isSeedRating: Boolean(guide.seedRating !== false && (!guide.userId || guide.reviews === 0)),
                isAvailable: guide.isAvailable !== false,
                isApproved: guide.isApproved !== false,
                totalBookings: totalBookings,
                completedTours: completedTours
            }
        });
    } catch (error) {
        console.error("Get guide profile error:", error.message);
        res.status(500).json({ success: false, message: "Unable to load guide profile." });
    }
});

// Update Guide Profile & Settings
app.put("/api/guide/profile/:guideId", async function (req, res) {
    try {
        if (!db) return res.status(503).json({ success: false, message: "Database not connected." });
        const { guideId } = req.params;
        const { bio, languages, experience, specialization, dailyRate, phone, isAvailable, photo, avatar } = req.body;

        let query = null;
        if (ObjectId.isValid(guideId)) {
            query = { $or: [{ _id: new ObjectId(guideId) }, { userId: new ObjectId(guideId) }] };
        } else {
            return res.status(400).json({ success: false, message: "Invalid guide ID." });
        }

        const updateFields = { updatedAt: new Date() };
        if (typeof bio === "string") updateFields.bio = bio.trim();
        if (typeof phone === "string") updateFields.phone = phone.trim();
        if (dailyRate !== undefined) updateFields.dailyRate = Math.max(500, Number(dailyRate) || 2000);
        if (experience !== undefined) updateFields.experience = Math.max(0, Number(experience) || 1);
        if (isAvailable !== undefined) updateFields.isAvailable = Boolean(isAvailable);

        if (photo !== undefined || avatar !== undefined) {
            const photoVal = (photo !== undefined ? photo : avatar) || "";
            updateFields.photo = photoVal;
            updateFields.avatar = photoVal;
        }

        if (languages) {
            updateFields.languages = Array.isArray(languages)
                ? languages
                : String(languages).split(",").map(s => s.trim()).filter(Boolean);
        }
        if (specialization) {
            updateFields.specialization = Array.isArray(specialization)
                ? specialization
                : String(specialization).split(",").map(s => s.trim()).filter(Boolean);
        }

        const existingGuide = await db.collection("tourguides").findOne(query);
        if (!existingGuide) {
            return res.status(404).json({ success: false, message: "Guide profile not found." });
        }

        await db.collection("tourguides").updateOne({ _id: existingGuide._id }, { $set: updateFields });

        // Synchronize avatar to users collection if photo updated
        if ((photo !== undefined || avatar !== undefined) && existingGuide.userId) {
            const photoVal = (photo !== undefined ? photo : avatar) || "";
            await db.collection("users").updateOne(
                { _id: existingGuide.userId },
                { $set: { avatar: photoVal, updatedAt: new Date() } }
            );
        }

        res.json({ success: true, message: "Guide profile updated successfully!" });
    } catch (error) {
        console.error("Update guide profile error:", error.message);
        res.status(500).json({ success: false, message: "Unable to update guide profile." });
    }
});

// Dedicated Tour Guide Profile Photo Route
app.put("/api/guide/profile/:guideId/photo", async function (req, res) {
    try {
        if (!db) return res.status(503).json({ success: false, message: "Database not connected." });
        const { guideId } = req.params;
        const { photo, avatar, userId } = req.body;

        if (!ObjectId.isValid(guideId)) {
            return res.status(400).json({ success: false, message: "Invalid guide ID." });
        }

        // Find guide by _id or userId
        const guide = await db.collection("tourguides").findOne({
            $or: [{ _id: new ObjectId(guideId) }, { userId: new ObjectId(guideId) }]
        });

        if (!guide) {
            return res.status(404).json({ success: false, message: "Tour guide profile not found." });
        }

        // Role / ownership check: if userId provided, verify match
        if (userId && ObjectId.isValid(userId)) {
            const userObjId = new ObjectId(userId);
            if (guide.userId && !guide.userId.equals(userObjId) && !guide._id.equals(userObjId)) {
                return res.status(403).json({ success: false, message: "Unauthorized. You can only update your own guide photo." });
            }
        }

        const photoData = (photo !== undefined ? photo : avatar) || "";

        // If photoData is provided, validate format and size
        if (photoData) {
            if (typeof photoData !== "string") {
                return res.status(400).json({ success: false, message: "Invalid image format." });
            }

            const isDataUri = /^data:image\/(jpeg|jpg|png|webp);base64,/i.test(photoData);
            const isHttpUrl = /^https?:\/\//i.test(photoData);
            if (!isDataUri && !isHttpUrl) {
                return res.status(400).json({
                    success: false,
                    message: "Unsupported file format. Please upload JPG, JPEG, PNG, or WEBP image."
                });
            }

            if (photoData.length > 7 * 1024 * 1024) {
                return res.status(400).json({
                    success: false,
                    message: "Image exceeds maximum allowed size of 5 MB."
                });
            }
        }

        // Persist photo in tourguides collection
        await db.collection("tourguides").updateOne(
            { _id: guide._id },
            {
                $set: {
                    photo: photoData,
                    avatar: photoData,
                    updatedAt: new Date()
                }
            }
        );

        // Synchronize in users collection
        if (guide.userId) {
            await db.collection("users").updateOne(
                { _id: guide.userId },
                {
                    $set: {
                        avatar: photoData,
                        updatedAt: new Date()
                    }
                }
            );
        }

        res.json({
            success: true,
            message: photoData ? "Guide profile photo updated successfully!" : "Guide profile photo removed successfully.",
            photo: photoData,
            avatar: photoData
        });
    } catch (error) {
        console.error("Guide photo upload error:", error.message);
        res.status(500).json({ success: false, message: "Unable to update guide photo." });
    }
});

// Toggle Guide Availability
app.put("/api/guide/availability/:guideId", async function (req, res) {
    try {
        if (!db) return res.status(503).json({ success: false, message: "Database not connected." });
        const { guideId } = req.params;
        const { isAvailable } = req.body;

        let query = null;
        if (ObjectId.isValid(guideId)) {
            query = { $or: [{ _id: new ObjectId(guideId) }, { userId: new ObjectId(guideId) }] };
        } else {
            return res.status(400).json({ success: false, message: "Invalid guide ID." });
        }

        await db.collection("tourguides").updateOne(query, {
            $set: { isAvailable: Boolean(isAvailable), updatedAt: new Date() }
        });

        res.json({
            success: true,
            isAvailable: Boolean(isAvailable),
            message: `Availability status set to: ${isAvailable ? "Available for Hire" : "Unavailable"}.`
        });
    } catch (error) {
        console.error("Toggle availability error:", error.message);
        res.status(500).json({ success: false, message: "Unable to change availability." });
    }
});

// Get Incoming Traveler Requests for this Guide
app.get("/api/guide/bookings/:guideId", async function (req, res) {
    try {
        if (!db) return res.status(503).json({ success: false, message: "Database not connected." });
        const { guideId } = req.params;

        let guide = null;
        if (ObjectId.isValid(guideId)) {
            guide = await db.collection("tourguides").findOne({
                $or: [{ _id: new ObjectId(guideId) }, { userId: new ObjectId(guideId) }]
            });
        }

        if (!guide) {
            return res.status(404).json({ success: false, message: "Guide profile not found." });
        }

        // Strictly fetch bookings belonging to this guide
        const bookings = await db.collection("bookings")
            .find({
                type: "tourguide",
                $or: [
                    { guideId: guide._id.toString() },
                    { guideName: guide.name }
                ]
            })
            .sort({ createdAt: -1 })
            .toArray();

        res.json({
            success: true,
            bookings: bookings.map(b => ({
                id: b._id.toString(),
                reference: b.reference,
                destination: b.destination,
                tourDate: b.tourDate,
                days: b.days || 1,
                dailyRate: b.dailyRate || 2000,
                totalAmount: b.totalAmount || (b.days || 1) * (b.dailyRate || 2000),
                guestName: b.guestName || "Traveler",
                guestPhone: b.guestPhone || "N/A",
                paymentMethod: b.paymentMethod || "cash",
                paymentStatus: b.paymentStatus || "Demo Paid",
                status: b.status || "Pending",
                notes: b.notes || "",
                createdAt: b.createdAt
            }))
        });
    } catch (error) {
        console.error("Get guide bookings error:", error.message);
        res.status(500).json({ success: false, message: "Unable to load guide bookings." });
    }
});

// Update Request Status (Accept / Reject / Complete)
app.put("/api/guide/bookings/:bookingId/status", async function (req, res) {
    try {
        if (!db) return res.status(503).json({ success: false, message: "Database not connected." });
        const { bookingId } = req.params;
        const { status, guideId } = req.body;

        if (!ObjectId.isValid(bookingId)) {
            return res.status(400).json({ success: false, message: "Invalid booking ID." });
        }

        const validStatuses = ["Confirmed", "Rejected", "Completed", "Cancelled"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status value." });
        }

        // Verify guide owns this booking
        let guide = null;
        if (guideId && ObjectId.isValid(guideId)) {
            guide = await db.collection("tourguides").findOne({
                $or: [{ _id: new ObjectId(guideId) }, { userId: new ObjectId(guideId) }]
            });
        }

        const booking = await db.collection("bookings").findOne({ _id: new ObjectId(bookingId) });
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found." });
        }

        if (guide) {
            const matchesId = booking.guideId === guide._id.toString();
            const matchesName = booking.guideName && booking.guideName.toLowerCase() === guide.name.toLowerCase();
            if (!matchesId && !matchesName) {
                return res.status(403).json({ success: false, message: "Unauthorized. You cannot modify another guide's request." });
            }
        }

        await db.collection("bookings").updateOne(
            { _id: new ObjectId(bookingId) },
            { $set: { status: status, updatedAt: new Date() } }
        );

        // Notify traveler if traveler userId exists
        if (booking.userId && ObjectId.isValid(booking.userId)) {
            const msgStatus = status === "Confirmed" ? "confirmed by your tour guide!" : (status === "Rejected" ? "declined by the guide." : `updated to: ${status}.`);
            await db.collection("notifications").insertOne({
                userId: new ObjectId(booking.userId),
                title: `Tour Guide Request ${status}`,
                message: `Your booking (Ref: ${booking.reference}) for ${booking.destination} on ${booking.tourDate} has been ${msgStatus}`,
                read: false,
                createdAt: new Date()
            });
        }

        res.json({
            success: true,
            status: status,
            message: `Booking request has been marked as ${status}.`
        });
    } catch (error) {
        console.error("Update guide booking status error:", error.message);
        res.status(500).json({ success: false, message: "Unable to update booking status." });
    }
});

// ============================================
// TRAVELER RATINGS & REVIEWS FOR TOUR GUIDES
// ============================================

// Submit or Update Guide Rating & Review
app.post("/api/guide-reviews", async function (req, res) {
    try {
        if (!db) return res.status(503).json({ success: false, message: "Database not connected." });
        const { userId, guideId, bookingReference, rating, comment, travelerName } = req.body;

        const numRating = parseInt(rating, 10);
        if (isNaN(numRating) || numRating < 1 || numRating > 5) {
            return res.status(400).json({ success: false, message: "Rating must be an integer between 1 and 5 stars." });
        }

        if (!guideId) {
            return res.status(400).json({ success: false, message: "Tour Guide is required." });
        }

        if (!comment || !comment.trim()) {
            return res.status(400).json({ success: false, message: "Please provide review comments describing your experience." });
        }

        // Resolve guide document
        let guide = null;
        if (ObjectId.isValid(guideId)) {
            guide = await db.collection("tourguides").findOne({ _id: new ObjectId(guideId) });
        }
        if (!guide) {
            guide = await db.collection("tourguides").findOne({
                $or: [
                    { _id: String(guideId) },
                    { name: String(guideId).trim() }
                ]
            });
        }
        if (!guide) {
            return res.status(404).json({ success: false, message: "Tour guide not found." });
        }

        // Look up traveler info
        let authorName = travelerName ? String(travelerName).trim() : "";
        let userObjId = userId && ObjectId.isValid(userId) ? new ObjectId(userId) : null;

        if (userObjId) {
            const userDoc = await db.collection("users").findOne({ _id: userObjId });
            if (userDoc && userDoc.name) {
                authorName = userDoc.name;
            }
        }
        if (!authorName) {
            authorName = "Verified Traveler";
        }

        // Check for booking
        let booking = null;
        if (bookingReference && bookingReference.trim()) {
            booking = await db.collection("bookings").findOne({
                type: "tourguide",
                reference: bookingReference.trim()
            });
        }

        // Check if existing review exists (by bookingReference, or by user + guide)
        let existingReview = null;
        if (bookingReference && bookingReference.trim()) {
            existingReview = await db.collection("guidereviews").findOne({
                bookingReference: bookingReference.trim()
            });
        } else if (userObjId) {
            existingReview = await db.collection("guidereviews").findOne({
                guideId: guide._id,
                userId: userObjId
            });
        }

        if (existingReview) {
            // Update existing review
            await db.collection("guidereviews").updateOne(
                { _id: existingReview._id },
                {
                    $set: {
                        rating: numRating,
                        comment: comment.trim(),
                        travelerName: authorName,
                        updatedAt: new Date()
                    }
                }
            );
        } else {
            // Insert new review
            const reviewDoc = {
                guideId: guide._id,
                guideName: guide.name,
                bookingReference: booking ? booking.reference : (bookingReference || null),
                userId: userObjId,
                travelerName: authorName,
                rating: numRating,
                comment: comment.trim(),
                destination: booking ? booking.destination : (guide.specialization ? (Array.isArray(guide.specialization) ? guide.specialization[0] : guide.specialization) : "Bangladesh"),
                tourDate: booking ? booking.tourDate : new Date().toISOString().slice(0, 10),
                createdAt: new Date(),
                updatedAt: new Date()
            };
            await db.collection("guidereviews").insertOne(reviewDoc);
        }

        // Mark booking as Completed if linked
        if (booking) {
            await db.collection("bookings").updateOne(
                { _id: booking._id },
                { $set: { status: "Completed", isReviewed: true, updatedAt: new Date() } }
            );
        }

        // Recalculate average rating & review count for the guide
        const allReviews = await db.collection("guidereviews").find({
            $or: [
                { guideId: guide._id },
                { guideId: guide._id.toString() }
            ]
        }).toArray();

        const totalReviews = allReviews.length;
        const avgRating = totalReviews > 0
            ? Number((allReviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / totalReviews).toFixed(1))
            : numRating;

        await db.collection("tourguides").updateOne(
            { _id: guide._id },
            {
                $set: {
                    rating: avgRating,
                    reviews: totalReviews,
                    seedRating: false, // Authentic traveler reviews active
                    updatedAt: new Date()
                }
            }
        );

        res.status(201).json({
            success: true,
            message: existingReview
                ? "Your review has been updated successfully!"
                : "Thank you! Your rating and comment have been recorded.",
            updatedRating: avgRating,
            totalReviews: totalReviews
        });
    } catch (error) {
        console.error("Submit guide review error:", error.message);
        res.status(500).json({ success: false, message: "Unable to submit guide review." });
    }
});

// Get Reviews for a Guide
app.get("/api/guide-reviews/:guideId", async function (req, res) {
    try {
        if (!db) return res.status(503).json({ success: false, message: "Database not connected." });
        const { guideId } = req.params;

        const query = ObjectId.isValid(guideId)
            ? { $or: [{ guideId: new ObjectId(guideId) }, { guideId: String(guideId) }] }
            : { guideId: String(guideId) };

        const reviews = await db.collection("guidereviews")
            .find(query)
            .sort({ createdAt: -1 })
            .toArray();

        res.json({
            success: true,
            reviews: reviews.map(r => ({
                id: r._id.toString(),
                travelerName: r.travelerName,
                rating: r.rating,
                comment: r.comment,
                tourDate: r.tourDate,
                destination: r.destination,
                createdAt: r.createdAt
            }))
        });
    } catch (error) {
        console.error("Get guide reviews error:", error.message);
        res.status(500).json({ success: false, message: "Unable to load reviews." });
    }
});

// Get All Guide Reviews written by a Traveler
app.get("/api/my-guide-reviews/:userId", async function (req, res) {
    try {
        if (!db) return res.status(503).json({ success: false, message: "Database not connected." });
        const { userId } = req.params;

        const query = ObjectId.isValid(userId)
            ? { $or: [{ userId: new ObjectId(userId) }, { userId: String(userId) }] }
            : { userId: String(userId) };

        const reviews = await db.collection("guidereviews")
            .find(query)
            .sort({ createdAt: -1 })
            .toArray();

        // Attach guide details
        const guideIds = reviews.map(r => r.guideId).filter(Boolean);
        const objGuideIds = guideIds.filter(id => ObjectId.isValid(id)).map(id => new ObjectId(id));
        const guides = await db.collection("tourguides").find({
            $or: [
                { _id: { $in: objGuideIds } },
                { _id: { $in: guideIds } }
            ]
        }).toArray();

        const guideMap = new Map();
        guides.forEach(g => {
            guideMap.set(g._id.toString(), g);
        });

        res.json({
            success: true,
            reviews: reviews.map(r => {
                const g = guideMap.get(r.guideId ? r.guideId.toString() : "");
                return {
                    id: r._id.toString(),
                    guideId: r.guideId ? r.guideId.toString() : "",
                    guideName: g ? g.name : (r.guideName || "Tour Guide"),
                    guideSpecialization: g ? (Array.isArray(g.specialization) ? g.specialization.join(", ") : g.specialization) : "",
                    bookingReference: r.bookingReference || null,
                    rating: r.rating,
                    comment: r.comment,
                    destination: r.destination || "",
                    tourDate: r.tourDate || "",
                    createdAt: r.createdAt
                };
            })
        });
    } catch (error) {
        console.error("Get my guide reviews error:", error.message);
        res.status(500).json({ success: false, message: "Unable to load your guide reviews." });
    }
});

// ============================================
// HOTEL PARTNER PORTAL APIS
// Allows hotel managers to view incoming, completed, and timeline-based bookings
// ============================================

app.get("/api/hotel-portal/bookings/:userId", async function (req, res) {
    try {
        if (!db) return res.status(503).json({ success: false, message: "Database not connected." });
        const { userId } = req.params;
        let user = null;
        if (ObjectId.isValid(userId)) {
            user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
        }

        // Filter by hotelName or district if provided, or if user is assigned to a specific hotel
        let filter = {};
        if (req.query.hotelName && req.query.hotelName !== "all") {
            filter.hotelName = new RegExp(req.query.hotelName.trim(), "i");
        } else if (user && user.userType === "hotel" && user.hotelName && user.hotelName.trim() && !user.hotelName.includes("&") && !user.hotelName.includes("Partner")) {
            filter.hotelName = new RegExp(user.hotelName.trim(), "i");
        }
        if (req.query.district && req.query.district !== "all") {
            filter.district = new RegExp(req.query.district.trim(), "i");
        }

        const bookings = await db.collection("hotelBookings")
            .find(filter)
            .sort({ createdAt: -1 })
            .toArray();

        // Get users map for email/phone fallback
        const uids = [...new Set(bookings.map(b => b.userId ? b.userId.toString() : null).filter(Boolean))];
        const userDocs = await db.collection("users").find({ _id: { $in: uids.filter(id => ObjectId.isValid(id)).map(id => new ObjectId(id)) } }).toArray();
        const userMap = {};
        userDocs.forEach(u => { userMap[u._id.toString()] = u; });

        const now = new Date();
        const todayStr = now.toISOString().slice(0, 10);
        const tomorrow = new Date(now.getTime() + 86400000);
        const tomorrowStr = tomorrow.toISOString().slice(0, 10);

        const normalized = bookings.map(b => {
            const u = b.userId ? userMap[b.userId.toString()] : null;
            const status = b.status || "Pending";
            const checkIn = b.checkIn || "";
            const isCompleted = status.toLowerCase() === "completed";
            const isCancelled = status.toLowerCase() === "cancelled" || status.toLowerCase() === "rejected";
            
            let timingBadge = "Upcoming";
            let executionCategory = "incoming";

            if (isCompleted) {
                executionCategory = "completed";
                timingBadge = "Execution Completed";
            } else if (isCancelled) {
                executionCategory = "cancelled";
                timingBadge = "Cancelled";
            } else {
                if (checkIn === todayStr) {
                    timingBadge = "Check-in Today";
                    executionCategory = "incoming_today";
                } else if (checkIn === tomorrowStr) {
                    timingBadge = "Check-in Tomorrow";
                    executionCategory = "incoming_tomorrow";
                } else if (checkIn && checkIn < todayStr) {
                    timingBadge = "Active Stay / In Progress";
                    executionCategory = "in_stay";
                } else {
                    timingBadge = "Upcoming Stay";
                    executionCategory = "incoming_future";
                }
            }

            return {
                id: b._id.toString(),
                reference: b.reference || ("TKH-" + b._id.toString().slice(-6).toUpperCase()),
                hotelName: b.hotelName || "Hotel Stay",
                district: b.district || "Bangladesh",
                roomType: b.roomType || "Standard",
                checkIn: b.checkIn || "TBD",
                checkOut: b.checkOut || "TBD",
                nights: b.nights || 1,
                rooms: b.rooms || 1,
                guests: b.guests || 1,
                guestName: b.guestName || (u ? u.fullName : "Traveler"),
                guestPhone: b.guestPhone || (u ? u.phone : "N/A"),
                guestEmail: u ? u.email : "N/A",
                pricePerNight: b.pricePerNight || 0,
                totalPrice: b.totalPrice || 0,
                paymentMethod: (b.payment && b.payment.method) || b.paymentMethod || "Pay at Hotel",
                paymentStatus: (b.payment && b.payment.status) || b.paymentStatus || "Pending",
                status: status,
                executionCategory,
                timingBadge,
                createdAt: b.createdAt
            };
        });

        // Compute summary counts
        const stats = {
            total: normalized.length,
            incoming: normalized.filter(b => b.executionCategory.startsWith("incoming") || b.executionCategory === "in_stay").length,
            completed: normalized.filter(b => b.status.toLowerCase() === "completed").length,
            todayCheckins: normalized.filter(b => b.checkIn === todayStr && b.status.toLowerCase() !== "cancelled").length,
            tomorrowCheckins: normalized.filter(b => b.checkIn === tomorrowStr && b.status.toLowerCase() !== "cancelled").length,
            totalRevenue: normalized.filter(b => b.status.toLowerCase() !== "cancelled").reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0)
        };

        res.json({
            success: true,
            hotelProfile: user ? {
                fullName: user.fullName,
                email: user.email,
                hotelName: user.hotelName || "Partner Hotel",
                district: user.district || "Dhaka"
            } : null,
            stats,
            todayDate: todayStr,
            bookings: normalized
        });

    } catch (error) {
        console.error("Hotel portal bookings error:", error.message);
        res.status(500).json({ success: false, message: "Unable to load hotel bookings." });
    }
});

app.put("/api/hotel-portal/bookings/:bookingId/status", async function (req, res) {
    try {
        if (!db) return res.status(503).json({ success: false, message: "Database not connected." });
        const { bookingId } = req.params;
        const { status } = req.body;

        if (!ObjectId.isValid(bookingId)) {
            return res.status(400).json({ success: false, message: "Invalid booking ID." });
        }

        const validStatuses = ["Pending", "Confirmed", "Completed", "Cancelled", "Rejected"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status: " + validStatuses.join(", ") });
        }

        const booking = await db.collection("hotelBookings").findOne({ _id: new ObjectId(bookingId) });
        if (!booking) {
            return res.status(404).json({ success: false, message: "Hotel booking record not found." });
        }

        await db.collection("hotelBookings").updateOne(
            { _id: new ObjectId(bookingId) },
            { $set: { status, updatedAt: new Date() } }
        );

        // Auto notification to customer
        if (booking.userId) {
            try {
                await db.collection("notifications").insertOne({
                    userId: booking.userId,
                    title: `Hotel Booking ${status}`,
                    message: `Your booking at ${booking.hotelName} (Ref: ${booking.reference}) has been marked as ${status}.`,
                    read: false,
                    createdAt: new Date()
                });
            } catch (ne) {}
        }

        res.json({ success: true, message: `Booking status updated to ${status}.` });
    } catch (error) {
        console.error("Update hotel booking status error:", error.message);
        res.status(500).json({ success: false, message: "Unable to update status." });
    }
});

// ============================================
// TRANSPORT OPERATOR PORTAL APIS
// Allows transport operators to view tickets, departure times, execution completed and incoming trips
// ============================================

app.get("/api/transport-portal/bookings/:userId", async function (req, res) {
    try {
        if (!db) return res.status(503).json({ success: false, message: "Database not connected." });
        const { userId } = req.params;
        let user = null;
        if (ObjectId.isValid(userId)) {
            user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
        }

        // Filter by operator or transportType if provided, or if user is assigned to a specific operator
        let filter = {};
        if (req.query.operator && req.query.operator !== "all") {
            filter.operator = new RegExp(req.query.operator.trim(), "i");
        } else if (user && user.userType === "transport" && user.operatorName && user.operatorName.trim() && !user.operatorName.includes("&") && !user.operatorName.includes("Partner")) {
            filter.operator = new RegExp(user.operatorName.trim(), "i");
        }
        if (req.query.transportType && req.query.transportType !== "all") {
            filter.transportType = new RegExp(req.query.transportType.trim(), "i");
        }

        const tickets = await db.collection("transportBookings")
            .find(filter)
            .sort({ createdAt: -1 })
            .toArray();

        const uids = [...new Set(tickets.map(t => t.userId ? t.userId.toString() : null).filter(Boolean))];
        const userDocs = await db.collection("users").find({ _id: { $in: uids.filter(id => ObjectId.isValid(id)).map(id => new ObjectId(id)) } }).toArray();
        const userMap = {};
        userDocs.forEach(u => { userMap[u._id.toString()] = u; });

        const now = new Date();
        const todayStr = now.toISOString().slice(0, 10);
        const tomorrow = new Date(now.getTime() + 86400000);
        const tomorrowStr = tomorrow.toISOString().slice(0, 10);

        const normalized = tickets.map(t => {
            const u = t.userId ? userMap[t.userId.toString()] : null;
            const status = t.status || "Pending";
            const journeyDate = t.journeyDate || "";
            const isCompleted = status.toLowerCase() === "completed";
            const isCancelled = status.toLowerCase() === "cancelled" || status.toLowerCase() === "rejected";

            let timingBadge = "Upcoming";
            let executionCategory = "incoming";

            if (isCompleted) {
                executionCategory = "completed";
                timingBadge = "Execution Completed";
            } else if (isCancelled) {
                executionCategory = "cancelled";
                timingBadge = "Cancelled";
            } else {
                if (journeyDate === todayStr) {
                    timingBadge = "Departure Today";
                    executionCategory = "incoming_today";
                } else if (journeyDate === tomorrowStr) {
                    timingBadge = "Departure Tomorrow";
                    executionCategory = "incoming_tomorrow";
                } else if (journeyDate && journeyDate < todayStr) {
                    timingBadge = "Past Departure";
                    executionCategory = "past";
                } else {
                    timingBadge = "Upcoming Departure";
                    executionCategory = "incoming_future";
                }
            }

            return {
                id: t._id.toString(),
                reference: t.reference || ("TKT-" + t._id.toString().slice(-6).toUpperCase()),
                operator: t.operator || "Transport Operator",
                transportType: t.transportType || "Bus",
                from: t.from || "Dhaka",
                to: t.to || "Destination",
                route: `${t.from || 'Dhaka'} → ${t.to || 'Destination'}`,
                journeyDate: t.journeyDate || "TBD",
                passengers: t.passengers || 1,
                seatNumbers: Array.isArray(t.seatNumbers) ? t.seatNumbers.join(", ") : (t.seatNumbers || "Assigned"),
                passengerName: t.passengerName || (u ? u.fullName : "Traveler"),
                passengerPhone: t.passengerPhone || (u ? u.phone : "N/A"),
                passengerEmail: u ? u.email : "N/A",
                farePerPassenger: t.farePerPassenger || 0,
                totalPrice: t.totalPrice || 0,
                paymentMethod: (t.payment && t.payment.method) || t.paymentMethod || "Demo Payment",
                paymentStatus: (t.payment && t.payment.status) || t.paymentStatus || "Paid (Demo)",
                status: status,
                executionCategory,
                timingBadge,
                createdAt: t.createdAt
            };
        });

        const stats = {
            total: normalized.length,
            incoming: normalized.filter(t => t.executionCategory.startsWith("incoming")).length,
            completed: normalized.filter(t => t.status.toLowerCase() === "completed").length,
            todayDepartures: normalized.filter(t => t.journeyDate === todayStr && t.status.toLowerCase() !== "cancelled").length,
            tomorrowDepartures: normalized.filter(t => t.journeyDate === tomorrowStr && t.status.toLowerCase() !== "cancelled").length,
            totalRevenue: normalized.filter(t => t.status.toLowerCase() !== "cancelled").reduce((sum, t) => sum + (Number(t.totalPrice) || 0), 0)
        };

        res.json({
            success: true,
            transportProfile: user ? {
                fullName: user.fullName,
                email: user.email,
                operatorName: user.operatorName || "Transport Partner",
                transportType: user.transportType || "Bus"
            } : null,
            stats,
            todayDate: todayStr,
            tickets: normalized
        });

    } catch (error) {
        console.error("Transport portal bookings error:", error.message);
        res.status(500).json({ success: false, message: "Unable to load transport bookings." });
    }
});

app.put("/api/transport-portal/bookings/:bookingId/status", async function (req, res) {
    try {
        if (!db) return res.status(503).json({ success: false, message: "Database not connected." });
        const { bookingId } = req.params;
        const { status } = req.body;

        if (!ObjectId.isValid(bookingId)) {
            return res.status(400).json({ success: false, message: "Invalid ticket booking ID." });
        }

        const validStatuses = ["Pending", "Confirmed", "Completed", "Cancelled", "Rejected"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status: " + validStatuses.join(", ") });
        }

        const ticket = await db.collection("transportBookings").findOne({ _id: new ObjectId(bookingId) });
        if (!ticket) {
            return res.status(404).json({ success: false, message: "Transport ticket not found." });
        }

        await db.collection("transportBookings").updateOne(
            { _id: new ObjectId(bookingId) },
            { $set: { status, updatedAt: new Date() } }
        );

        // Auto notification to customer
        if (ticket.userId) {
            try {
                await db.collection("notifications").insertOne({
                    userId: ticket.userId,
                    title: `Transport Ticket ${status}`,
                    message: `Your ${ticket.transportType || 'journey'} ticket to ${ticket.to} (Ref: ${ticket.reference}) is marked as ${status}.`,
                    read: false,
                    createdAt: new Date()
                });
            } catch (ne) {}
        }

        res.json({ success: true, message: `Transport ticket status updated to ${status}.` });
    } catch (error) {
        console.error("Update transport ticket status error:", error.message);
        res.status(500).json({ success: false, message: "Unable to update status." });
    }
});

// ============================================
// NOTIFICATIONS API (FR-61, FR-62 & Section D)
// ============================================

app.get("/api/notifications/:userId", async function (req, res) {
    try {
        if (!db) return res.status(503).json({ success: false, message: "Database not connected." });
        const { userId } = req.params;

        if (!ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: "Invalid user ID." });
        }

        const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
        const role = user ? (user.userType || "traveler") : "traveler";

        let query = {};
        if (role === "admin") {
            query = {
                $or: [
                    { userId: new ObjectId(userId) },
                    { userId: userId },
                    { role: "admin" },
                    { type: "security_alert" },
                    { type: "system_alert" }
                ]
            };
        } else if (role === "hotel") {
            query = {
                $or: [
                    { userId: new ObjectId(userId) },
                    { userId: userId },
                    { role: "hotel" }
                ]
            };
        } else if (role === "transport") {
            query = {
                $or: [
                    { userId: new ObjectId(userId) },
                    { userId: userId },
                    { role: "transport" }
                ]
            };
        } else if (role === "guide") {
            query = {
                $or: [
                    { userId: new ObjectId(userId) },
                    { userId: userId },
                    { role: "guide" }
                ]
            };
        } else {
            query = {
                $or: [
                    { userId: new ObjectId(userId) },
                    { userId: userId }
                ]
            };
        }

        const notifs = await db.collection("notifications")
            .find(query)
            .sort({ createdAt: -1 })
            .limit(30)
            .toArray();

        res.json({
            success: true,
            notifications: notifs.map(n => ({
                id: n._id.toString(),
                title: n.title || "Notification",
                message: n.message || "",
                type: n.type || "general",
                read: Boolean(n.read || n.isRead),
                isRead: Boolean(n.read || n.isRead),
                createdAt: n.createdAt
            }))
        });
    } catch (error) {
        console.error("Get notifications error:", error.message);
        res.status(500).json({ success: false, message: "Unable to load notifications." });
    }
});

app.put("/api/notifications/:id/read", async function (req, res) {
    try {
        if (!db) return res.status(503).json({ success: false, message: "Database not connected." });
        const { id } = req.params;
        if (!ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid notification ID." });

        await db.collection("notifications").updateOne(
            { _id: new ObjectId(id) },
            { $set: { read: true, isRead: true, updatedAt: new Date() } }
        );

        res.json({ success: true, message: "Notification marked as read." });
    } catch (error) {
        console.error("Mark notification read error:", error.message);
        res.status(500).json({ success: false, message: "Unable to update notification." });
    }
});

app.put("/api/notifications/:userId/read-all", async function (req, res) {
    try {
        if (!db) return res.status(503).json({ success: false, message: "Database not connected." });
        const { userId } = req.params;
        if (!ObjectId.isValid(userId)) return res.status(400).json({ success: false, message: "Invalid user ID." });

        const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
        const role = user ? (user.userType || "traveler") : "traveler";

        let filter = { $or: [{ userId: new ObjectId(userId) }, { userId: userId }] };
        if (role === "admin") {
            filter = { $or: [{ userId: new ObjectId(userId) }, { userId: userId }, { role: "admin" }, { type: "security_alert" }, { type: "system_alert" }] };
        } else if (["hotel", "transport", "guide"].includes(role)) {
            filter = { $or: [{ userId: new ObjectId(userId) }, { userId: userId }, { role: role }] };
        }

        await db.collection("notifications").updateMany(
            filter,
            { $set: { read: true, isRead: true, updatedAt: new Date() } }
        );

        res.json({ success: true, message: "All notifications marked as read." });
    } catch (error) {
        console.error("Mark all notifications read error:", error.message);
        res.status(500).json({ success: false, message: "Unable to update notifications." });
    }
});

// ============================================
// DESTINATION REVIEWS & RATINGS API (Section F)
// ============================================

app.get("/api/destinations/:id/reviews", async function (req, res) {
    try {
        if (!db) return res.status(503).json({ success: false, message: "Database not connected." });
        const { id } = req.params;

        let attraction = null;
        if (ObjectId.isValid(id)) {
            attraction = await db.collection("attractions").findOne({ _id: new ObjectId(id) });
        }
        if (!attraction) {
            attraction = await db.collection("attractions").findOne({ name: id });
        }

        if (!attraction) {
            return res.status(404).json({ success: false, message: "Destination attraction not found." });
        }

        // Return reviews array, rating, and review count
        const reviews = attraction.reviews || [];
        res.json({
            success: true,
            destinationId: attraction._id.toString(),
            name: attraction.name,
            rating: attraction.rating || 4.8,
            reviewsCount: attraction.reviewsCount || reviews.length || 0,
            reviews: reviews.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
        });
    } catch (error) {
        console.error("Get destination reviews error:", error.message);
        res.status(500).json({ success: false, message: "Unable to load reviews." });
    }
});

app.post("/api/destinations/:id/reviews", async function (req, res) {
    try {
        if (!db) return res.status(503).json({ success: false, message: "Database not connected." });
        const { id } = req.params;
        const { userId, rating, comment } = req.body;

        if (!userId || !ObjectId.isValid(userId)) {
            return res.status(401).json({ success: false, message: "You must be logged in to submit a review." });
        }

        const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
        if (!user) {
            return res.status(404).json({ success: false, message: "User account not found." });
        }

        const starRating = Number(rating);
        if (!Number.isFinite(starRating) || starRating < 1 || starRating > 5) {
            return res.status(400).json({ success: false, message: "Please provide a valid star rating between 1 and 5." });
        }

        if (!comment || typeof comment !== "string" || !comment.trim()) {
            return res.status(400).json({ success: false, message: "Please provide your written review comments." });
        }

        let attraction = null;
        if (ObjectId.isValid(id)) {
            attraction = await db.collection("attractions").findOne({ _id: new ObjectId(id) });
        }
        if (!attraction) {
            attraction = await db.collection("attractions").findOne({ name: id });
        }

        if (!attraction) {
            return res.status(404).json({ success: false, message: "Destination attraction not found." });
        }

        // Prevent duplicate review from same user
        const existingReviews = attraction.reviews || [];
        const alreadyReviewed = existingReviews.some(r => String(r.user) === String(userId));
        if (alreadyReviewed) {
            return res.status(409).json({ success: false, message: "You have already submitted a review for this destination." });
        }

        const newReview = {
            _id: new ObjectId(),
            user: new ObjectId(userId),
            userName: user.fullName || user.name || "Verified Traveler",
            rating: starRating,
            comment: comment.trim(),
            date: new Date().toISOString()
        };

        const updatedReviews = [newReview, ...existingReviews];
        const sumRatings = updatedReviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0);
        const newAvgRating = Number((sumRatings / updatedReviews.length).toFixed(1));
        const newReviewsCount = updatedReviews.length;

        await db.collection("attractions").updateOne(
            { _id: attraction._id },
            {
                $set: {
                    reviews: updatedReviews,
                    rating: newAvgRating,
                    reviewsCount: newReviewsCount,
                    updatedAt: new Date()
                }
            }
        );

        // Add user notification
        await db.collection("notifications").insertOne({
            userId: user._id,
            title: "Review Published!",
            message: `Your ${starRating}-star review for "${attraction.name}" was published successfully. Thank you for helping the travel community!`,
            read: false,
            isRead: false,
            createdAt: new Date().toISOString()
        });

        res.status(201).json({
            success: true,
            message: "Thank you! Your destination review has been posted successfully.",
            review: newReview,
            newRating: newAvgRating,
            reviewsCount: newReviewsCount
        });
    } catch (error) {
        console.error("Submit destination review error:", error.message);
        res.status(500).json({ success: false, message: "Unable to submit review." });
    }
});

// ============================================
// TRIP PLANNER & ITINERARY API (Section H)
// ============================================

app.post("/api/trip-plans", async function (req, res) {
    try {
        if (!db) return res.status(503).json({ success: false, message: "Database not connected." });
        const { userId, origin, durationDays, travelers, budgetCategory, destinations, itinerary, costBreakdown } = req.body;

        if (!userId || !ObjectId.isValid(userId)) {
            return res.status(401).json({ success: false, message: "Please log in to save your customized trip plan." });
        }

        const planDoc = {
            userId: new ObjectId(userId),
            origin: origin || "Dhaka",
            durationDays: Number(durationDays) || 3,
            travelers: travelers || "2 Travelers / Couple",
            budgetCategory: budgetCategory || "Standard / Comfort",
            destinations: Array.isArray(destinations) ? destinations : [],
            itinerary: Array.isArray(itinerary) ? itinerary : [],
            costBreakdown: costBreakdown || {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const result = await db.collection("trip_plans").insertOne(planDoc);

        // Add user notification
        await db.collection("notifications").insertOne({
            userId: new ObjectId(userId),
            title: "Trip Plan Saved",
            message: `Your ${planDoc.durationDays}-Day itinerary covering ${planDoc.destinations.join(", ") || "Bangladesh"} has been saved to your profile.`,
            read: false,
            isRead: false,
            createdAt: new Date().toISOString()
        });

        res.status(201).json({
            success: true,
            message: "Trip itinerary saved to your account successfully!",
            planId: result.insertedId.toString()
        });
    } catch (error) {
        console.error("Save trip plan error:", error.message);
        res.status(500).json({ success: false, message: "Unable to save trip plan." });
    }
});

app.get("/api/trip-plans/:userId", async function (req, res) {
    try {
        if (!db) return res.status(503).json({ success: false, message: "Database not connected." });
        const { userId } = req.params;
        if (!ObjectId.isValid(userId)) return res.status(400).json({ success: false, message: "Invalid user ID." });

        const plans = await db.collection("trip_plans")
            .find({ userId: new ObjectId(userId) })
            .sort({ createdAt: -1 })
            .toArray();

        res.json({
            success: true,
            plans: plans.map(p => ({
                id: p._id.toString(),
                origin: p.origin,
                durationDays: p.durationDays,
                travelers: p.travelers,
                budgetCategory: p.budgetCategory,
                destinations: p.destinations,
                itinerary: p.itinerary,
                costBreakdown: p.costBreakdown,
                createdAt: p.createdAt
            }))
        });
    } catch (error) {
        console.error("Get trip plans error:", error.message);
        res.status(500).json({ success: false, message: "Unable to load trip plans." });
    }
});

app.delete("/api/trip-plans/:id", async function (req, res) {
    try {
        if (!db) return res.status(503).json({ success: false, message: "Database not connected." });
        const { id } = req.params;
        if (!ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid plan ID." });

        await db.collection("trip_plans").deleteOne({ _id: new ObjectId(id) });
        res.json({ success: true, message: "Trip plan removed." });
    } catch (error) {
        console.error("Delete trip plan error:", error.message);
        res.status(500).json({ success: false, message: "Unable to delete plan." });
    }
});

// ============================================
// TRAVELER PROFILE API (Section L)
// ============================================

app.get("/api/users/profile/:userId", async function (req, res) {
    try {
        if (!db) return res.status(503).json({ success: false, message: "Database not connected." });
        const { userId } = req.params;
        if (!ObjectId.isValid(userId)) return res.status(400).json({ success: false, message: "Invalid user ID." });

        const user = await db.collection("users").findOne(
            { _id: new ObjectId(userId) },
            { projection: { password: 0 } }
        );

        if (!user) return res.status(404).json({ success: false, message: "User not found." });

        res.json({
            success: true,
            profile: {
                id: user._id.toString(),
                fullName: user.fullName || user.name || "",
                email: user.email,
                phone: user.phone || "",
                district: user.district || "",
                address: user.address || "",
                bio: user.bio || "",
                avatar: user.avatar || "",
                userType: user.userType || "traveler",
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error("Get user profile error:", error.message);
        res.status(500).json({ success: false, message: "Unable to load user profile." });
    }
});

app.put("/api/users/profile/:userId", async function (req, res) {
    try {
        if (!db) return res.status(503).json({ success: false, message: "Database not connected." });
        const { userId } = req.params;
        if (!ObjectId.isValid(userId)) return res.status(400).json({ success: false, message: "Invalid user ID." });

        const { fullName, phone, district, address, bio, avatar } = req.body;

        const updateDoc = {
            updatedAt: new Date().toISOString()
        };
        if (typeof fullName === "string" && fullName.trim()) updateDoc.fullName = fullName.trim();
        if (typeof phone === "string") updateDoc.phone = phone.trim();
        if (typeof district === "string") updateDoc.district = district.trim();
        if (typeof address === "string") updateDoc.address = address.trim();
        if (typeof bio === "string") updateDoc.bio = bio.trim();
        if (typeof avatar === "string") updateDoc.avatar = avatar.trim();

        await db.collection("users").updateOne(
            { _id: new ObjectId(userId) },
            { $set: updateDoc }
        );

        res.json({
            success: true,
            message: "Profile updated successfully!",
            profile: updateDoc
        });
    } catch (error) {
        console.error("Update profile error:", error.message);
        res.status(500).json({ success: false, message: "Unable to update profile." });
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

// Get all bookings across all categories (Admin only)
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

        // Preload users map for traveler profile resolution
        const users = await db.collection("users").find({}).toArray();
        const userMap = {};
        users.forEach(u => {
            userMap[u._id.toString()] = u;
        });

        // 1. Tour & Guide bookings
        const tourDocs = await db.collection("bookings").find({}).toArray();
        // 2. Transport tickets
        const transportDocs = await db.collection("transportBookings").find({}).toArray();
        // 3. Hotel bookings
        const hotelDocs = await db.collection("hotelBookings").find({}).toArray();

        const combined = [];

        // Normalize Tour & Guide bookings
        tourDocs.forEach(b => {
            const uid = b.userId ? b.userId.toString() : "";
            const userObj = userMap[uid] || {};
            const isGuide = b.type === "tourguide" || Boolean(b.guideName);

            combined.push({
                id: b._id.toString(),
                category: isGuide ? "guide" : "tour",
                categoryLabel: isGuide ? "Tour Guide" : "Tour Spot",
                categoryBadge: isGuide ? "🧭 Tour Guide" : "📍 Tourist Spot",
                reference: b.reference || b.transactionReference || ("TKB-" + b._id.toString().slice(-6).toUpperCase()),
                title: isGuide ? `Guide: ${b.guideName || 'Local Guide'}` : (b.touristSpot || (b.serviceDetails && b.serviceDetails.operator) || "Tour Destination"),
                destination: b.destination || b.district || (b.serviceDetails && b.serviceDetails.from) || "Bangladesh",
                serviceDate: b.tourDate || b.visitDate || b.serviceDate || "TBD",
                days: b.days || 1,
                people: b.people ?? (b.serviceDetails && b.serviceDetails.passengers) ?? 1,
                amount: Number(b.totalAmount ?? b.amount ?? 0),
                paymentMethod: b.paymentMethod || "Cash on Arrival",
                paymentStatus: b.paymentStatus || "Pending",
                status: b.status || "Pending",
                createdAt: b.createdAt || b.bookingDate || new Date().toISOString(),
                travelerName: b.guestName || userObj.fullName || userObj.name || "Traveler",
                travelerEmail: b.guestEmail || userObj.email || "N/A",
                travelerPhone: b.guestPhone || userObj.phone || "N/A",
                notes: b.specialRequests || b.guideName || ""
            });
        });

        // Normalize Transport tickets
        transportDocs.forEach(b => {
            const uid = b.userId ? b.userId.toString() : "";
            const userObj = userMap[uid] || {};

            combined.push({
                id: b._id.toString(),
                category: "transport",
                categoryLabel: b.transportType || "Transport",
                categoryBadge: `${b.transportType === 'Flight' ? '✈️' : b.transportType === 'Train' ? '🚆' : '🚌'} ${b.transportType || 'Transport'} Ticket`,
                reference: b.reference || ("TKT-" + b._id.toString().slice(-6).toUpperCase()),
                title: `${b.operator || 'Transport'} (${b.from} → ${b.to})`,
                destination: `${b.from} → ${b.to}`,
                serviceDate: b.journeyDate || "TBD",
                days: 1,
                people: b.passengers || 1,
                seatNumbers: Array.isArray(b.seatNumbers) ? b.seatNumbers.join(", ") : (b.seatNumbers || ""),
                amount: Number(b.totalPrice || b.farePerPassenger || 0),
                paymentMethod: b.paymentMethod || "Demo Payment",
                paymentStatus: b.paymentStatus || "Paid (Demo)",
                status: b.status || "Pending",
                createdAt: b.createdAt || new Date().toISOString(),
                travelerName: b.passengerName || userObj.fullName || userObj.name || "Traveler",
                travelerEmail: userObj.email || "N/A",
                travelerPhone: b.passengerPhone || userObj.phone || "N/A",
                notes: `Seats: ${Array.isArray(b.seatNumbers) ? b.seatNumbers.join(', ') : (b.seatNumbers || 'Assigned')}`
            });
        });

        // Normalize Hotel reservations
        hotelDocs.forEach(b => {
            const uid = b.userId ? b.userId.toString() : "";
            const userObj = userMap[uid] || {};

            combined.push({
                id: b._id.toString(),
                category: "hotel",
                categoryLabel: "Hotel Stay",
                categoryBadge: "🏨 Hotel Room",
                reference: b.reference || ("TKH-" + b._id.toString().slice(-6).toUpperCase()),
                title: `${b.hotelName || 'Hotel Stay'} (${b.district || 'Bangladesh'})`,
                destination: b.district || "Bangladesh",
                serviceDate: `${b.checkIn || 'TBD'} to ${b.checkOut || 'TBD'}`,
                days: b.nights || 1,
                people: `${b.rooms || 1} room(s), ${b.guests || 1} guest(s)`,
                roomType: b.roomType || "Standard",
                amount: Number(b.totalPrice || 0),
                paymentMethod: b.paymentMethod || "Pay at Hotel",
                paymentStatus: b.paymentStatus || "Pending",
                status: b.status || "Pending",
                createdAt: b.createdAt || new Date().toISOString(),
                travelerName: b.guestName || userObj.fullName || userObj.name || "Traveler",
                travelerEmail: userObj.email || "N/A",
                travelerPhone: b.guestPhone || userObj.phone || "N/A",
                notes: `${b.roomType || 'Standard'} Room (${b.nights || 1} nights)`
            });
        });

        // Sort all bookings by timestamp descending (newest bookings first)
        combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        // Count totals
        const counts = {
            total: combined.length,
            pending: combined.filter(b => (b.status || "").toLowerCase() === "pending").length,
            confirmed: combined.filter(b => (b.status || "").toLowerCase() === "confirmed").length,
            completed: combined.filter(b => (b.status || "").toLowerCase() === "completed").length,
            cancelled: combined.filter(b => (b.status || "").toLowerCase() === "cancelled" || (b.status || "").toLowerCase() === "rejected").length,
            tours: combined.filter(b => b.category === "tour").length,
            hotels: combined.filter(b => b.category === "hotel").length,
            transport: combined.filter(b => b.category === "transport").length,
            guides: combined.filter(b => b.category === "guide").length
        };

        res.json({
            success: true,
            bookings: combined,
            counts: counts
        });

    } catch (error) {
        console.error("Admin bookings error:", error.message);
        res.status(500).json({
            success: false,
            message: "Unable to load bookings: " + error.message
        });
    }
});

// Update booking status across any collection (Admin only)
async function handleUpdateBookingStatus(req, res) {
    try {
        const { bookingId } = req.params;
        const { status, category } = req.body;

        if (!ObjectId.isValid(bookingId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking ID."
            });
        }

        const validStatuses = ["Pending", "Confirmed", "Completed", "Cancelled", "Rejected"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status. Must be one of: " + validStatuses.join(", ")
            });
        }

        const objId = new ObjectId(bookingId);
        let updated = false;

        // Update target collection or try all collections
        if (category === "hotel") {
            const r = await db.collection("hotelBookings").updateOne({ _id: objId }, { $set: { status, updatedAt: new Date() } });
            if (r.matchedCount > 0) updated = true;
        } else if (category === "transport") {
            const r = await db.collection("transportBookings").updateOne({ _id: objId }, { $set: { status, updatedAt: new Date() } });
            if (r.matchedCount > 0) updated = true;
        } else if (category === "tour" || category === "guide") {
            const r = await db.collection("bookings").updateOne({ _id: objId }, { $set: { status, updatedAt: new Date() } });
            if (r.matchedCount > 0) updated = true;
        } else {
            // Check bookings
            let r = await db.collection("bookings").updateOne({ _id: objId }, { $set: { status, updatedAt: new Date() } });
            if (r.matchedCount > 0) updated = true;
            else {
                r = await db.collection("transportBookings").updateOne({ _id: objId }, { $set: { status, updatedAt: new Date() } });
                if (r.matchedCount > 0) updated = true;
                else {
                    r = await db.collection("hotelBookings").updateOne({ _id: objId }, { $set: { status, updatedAt: new Date() } });
                    if (r.matchedCount > 0) updated = true;
                }
            }
        }

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "Booking record not found."
            });
        }

        res.json({
            success: true,
            message: `Booking status updated to ${status}.`
        });

    } catch (error) {
        console.error("Update booking status error:", error.message);
        res.status(500).json({
            success: false,
            message: "Unable to update booking status."
        });
    }
}

app.put("/api/admin/bookings/:adminId/:bookingId/status", handleUpdateBookingStatus);
app.put("/api/admin/bookings/:bookingId", handleUpdateBookingStatus);

// Delete booking across any collection (Admin only)
async function handleDeleteBooking(req, res) {
    try {
        const { bookingId } = req.params;
        const category = req.query.category || req.body.category;

        if (!ObjectId.isValid(bookingId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking ID."
            });
        }

        const objId = new ObjectId(bookingId);
        let deleted = false;

        if (category === "hotel") {
            const r = await db.collection("hotelBookings").deleteOne({ _id: objId });
            if (r.deletedCount > 0) deleted = true;
        } else if (category === "transport") {
            const r = await db.collection("transportBookings").deleteOne({ _id: objId });
            if (r.deletedCount > 0) deleted = true;
        } else if (category === "tour" || category === "guide") {
            const r = await db.collection("bookings").deleteOne({ _id: objId });
            if (r.deletedCount > 0) deleted = true;
        } else {
            let r = await db.collection("bookings").deleteOne({ _id: objId });
            if (r.deletedCount > 0) deleted = true;
            else {
                r = await db.collection("transportBookings").deleteOne({ _id: objId });
                if (r.deletedCount > 0) deleted = true;
                else {
                    r = await db.collection("hotelBookings").deleteOne({ _id: objId });
                    if (r.deletedCount > 0) deleted = true;
                }
            }
        }

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Booking record not found to delete."
            });
        }

        res.json({
            success: true,
            message: "Booking deleted successfully."
        });

    } catch (error) {
        console.error("Delete booking error:", error.message);
        res.status(500).json({
            success: false,
            message: "Unable to delete booking."
        });
    }
}

app.delete("/api/admin/bookings/:adminId/:bookingId", handleDeleteBooking);
app.delete("/api/admin/bookings/:bookingId", handleDeleteBooking);

// =========================
// ATTRACTIONS API
// =========================

app.get("/api/attractions", async function (req, res) {
    try {
        const { district } = req.query;
        const districts = await db.collection("districts").find({}).toArray();
        const distMap = {};
        districts.forEach(d => {
            distMap[d._id.toString()] = d.name;
        });

        const query = {};
        if (district) {
            const matchedDist = districts.find(d => d.name.toLowerCase() === district.trim().toLowerCase());
            if (matchedDist) {
                query.$or = [
                    { district: matchedDist._id.toString() },
                    { district: matchedDist._id },
                    { district: new RegExp("^" + district.trim() + "$", "i") },
                    { districtName: new RegExp("^" + district.trim() + "$", "i") }
                ];
            } else {
                query.$or = [
                    { district: new RegExp("^" + district.trim() + "$", "i") },
                    { districtName: new RegExp("^" + district.trim() + "$", "i") }
                ];
            }
        }

        const attractions = await db.collection("attractions")
            .find(query)
            .sort({ createdAt: -1 })
            .toArray();

        res.json({
            success: true,
            attractions: attractions.map(a => ({
                id: a._id.toString(),
                name: a.name,
                district: distMap[a.district ? a.district.toString() : ""] || a.districtName || a.district || "Bangladesh",
                category: a.category || "attraction",
                description: a.description || "",
                entranceFee: a.entranceFee ?? 0,
                openingHours: a.openingHours || "Open daily",
                rating: a.rating || 4.8
            }))
        });
    } catch (error) {
        console.error("Get attractions error:", error.message);
        res.status(500).json({ success: false, message: "Unable to load attractions." });
    }
});

app.post("/api/admin/attractions/:adminId", async function (req, res) {
    try {
        const { adminId } = req.params;
        const { name, district, description, category, entranceFee, openingHours } = req.body;

        if (!ObjectId.isValid(adminId)) {
            return res.status(400).json({ success: false, message: "Invalid admin ID." });
        }
        const admin = await db.collection("users").findOne({ _id: new ObjectId(adminId), userType: "admin" });
        if (!admin) {
            return res.status(403).json({ success: false, message: "Admin access denied." });
        }
        if (!name?.trim() || !district?.trim() || !description?.trim()) {
            return res.status(400).json({ success: false, message: "Name, district, and description are required." });
        }

        const now = new Date();
        const doc = {
            name: name.trim(),
            district: district.trim(),
            districtName: district.trim(),
            description: description.trim(),
            category: category?.trim() || "sightseeing",
            entranceFee: Number(entranceFee) || 0,
            openingHours: openingHours?.trim() || "Open daily",
            rating: 5.0,
            reviewsCount: 1,
            reviews: [],
            createdAt: now,
            updatedAt: now
        };
        const result = await db.collection("attractions").insertOne(doc);
        res.status(201).json({ success: true, message: "Tourist spot added successfully!", id: result.insertedId.toString() });
    } catch (error) {
        console.error("Add attraction error:", error.message);
        res.status(500).json({ success: false, message: "Unable to add tourist spot." });
    }
});

app.put("/api/admin/attractions/:adminId/:id", async function (req, res) {
    try {
        const { adminId, id } = req.params;
        const { name, district, description, category, entranceFee, openingHours } = req.body;

        if (!ObjectId.isValid(adminId) || !ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid ID." });
        }
        const admin = await db.collection("users").findOne({ _id: new ObjectId(adminId), userType: "admin" });
        if (!admin) {
            return res.status(403).json({ success: false, message: "Admin access denied." });
        }

        const updateData = { updatedAt: new Date() };
        if (name?.trim()) updateData.name = name.trim();
        if (district?.trim()) {
            updateData.district = district.trim();
            updateData.districtName = district.trim();
        }
        if (description?.trim()) updateData.description = description.trim();
        if (category?.trim()) updateData.category = category.trim();
        if (entranceFee !== undefined) updateData.entranceFee = Number(entranceFee) || 0;
        if (openingHours?.trim()) updateData.openingHours = openingHours.trim();

        const result = await db.collection("attractions").updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );
        if (result.matchedCount === 0) {
            return res.status(404).json({ success: false, message: "Tourist spot not found." });
        }
        res.json({ success: true, message: "Tourist spot updated successfully!" });
    } catch (error) {
        console.error("Update attraction error:", error.message);
        res.status(500).json({ success: false, message: "Unable to update tourist spot." });
    }
});

app.delete("/api/admin/attractions/:adminId/:id", async function (req, res) {
    try {
        const { adminId, id } = req.params;
        if (!ObjectId.isValid(adminId) || !ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid ID." });
        }
        const admin = await db.collection("users").findOne({ _id: new ObjectId(adminId), userType: "admin" });
        if (!admin) {
            return res.status(403).json({ success: false, message: "Admin access denied." });
        }
        const result = await db.collection("attractions").deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) {
            return res.status(404).json({ success: false, message: "Tourist spot not found." });
        }
        res.json({ success: true, message: "Tourist spot deleted successfully!" });
    } catch (error) {
        console.error("Delete attraction error:", error.message);
        res.status(500).json({ success: false, message: "Unable to delete tourist spot." });
    }
});

// =========================
// HOTELS API
// =========================

app.get("/api/hotels", async function (req, res) {
    try {
        const { district } = req.query;
        const query = {};
        if (district) {
            query.$or = [
                { districtName: new RegExp("^" + district.trim() + "$", "i") },
                { district: new RegExp("^" + district.trim() + "$", "i") }
            ];
        }
        const hotels = await db.collection("hotels")
            .find(query)
            .sort({ createdAt: -1 })
            .toArray();

        res.json({
            success: true,
            hotels: hotels.map(h => ({
                id: h._id.toString(),
                name: h.name,
                districtName: h.districtName || h.district || "Bangladesh",
                address: h.address || "",
                starRating: h.starRating || 4,
                description: h.description || "",
                image: h.image || null,
                priceStandard: h.packages?.[0]?.pricePerNight || h.priceStandard || 2500,
                priceDeluxe: h.packages?.[1]?.pricePerNight || h.priceDeluxe || 4500,
                priceFamily: h.packages?.[2]?.pricePerNight || h.priceFamily || 6500
            }))
        });
    } catch (error) {
        console.error("Get hotels error:", error.message);
        res.status(500).json({ success: false, message: "Unable to load hotels." });
    }
});

// =========================
// SINGLE HOTEL DETAILS API (DYNAMIC)
// =========================
app.get("/api/hotels/:id", async function (req, res) {
    try {
        if (!db) return res.status(503).json({ success: false, message: "Database not connected." });
        const { id } = req.params;
        let hotel = null;

        if (ObjectId.isValid(id)) {
            try {
                hotel = await db.collection("hotels").findOne({ _id: new ObjectId(id) });
            } catch (err) {}
        }
        if (!hotel) {
            hotel = await db.collection("hotels").findOne({ _id: id });
        }
        if (!hotel) {
            hotel = await db.collection("hotels").findOne({
                name: new RegExp("^" + id.replace(/[-_]/g, " ").trim() + "$", "i")
            });
        }

        if (!hotel) {
            return res.status(404).json({ success: false, message: "Hotel not found." });
        }

        const checkInTime = hotel.checkInTime || "02:00 PM";
        const checkOutTime = hotel.checkOutTime || "12:00 PM";

        let guestReviews = [];
        try {
            const bookingsWithReviews = await db.collection("hotelBookings")
                .find({
                    $or: [
                        { hotelId: hotel._id.toString() },
                        { hotelName: hotel.name }
                    ],
                    review: { $exists: true, $ne: "" }
                })
                .sort({ createdAt: -1 })
                .limit(5)
                .toArray();

            guestReviews = bookingsWithReviews.map(b => ({
                guestName: b.guestName || "Verified Guest",
                rating: b.rating || 5,
                comment: b.review || "Comfortable stay, polite staff and wonderful ambiance.",
                date: b.createdAt ? new Date(b.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recent Stay"
            }));
        } catch (e) {}

        if (!guestReviews.length) {
            guestReviews = [
                {
                    guestName: "Tanvir Ahmed",
                    rating: 5,
                    comment: "Excellent hospitality and sparkling clean rooms. The staff were remarkably courteous.",
                    date: "Oct 2026"
                },
                {
                    guestName: "Sadia Rahman",
                    rating: 5,
                    comment: "Breathtaking surroundings, peaceful location, and top-tier amenities. Highly recommended!",
                    date: "Sep 2026"
                }
            ];
        }

        res.json({
            success: true,
            hotel: {
                id: hotel._id.toString(),
                name: hotel.name,
                districtName: hotel.districtName || hotel.district || "Bangladesh",
                address: hotel.address || hotel.location || "",
                latitude: hotel.latitude || null,
                longitude: hotel.longitude || null,
                starRating: hotel.starRating || 5,
                rating: hotel.rating || (hotel.starRating ? Number(hotel.starRating).toFixed(1) : "4.8"),
                reviewCount: hotel.reviewCount || 128,
                phone: hotel.phone || "",
                email: hotel.email || "",
                description: hotel.description || "",
                image: hotel.image || null,
                images: Array.isArray(hotel.images) && hotel.images.length ? hotel.images : (hotel.image ? [hotel.image] : []),
                facilities: Array.isArray(hotel.facilities) && hotel.facilities.length
                    ? hotel.facilities
                    : ["Free High-Speed WiFi", "Air Conditioning", "Swimming Pool", "Complimentary Breakfast", "24/7 Room Service", "Secure Parking", "Fitness Center"],
                checkInTime: checkInTime,
                checkOutTime: checkOutTime,
                packages: Array.isArray(hotel.packages) && hotel.packages.length ? hotel.packages.map(p => ({
                    id: p._id ? p._id.toString() : p.name.toLowerCase().replace(/\s+/g, "-"),
                    name: p.name,
                    type: p.type || "standard",
                    pricePerNight: p.pricePerNight || p.price || 3500,
                    availableRooms: typeof p.availableRooms === "number" ? p.availableRooms : 6,
                    capacity: p.capacity || 2,
                    bedType: p.bedType || (p.capacity > 2 ? "2 King Beds" : (p.type === "standard" ? "1 Queen / Twin Bed" : "1 King Bed")),
                    roomSize: p.roomSize || null,
                    facilities: Array.isArray(p.facilities) ? p.facilities : []
                })) : [
                    {
                        name: "Standard Deluxe Room",
                        type: "standard",
                        pricePerNight: hotel.priceStandard || 3500,
                        availableRooms: 8,
                        capacity: 2,
                        bedType: "1 Queen Bed",
                        roomSize: null,
                        facilities: ["Free Breakfast", "AC", "WiFi"]
                    },
                    {
                        name: "Executive Suite",
                        type: "deluxe",
                        pricePerNight: hotel.priceDeluxe || 6500,
                        availableRooms: 4,
                        capacity: 2,
                        bedType: "1 King Bed",
                        roomSize: null,
                        facilities: ["Balcony View", "Free Breakfast", "AC", "WiFi", "Pool Access"]
                    }
                ],
                reviews: guestReviews
            }
        });
    } catch (error) {
        console.error("Get hotel details error:", error.message);
        res.status(500).json({ success: false, message: "Unable to load hotel details." });
    }
});

app.post("/api/admin/hotels/:adminId", async function (req, res) {
    try {
        const { adminId } = req.params;
        const { name, districtName, address, description, starRating, priceStandard, priceDeluxe, priceFamily } = req.body;

        if (!ObjectId.isValid(adminId)) {
            return res.status(400).json({ success: false, message: "Invalid admin ID." });
        }
        const admin = await db.collection("users").findOne({ _id: new ObjectId(adminId), userType: "admin" });
        if (!admin) {
            return res.status(403).json({ success: false, message: "Admin access denied." });
        }
        if (!name?.trim() || !districtName?.trim()) {
            return res.status(400).json({ success: false, message: "Hotel name and district are required." });
        }

        const now = new Date();
        const stdPrice = Number(priceStandard) || 2500;
        const dlxPrice = Number(priceDeluxe) || 4500;
        const famPrice = Number(priceFamily) || 6500;

        const doc = {
            name: name.trim(),
            districtName: districtName.trim(),
            district: districtName.trim(),
            address: address?.trim() || districtName.trim() + ", Bangladesh",
            description: description?.trim() || "Comfortable stay in " + districtName.trim(),
            starRating: Number(starRating) || 4,
            priceStandard: stdPrice,
            priceDeluxe: dlxPrice,
            priceFamily: famPrice,
            packages: [
                { name: "Standard Room", type: "standard", pricePerNight: stdPrice, capacity: 2, facilities: ["AC", "Free WiFi", "Breakfast"] },
                { name: "Deluxe Suite", type: "deluxe", pricePerNight: dlxPrice, capacity: 2, facilities: ["Balcony View", "AC", "Breakfast", "Pool Access"] },
                { name: "Family Room", type: "family", pricePerNight: famPrice, capacity: 4, facilities: ["Dual Beds", "AC", "Breakfast", "City View"] }
            ],
            createdAt: now,
            updatedAt: now
        };
        const result = await db.collection("hotels").insertOne(doc);
        res.status(201).json({ success: true, message: "Hotel added successfully!", id: result.insertedId.toString() });
    } catch (error) {
        console.error("Add hotel error:", error.message);
        res.status(500).json({ success: false, message: "Unable to add hotel." });
    }
});

app.put("/api/admin/hotels/:adminId/:id", async function (req, res) {
    try {
        const { adminId, id } = req.params;
        const { name, districtName, address, description, starRating, priceStandard, priceDeluxe, priceFamily } = req.body;

        if (!ObjectId.isValid(adminId) || !ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid ID." });
        }
        const admin = await db.collection("users").findOne({ _id: new ObjectId(adminId), userType: "admin" });
        if (!admin) {
            return res.status(403).json({ success: false, message: "Admin access denied." });
        }

        const updateData = { updatedAt: new Date() };
        if (name?.trim()) updateData.name = name.trim();
        if (districtName?.trim()) {
            updateData.districtName = districtName.trim();
            updateData.district = districtName.trim();
        }
        if (address?.trim()) updateData.address = address.trim();
        if (description?.trim()) updateData.description = description.trim();
        if (starRating !== undefined) updateData.starRating = Number(starRating) || 4;
        if (priceStandard !== undefined) updateData.priceStandard = Number(priceStandard) || 2500;
        if (priceDeluxe !== undefined) updateData.priceDeluxe = Number(priceDeluxe) || 4500;
        if (priceFamily !== undefined) updateData.priceFamily = Number(priceFamily) || 6500;

        const result = await db.collection("hotels").updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );
        if (result.matchedCount === 0) {
            return res.status(404).json({ success: false, message: "Hotel not found." });
        }
        res.json({ success: true, message: "Hotel updated successfully!" });
    } catch (error) {
        console.error("Update hotel error:", error.message);
        res.status(500).json({ success: false, message: "Unable to update hotel." });
    }
});

app.delete("/api/admin/hotels/:adminId/:id", async function (req, res) {
    try {
        const { adminId, id } = req.params;
        if (!ObjectId.isValid(adminId) || !ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid ID." });
        }
        const admin = await db.collection("users").findOne({ _id: new ObjectId(adminId), userType: "admin" });
        if (!admin) {
            return res.status(403).json({ success: false, message: "Admin access denied." });
        }
        const result = await db.collection("hotels").deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) {
            return res.status(404).json({ success: false, message: "Hotel not found." });
        }
        res.json({ success: true, message: "Hotel deleted successfully!" });
    } catch (error) {
        console.error("Delete hotel error:", error.message);
        res.status(500).json({ success: false, message: "Unable to delete hotel." });
    }
});

// =========================
// TRANSPORTATIONS API
// =========================

app.get("/api/transportations", async function (req, res) {
    try {
        const { type, from, to } = req.query;
        const query = {};
        if (type && type !== "all") {
            query.type = new RegExp("^" + type.trim() + "$", "i");
        }
        if (from) {
            query.from = new RegExp("^" + from.trim() + "$", "i");
        }
        if (to) {
            query.to = new RegExp("^" + to.trim() + "$", "i");
        }
        const list = await db.collection("transportations")
            .find(query)
            .sort({ createdAt: -1 })
            .toArray();

        res.json({
            success: true,
            transportations: list.map(t => {
                const classStr = t.classType || t.category || "";
                const isAcCoach = typeof t.isAc === "boolean"
                    ? t.isAc
                    : (/\bAC\b/i.test(classStr) || /\bAC\b/i.test(t.operator || "") || /Scania|Universe|Sleeper|Deluxe|Luxury/i.test(classStr)) && !/Non-AC/i.test(classStr);

                return {
                    id: t._id.toString(),
                    type: t.type ? t.type.charAt(0).toUpperCase() + t.type.slice(1).toLowerCase() : "Bus",
                    operator: t.operator || "Transport Operator",
                    vesselName: t.vesselName || "",
                    from: t.from,
                    to: t.to,
                    originTerminal: t.originTerminal || "",
                    destinationTerminal: t.destinationTerminal || "",
                    fare: t.farePerSeat || t.fare || 800,
                    farePerSeat: t.farePerSeat || t.fare || 800,
                    cabinFares: t.cabinFares || null,
                    vehicleNumber: t.vehicleNumber || "",
                    departureTime: t.departureTime || "08:00 AM",
                    duration: t.duration || 360,
                    availableSeats: typeof t.availableSeats === "number" ? t.availableSeats : 28,
                    totalSeats: t.totalSeats || 36,
                    classType: classStr || (isAcCoach ? "AC Luxury Coach" : "Non-AC Standard"),
                    facilities: t.facilities || [],
                    scheduleUrl: t.scheduleUrl || "",
                    isAc: isAcCoach
                };
            })
        });
    } catch (error) {
        console.error("Get transportations error:", error.message);
        res.status(500).json({ success: false, message: "Unable to load transportations." });
    }
});

app.post("/api/admin/transportations/:adminId", async function (req, res) {
    try {
        const { adminId } = req.params;
        const { type, operator, from, to, farePerSeat, vehicleNumber, departureTime } = req.body;

        if (!ObjectId.isValid(adminId)) {
            return res.status(400).json({ success: false, message: "Invalid admin ID." });
        }
        const admin = await db.collection("users").findOne({ _id: new ObjectId(adminId), userType: "admin" });
        if (!admin) {
            return res.status(403).json({ success: false, message: "Admin access denied." });
        }
        if (!type?.trim() || !operator?.trim() || !from?.trim() || !to?.trim()) {
            return res.status(400).json({ success: false, message: "Type, operator, origin, and destination are required." });
        }

        const now = new Date();
        const doc = {
            type: type.trim().toLowerCase(),
            operator: operator.trim(),
            from: from.trim(),
            to: to.trim(),
            farePerSeat: Number(farePerSeat) || 500,
            vehicleNumber: vehicleNumber?.trim() || "TR-" + Math.floor(1000 + Math.random() * 9000),
            departureTime: departureTime?.trim() || "08:00 AM",
            isActive: true,
            createdAt: now,
            updatedAt: now
        };
        const result = await db.collection("transportations").insertOne(doc);
        res.status(201).json({ success: true, message: "Transportation option added successfully!", id: result.insertedId.toString() });
    } catch (error) {
        console.error("Add transportation error:", error.message);
        res.status(500).json({ success: false, message: "Unable to add transportation." });
    }
});

app.put("/api/admin/transportations/:adminId/:id", async function (req, res) {
    try {
        const { adminId, id } = req.params;
        const { type, operator, from, to, farePerSeat, vehicleNumber, departureTime } = req.body;

        if (!ObjectId.isValid(adminId) || !ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid ID." });
        }
        const admin = await db.collection("users").findOne({ _id: new ObjectId(adminId), userType: "admin" });
        if (!admin) {
            return res.status(403).json({ success: false, message: "Admin access denied." });
        }

        const updateData = { updatedAt: new Date() };
        if (type?.trim()) updateData.type = type.trim().toLowerCase();
        if (operator?.trim()) updateData.operator = operator.trim();
        if (from?.trim()) updateData.from = from.trim();
        if (to?.trim()) updateData.to = to.trim();
        if (farePerSeat !== undefined) updateData.farePerSeat = Number(farePerSeat) || 500;
        if (vehicleNumber?.trim()) updateData.vehicleNumber = vehicleNumber.trim();
        if (departureTime?.trim()) updateData.departureTime = departureTime.trim();

        const result = await db.collection("transportations").updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );
        if (result.matchedCount === 0) {
            return res.status(404).json({ success: false, message: "Transportation option not found." });
        }
        res.json({ success: true, message: "Transportation option updated successfully!" });
    } catch (error) {
        console.error("Update transportation error:", error.message);
        res.status(500).json({ success: false, message: "Unable to update transportation." });
    }
});

app.delete("/api/admin/transportations/:adminId/:id", async function (req, res) {
    try {
        const { adminId, id } = req.params;
        if (!ObjectId.isValid(adminId) || !ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid ID." });
        }
        const admin = await db.collection("users").findOne({ _id: new ObjectId(adminId), userType: "admin" });
        if (!admin) {
            return res.status(403).json({ success: false, message: "Admin access denied." });
        }
        const result = await db.collection("transportations").deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) {
            return res.status(404).json({ success: false, message: "Transportation option not found." });
        }
        res.json({ success: true, message: "Transportation option deleted successfully!" });
    } catch (error) {
        console.error("Delete transportation error:", error.message);
        res.status(500).json({ success: false, message: "Unable to delete transportation." });
    }
});

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
            people,
            paymentMethod,
            paymentPhone,
            transactionReference
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

        const method = paymentMethod || "cash";
        const isWallet = method === "bkash" || method === "nagad";

        const booking = {
            reference: reference,
            userId: user._id,
            district: district.trim(),
            touristSpot: touristSpot.trim(),
            visitDate,
            people: Number(people),
            payment: {
                method: method,
                status: method === "cash" ? "Pay on travel day" : "Demo paid",
                provider: method === "bkash" ? "bKash (Demo)" : method === "nagad" ? "Nagad (Demo)" : method === "card" ? "Card (Demo)" : "Cash",
                payerPhone: isWallet && paymentPhone ? paymentPhone.trim() : null,
                transactionReference: method === "cash" ? null : (transactionReference?.trim() || "DEMO-" + Math.random().toString(36).slice(2, 8).toUpperCase())
            },
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
            guestPhone,
            paymentMethod,
            paymentPhone,
            transactionReference
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
            typeof roomType !== "string" ||
            !roomType.trim() ||
            roomType.trim().length > 60 ||
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

        let hotel = demoHotels[hotelId];
        if (!hotel) {
            let dbHotel = null;
            if (ObjectId.isValid(hotelId)) {
                dbHotel = await db.collection("hotels").findOne({ _id: new ObjectId(hotelId) });
            }
            if (!dbHotel) {
                dbHotel = await db.collection("hotels").findOne({ name: hotelName });
            }
            if (dbHotel) {
                const stdPrice = dbHotel.packages?.[0]?.pricePerNight || Number(dbHotel.priceStandard) || 2500;
                const dlxPrice = dbHotel.packages?.[1]?.pricePerNight || Number(dbHotel.priceDeluxe) || 4500;
                const famPrice = dbHotel.packages?.[2]?.pricePerNight || Number(dbHotel.priceFamily) || 6500;
                hotel = {
                    name: dbHotel.name,
                    district: dbHotel.districtName || dbHotel.district || district,
                    prices: { Standard: stdPrice, Deluxe: dlxPrice, Family: famPrice }
                };
            }
        }

        let resolvedPrice = Number(req.body.pricePerNight);
        if (!resolvedPrice || resolvedPrice <= 0) {
            if (hotel && hotel.prices) {
                resolvedPrice = hotel.prices[roomType] || 
                                hotel.prices[roomType.charAt(0).toUpperCase() + roomType.slice(1).toLowerCase()] ||
                                hotel.prices.Standard || 2500;
            } else {
                resolvedPrice = 2500;
            }
        }

        if (!hotel) {
            hotel = {
                name: hotelName || "Hotel Stay",
                district: district || "Bangladesh",
                prices: { Standard: resolvedPrice }
            };
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

        const pricePerNight = resolvedPrice;
        const totalPrice = pricePerNight * rooms * nights;

        const reference =
            "TKH-" +
            new Date().toISOString().slice(0, 10).replace(/-/g, "") +
            "-" +
            require("crypto").randomBytes(4).toString("hex").toUpperCase();

        const method = paymentMethod || "cash";
        const isPayAtHotel = method === "cash" || method === "pay_at_hotel" || method === "pay_at_property";
        const isWallet = method === "bkash" || method === "nagad";

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
            payment: {
                method: isPayAtHotel ? "pay_at_hotel" : method,
                status: isPayAtHotel ? "Pay at Hotel (Pending)" : "Paid (Demo)",
                provider: method === "bkash" ? "bKash (Demo)" : method === "nagad" ? "Nagad (Demo)" : method === "card" ? "Card (Demo)" : "Pay at Hotel",
                payerPhone: isWallet && paymentPhone ? paymentPhone.trim() : null,
                transactionReference: isPayAtHotel ? null : (transactionReference?.trim() || "DEMO-" + Math.random().toString(36).slice(2, 8).toUpperCase())
            },
            paymentStatus: isPayAtHotel ? "Payment Pending" : "Paid",
            status: "Pending",
            bookingType: "hotel",
            createdAt: new Date()
        };

        const result = await db
            .collection("hotelBookings")
            .insertOne(booking);

        // Auto create notifications for Traveler, Hotel Partner, and Admin
        await db.collection("notifications").insertOne({
            userId: user._id,
            title: "Hotel Booking Placed",
            message: `Your booking at ${hotel.name} (${roomType} room) from ${checkIn} to ${checkOut} has been placed (Ref: ${reference}). Payment: ${isPayAtHotel ? 'Pay at Hotel (Pending)' : 'Paid'}.`,
            read: false,
            isRead: false,
            createdAt: new Date()
        });

        await db.collection("notifications").insertOne({
            role: "hotel",
            title: "New Hotel Reservation",
            message: `New booking received for ${hotel.name} from ${guestName} (${rooms} room, ${nights} night). Status: ${isPayAtHotel ? 'Pay at Hotel' : 'Paid'}.`,
            read: false,
            isRead: false,
            createdAt: new Date()
        });

        // Email Confirmation (Section K)
        if (user.email) {
            sendBookingConfirmationEmail(
                user.email,
                `Hotel Booking Confirmation - ${hotel.name} (${reference})`,
                `<h2>Travel Kori Bangladesh - Hotel Booking Confirmation</h2>
                <p>Dear ${guestName},</p>
                <p>Thank you for choosing Travel Kori Bangladesh. Your hotel reservation details are below:</p>
                <ul>
                    <li><strong>Booking Reference:</strong> ${reference}</li>
                    <li><strong>Property:</strong> ${hotel.name} (${hotel.district})</li>
                    <li><strong>Room Type:</strong> ${roomType} (${rooms} Room, ${nights} Night)</li>
                    <li><strong>Check-in:</strong> ${checkIn}</li>
                    <li><strong>Check-out:</strong> ${checkOut}</li>
                    <li><strong>Total Amount:</strong> BDT ${totalPrice}</li>
                    <li><strong>Payment Status:</strong> ${isPayAtHotel ? 'Payment Pending (Pay at Hotel)' : 'Paid (Demo)'}</li>
                </ul>
                <p>Have a wonderful stay in Bangladesh!</p>`
            );
        }

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
// TRANSPORT BOOKING API
// =========================

app.post("/api/transport-bookings", async function (req, res) {
    try {
        const {
            userId,
            journeyId,
            journeyDate,
            passengers,
            seatNumbers,
            passengerName,
            passengerPhone,
            paymentMethod,
            paymentPhone,
            transactionReference
        } = req.body;

        if (!userId || !ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Please log in with a valid account."
            });
        }

        if (
            typeof journeyId !== "string" ||
            typeof journeyDate !== "string" ||
            !/^\d{4}-\d{2}-\d{2}$/.test(journeyDate) ||
            !Number.isInteger(passengers) ||
            passengers < 1 ||
            passengers > 10 ||
            !Array.isArray(seatNumbers) ||
            seatNumbers.length !== passengers ||
            new Set(seatNumbers).size !== seatNumbers.length ||
            !seatNumbers.every(seat => typeof seat === "string") ||
            typeof passengerName !== "string" ||
            !passengerName.trim() ||
            passengerName.trim().length > 100 ||
            typeof passengerPhone !== "string" ||
            !passengerPhone.trim() ||
            passengerPhone.trim().length > 20
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide valid passenger, journey and seat details."
            });
        }

        const chosenDate = new Date(`${journeyDate}T00:00:00.000Z`);
        const today = new Date().toISOString().slice(0, 10);

        if (
            Number.isNaN(chosenDate.getTime()) ||
            chosenDate.toISOString().slice(0, 10) !== journeyDate ||
            journeyDate < today
        ) {
            return res.status(400).json({
                success: false,
                message: "Please select a valid future journey date."
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

        const allowedPaymentMethods = ["bkash", "nagad", "cash", "card"];

        if (!allowedPaymentMethods.includes(paymentMethod)) {
            return res.status(400).json({
                success: false,
                message: "Please select a valid payment method."
            });
        }

        if (paymentMethod === "bkash" || paymentMethod === "nagad") {
            if (
                typeof paymentPhone !== "string" ||
                !/^01[3-9]\d{8}$/.test(paymentPhone.trim())
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Enter a valid 11-digit Bangladeshi mobile number for the demo wallet payment."
                });
            }
        }

        if (
            transactionReference !== undefined &&
            transactionReference !== null &&
            (
                typeof transactionReference !== "string" ||
                transactionReference.trim().length > 80
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid demo transaction reference."
            });
        }

        // Server-controlled demonstration journey data.
        const demoJourneys = {
            "BUS-DAC-CTG-01": { type: "Bus", operator: "Demo Express", from: "Dhaka", to: "Chattogram", fare: 900 },
            "BUS-DAC-COX-01": { type: "Bus", operator: "Demo Coastal Coach", from: "Dhaka", to: "Cox's Bazar", fare: 1400 },
            "BUS-DAC-SYL-01": { type: "Bus", operator: "Demo Green Coach", from: "Dhaka", to: "Sylhet", fare: 750 },
            "BUS-CTG-COX-01": { type: "Bus", operator: "Demo Bay Coach", from: "Chattogram", to: "Cox's Bazar", fare: 500 },
            "TRAIN-DAC-CTG-01": { type: "Train", operator: "Demo Intercity Train", from: "Dhaka", to: "Chattogram", fare: 450 },
            "TRAIN-DAC-SYL-01": { type: "Train", operator: "Demo Intercity Train", from: "Dhaka", to: "Sylhet", fare: 400 },
            "TRAIN-DAC-RJH-01": { type: "Train", operator: "Demo Intercity Train", from: "Dhaka", to: "Rajshahi", fare: 420 },
            "FLIGHT-DAC-CTG-01": { type: "Flight", operator: "Demo Bangladesh Air", from: "Dhaka", to: "Chattogram", fare: 4500 },
            "FLIGHT-DAC-COX-01": { type: "Flight", operator: "Demo Bangladesh Air", from: "Dhaka", to: "Cox's Bazar", fare: 6500 },
            "FLIGHT-DAC-SYL-01": { type: "Flight", operator: "Demo Bangladesh Air", from: "Dhaka", to: "Sylhet", fare: 4200 },
            "BUS-GREEN-DAC-CTG": { type: "Bus", operator: "Green Line Paribahan", from: "Dhaka", to: "Chattogram", fare: 1200 },
            "BUS-HANIF-DAC-CTG": { type: "Bus", operator: "Hanif Enterprise", from: "Dhaka", to: "Chattogram", fare: 1000 },
            "BUS-ENA-DAC-CTG": { type: "Bus", operator: "Ena Transport", from: "Dhaka", to: "Chattogram", fare: 1000 },
            "BUS-GREEN-DAC-COX": { type: "Bus", operator: "Green Line Paribahan", from: "Dhaka", to: "Cox's Bazar", fare: 1800 },
            "BUS-HANIF-DAC-COX": { type: "Bus", operator: "Hanif Enterprise", from: "Dhaka", to: "Cox's Bazar", fare: 1500 },
            "BUS-ENA-DAC-COX": { type: "Bus", operator: "Ena Transport", from: "Dhaka", to: "Cox's Bazar", fare: 1500 },
            "BUS-GREEN-DAC-SYL": { type: "Bus", operator: "Green Line Paribahan", from: "Dhaka", to: "Sylhet", fare: 1000 },
            "BUS-ENA-DAC-SYL": { type: "Bus", operator: "Ena Transport", from: "Dhaka", to: "Sylhet", fare: 900 },
            "BUS-HANIF-DAC-RNG": { type: "Bus", operator: "Hanif Enterprise", from: "Dhaka", to: "Rangpur", fare: 1000 },
            "BUS-ENA-DAC-RNG": { type: "Bus", operator: "Ena Transport", from: "Dhaka", to: "Rangpur", fare: 1000 },
            "BUS-GREEN-DAC-KHL": { type: "Bus", operator: "Green Line Paribahan", from: "Dhaka", to: "Khulna", fare: 1200 },
            "BUS-GREEN-DAC-RJH": { type: "Bus", operator: "Green Line Paribahan", from: "Dhaka", to: "Rajshahi", fare: 1000 },
            "BUS-HANIF-DAC-RJH": { type: "Bus", operator: "Hanif Enterprise", from: "Dhaka", to: "Rajshahi", fare: 900 },
            "BUS-GREEN-CTG-SYL": { type: "Bus", operator: "Green Line Paribahan", from: "Chattogram", to: "Sylhet", fare: 1200 },
            "BUS-HANIF-CTG-COX": { type: "Bus", operator: "Hanif Enterprise", from: "Chattogram", to: "Cox's Bazar", fare: 600 },
            "TRAIN-SONARBANGLA-DAC-CTG": { type: "Train", operator: "Sonar Bangla Express", from: "Dhaka", to: "Chattogram", fare: 900 },
            "TRAIN-SUBARNA-DAC-CTG": { type: "Train", operator: "Subarna Express", from: "Dhaka", to: "Chattogram", fare: 900 },
            "TRAIN-MOHANAGAR-DAC-CTG": { type: "Train", operator: "Mohanagar Provati", from: "Dhaka", to: "Chattogram", fare: 700 },
            "TRAIN-TURNA-DAC-CTG": { type: "Train", operator: "Turna Express", from: "Dhaka", to: "Chattogram", fare: 800 },
            "TRAIN-COXEXP-DAC-COX": { type: "Train", operator: "Cox's Bazar Express", from: "Dhaka", to: "Cox's Bazar", fare: 1200 },
            "TRAIN-PARJOTOK-DAC-COX": { type: "Train", operator: "Parjotok Express", from: "Dhaka", to: "Cox's Bazar", fare: 1200 },
            "TRAIN-PARABAT-DAC-SYL": { type: "Train", operator: "Parabat Express", from: "Dhaka", to: "Sylhet", fare: 500 },
            "TRAIN-JAYANTIKA-DAC-SYL": { type: "Train", operator: "Jayantika Express", from: "Dhaka", to: "Sylhet", fare: 500 },
            "TRAIN-DHUMKETU-DAC-RJH": { type: "Train", operator: "Dhumketu Express", from: "Dhaka", to: "Rajshahi", fare: 550 },
            "TRAIN-SUNDARBAN-DAC-KHL": { type: "Train", operator: "Sundarban Express", from: "Dhaka", to: "Khulna", fare: 600 },
            "FLIGHT-BIMAN-DAC-CTG": { type: "Flight", operator: "Biman Bangladesh Airlines", from: "Dhaka", to: "Chattogram", fare: 5500 },
            "FLIGHT-USBAIR-DAC-CTG": { type: "Flight", operator: "US-Bangla Airlines", from: "Dhaka", to: "Chattogram", fare: 5000 },
            "FLIGHT-BIMAN-DAC-COX": { type: "Flight", operator: "Biman Bangladesh Airlines", from: "Dhaka", to: "Cox's Bazar", fare: 7000 },
            "FLIGHT-USBAIR-DAC-COX": { type: "Flight", operator: "US-Bangla Airlines", from: "Dhaka", to: "Cox's Bazar", fare: 6500 },
            "FLIGHT-USBAIR-DAC-SYL": { type: "Flight", operator: "US-Bangla Airlines", from: "Dhaka", to: "Sylhet", fare: 5000 }
        };

        let journey = demoJourneys[journeyId];

        if (!journey) {
            // Check MongoDB transportations collection
            let dbJourney = null;
            if (ObjectId.isValid(journeyId)) {
                dbJourney = await db.collection("transportations").findOne({ _id: new ObjectId(journeyId) });
            }
            if (!dbJourney) {
                dbJourney = await db.collection("transportations").findOne({
                    $or: [
                        { vehicleNumber: journeyId },
                        { operator: new RegExp(journeyId.split('-')[0], "i") }
                    ]
                });
            }
            if (dbJourney) {
                journey = {
                    type: dbJourney.type ? dbJourney.type.charAt(0).toUpperCase() + dbJourney.type.slice(1).toLowerCase() : "Bus",
                    operator: dbJourney.operator,
                    from: dbJourney.from,
                    to: dbJourney.to,
                    fare: dbJourney.farePerSeat || dbJourney.fare || 1000
                };
            } else {
                journey = {
                    type: req.body.type ? req.body.type.charAt(0).toUpperCase() + req.body.type.slice(1).toLowerCase() : "Bus",
                    operator: req.body.operator || "Travel Kori Service",
                    from: req.body.from || "Dhaka",
                    to: req.body.to || "Destination",
                    fare: Number(req.body.fare) || 800
                };
            }
        }

        if (!journey) {
            return res.status(400).json({
                success: false,
                message: "Invalid demonstration journey."
            });
        }

        // Validate seat labels against the selected transport type.
        if (journey.type === "Train") {
            const validTrainSeat = seat =>
                /^[ABC](?:[1-9]|[1-3]\d|40)$/.test(seat);

            if (!seatNumbers.every(validTrainSeat)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid train coach or seat."
                });
            }

        } else if (journey.type === "Bus") {
            const validBusSeat = seat =>
                /^[A-J][1-4]$|^B?(?:[1-9]|[1-3]\d|40)$/i.test(seat);

            if (!seatNumbers.every(validBusSeat)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid bus seat."
                });
            }

        } else if (journey.type === "Flight") {
            // Demo aircraft seat labels: 1A-5F (six seats per row).
            const validFlightSeat = seat =>
                /^[1-5][A-F]$/.test(seat);

            if (!seatNumbers.every(validFlightSeat)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid flight seat."
                });
            }
        } else if (journey.type === "Ship") {
            const validShipSeat = seat =>
                /^(?:C|Cabin|D|Deck|VIP|Berth)?-?\d+$/i.test(seat) || /^[A-Z]\d+$/i.test(seat) || /^\d+$/.test(seat);

            if (!seatNumbers.every(validShipSeat)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid ship cabin or deck berth."
                });
            }
        }

        const reference =
            "TKT-" +
            journeyDate.replace(/-/g, "") +
            "-" +
            require("crypto").randomBytes(4).toString("hex").toUpperCase();

        const booking = {
            reference,
            userId: user._id,
            journeyId,
            transportType: journey.type,
            operator: journey.operator,
            from: journey.from,
            to: journey.to,
            journeyDate,
            passengers,
            seatNumbers,
            coach: journey.type === "Train" ? seatNumbers[0].charAt(0) : null,
            passengerName: passengerName.trim(),
            passengerPhone: passengerPhone.trim(),
            farePerPassenger: journey.fare,
            totalPrice: journey.fare * passengers,
            currency: "BDT",
            payment: {
                method: paymentMethod,
                status: paymentMethod === "cash" ? "Pay on travel day" : "Demo paid",
                provider: paymentMethod === "bkash" ? "bKash (Demo)" :
                    paymentMethod === "nagad" ? "Nagad (Demo)" :
                    paymentMethod === "card" ? "Card (Demo)" : "Cash",
                payerPhone: (paymentMethod === "bkash" || paymentMethod === "nagad")
                    ? paymentPhone.trim()
                    : null,
                transactionReference: paymentMethod === "cash"
                    ? null
                    : (
                        typeof transactionReference === "string" &&
                        transactionReference.trim()
                            ? transactionReference.trim()
                            : "DEMO-" +
                              require("crypto").randomBytes(4).toString("hex").toUpperCase()
                    ),
                paidAt: paymentMethod === "cash" ? null : new Date(),
                isRealTransaction: false
            },
            status: "Pending",
            bookingType: "transport",
            createdAt: new Date()
        };

        const result = await db.collection("transportBookings").insertOne(booking);

        // Auto create notifications for Traveler and Transport Partner
        await db.collection("notifications").insertOne({
            userId: user._id,
            title: `${journey.type} Ticket Confirmed`,
            message: `Your ${journey.type} journey (${reference}) from ${journey.from} to ${journey.to} on ${journeyDate} is confirmed. Seats: ${seatNumbers.join(", ")}.`,
            read: false,
            isRead: false,
            createdAt: new Date()
        });

        await db.collection("notifications").insertOne({
            role: "transport",
            title: `New ${journey.type} Ticket Reservation`,
            message: `New passenger booked: ${passengerName} (${passengers} seat(s): ${seatNumbers.join(", ")}) for ${journey.from} → ${journey.to} on ${journeyDate}.`,
            read: false,
            isRead: false,
            createdAt: new Date()
        });

        // Email Confirmation (Section K)
        if (user.email) {
            sendBookingConfirmationEmail(
                user.email,
                `Transport Journey Confirmation - ${journey.from} to ${journey.to} (${reference})`,
                `<h2>Travel Kori Bangladesh - Transport Ticket Confirmation</h2>
                <p>Dear ${passengerName},</p>
                <p>Your transport journey is confirmed! Details below:</p>
                <ul>
                    <li><strong>Ticket Reference:</strong> ${reference}</li>
                    <li><strong>Service Type:</strong> ${journey.type} (${journey.operator || "Express Transport"})</li>
                    <li><strong>Route:</strong> ${journey.from} → ${journey.to}</li>
                    <li><strong>Journey Date:</strong> ${journeyDate} (${journey.departureTime || "Scheduled Departure"})</li>
                    <li><strong>Seats:</strong> ${seatNumbers.join(", ")} (${passengers} passenger)</li>
                    <li><strong>Total Fare:</strong> BDT ${booking.totalPrice}</li>
                    <li><strong>Payment:</strong> ${booking.payment?.status || "Paid"}</li>
                </ul>
                <p>Please arrive at the boarding station 20 minutes before departure time. Safe travels!</p>`
            );
        }

        res.status(201).json({
            success: true,
            message: "Transport booking request submitted.",
            booking: {
                ...booking,
                id: result.insertedId.toString(),
                userId: user._id.toString()
            }
        });

    } catch (error) {
        console.error("Transport booking error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to submit transport booking."
        });
    }
});

app.get("/api/transport-bookings/:userId", async function (req, res) {
    try {
        const { userId } = req.params;

        if (!ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID."
            });
        }

        const bookings = await db.collection("transportBookings")
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
        console.error("Get transport bookings error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to load transport bookings."
        });
    }
});

// ============================================
// ATTRACTIONS (TOURIST SPOTS) MONGODB CRUD
// ============================================

app.get("/api/attractions", async function (req, res) {
    try {
        if (!db) return res.json([]);
        const { district } = req.query;

        // Build district ID map for resolving ObjectIds
        const districtsList = await db.collection("districts").find({}).toArray();
        const distIdMap = {};
        districtsList.forEach(d => {
            distIdMap[d._id.toString()] = d.name;
        });

        let filter = {};
        if (district) {
            // Find district ObjectId if exists
            const matchedDist = districtsList.find(d => d.name.toLowerCase() === district.toLowerCase());
            if (matchedDist) {
                filter = {
                    $or: [
                        { district: matchedDist._id },
                        { district: district },
                        { districtName: new RegExp(district, "i") }
                    ]
                };
            } else {
                filter = {
                    $or: [
                        { district: district },
                        { districtName: new RegExp(district, "i") }
                    ]
                };
            }
        }

        const attractions = await db.collection("attractions").find(filter).toArray();
        const resolved = attractions.map(a => {
            const distName = a.districtName || (a.district && distIdMap[a.district.toString()]) || String(a.district || "Bangladesh");
            return {
                ...a,
                districtName: distName
            };
        });

        res.json(resolved);
    } catch (error) {
        console.error("Get attractions error:", error.message);
        res.status(500).json({ success: false, message: "Unable to load attractions." });
    }
});

app.post("/api/attractions", async function (req, res) {
    try {
        if (!db) return res.status(503).json({ success: false, message: "Database not connected." });
        const { name, district, description, bestTimeToVisit } = req.body;

        if (!name || !district) {
            return res.status(400).json({ success: false, message: "Spot name and district are required." });
        }

        const doc = {
            name: name.trim(),
            district: district.trim(),
            districtName: district.trim(),
            description: (description || "").trim(),
            bestTimeToVisit: (bestTimeToVisit || "Year-round").trim(),
            createdAt: new Date()
        };

        const result = await db.collection("attractions").insertOne(doc);
        res.status(201).json({ success: true, message: "Tourist spot saved successfully!", id: result.insertedId, spot: doc });
    } catch (error) {
        console.error("Create attraction error:", error.message);
        res.status(500).json({ success: false, message: "Failed to create attraction." });
    }
});

app.put("/api/attractions/:id", async function (req, res) {
    try {
        if (!db) return res.status(503).json({ success: false, message: "Database not connected." });
        const { id } = req.params;
        const { name, district, description, bestTimeToVisit } = req.body;

        let objectId;
        try { objectId = new ObjectId(id); } catch { return res.status(400).json({ success: false, message: "Invalid ID." }); }

        const updateData = {};
        if (name) updateData.name = name.trim();
        if (district) {
            updateData.district = district.trim();
            updateData.districtName = district.trim();
        }
        if (description !== undefined) updateData.description = description.trim();
        if (bestTimeToVisit !== undefined) updateData.bestTimeToVisit = bestTimeToVisit.trim();

        await db.collection("attractions").updateOne({ _id: objectId }, { $set: updateData });
        res.json({ success: true, message: "Tourist spot updated successfully!" });
    } catch (error) {
        console.error("Update attraction error:", error.message);
        res.status(500).json({ success: false, message: "Failed to update attraction." });
    }
});

app.delete("/api/attractions/:id", async function (req, res) {
    try {
        if (!db) return res.status(503).json({ success: false, message: "Database not connected." });
        const { id } = req.params;
        let objectId;
        try { objectId = new ObjectId(id); } catch { return res.status(400).json({ success: false, message: "Invalid ID." }); }

        await db.collection("attractions").deleteOne({ _id: objectId });
        res.json({ success: true, message: "Tourist spot deleted successfully!" });
    } catch (error) {
        console.error("Delete attraction error:", error.message);
        res.status(500).json({ success: false, message: "Failed to delete attraction." });
    }
});

// ============================================
// HOTELS MONGODB CRUD
// ============================================

app.get("/api/hotels", async function (req, res) {
    try {
        if (!db) return res.json([]);
        const { district } = req.query;

        let filter = {};
        if (district) {
            filter = {
                $or: [
                    { districtName: new RegExp(district, "i") },
                    { location: new RegExp(district, "i") }
                ]
            };
        }

        const hotels = await db.collection("hotels").find(filter).toArray();
        res.json(hotels);
    } catch (error) {
        console.error("Get hotels error:", error.message);
        res.status(500).json({ success: false, message: "Unable to load hotels." });
    }
});

app.post("/api/hotels", async function (req, res) {
    try {
        if (!db) return res.status(503).json({ success: false, message: "Database not connected." });
        const { name, districtName, minPrice, address, description } = req.body;

        if (!name || !districtName) {
            return res.status(400).json({ success: false, message: "Hotel name and district are required." });
        }

        const price = Number(minPrice) || 2500;
        const doc = {
            name: name.trim(),
            districtName: districtName.trim(),
            location: (address || districtName).trim(),
            description: (description || "Comfortable stay with modern amenities.").trim(),
            packages: [
                { name: "Standard Deluxe", price: price, description: "AC Room, Free Breakfast" },
                { name: "Premium Suite", price: Math.round(price * 1.6), description: "Balcony view, King Bed" }
            ],
            createdAt: new Date()
        };

        const result = await db.collection("hotels").insertOne(doc);
        res.status(201).json({ success: true, message: "Hotel added to MongoDB successfully!", id: result.insertedId, hotel: doc });
    } catch (error) {
        console.error("Create hotel error:", error.message);
        res.status(500).json({ success: false, message: "Failed to create hotel." });
    }
});

app.put("/api/hotels/:id", async function (req, res) {
    try {
        if (!db) return res.status(503).json({ success: false, message: "Database not connected." });
        const { id } = req.params;
        const { name, districtName, minPrice, address, description } = req.body;

        let objectId;
        try { objectId = new ObjectId(id); } catch { return res.status(400).json({ success: false, message: "Invalid ID." }); }

        const updateData = {};
        if (name) updateData.name = name.trim();
        if (districtName) updateData.districtName = districtName.trim();
        if (address) updateData.location = address.trim();
        if (description) updateData.description = description.trim();
        if (minPrice) {
            const price = Number(minPrice);
            updateData.packages = [
                { name: "Standard Deluxe", price: price, description: "AC Room, Free Breakfast" },
                { name: "Premium Suite", price: Math.round(price * 1.6), description: "Balcony view, King Bed" }
            ];
        }

        await db.collection("hotels").updateOne({ _id: objectId }, { $set: updateData });
        res.json({ success: true, message: "Hotel updated successfully!" });
    } catch (error) {
        console.error("Update hotel error:", error.message);
        res.status(500).json({ success: false, message: "Failed to update hotel." });
    }
});

app.delete("/api/hotels/:id", async function (req, res) {
    try {
        if (!db) return res.status(503).json({ success: false, message: "Database not connected." });
        const { id } = req.params;
        let objectId;
        try { objectId = new ObjectId(id); } catch { return res.status(400).json({ success: false, message: "Invalid ID." }); }

        await db.collection("hotels").deleteOne({ _id: objectId });
        res.json({ success: true, message: "Hotel deleted successfully!" });
    } catch (error) {
        console.error("Delete hotel error:", error.message);
        res.status(500).json({ success: false, message: "Failed to delete hotel." });
    }
});

// ============================================
// TRANSPORTATIONS MONGODB CRUD
// ============================================

app.get("/api/transportations", async function (req, res) {
    try {
        if (!db) return res.json([]);
        const { type } = req.query;
        const filter = type ? { type: new RegExp(type, "i") } : {};
        const transports = await db.collection("transportations").find(filter).toArray();
        res.json(transports);
    } catch (error) {
        console.error("Get transportations error:", error.message);
        res.status(500).json({ success: false, message: "Unable to load transportations." });
    }
});

app.post("/api/transportations", async function (req, res) {
    try {
        if (!db) return res.status(503).json({ success: false, message: "Database not connected." });
        const { type, operator, from, to, farePerSeat } = req.body;

        if (!type || !operator || !from || !to) {
            return res.status(400).json({ success: false, message: "Type, operator, origin, and destination are required." });
        }

        const doc = {
            type: type.trim(),
            operator: operator.trim(),
            from: from.trim(),
            to: to.trim(),
            farePerSeat: Number(farePerSeat) || 1000,
            createdAt: new Date()
        };

        const result = await db.collection("transportations").insertOne(doc);
        res.status(201).json({ success: true, message: "Transport route added to MongoDB!", id: result.insertedId, transport: doc });
    } catch (error) {
        console.error("Create transport error:", error.message);
        res.status(500).json({ success: false, message: "Failed to add transport route." });
    }
});

app.put("/api/transportations/:id", async function (req, res) {
    try {
        if (!db) return res.status(503).json({ success: false, message: "Database not connected." });
        const { id } = req.params;
        const { type, operator, from, to, farePerSeat } = req.body;

        let objectId;
        try { objectId = new ObjectId(id); } catch { return res.status(400).json({ success: false, message: "Invalid ID." }); }

        const updateData = {};
        if (type) updateData.type = type.trim();
        if (operator) updateData.operator = operator.trim();
        if (from) updateData.from = from.trim();
        if (to) updateData.to = to.trim();
        if (farePerSeat !== undefined) updateData.farePerSeat = Number(farePerSeat);

        await db.collection("transportations").updateOne({ _id: objectId }, { $set: updateData });
        res.json({ success: true, message: "Transport route updated successfully!" });
    } catch (error) {
        console.error("Update transport error:", error.message);
        res.status(500).json({ success: false, message: "Failed to update transport route." });
    }
});

app.delete("/api/transportations/:id", async function (req, res) {
    try {
        if (!db) return res.status(503).json({ success: false, message: "Database not connected." });
        const { id } = req.params;
        let objectId;
        try { objectId = new ObjectId(id); } catch { return res.status(400).json({ success: false, message: "Invalid ID." }); }

        await db.collection("transportations").deleteOne({ _id: objectId });
        res.json({ success: true, message: "Transport route deleted successfully!" });
    } catch (error) {
        console.error("Delete transport error:", error.message);
        res.status(500).json({ success: false, message: "Failed to delete transport route." });
    }
});

// ============================================
// ADMIN TOUR GUIDE MANAGEMENT APIS (FR-48 to FR-56)
// ============================================

// Helper to verify admin
async function verifyAdminUser(adminId) {
    if (!adminId || !ObjectId.isValid(adminId)) return null;
    return await db.collection("users").findOne({
        _id: new ObjectId(adminId),
        userType: "admin"
    });
}

// Get all guides (Admin view with pending, active, stats)
app.get("/api/admin/guides/:adminId", async function (req, res) {
    try {
        if (!db) return res.status(503).json({ success: false, message: "Database not connected." });
        const admin = await verifyAdminUser(req.params.adminId);
        if (!admin) return res.status(403).json({ success: false, message: "Admin access required." });

        const guides = await db.collection("tourguides").find({}).sort({ createdAt: -1 }).toArray();

        // Attach booking stats to each guide
        const guidesWithStats = await Promise.all(guides.map(async (g) => {
            const bookingCount = await db.collection("bookings").countDocuments({
                type: "tourguide",
                $or: [{ guideId: g._id.toString() }, { guideName: g.name }]
            });
            return {
                id: g._id.toString(),
                name: g.name,
                email: g.email || "",
                phone: g.phone || "",
                specialization: Array.isArray(g.specialization) ? g.specialization : [g.specialization || "Bangladesh"],
                experience: g.experience || 1,
                languages: Array.isArray(g.languages) ? g.languages : ["Bengali", "English"],
                dailyRate: Number(g.dailyRate) || 2000,
                rating: Number(g.rating) || 5.0,
                reviews: Number(g.reviews) || 0,
                isSeedRating: Boolean(g.seedRating !== false && (!g.userId || g.reviews === 0)),
                isApproved: g.isApproved !== false,
                isAvailable: g.isAvailable !== false,
                isActive: g.isActive !== false,
                bookingCount: bookingCount,
                createdAt: g.createdAt || new Date()
            };
        }));

        res.json({ success: true, guides: guidesWithStats });
    } catch (error) {
        console.error("Admin get guides error:", error.message);
        res.status(500).json({ success: false, message: "Unable to load guides." });
    }
});

// Admin Add New Tour Guide
app.post("/api/admin/guides/:adminId", async function (req, res) {
    try {
        if (!db) return res.status(503).json({ success: false, message: "Database not connected." });
        const admin = await verifyAdminUser(req.params.adminId);
        if (!admin) return res.status(403).json({ success: false, message: "Admin access required." });

        const { name, email, phone, specialization, experience, languages, dailyRate, bio } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ success: false, message: "Guide name is required." });
        }

        const specArray = Array.isArray(specialization)
            ? specialization
            : (typeof specialization === "string" ? specialization.split(",").map(s => s.trim()).filter(Boolean) : ["Dhaka"]);

        const langArray = Array.isArray(languages)
            ? languages
            : (typeof languages === "string" ? languages.split(",").map(s => s.trim()).filter(Boolean) : ["Bengali", "English"]);

        const now = new Date();
        const guideDoc = {
            name: name.trim(),
            email: (email || "").trim().toLowerCase(),
            phone: (phone || "").trim(),
            specialization: specArray,
            experience: Number(experience) || 2,
            languages: langArray,
            dailyRate: Number(dailyRate) || 2000,
            bio: (bio || "Verified professional tour guide.").trim(),
            rating: 5.0,
            reviews: 0,
            seedRating: true,
            isApproved: true, // Directly approved when added by admin
            isAvailable: true,
            isActive: true,
            createdAt: now,
            updatedAt: now
        };

        const result = await db.collection("tourguides").insertOne(guideDoc);
        res.status(201).json({
            success: true,
            message: "Tour guide created and approved successfully!",
            guideId: result.insertedId.toString()
        });
    } catch (error) {
        console.error("Admin add guide error:", error.message);
        res.status(500).json({ success: false, message: "Unable to create guide." });
    }
});

// Admin Edit Guide Profile Details
app.put("/api/admin/guides/:adminId/:guideId", async function (req, res) {
    try {
        if (!db) return res.status(503).json({ success: false, message: "Database not connected." });
        const admin = await verifyAdminUser(req.params.adminId);
        if (!admin) return res.status(403).json({ success: false, message: "Admin access required." });

        const { guideId } = req.params;
        if (!ObjectId.isValid(guideId)) return res.status(400).json({ success: false, message: "Invalid guide ID." });

        const { name, email, phone, specialization, experience, languages, dailyRate, bio } = req.body;
        const updateFields = { updatedAt: new Date() };

        if (name) updateFields.name = name.trim();
        if (email) updateFields.email = email.trim().toLowerCase();
        if (phone) updateFields.phone = phone.trim();
        if (bio) updateFields.bio = bio.trim();
        if (dailyRate !== undefined) updateFields.dailyRate = Math.max(500, Number(dailyRate) || 2000);
        if (experience !== undefined) updateFields.experience = Math.max(0, Number(experience) || 1);

        if (specialization) {
            updateFields.specialization = Array.isArray(specialization)
                ? specialization
                : String(specialization).split(",").map(s => s.trim()).filter(Boolean);
        }
        if (languages) {
            updateFields.languages = Array.isArray(languages)
                ? languages
                : String(languages).split(",").map(s => s.trim()).filter(Boolean);
        }

        await db.collection("tourguides").updateOne(
            { _id: new ObjectId(guideId) },
            { $set: updateFields }
        );

        res.json({ success: true, message: "Guide updated successfully!" });
    } catch (error) {
        console.error("Admin update guide error:", error.message);
        res.status(500).json({ success: false, message: "Unable to update guide." });
    }
});

// Admin Approve / Deactivate / Toggle Status
app.put("/api/admin/guides/:adminId/:guideId/status", async function (req, res) {
    try {
        if (!db) return res.status(503).json({ success: false, message: "Database not connected." });
        const admin = await verifyAdminUser(req.params.adminId);
        if (!admin) return res.status(403).json({ success: false, message: "Admin access required." });

        const { guideId } = req.params;
        if (!ObjectId.isValid(guideId)) return res.status(400).json({ success: false, message: "Invalid guide ID." });

        const { isApproved, isActive, isAvailable } = req.body;
        const updateFields = { updatedAt: new Date() };

        if (isApproved !== undefined) {
            updateFields.isApproved = Boolean(isApproved);
            // If newly approved, make available by default
            if (isApproved && isAvailable === undefined) updateFields.isAvailable = true;
        }
        if (isActive !== undefined) updateFields.isActive = Boolean(isActive);
        if (isAvailable !== undefined) updateFields.isAvailable = Boolean(isAvailable);

        const guide = await db.collection("tourguides").findOne({ _id: new ObjectId(guideId) });
        if (!guide) return res.status(404).json({ success: false, message: "Guide not found." });

        await db.collection("tourguides").updateOne(
            { _id: new ObjectId(guideId) },
            { $set: updateFields }
        );

        // Sync with users collection if guide has an associated user account
        if (guide.userId) {
            const userUpdate = {};
            if (isApproved !== undefined) userUpdate.isApproved = Boolean(isApproved);
            if (isActive !== undefined) userUpdate.isActive = Boolean(isActive);
            if (Object.keys(userUpdate).length > 0) {
                await db.collection("users").updateOne(
                    { _id: guide.userId },
                    { $set: userUpdate }
                );
            }
        }

        res.json({
            success: true,
            message: `Guide status updated: ${isApproved ? "Approved" : "Pending/Updated"}, Active: ${updateFields.isActive !== false}.`
        });
    } catch (error) {
        console.error("Admin guide status error:", error.message);
        res.status(500).json({ success: false, message: "Unable to update guide status." });
    }
});

// Admin Safe Remove / Deactivate Guide
app.delete("/api/admin/guides/:adminId/:guideId", async function (req, res) {
    try {
        if (!db) return res.status(503).json({ success: false, message: "Database not connected." });
        const admin = await verifyAdminUser(req.params.adminId);
        if (!admin) return res.status(403).json({ success: false, message: "Admin access required." });

        const { guideId } = req.params;
        if (!ObjectId.isValid(guideId)) return res.status(400).json({ success: false, message: "Invalid guide ID." });

        // Check if bookings or reviews exist
        const hasBookings = await db.collection("bookings").findOne({
            type: "tourguide",
            $or: [{ guideId: guideId }, { guideId: new ObjectId(guideId) }]
        });
        const hasReviews = await db.collection("guidereviews").findOne({
            guideId: new ObjectId(guideId)
        });

        if (hasBookings || hasReviews) {
            // Prefer safe deactivation to preserve booking integrity
            await db.collection("tourguides").updateOne(
                { _id: new ObjectId(guideId) },
                { $set: { isActive: false, isAvailable: false, isApproved: false, updatedAt: new Date() } }
            );
            return res.json({
                success: true,
                message: "Guide has existing bookings/reviews and was safely deactivated instead of permanently deleted."
            });
        }

        // Clean delete if no references
        await db.collection("tourguides").deleteOne({ _id: new ObjectId(guideId) });
        res.json({ success: true, message: "Guide permanently removed." });
    } catch (error) {
        console.error("Admin delete guide error:", error.message);
        res.status(500).json({ success: false, message: "Unable to delete guide." });
    }
});

// Admin View All Tour Guide Booking Requests
app.get("/api/admin/guide-bookings/:adminId", async function (req, res) {
    try {
        if (!db) return res.status(503).json({ success: false, message: "Database not connected." });
        const admin = await verifyAdminUser(req.params.adminId);
        if (!admin) return res.status(403).json({ success: false, message: "Admin access required." });

        const bookings = await db.collection("bookings")
            .find({ type: "tourguide" })
            .sort({ createdAt: -1 })
            .toArray();

        res.json({
            success: true,
            bookings: bookings.map(b => ({
                id: b._id.toString(),
                reference: b.reference,
                guideName: b.guideName,
                destination: b.destination,
                tourDate: b.tourDate,
                days: b.days || 1,
                totalAmount: b.totalAmount || (b.days || 1) * (b.dailyRate || 2000),
                guestName: b.guestName,
                guestPhone: b.guestPhone,
                paymentMethod: b.paymentMethod,
                paymentStatus: b.paymentStatus,
                status: b.status || "Pending",
                createdAt: b.createdAt
            }))
        });
    } catch (error) {
        console.error("Admin get guide bookings error:", error.message);
        res.status(500).json({ success: false, message: "Unable to load guide bookings." });
    }
});

// Admin View All Guide Reviews
app.get("/api/admin/guide-reviews/:adminId", async function (req, res) {
    try {
        if (!db) return res.status(503).json({ success: false, message: "Database not connected." });
        const admin = await verifyAdminUser(req.params.adminId);
        if (!admin) return res.status(403).json({ success: false, message: "Admin access required." });

        const reviews = await db.collection("guidereviews")
            .find({})
            .sort({ createdAt: -1 })
            .toArray();

        res.json({
            success: true,
            reviews: reviews.map(r => ({
                id: r._id.toString(),
                guideId: r.guideId?.toString(),
                bookingReference: r.bookingReference,
                travelerName: r.travelerName,
                rating: r.rating,
                comment: r.comment,
                destination: r.destination,
                tourDate: r.tourDate,
                createdAt: r.createdAt
            }))
        });
    } catch (error) {
        console.error("Admin get guide reviews error:", error.message);
        res.status(500).json({ success: false, message: "Unable to load guide reviews." });
    }
});

// ============================================
// ADMIN ACCOUNT MANAGEMENT (Travelers, Hotels, Transport, Guides)
// ============================================
app.get("/api/admin/accounts/:adminId", async function (req, res) {
    try {
        if (!db) return res.status(503).json({ success: false, message: "Database not connected." });
        const admin = await verifyAdminUser(req.params.adminId);
        if (!admin) return res.status(403).json({ success: false, message: "Admin access required." });

        const { role, status, search } = req.query;
        const query = {};

        if (role && role !== "all") {
            query.userType = role.toLowerCase();
        }
        if (status && status !== "all") {
            if (status === "active") query.isActive = { $ne: false };
            else if (status === "suspended") query.isActive = false;
        }
        if (search && search.trim()) {
            const s = search.trim();
            query.$or = [
                { fullName: { $regex: s, $options: "i" } },
                { name: { $regex: s, $options: "i" } },
                { email: { $regex: s, $options: "i" } },
                { phone: { $regex: s, $options: "i" } },
                { hotelName: { $regex: s, $options: "i" } },
                { operatorName: { $regex: s, $options: "i" } }
            ];
        }

        const usersCol = db.collection("users");
        const allUsers = await usersCol.find(query).sort({ createdAt: -1 }).toArray();

        const [totalCount, travelerCount, hotelCount, transportCount, guideCount, activeCount, suspendedCount] = await Promise.all([
            usersCol.countDocuments({}),
            usersCol.countDocuments({ userType: "traveler" }),
            usersCol.countDocuments({ userType: "hotel" }),
            usersCol.countDocuments({ userType: "transport" }),
            usersCol.countDocuments({ userType: "guide" }),
            usersCol.countDocuments({ isActive: { $ne: false } }),
            usersCol.countDocuments({ isActive: false })
        ]);

        const accounts = allUsers.map(u => ({
            id: u._id.toString(),
            fullName: u.fullName || u.name || "User",
            email: u.email,
            phone: u.phone || "N/A",
            userType: u.userType || "traveler",
            isActive: u.isActive !== false,
            hotelName: u.hotelName || "",
            operatorName: u.operatorName || "",
            district: u.district || "",
            statusReason: u.statusReason || "",
            statusUpdatedAt: u.statusUpdatedAt || null,
            statusUpdatedBy: u.statusUpdatedBy || "",
            createdAt: u.createdAt || new Date()
        }));

        res.json({
            success: true,
            stats: {
                total: totalCount,
                travelers: travelerCount,
                hotels: hotelCount,
                transports: transportCount,
                guides: guideCount,
                active: activeCount,
                suspended: suspendedCount
            },
            accounts
        });
    } catch (err) {
        console.error("Admin get accounts error:", err.message);
        res.status(500).json({ success: false, message: "Unable to load accounts." });
    }
});

// Update Account Status (Deactivate / Reactivate with confirmation & reason)
app.put("/api/admin/accounts/:adminId/:userId/status", async function (req, res) {
    try {
        if (!db) return res.status(503).json({ success: false, message: "Database not connected." });
        const admin = await verifyAdminUser(req.params.adminId);
        if (!admin) return res.status(403).json({ success: false, message: "Admin access required." });

        const { userId } = req.params;
        const { status, reason } = req.body;

        if (!ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: "Invalid user ID." });
        }

        // Prevent admin from deactivating themselves
        if (admin._id.toString() === userId) {
            return res.status(400).json({ success: false, message: "You cannot deactivate your own admin account." });
        }

        const isActivating = status === "active";
        const reasonText = (reason || "").trim() || (isActivating ? "Reactivated by admin" : "Administrative review");

        const updateResult = await db.collection("users").updateOne(
            { _id: new ObjectId(userId) },
            {
                $set: {
                    isActive: isActivating,
                    statusReason: reasonText,
                    statusUpdatedAt: new Date(),
                    statusUpdatedBy: admin.email,
                    isLocked: false,
                    failedLoginAttempts: 0,
                    lockUntil: null
                }
            }
        );

        if (updateResult.matchedCount === 0) {
            return res.status(404).json({ success: false, message: "Account not found." });
        }

        // Insert audit log in security_logs
        await db.collection("security_logs").insertOne({
            action: isActivating ? "account_reactivated" : "account_suspended",
            targetUserId: userId,
            reason: reasonText,
            performedBy: admin.email,
            adminId: admin._id.toString(),
            timestamp: new Date()
        });

        // Insert notification for affected user
        try {
            await db.collection("notifications").insertOne({
                userId: userId,
                title: isActivating ? "Account Reactivated" : "Account Suspended",
                message: isActivating
                    ? "Your account has been reactivated by administrator. You now have full access to Travel Kori Bangladesh services."
                    : `Your account was suspended by administrator. Reason: ${reasonText}`,
                type: "account_status",
                isRead: false,
                read: false,
                createdAt: new Date().toISOString()
            });
        } catch (e) {}

        res.json({
            success: true,
            message: `Account has been ${isActivating ? "reactivated" : "suspended"} successfully.`,
            isActive: isActivating
        });
    } catch (err) {
        console.error("Admin update account status error:", err.message);
        res.status(500).json({ success: false, message: "Unable to update account status." });
    }
});

// ============================================
// SECURITY MONITORING & ALERTS
// ============================================
app.get("/api/admin/security-alerts/:adminId", async function (req, res) {
    try {
        if (!db) return res.status(503).json({ success: false, message: "Database not connected." });
        const admin = await verifyAdminUser(req.params.adminId);
        if (!admin) return res.status(403).json({ success: false, message: "Admin access required." });

        const alerts = await db.collection("notifications")
            .find({ type: "security_alert" })
            .sort({ createdAt: -1 })
            .limit(50)
            .toArray();

        const lockedUsers = await db.collection("users")
            .find({ isLocked: true })
            .project({ password: 0 })
            .toArray();

        res.json({
            success: true,
            alerts: alerts.map(a => ({
                id: a._id.toString(),
                title: a.title,
                message: a.message,
                isRead: a.isRead || a.read || false,
                createdAt: a.createdAt
            })),
            lockedUsers: lockedUsers.map(u => ({
                id: u._id.toString(),
                email: u.email,
                fullName: u.fullName || u.name,
                failedLoginAttempts: u.failedLoginAttempts,
                lockUntil: u.lockUntil
            }))
        });
    } catch (err) {
        console.error("Admin get security alerts error:", err.message);
        res.status(500).json({ success: false, message: "Unable to load security alerts." });
    }
});

app.put("/api/admin/security-alerts/:adminId/:alertId/resolve", async function (req, res) {
    try {
        if (!db) return res.status(503).json({ success: false, message: "Database not connected." });
        const admin = await verifyAdminUser(req.params.adminId);
        if (!admin) return res.status(403).json({ success: false, message: "Admin access required." });

        const { alertId } = req.params;
        if (ObjectId.isValid(alertId)) {
            await db.collection("notifications").updateOne(
                { _id: new ObjectId(alertId) },
                { $set: { isRead: true, read: true, resolvedAt: new Date() } }
            );
        }
        res.json({ success: true, message: "Alert resolved." });
    } catch (err) {
        res.status(500).json({ success: false, message: "Unable to resolve alert." });
    }
});

app.get("/api/admin/security-logs/:adminId", async function (req, res) {
    try {
        if (!db) return res.status(503).json({ success: false, message: "Database not connected." });
        const admin = await verifyAdminUser(req.params.adminId);
        if (!admin) return res.status(403).json({ success: false, message: "Admin access required." });

        const logs = await db.collection("security_logs")
            .find({})
            .sort({ timestamp: -1 })
            .limit(100)
            .toArray();

        res.json({
            success: true,
            logs: logs.map(l => ({
                id: l._id.toString(),
                action: l.action,
                performedBy: l.performedBy || "System",
                targetUserId: l.targetUserId || "",
                reason: l.reason || "",
                timestamp: l.timestamp
            }))
        });
    } catch (err) {
        console.error("Admin security logs error:", err.message);
        res.status(500).json({ success: false, message: "Unable to load security logs." });
    }
});

// =========================
// DEFAULT PARTNER ACCOUNTS SEEDER
// =========================
async function seedDefaultPartnerAccounts() {
    try {
        if (!db) return;
        const users = db.collection("users");

        // 1. Hotel Partner Demo Account
        const hotelEmail = "hotel@travelkori.com";
        const existingHotel = await users.findOne({ email: hotelEmail });
        if (!existingHotel) {
            const hashedPassword = await bcrypt.hash("password123", 10);
            await users.insertOne({
                fullName: "Radisson & Grand Sylhet Hotel Partner",
                email: hotelEmail,
                password: hashedPassword,
                userType: "hotel",
                isActive: true,
                hotelName: "Dhaka Comfort Stay & Partner Hotels",
                district: "Dhaka",
                phone: "+8801711002233",
                address: "Gulshan-2, Dhaka",
                createdAt: new Date(),
                updatedAt: new Date()
            });
            console.log("Default Hotel Partner account created: hotel@travelkori.com / password123");
        }

        // 2. Transport Operator Demo Account
        const transportEmail = "transport@travelkori.com";
        const existingTransport = await users.findOne({ email: transportEmail });
        if (!existingTransport) {
            const hashedPassword = await bcrypt.hash("password123", 10);
            await users.insertOne({
                fullName: "Green Line & Express Transport Partner",
                email: transportEmail,
                password: hashedPassword,
                userType: "transport",
                isActive: true,
                operatorName: "Green Line & Coastal Express",
                transportType: "Bus",
                phone: "+8801711998877",
                routes: "Dhaka - Cox's Bazar - Sylhet - Chittagong",
                createdAt: new Date(),
                updatedAt: new Date()
            });
            console.log("Default Transport Operator account created: transport@travelkori.com / password123");
        }
    } catch (e) {
        console.error("Error seeding partner accounts:", e.message);
    }
}

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

        await seedDefaultPartnerAccounts();

        app.listen(PORT, "0.0.0.0", function () {
            console.log(
                `Server is running at http://0.0.0.0:${PORT} (local: http://localhost:${PORT})`
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