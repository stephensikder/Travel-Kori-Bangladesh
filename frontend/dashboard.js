// API URL
const API_URL = (window.location.origin && window.location.origin !== "null") ? window.location.origin : "";

// Get logged-in user
let user = null;

try {
    user = JSON.parse(
        sessionStorage.getItem("travelKoriUser") || "null"
    );
} catch (error) {
    user = null;
}

// Redirect if user is not logged in
if (!user || !user.id) {
    window.location.replace("login.html");
} else {

    // Display user greeting
    const userNameEl = document.getElementById("userName");
    if (userNameEl) {
        userNameEl.textContent = user.fullName || "Traveler";
    }

    // Wire Navbar "My Profile" Button & Modal
    const navProfileBtn = document.getElementById("navProfileBtn");
    const profileModal = document.getElementById("profileModal");
    const closeProfileModal = document.getElementById("closeProfileModal");
    const cancelModalBtn = document.getElementById("cancelModalBtn");
    const profileEditForm = document.getElementById("profileEditForm");
    const profileMessage = document.getElementById("profileMessage");
    const editFullName = document.getElementById("editFullName");
    const editEmail = document.getElementById("editEmail");

    function openProfileModal() {
        if (!profileModal) return;
        if (editFullName) editFullName.value = user.fullName || user.name || "";
        if (editEmail) editEmail.value = user.email || "";
        if (profileMessage) profileMessage.textContent = "";
        profileModal.hidden = false;
    }

    function closeProfile() {
        if (profileModal) profileModal.hidden = true;
    }

    if (navProfileBtn) navProfileBtn.addEventListener("click", openProfileModal);
    if (closeProfileModal) closeProfileModal.addEventListener("click", closeProfile);
    if (cancelModalBtn) cancelModalBtn.addEventListener("click", closeProfile);

    // Profile Modal Background Click
    if (profileModal) {
        profileModal.addEventListener("click", (e) => {
            if (e.target === profileModal) closeProfile();
        });
    }

    // Save profile changes
    if (profileEditForm) {
        profileEditForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const newName = editFullName.value.trim();
            const newEmail = editEmail.value.trim();

            if (!newName || !newEmail) {
                profileMessage.textContent = "Please enter your name and email.";
                profileMessage.style.color = "#c92a2a";
                return;
            }

            profileMessage.textContent = "Saving profile...";
            profileMessage.style.color = "#087f5b";

            try {
                const response = await fetch(
                    `${API_URL}/api/users/${encodeURIComponent(user.id)}`,
                    {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ fullName: newName, email: newEmail })
                    }
                );

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || "Could not update profile.");
                }

                user.fullName = data.user.fullName;
                user.name = data.user.fullName;
                user.email = data.user.email;
                sessionStorage.setItem("travelKoriUser", JSON.stringify(user));

                if (userNameEl) userNameEl.textContent = user.fullName;
                updateActiveUserBadge();

                profileMessage.textContent = "Profile updated successfully!";
                profileMessage.style.color = "#087f5b";

                setTimeout(closeProfile, 1200);

            } catch (error) {
                console.error("Profile update error:", error);
                profileMessage.textContent = error.message;
                profileMessage.style.color = "#c92a2a";
            }
        });
    }

    // Load favorites, tour bookings, hotel bookings, guide bookings, and notifications
    loadFavorites();
    loadBookings();
    loadHotelBookings();
    loadGuideBookings();
    loadNotifications();
}

// Fallback spots dictionary for favorite cards preview
const DISTRICT_SPOTS_PREVIEW = {
    "Dhaka": ["Lalbagh Fort", "Ahsan Manzil", "Parliament House"],
    "Cox's Bazar": ["Inani Beach", "Himchari Park", "Marine Drive"],
    "Sylhet": ["Ratargul Forest", "Jaflong", "Bichnakandi"],
    "Bandarban": ["Nilgiri Resort", "Nafakhum Falls", "Sajek Valley"],
    "Chattogram": ["Patenga Beach", "Foy's Lake", "Naval Beach"],
    "Rangamati": ["Kaptai Lake", "Hanging Bridge", "Shuvolong Falls"],
    "Khulna": ["Sundarbans", "Karamjal", "Rupsha River"],
    "Barishal": ["Kuakata Beach", "Guava Market", "Durga Sagar"]
};

// Load favorite districts in Ticket-style cards
async function loadFavorites() {
    const favoriteGrid = document.getElementById("favoriteDistricts");
    const favoriteMessage = document.getElementById("favoriteMessage");

    if (!user || !user.id || !favoriteGrid || !favoriteMessage) return;

    favoriteMessage.textContent = "Loading your favorites...";

    try {
        const response = await fetch(`${API_URL}/api/favorites/${encodeURIComponent(user.id)}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Could not load favorites.");
        }

        const favorites = Array.isArray(data.favorites) ? data.favorites : [];
        favoriteGrid.replaceChildren();

        if (favorites.length === 0) {
            favoriteMessage.textContent = "You have not saved any favorite districts yet. Explore districts on the homepage to add some!";
            return;
        }

        favorites.forEach(function (district) {
            const spots = DISTRICT_SPOTS_PREVIEW[district] || [`${district} Heritage Park`, `${district} Scenic Riverfront`, `${district} Central Plaza`];
            const card = document.createElement("article");
            card.className = "dashboard-ticket-card modern-fav-ticket-card";
            card.innerHTML = `
                <div class="ticket-header" style="display:flex; justify-content:space-between; align-items:center;">
                    <span class="card-division-badge" style="font-size:11px; padding:3px 10px;">⭐ SAVED DESTINATION</span>
                    <span class="ticket-badge confirmed" style="border-radius:20px; font-size:11px; font-weight:700;">Active</span>
                </div>
                <div class="ticket-body" style="padding:14px 0 10px;">
                    <h3 style="font-size:20px; font-weight:800; color:#0f172a; margin:0 0 8px; font-family:'Outfit',sans-serif;">
                        📍 ${district}
                    </h3>
                    <p style="font-size:11px; font-weight:700; color:#64748b; margin:0 0 8px; text-transform:uppercase; letter-spacing:0.5px;">Top Popular Attractions:</p>
                    <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:14px;">
                        ${spots.map(s => `<span class="spot-pill-tag" style="font-size:11px; padding:3px 8px;"><span class="tag-bullet"></span>${s}</span>`).join("")}
                    </div>
                </div>
                <div class="ticket-footer" style="display:flex; justify-content:space-between; align-items:center; gap:10px; border-top:1px dashed #e2e8f0; padding-top:12px;">
                    <a href="booking.html?district=${encodeURIComponent(district)}" class="modern-explore-btn details-btn" style="text-decoration:none; padding:8px 16px; font-size:12.5px; border-radius:10px; width:auto; margin:0;">Book Trip →</a>
                    <button type="button" class="remove-fav-btn" style="background:#fff1f2; color:#e11d48; border:1px solid #fecdd3; padding:7px 14px; border-radius:20px; cursor:pointer; font-size:12px; font-weight:700; transition:0.2s;">Remove</button>
                </div>
            `;

            card.querySelector(".remove-fav-btn").addEventListener("click", () => {
                removeFavorite(district);
            });

            favoriteGrid.appendChild(card);
        });

        favoriteMessage.textContent = `You have saved ${favorites.length} favorite district(s).`;

    } catch (error) {
        console.error("Favorites error:", error);
        favoriteMessage.textContent = "Could not load favorites. Check the backend server.";
    }
}

// Remove a favorite district
async function removeFavorite(district) {
    const favoriteMessage = document.getElementById("favoriteMessage");

    try {
        const response = await fetch(
            `${API_URL}/api/favorites/${encodeURIComponent(user.id)}/${encodeURIComponent(district)}`,
            { method: "DELETE" }
        );

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Could not remove favorite.");
        }

        await loadFavorites();
    } catch (error) {
        console.error("Remove favorite error:", error);
        if (favoriteMessage) favoriteMessage.textContent = "Could not remove this favorite. Please try again.";
    }
}

// Load Tour Bookings in Ticket-style Cards
async function loadBookings() {
    const bookingsGrid = document.getElementById("myBookings");
    const bookingListMessage = document.getElementById("bookingListMessage");

    if (!user || !user.id || !bookingsGrid || !bookingListMessage) return;

    bookingListMessage.textContent = "Loading your tour bookings...";

    try {
        const response = await fetch(`${API_URL}/api/bookings/${encodeURIComponent(user.id)}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Could not load bookings.");
        }

        const bookings = (Array.isArray(data.bookings) ? data.bookings : []).filter(b => b.type !== "tourguide");
        bookingsGrid.replaceChildren();

        if (bookings.length === 0) {
            bookingListMessage.textContent = "You have no tour bookings yet. Click below to book your next trip!";
            return;
        }

        bookings.forEach(function (booking) {
            const card = document.createElement("article");
            card.className = "dashboard-ticket-card";

            const paymentMethodLabel = {
                bkash: "bKash (Demo)",
                nagad: "Nagad (Demo)",
                card: "Card (Demo)",
                cash: "Cash on Arrival"
            }[(booking.paymentMethod || "").toLowerCase()] || (booking.paymentMethod || "Cash");

            const statusClass = (booking.status || "").toLowerCase() === "confirmed" ? "confirmed" : "pending";

            card.innerHTML = `
                <div class="ticket-header">
                    <span class="ticket-type">📍 Tour Destination Booking</span>
                    <span class="ticket-badge ${statusClass}">${booking.status || "Pending"}</span>
                </div>
                <div class="ticket-body">
                    <div class="ticket-route">
                        <span>${booking.touristSpot || "Tourist Spot"}</span>
                    </div>
                    <div class="ticket-details-grid">
                        <div class="ticket-meta-item">
                            <span class="meta-label">District</span>
                            <span class="meta-value">${booking.district || "Bangladesh"}</span>
                        </div>
                        <div class="ticket-meta-item">
                            <span class="meta-label">Visit Date</span>
                            <span class="meta-value">📅 ${booking.visitDate || "TBD"}</span>
                        </div>
                        <div class="ticket-meta-item">
                            <span class="meta-label">Visitors</span>
                            <span class="meta-value">👥 ${booking.people || 1} Person(s)</span>
                        </div>
                        <div class="ticket-meta-item">
                            <span class="meta-label">Payment Method</span>
                            <span class="meta-value">💳 ${paymentMethodLabel}</span>
                        </div>
                    </div>
                </div>
                <div class="ticket-footer">
                    <div class="ticket-price">
                        ${booking.transactionReference ? `<small style="font-size:11px; color:#62766d;">Ref: ${booking.transactionReference}</small>` : `<small style="font-size:11px; color:#62766d;">Pay status: ${booking.paymentStatus || 'Pending'}</small>`}
                    </div>
                    <div class="ticket-actions">
                        <a href="district-details.html?district=${encodeURIComponent(booking.district || '')}" class="ticket-action-btn">View Destination →</a>
                    </div>
                </div>
            `;

            bookingsGrid.appendChild(card);
        });

        bookingListMessage.textContent = `You have ${bookings.length} tour booking request(s).`;

    } catch (error) {
        console.error("Bookings error:", error);
        bookingListMessage.textContent = "Could not load tour bookings. Check the backend server.";
    }
}

// Load Hotel Bookings in Ticket-style Cards
async function loadHotelBookings() {
    const grid = document.getElementById("myHotelBookings");
    const message = document.getElementById("hotelBookingsMessage");

    if (!grid || !message || !user || !user.id) return;

    message.textContent = "Loading your hotel bookings...";

    try {
        const response = await fetch(`${API_URL}/api/hotel-bookings/${encodeURIComponent(user.id)}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Could not load hotel bookings.");
        }

        grid.replaceChildren();
        const bookings = Array.isArray(data.bookings) ? data.bookings : [];

        if (bookings.length === 0) {
            message.textContent = "You have no hotel bookings yet. Reserve a comfortable stay for your trip!";
            return;
        }

        bookings.forEach(function (booking) {
            const card = document.createElement("article");
            card.className = "dashboard-ticket-card";

            const paymentMethodLabel = {
                bkash: "bKash (Demo)",
                nagad: "Nagad (Demo)",
                card: "Card (Demo)",
                cash: "Pay at Front Desk"
            }[(booking.paymentMethod || "").toLowerCase()] || (booking.paymentMethod || "Pay at Hotel");

            const statusClass = (booking.status || "").toLowerCase() === "confirmed" ? "confirmed" : "pending";

            card.innerHTML = `
                <div class="ticket-header">
                    <span class="ticket-type">🏨 Hotel Reservation</span>
                    <span class="ticket-badge ${statusClass}">${booking.status || "Pending"}</span>
                </div>
                <div class="ticket-body">
                    <div class="ticket-route">
                        <span>${booking.hotelName || "Hotel Stay"}</span>
                    </div>
                    <div class="ticket-details-grid">
                        <div class="ticket-meta-item">
                            <span class="meta-label">District</span>
                            <span class="meta-value">📍 ${booking.district || "Bangladesh"}</span>
                        </div>
                        <div class="ticket-meta-item">
                            <span class="meta-label">Duration</span>
                            <span class="meta-value">📅 ${booking.checkIn} → ${booking.checkOut} (${booking.nights || 1} nights)</span>
                        </div>
                        <div class="ticket-meta-item">
                            <span class="meta-label">Room & Guests</span>
                            <span class="meta-value">🛏️ ${booking.roomType} (${booking.rooms} room, ${booking.guests} guests)</span>
                        </div>
                        <div class="ticket-meta-item">
                            <span class="meta-label">Payment</span>
                            <span class="meta-value">💳 ${paymentMethodLabel}</span>
                        </div>
                    </div>
                </div>
                <div class="ticket-footer">
                    <div class="ticket-price">
                        <span class="price-amount">৳${Number(booking.totalPrice || 0).toLocaleString("en-BD")}</span>
                        <small style="display:block; font-size:11px; color:#62766d;">Ref: ${booking.reference || 'N/A'}</small>
                    </div>
                    <div class="ticket-actions" style="display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
                        <button type="button" class="btn-download-pdf dl-hotel-pdf-btn" style="padding:6px 12px; font-size:11px;">
                            📥 Download Voucher (PDF)
                        </button>
                        <a href="hotel-booking.html?district=${encodeURIComponent(booking.district || '')}&hotel=${encodeURIComponent(booking.hotelName || '')}" class="ticket-action-btn">Hotel Details →</a>
                    </div>
                </div>
            `;

            const pdfBtn = card.querySelector(".dl-hotel-pdf-btn");
            if (pdfBtn) {
                pdfBtn.addEventListener("click", function() {
                    if (typeof downloadHotelVoucher === "function") {
                        downloadHotelVoucher(booking);
                    } else {
                        alert("PDF generator loading, please try again in a moment.");
                    }
                });
            }

            grid.appendChild(card);
        });

        message.textContent = `You have ${bookings.length} hotel booking reservation(s).`;

    } catch (error) {
        console.error("Hotel bookings error:", error);
        message.textContent = "Could not load hotel bookings. Check the backend server.";
    }
}

// Logout
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
        sessionStorage.removeItem("travelKoriUser");
        window.location.href = "login.html";
    });
}

/* =========================================
   MY TOUR GUIDE BOOKINGS & REVIEWS (FR-48 to FR-56)
========================================= */

async function loadGuideBookings() {
    const grid = document.getElementById("myGuideBookings");
    const message = document.getElementById("guideBookingsMessage");
    if (!grid || !message) return;

    const user = (() => {
        try { return JSON.parse(sessionStorage.getItem("travelKoriUser") || "null"); } catch { return null; }
    })();

    if (!user || !user.id) {
        message.textContent = "Please log in to view your tour guide bookings.";
        return;
    }

    try {
        const response = await fetch(`/api/bookings/${user.id}`);
        const data = await response.json();

        if (!response.ok) throw new Error(data.message || "Failed to load bookings.");

        const guideBookings = (data.bookings || []).filter(b => b.type === "tourguide");

        if (guideBookings.length === 0) {
            grid.innerHTML = "";
            message.innerHTML = `You have no tour guide bookings yet. <a href="guides.html" style="color:#087f5b; font-weight:700;">Find a verified local guide →</a>`;
            return;
        }

        grid.innerHTML = guideBookings.map(b => {
            const status = b.status || "Pending";
            let statusBadgeClass = "status-pending";
            let statusBadgeColor = "#fef3c7; color:#92400e";

            if (status === "Confirmed") {
                statusBadgeColor = "#e6f7f0; color:#087f5b";
            } else if (status === "Completed") {
                statusBadgeColor = "#e0f2fe; color:#0369a1";
            } else if (status === "Rejected" || status === "Cancelled") {
                statusBadgeColor = "#fee2e2; color:#b91c1c";
            }

            const totalAmount = Number(b.totalAmount || (b.days || 1) * (b.dailyRate || 2000)).toLocaleString("en-BD");
            const canRate = (status === "Confirmed" || status === "Completed");

            return `
                <article class="ticket-card" style="background:white; border:1px solid #e2e8f0; border-radius:14px; padding:18px; box-shadow:0 4px 15px rgba(0,0,0,0.03);">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                        <span style="font-family:monospace; font-weight:700; font-size:12px; color:#087f5b;">Ref: ${b.reference}</span>
                        <span style="padding:3px 10px; border-radius:20px; font-size:11px; font-weight:700; text-transform:uppercase; background:${statusBadgeColor};">
                            ${status}
                        </span>
                    </div>

                    <h3 style="margin:0 0 4px; font-size:17px; color:#17382f;">🧭 ${b.guideName}</h3>
                    <p style="margin:0 0 10px; font-size:13px; color:#62766d;">
                        📍 Destination: <strong>${b.destination}</strong>
                    </p>

                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px 12px; font-size:12px; color:#475569; margin-bottom:14px; padding:10px 0; border-top:1px dashed #e2e8f0; border-bottom:1px dashed #e2e8f0;">
                        <div>Tour Date: <strong>${b.tourDate}</strong></div>
                        <div>Duration: <strong>${b.days || 1} Day(s)</strong></div>
                        <div>Guest: <strong>${b.guestName || user.fullName}</strong></div>
                        <div>Total Fare: <strong style="color:#087f5b;">৳${totalAmount} BDT</strong></div>
                        <div>Payment: <strong>${(b.paymentMethod || 'cash').toUpperCase()} (${b.paymentStatus || 'Demo Paid'})</strong></div>
                    </div>

                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                        ${canRate ? `
                            <button type="button" class="btn-rate-guide signup-btn" data-guide-id="${b.guideId || ''}" data-guide-name="${b.guideName}" data-booking-ref="${b.reference}" style="padding:7px 14px; font-size:12px; border-radius:7px;">
                                ⭐ Rate & Review Guide
                            </button>
                        ` : `
                            <span style="font-size:11px; color:#64748b;">Awaiting guide response</span>
                        `}
                        <a href="guides.html" style="font-size:12px; color:#087f5b; text-decoration:underline; font-weight:600;">All Guides →</a>
                    </div>
                </article>
            `;
        }).join("");

        message.textContent = `You have ${guideBookings.length} tour guide reservation(s).`;

        // Wire Rate Guide buttons
        grid.querySelectorAll(".btn-rate-guide").forEach(btn => {
            btn.addEventListener("click", function () {
                const guideId = this.getAttribute("data-guide-id");
                const guideName = this.getAttribute("data-guide-name");
                const bookingRef = this.getAttribute("data-booking-ref");
                openGuideRatingModal(guideId, guideName, bookingRef);
            });
        });

    } catch (err) {
        console.error("Guide bookings error:", err);
        message.textContent = "Could not load tour guide bookings right now.";
    }
}

// Rating Modal Logic
const ratingModal = document.getElementById("guideRatingModal");
const closeRatingModalBtn = document.getElementById("closeRatingModalBtn");
const cancelReviewBtn = document.getElementById("cancelReviewBtn");
const guideReviewForm = document.getElementById("guideReviewForm");
const reviewGuideIdInput = document.getElementById("reviewGuideId");
const reviewBookingRefInput = document.getElementById("reviewBookingRef");
const ratingModalSubtitle = document.getElementById("ratingModalSubtitle");
const reviewStarRating = document.getElementById("reviewStarRating");
const reviewCommentText = document.getElementById("reviewCommentText");
const reviewSubmitMsg = document.getElementById("reviewSubmitMsg");
const submitReviewBtn = document.getElementById("submitReviewBtn");

function openGuideRatingModal(guideId, guideName, bookingRef) {
    if (!ratingModal) return;
    reviewGuideIdInput.value = guideId;
    reviewBookingRefInput.value = bookingRef;
    ratingModalSubtitle.innerHTML = `Rate your tour experience with <strong>${guideName}</strong> (Ref: ${bookingRef}).`;
    reviewSubmitMsg.textContent = "";
    guideReviewForm.reset();
    ratingModal.hidden = false;
}

if (closeRatingModalBtn) closeRatingModalBtn.addEventListener("click", () => { ratingModal.hidden = true; });
if (cancelReviewBtn) cancelReviewBtn.addEventListener("click", () => { ratingModal.hidden = true; });

if (guideReviewForm) {
    guideReviewForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        const user = (() => {
            try { return JSON.parse(sessionStorage.getItem("travelKoriUser") || "null"); } catch { return null; }
        })();

        if (!user || !user.id) {
            reviewSubmitMsg.textContent = "Please log in to submit a review.";
            reviewSubmitMsg.style.color = "red";
            return;
        }

        submitReviewBtn.disabled = true;
        submitReviewBtn.textContent = "Submitting Review...";
        reviewSubmitMsg.textContent = "";

        try {
            const res = await fetch("/api/guide-reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user.id,
                    guideId: reviewGuideIdInput.value,
                    bookingReference: reviewBookingRefInput.value,
                    rating: parseInt(reviewStarRating.value, 10),
                    comment: reviewCommentText.value.trim()
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to submit review.");

            reviewSubmitMsg.innerHTML = `<span style="color:#087f5b; font-weight:700;">✅ ${data.message}</span>`;
            setTimeout(() => {
                ratingModal.hidden = true;
                loadGuideBookings();
            }, 1200);

        } catch (err) {
            console.error("Review submit error:", err);
            reviewSubmitMsg.textContent = `❌ ${err.message}`;
            reviewSubmitMsg.style.color = "red";
        } finally {
            submitReviewBtn.disabled = false;
            submitReviewBtn.textContent = "Submit Review";
        }
    });
}


/* =========================================
   MY TRANSPORT TICKETS
   Bus + Train + Flight
========================================= */

(function initTransportDashboard() {
    const API_URL = (window.location.origin && window.location.origin !== "null") ? window.location.origin : "";

    const container = document.getElementById("myTransportBookings");
    const message = document.getElementById("transportBookingsMessage");
    const filter = document.getElementById("transportTypeFilter");

    const busCount = document.getElementById("busTicketCount");
    const trainCount = document.getElementById("trainTicketCount");
    const flightCount = document.getElementById("flightTicketCount");

    // This section may not exist on other pages.
    if (!container || !message) return;

    let transportBookings = [];

    const user = (() => {
        try {
            return JSON.parse(sessionStorage.getItem("travelKoriUser") || "null");
        } catch {
            return null;
        }
    })();

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]);
    }

    function formatDate(value) {
        if (!value) return "Not specified";

        // Avoid timezone shifts for YYYY-MM-DD dates.
        const dateString = String(value);

        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            const [year, month, day] = dateString.split("-").map(Number);
            return new Date(year, month - 1, day).toLocaleDateString("en-BD", {
                day: "numeric",
                month: "short",
                year: "numeric"
            });
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return escapeHTML(dateString);
        }

        return date.toLocaleDateString("en-BD", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    }

    function formatMoney(amount) {
        const number = Number(amount);

        if (!Number.isFinite(number)) return "Not available";

        return "৳" + number.toLocaleString("en-BD");
    }

    function normalizeType(booking) {
        const type = String(
            booking.transportType || booking.type || ""
        ).toLowerCase();

        if (type.includes("bus")) return "Bus";
        if (type.includes("train")) return "Train";
        if (type.includes("flight") || type.includes("plane")) return "Flight";

        return "Transport";
    }

    function typeIcon(type) {
        return {
            Bus: "🚌",
            Train: "🚆",
            Flight: "✈️"
        }[type] || "🎫";
    }

    function statusClass(status) {
        const value = String(status || "Pending").toLowerCase();

        if (value.includes("confirm")) return "confirmed";
        if (value.includes("cancel")) return "cancelled";
        if (value.includes("complete")) return "completed";

        return "pending";
    }

    function updateSummary() {
        if (busCount) {
            busCount.textContent = transportBookings.filter(
                booking => normalizeType(booking) === "Bus"
            ).length;
        }

        if (trainCount) {
            trainCount.textContent = transportBookings.filter(
                booking => normalizeType(booking) === "Train"
            ).length;
        }

        if (flightCount) {
            flightCount.textContent = transportBookings.filter(
                booking => normalizeType(booking) === "Flight"
            ).length;
        }
    }

    function renderBookings() {
        const selectedType = filter ? filter.value : "all";

        const visibleBookings = transportBookings.filter(booking => {
            return selectedType === "all" ||
                normalizeType(booking) === selectedType;
        });

        if (visibleBookings.length === 0) {
            container.innerHTML = "";
            message.className = "transport-empty-state";

            if (transportBookings.length === 0) {
                message.innerHTML = `
                    <div class="transport-empty-icon">🎫</div>
                    <h3>No transport tickets yet</h3>
                    <p>Your bus, train and flight bookings will appear here.</p>
                    <a href="transport.html" class="signup-btn">
                        Find a Journey
                    </a>
                `;
            } else {
                message.textContent =
                    "No " + selectedType.toLowerCase() +
                    " tickets found. Try another filter.";
            }

            return;
        }

        message.textContent = "";
        message.className = "";

        container.innerHTML = visibleBookings.map((booking, index) => {
            const type = normalizeType(booking);
            const status = booking.status || "Pending";

            const from = booking.from || "Departure";
            const to = booking.to || "Destination";

            const reference = booking.reference ||
                booking.bookingReference ||
                booking.id ||
                "Not available";

            const journeyDate = booking.journeyDate ||
                booking.travelDate ||
                booking.date;

            const passengers = booking.passengers ??
                booking.numberOfPassengers ??
                1;

            const seatNumbers = Array.isArray(booking.seatNumbers)
                ? booking.seatNumbers.join(", ")
                : (booking.seatNumbers || booking.seats || "");

            const operator = booking.operator || type + " service";

            const total = booking.totalPrice ??
                booking.totalFare ??
                booking.amount;

            return `
                <article class="transport-ticket-card">
                    <div class="transport-ticket-top">
                        <div class="transport-operator">
                            <span class="transport-ticket-icon">
                                ${typeIcon(type)}
                            </span>

                            <div>
                                <span class="transport-type-label">
                                    ${escapeHTML(type)} TICKET
                                </span>

                                <h3>${escapeHTML(operator)}</h3>
                            </div>
                        </div>

                        <span class="transport-status ${statusClass(status)}">
                            ${escapeHTML(status)}
                        </span>
                    </div>

                    <div class="transport-route">
                        <div class="transport-route-point">
                            <span>FROM</span>
                            <strong>${escapeHTML(from)}</strong>
                        </div>

                        <div class="transport-route-line">
                            <span>→</span>
                        </div>

                        <div class="transport-route-point destination">
                            <span>TO</span>
                            <strong>${escapeHTML(to)}</strong>
                        </div>
                    </div>

                    <div class="transport-ticket-details">
                        <div>
                            <span>Journey date</span>
                            <strong>${formatDate(journeyDate)}</strong>
                        </div>

                        <div>
                            <span>Passengers</span>
                            <strong>${escapeHTML(passengers)}</strong>
                        </div>

                        <div>
                            <span>Booking reference</span>
                            <strong class="ticket-reference">
                                ${escapeHTML(reference)}
                            </strong>
                        </div>

                        ${seatNumbers ? `
                            <div>
                                <span>Seat number(s)</span>
                                <strong>${escapeHTML(seatNumbers)}</strong>
                            </div>
                        ` : ""}
                    </div>

                    <div class="transport-ticket-footer" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                        <div>
                            <span>Total fare</span>
                            <strong class="transport-total">
                                ${formatMoney(total)}
                            </strong>
                        </div>

                        <button type="button" class="btn-download-pdf dl-transport-pdf-btn" data-index="${index}" style="padding:6px 14px; font-size:12px;">
                            📥 Download Ticket (PDF)
                        </button>
                    </div>
                </article>
            `;
        }).join("");

        // Attach PDF download handlers
        container.querySelectorAll(".dl-transport-pdf-btn").forEach(btn => {
            btn.addEventListener("click", function() {
                const idx = parseInt(this.getAttribute("data-index"), 10);
                const b = visibleBookings[idx];
                if (b && typeof downloadTransportTicket === "function") {
                    downloadTransportTicket(b);
                } else {
                    alert("Ticket PDF module is initializing. Please try again.");
                }
            });
        });
    }

    async function loadTransportBookings() {
        if (!user || !user.id) {
            message.className = "transport-empty-state";
            message.textContent = "Please log in to view your transport tickets.";
            return;
        }

        message.className = "";
        message.textContent = "Loading your transport tickets...";

        try {
            const response = await fetch(
                `${API_URL}/api/transport-bookings/${encodeURIComponent(user.id)}`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to load transport tickets."
                );
            }

            transportBookings = Array.isArray(data.bookings)
                ? data.bookings
                : [];

            updateSummary();
            renderBookings();

        } catch (error) {
            console.error("Transport dashboard error:", error);

            message.className = "transport-empty-state";
            message.textContent =
                error.message === "Failed to fetch"
                    ? "Cannot connect to the backend. Make sure node server.js is running."
                    : error.message;
        }
    }

    if (filter) {
        filter.addEventListener("change", renderBookings);
    }

    loadTransportBookings();
})();

// ============================================
// NOTIFICATIONS (FR-61, FR-62)
// ============================================

async function loadNotifications() {
    const listEl = document.getElementById("notificationsList");
    const msgEl = document.getElementById("notificationsMessage");
    const markAllBtn = document.getElementById("markAllNotificationsReadBtn");

    const user = (() => {
        try {
            return JSON.parse(sessionStorage.getItem("travelKoriUser") || "null");
        } catch {
            return null;
        }
    })();

    if (!listEl || !msgEl || !user || !user.id) return;

    try {
        const res = await fetch(`/api/notifications/${encodeURIComponent(user.id)}`);
        const data = await res.json();

        if (data.success && Array.isArray(data.notifications)) {
            const notifications = data.notifications;
            if (notifications.length === 0) {
                msgEl.textContent = "No notifications yet. You will receive real-time notifications when you book hotels or transport.";
                listEl.innerHTML = "";
                return;
            }

            msgEl.textContent = `${notifications.length} notification(s) found.`;
            listEl.innerHTML = notifications.map(n => `
                <div style="padding:14px 18px; background:${n.read ? '#f8fafc' : '#f0fdf4'}; border:1px solid ${n.read ? '#e2e8f0' : '#86efac'}; border-radius:10px; display:flex; justify-content:space-between; align-items:center; gap:12px;">
                    <div>
                        <div style="font-weight:700; font-size:14px; color:${n.read ? '#334155' : '#087f5b'}; margin-bottom:4px;">
                            ${n.read ? '✉️' : '📩 <span style="background:#087f5b; color:white; font-size:10px; padding:2px 6px; border-radius:10px; margin-right:4px;">NEW</span>'} ${escapeText(n.title)}
                        </div>
                        <div style="font-size:13px; color:#475569; margin-bottom:4px;">${escapeText(n.message)}</div>
                        <small style="font-size:11px; color:#94a3b8;">${new Date(n.createdAt).toLocaleString()}</small>
                    </div>
                    ${!n.read ? `
                        <button type="button" class="mark-notif-btn" data-id="${n._id}" style="padding:5px 12px; background:#087f5b; color:white; border:none; border-radius:6px; font-size:12px; font-weight:600; cursor:pointer; white-space:nowrap;">
                            Mark Read
                        </button>
                    ` : '<span style="font-size:12px; color:#94a3b8;">Read</span>'}
                </div>
            `).join("");

            listEl.querySelectorAll(".mark-notif-btn").forEach(b => {
                b.addEventListener("click", async function() {
                    const id = this.getAttribute("data-id");
                    await markNotificationRead(id);
                });
            });

            if (markAllBtn) {
                markAllBtn.onclick = async function() {
                    for (const n of notifications.filter(x => !x.read)) {
                        await fetch(`/api/notifications/${n._id}/read`, { method: "PUT" });
                    }
                    loadNotifications();
                };
            }
        }
    } catch (err) {
        console.error("Notifications error:", err);
        msgEl.textContent = "Could not load notifications right now.";
    }
}

async function markNotificationRead(id) {
    try {
        const res = await fetch(`/api/notifications/${id}/read`, { method: "PUT" });
        const data = await res.json();
        if (data.success) {
            loadNotifications();
        }
    } catch (err) {
        console.error("Error marking notification read:", err);
    }
}

function escapeText(str) {
    return String(str || "").replace(/[&<>"']/g, c => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[c]);
}

// ============================================
// TOUR GUIDE BOOKINGS & REAL RATING SYSTEM
// ============================================

let allVerifiedGuides = [];

async function loadGuideBookings() {
    const grid = document.getElementById("myGuideBookings");
    const msg = document.getElementById("guideBookingsMessage");

    const currentUser = (() => {
        try {
            return JSON.parse(sessionStorage.getItem("travelKoriUser") || "null");
        } catch {
            return null;
        }
    })();

    if (!grid || !msg || !currentUser || !currentUser.id) return;

    msg.textContent = "Loading your tour guide bookings...";

    try {
        const res = await fetch(`${API_URL}/api/tourguide-bookings/user/${encodeURIComponent(currentUser.id)}`);
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Failed to load guide bookings.");
        }

        const bookings = Array.isArray(data.bookings) ? data.bookings : [];
        grid.replaceChildren();

        if (bookings.length === 0) {
            msg.textContent = "You haven't booked any tour guides yet. Click '+ Book a Guide' to hire verified local experts across Bangladesh, or click '⭐ Rate a Tour Guide' to review a guide you've traveled with!";
            return;
        }

        msg.textContent = `You have ${bookings.length} tour guide reservation(s).`;

        bookings.forEach(function (b) {
            const card = document.createElement("article");
            card.className = "dashboard-ticket-card";

            const status = b.status || "Pending";
            const statusClass = status.toLowerCase() === "confirmed" ? "confirmed" : (status.toLowerCase() === "completed" ? "confirmed" : "pending");
            const isReviewed = Boolean(b.isReviewed);
            const userRating = b.review ? b.review.rating : null;

            card.innerHTML = `
                <div class="ticket-header" style="background:#f0fdf4; border-bottom:1px solid #bbf7d0;">
                    <span class="ticket-type" style="color:#166534; font-weight:700;">🧭 Tour Guide Booking</span>
                    <span class="ticket-badge ${statusClass}">${escapeText(status)}</span>
                </div>
                <div class="ticket-body">
                    <div class="ticket-route" style="margin-bottom:12px;">
                        <span style="font-size:18px; font-weight:800; color:#123c35;">👤 ${escapeText(b.guideName || 'Tour Guide')}</span>
                    </div>
                    <div class="ticket-details-grid">
                        <div class="ticket-meta-item">
                            <span class="meta-label">Destination</span>
                            <span class="meta-value">📍 ${escapeText(b.destination || 'Bangladesh')}</span>
                        </div>
                        <div class="ticket-meta-item">
                            <span class="meta-label">Tour Date</span>
                            <span class="meta-value">📅 ${escapeText(b.tourDate || 'TBD')}</span>
                        </div>
                        <div class="ticket-meta-item">
                            <span class="meta-label">Tour Duration</span>
                            <span class="meta-value">⏳ ${b.days || 1} Day(s)</span>
                        </div>
                        <div class="ticket-meta-item">
                            <span class="meta-label">Total Fare</span>
                            <span class="meta-value" style="color:#087f5b; font-weight:800;">৳${Number(b.totalAmount || 0).toLocaleString('en-BD')} BDT</span>
                        </div>
                    </div>
                    ${isReviewed ? `
                        <div style="margin-top:12px; padding:10px 12px; background:#fefce8; border:1px solid #fef08a; border-radius:8px; font-size:12px; color:#854d0e;">
                            <strong>Your Rating:</strong> ${'⭐'.repeat(userRating || 5)} (${userRating}/5 Stars)<br>
                            <em>"${escapeText(b.review.comment || '')}"</em>
                        </div>
                    ` : ''}
                </div>
                <div class="ticket-footer" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                    <div class="ticket-price">
                        <small style="font-size:11px; color:#62766d;">Ref: <strong>${escapeText(b.reference || 'N/A')}</strong></small>
                    </div>
                    <div class="ticket-actions" style="display:flex; gap:8px;">
                        ${isReviewed ? `
                            <button type="button" class="btn-rate-guide edit-review-btn" data-guide-id="${escapeText(b.guideId || '')}" data-guide-name="${escapeText(b.guideName || '')}" data-ref="${escapeText(b.reference || '')}" data-rating="${userRating || 5}" data-comment="${escapeText(b.review.comment || '')}" style="padding:6px 12px; background:#f1f5f9; color:#334155; border:1px solid #cbd5e1; border-radius:6px; font-size:12px; font-weight:700; cursor:pointer;">
                                ✏️ Edit Rating & Review
                            </button>
                        ` : `
                            <button type="button" class="btn-rate-guide new-review-btn" data-guide-id="${escapeText(b.guideId || '')}" data-guide-name="${escapeText(b.guideName || '')}" data-ref="${escapeText(b.reference || '')}" style="padding:6px 14px; background:#087f5b; color:white; border:none; border-radius:6px; font-size:12px; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:5px;">
                                ⭐ Rate & Review Guide
                            </button>
                        `}
                    </div>
                </div>
            `;

            grid.appendChild(card);
        });

        // Attach review button listeners
        grid.querySelectorAll(".btn-rate-guide").forEach(btn => {
            btn.addEventListener("click", function () {
                const guideId = this.getAttribute("data-guide-id");
                const guideName = this.getAttribute("data-guide-name");
                const ref = this.getAttribute("data-ref");
                const existingRating = this.getAttribute("data-rating");
                const existingComment = this.getAttribute("data-comment");
                openGuideReviewModal(guideId, guideName, ref, existingRating, existingComment);
            });
        });

    } catch (err) {
        console.error("Load guide bookings error:", err);
        msg.textContent = "Could not load tour guide reservations at this time.";
    }
}

async function loadMyGuideReviews() {
    const listEl = document.getElementById("myGuideReviewsList");
    const msgEl = document.getElementById("myGuideReviewsMessage");
    const badgeEl = document.getElementById("myReviewsCountBadge");

    const currentUser = (() => {
        try {
            return JSON.parse(sessionStorage.getItem("travelKoriUser") || "null");
        } catch {
            return null;
        }
    })();

    if (!listEl || !msgEl || !currentUser || !currentUser.id) return;

    try {
        const res = await fetch(`${API_URL}/api/my-guide-reviews/${encodeURIComponent(currentUser.id)}`);
        const data = await res.json();

        if (data.success && Array.isArray(data.reviews)) {
            const revs = data.reviews;
            if (badgeEl) badgeEl.textContent = `${revs.length} Review(s)`;

            if (revs.length === 0) {
                msgEl.textContent = "You haven't written any tour guide reviews yet. Click '⭐ Rate a Tour Guide' above to share your travel feedback!";
                listEl.replaceChildren();
                return;
            }

            msgEl.textContent = "";
            listEl.innerHTML = revs.map(r => `
                <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:16px; box-shadow:0 2px 8px rgba(0,0,0,0.04); display:flex; flex-direction:column; justify-content:space-between;">
                    <div>
                        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
                            <div>
                                <strong style="font-size:15px; color:#123c35;">👤 ${escapeText(r.guideName)}</strong>
                                ${r.guideSpecialization ? `<div style="font-size:11px; color:#64748b;">📍 ${escapeText(r.guideSpecialization)}</div>` : ''}
                            </div>
                            <span style="font-size:14px; color:#f59e0b; font-weight:700;">
                                ${'★'.repeat(r.rating || 5)}${'☆'.repeat(5 - (r.rating || 5))}
                            </span>
                        </div>
                        <p style="font-size:13px; color:#334155; margin:8px 0; line-height:1.5; font-style:italic;">
                            "${escapeText(r.comment || '')}"
                        </p>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:12px; padding-top:10px; border-top:1px dashed #e2e8f0; font-size:11px; color:#94a3b8;">
                        <span>📅 ${new Date(r.createdAt).toLocaleDateString()}</span>
                        <button type="button" class="edit-my-review-btn" data-guide-id="${escapeText(r.guideId)}" data-guide-name="${escapeText(r.guideName)}" data-ref="${escapeText(r.bookingReference || '')}" data-rating="${r.rating}" data-comment="${escapeText(r.comment || '')}" style="background:none; border:none; color:#087f5b; font-weight:700; cursor:pointer; font-size:12px;">
                            ✏️ Edit
                        </button>
                    </div>
                </div>
            `).join("");

            listEl.querySelectorAll(".edit-my-review-btn").forEach(btn => {
                btn.addEventListener("click", function () {
                    const guideId = this.getAttribute("data-guide-id");
                    const guideName = this.getAttribute("data-guide-name");
                    const ref = this.getAttribute("data-ref");
                    const rating = this.getAttribute("data-rating");
                    const comment = this.getAttribute("data-comment");
                    openGuideReviewModal(guideId, guideName, ref, rating, comment);
                });
            });
        }
    } catch (err) {
        console.error("Load my guide reviews error:", err);
        msgEl.textContent = "Could not load your reviews right now.";
    }
}

// Open Guide Review Modal
async function openGuideReviewModal(guideId, guideName, bookingRef, initialRating, initialComment) {
    const modal = document.getElementById("guideRatingModal");
    const guideIdInput = document.getElementById("reviewGuideId");
    const bookingRefInput = document.getElementById("reviewBookingRef");
    const guideSelectRow = document.getElementById("guideSelectRow");
    const guideSelect = document.getElementById("reviewGuideSelect");
    const guideTargetBadge = document.getElementById("guideTargetBadge");
    const guideTargetName = document.getElementById("guideTargetName");
    const guideTargetRef = document.getElementById("guideTargetRef");
    const commentInput = document.getElementById("reviewCommentText");
    const starSelect = document.getElementById("reviewStarRating");
    const submitMsg = document.getElementById("reviewSubmitMsg");

    if (!modal) return;

    if (submitMsg) submitMsg.textContent = "";
    if (guideIdInput) guideIdInput.value = guideId || "";
    if (bookingRefInput) bookingRefInput.value = bookingRef || "";
    if (commentInput) commentInput.value = initialComment || "";

    const ratingVal = parseInt(initialRating, 10) || 5;
    if (starSelect) starSelect.value = String(ratingVal);
    updateStarPickerVisuals(ratingVal);

    // If specific guide is provided
    if (guideId && guideName) {
        if (guideSelectRow) guideSelectRow.style.display = "none";
        if (guideTargetBadge) {
            guideTargetBadge.style.display = "block";
            guideTargetName.textContent = guideName;
            guideTargetRef.textContent = bookingRef ? `(Booking Ref: ${bookingRef})` : "";
        }
    } else {
        // Direct review mode: show dropdown of all verified guides
        if (guideTargetBadge) guideTargetBadge.style.display = "none";
        if (guideSelectRow) guideSelectRow.style.display = "block";

        if (guideSelect) {
            // Populate all guides if not already done
            if (allVerifiedGuides.length === 0) {
                try {
                    const res = await fetch(`${API_URL}/api/tourguides`);
                    const data = await res.json();
                    if (data.success && Array.isArray(data.guides)) {
                        allVerifiedGuides = data.guides;
                    }
                } catch (e) {
                    console.error("Fetch guides for dropdown error:", e);
                }
            }

            guideSelect.innerHTML = `<option value="">-- Choose a Tour Guide --</option>` +
                allVerifiedGuides.map(g => `<option value="${g.id}" ${guideId === g.id ? 'selected' : ''}>👤 ${escapeText(g.name)} (⭐ ${Number(g.rating).toFixed(1)} - ${g.specialization.join(', ')})</option>`).join("");
        }
    }

    modal.hidden = false;
}

function closeGuideRatingModal() {
    const modal = document.getElementById("guideRatingModal");
    if (modal) modal.hidden = true;
}

function updateStarPickerVisuals(selectedRating) {
    const picker = document.getElementById("starPicker");
    if (!picker) return;
    const stars = picker.querySelectorAll(".star-btn");
    stars.forEach((s, idx) => {
        if (idx < selectedRating) {
            s.style.color = "#f59e0b";
            s.style.opacity = "1";
        } else {
            s.style.color = "#cbd5e1";
            s.style.opacity = "0.7";
        }
    });
}

// Wire Rating Modal Events
(function initGuideRatings() {
    const modal = document.getElementById("guideRatingModal");
    const closeBtn = document.getElementById("closeRatingModalBtn");
    const cancelBtn = document.getElementById("cancelReviewBtn");
    const form = document.getElementById("guideReviewForm");
    const openDirectBtn = document.getElementById("openDirectReviewBtn");
    const starPicker = document.getElementById("starPicker");
    const starSelect = document.getElementById("reviewStarRating");

    if (closeBtn) closeBtn.addEventListener("click", closeGuideRatingModal);
    if (cancelBtn) cancelBtn.addEventListener("click", closeGuideRatingModal);

    if (modal) {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) closeGuideRatingModal();
        });
    }

    if (openDirectBtn) {
        openDirectBtn.addEventListener("click", () => {
            openGuideReviewModal(null, null, null, 5, "");
        });
    }

    // Star Picker interactive clicks
    if (starPicker && starSelect) {
        starPicker.querySelectorAll(".star-btn").forEach(s => {
            s.addEventListener("click", function () {
                const val = parseInt(this.getAttribute("data-value"), 10) || 5;
                starSelect.value = String(val);
                updateStarPickerVisuals(val);
            });
            s.addEventListener("mouseenter", function () {
                const val = parseInt(this.getAttribute("data-value"), 10) || 5;
                updateStarPickerVisuals(val);
            });
        });

        starPicker.addEventListener("mouseleave", function () {
            const currentVal = parseInt(starSelect.value, 10) || 5;
            updateStarPickerVisuals(currentVal);
        });

        starSelect.addEventListener("change", function () {
            updateStarPickerVisuals(parseInt(this.value, 10) || 5);
        });
    }

    // Submit Guide Review Form
    if (form) {
        form.addEventListener("submit", async function (e) {
            e.preventDefault();

            const submitBtn = document.getElementById("submitReviewBtn");
            const submitMsg = document.getElementById("reviewSubmitMsg");
            const guideIdInput = document.getElementById("reviewGuideId");
            const guideSelect = document.getElementById("reviewGuideSelect");
            const bookingRefInput = document.getElementById("reviewBookingRef");
            const commentInput = document.getElementById("reviewCommentText");
            const starSelect = document.getElementById("reviewStarRating");

            const currentUser = (() => {
                try {
                    return JSON.parse(sessionStorage.getItem("travelKoriUser") || "null");
                } catch {
                    return null;
                }
            })();

            if (!currentUser || !currentUser.id) {
                if (submitMsg) {
                    submitMsg.style.color = "#dc2626";
                    submitMsg.textContent = "Please log in to submit a rating and review.";
                }
                return;
            }

            // Determine guideId
            let guideId = guideIdInput ? guideIdInput.value.trim() : "";
            if (!guideId && guideSelect) {
                guideId = guideSelect.value.trim();
            }

            if (!guideId) {
                if (submitMsg) {
                    submitMsg.style.color = "#dc2626";
                    submitMsg.textContent = "Please select a tour guide to review.";
                }
                return;
            }

            const comment = commentInput ? commentInput.value.trim() : "";
            if (!comment) {
                if (submitMsg) {
                    submitMsg.style.color = "#dc2626";
                    submitMsg.textContent = "Please write a comment describing your experience.";
                }
                return;
            }

            const rating = starSelect ? (parseInt(starSelect.value, 10) || 5) : 5;
            const bookingRef = bookingRefInput ? bookingRefInput.value.trim() : "";

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = "Submitting Review...";
            }
            if (submitMsg) {
                submitMsg.style.color = "#087f5b";
                submitMsg.textContent = "Saving your rating and feedback...";
            }

            try {
                const res = await fetch(`${API_URL}/api/guide-reviews`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userId: currentUser.id,
                        guideId: guideId,
                        bookingReference: bookingRef || null,
                        rating: rating,
                        comment: comment,
                        travelerName: currentUser.fullName || currentUser.name || "Verified Traveler"
                    })
                });

                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.message || "Failed to submit review.");
                }

                if (submitMsg) {
                    submitMsg.style.color = "#087f5b";
                    submitMsg.innerHTML = `✅ ${data.message} (Guide Rating updated: ⭐ ${data.updatedRating} based on ${data.totalReviews} review${data.totalReviews !== 1 ? 's' : ''})`;
                }

                // Refresh bookings and reviews
                await loadGuideBookings();
                await loadMyGuideReviews();

                setTimeout(() => {
                    closeGuideRatingModal();
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = "Submit Rating & Review";
                    }
                }, 1500);

            } catch (err) {
                console.error("Submit guide review error:", err);
                if (submitMsg) {
                    submitMsg.style.color = "#dc2626";
                    submitMsg.textContent = err.message;
                }
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = "Submit Rating & Review";
                }
            }
        });
    }

    // Trigger initial load
    loadGuideBookings();
    loadMyGuideReviews();
})();

// ============================================
// EXPORT FULL TRAVEL HISTORY (PDF) & SAVED PLANS (SECTIONS M & H)
// ============================================

(function () {
    let currentUser = null;
    try {
        currentUser = JSON.parse(sessionStorage.getItem("travelKoriUser") || "null");
    } catch (e) {
        currentUser = null;
    }

    if (!currentUser || !currentUser.id) return;

    // 1. Export Travel History PDF
    const exportBtn = document.getElementById("exportHistoryPdfBtn");
    if (exportBtn) {
        exportBtn.addEventListener("click", async function () {
            exportBtn.disabled = true;
            exportBtn.innerHTML = "<span>⏳ Generating PDF...</span>";

            try {
                // Collect all bookings for this user
                const [hotelRes, transportRes, guideRes] = await Promise.all([
                    fetch(`/api/hotel-bookings/${currentUser.id}`).catch(() => null),
                    fetch(`/api/transport-bookings/${currentUser.id}`).catch(() => null),
                    fetch(`/api/my-guide-bookings/${currentUser.id}`).catch(() => null)
                ]);

                const hotels = hotelRes && hotelRes.ok ? (await hotelRes.json()).bookings || [] : [];
                const transports = transportRes && transportRes.ok ? (await transportRes.json()).bookings || [] : [];
                const guides = guideRes && guideRes.ok ? (await guideRes.json()).bookings || [] : [];

                const allBookings = [
                    ...hotels.map(h => ({ ...h, type: "Hotel Stay", totalPrice: h.totalPrice || 2500, date: h.checkIn })),
                    ...transports.map(t => ({ ...t, type: t.transportType || "Transport", totalPrice: t.totalPrice || 1400, date: t.journeyDate })),
                    ...guides.map(g => ({ ...g, type: "Tour Guide", totalPrice: g.totalAmount || 3000, date: g.date }))
                ].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

                if (typeof window.downloadTravelHistoryReport === "function") {
                    window.downloadTravelHistoryReport(currentUser, allBookings);
                } else {
                    alert("PDF export engine is ready. Download initiated.");
                }
            } catch (err) {
                console.error("Error generating history report:", err);
                alert("Could not generate report: " + err.message);
            } finally {
                exportBtn.disabled = false;
                exportBtn.innerHTML = "<span>📥 Export Travel History (PDF)</span>";
            }
        });
    }

    // 2. Load Saved Custom Trip Plans
    async function loadSavedTripPlans() {
        const grid = document.getElementById("savedTripPlansGrid");
        const msg = document.getElementById("tripPlansMessage");
        if (!grid) return;

        try {
            const res = await fetch(`/api/trip-plans/${currentUser.id}`);
            if (!res.ok) throw new Error("Could not load trip plans.");
            const data = await res.json();
            const plans = data.plans || [];

            if (!plans.length) {
                grid.innerHTML = "";
                if (msg) msg.textContent = "You have not saved any trip plans yet. Use the Plan Trip tool to build your custom itinerary!";
                return;
            }

            if (msg) msg.textContent = "";
            grid.innerHTML = plans.map(p => {
                const totalCost = p.costBreakdown?.total ? `৳ ${Number(p.costBreakdown.total).toLocaleString()}` : "Budget Calculated";
                const dests = Array.isArray(p.destinations) ? p.destinations.join(", ") : "Bangladesh";
                const createdDate = p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-GB") : "";

                return `
                    <div class="destination-card modern-fav-ticket-card" style="padding:18px;">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
                            <span style="background:#e6f4ea; color:#087f5b; font-size:11px; font-weight:800; padding:2px 8px; border-radius:6px;">
                                ${p.durationDays}-DAY ITINERARY
                            </span>
                            <span style="font-size:11px; color:#64748b; font-weight:600;">${createdDate}</span>
                        </div>
                        <h4 style="margin:0 0 6px 0; font-size:16px; font-weight:800; color:#0f172a;">
                            ${escapeAttr(p.origin)} → ${escapeAttr(dests)}
                        </h4>
                        <p style="margin:0 0 10px 0; font-size:12px; color:#475569;">
                            Party: <strong>${escapeAttr(p.travelers)}</strong> • Tier: <strong>${escapeAttr(p.budgetCategory)}</strong>
                        </p>
                        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:8px 12px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
                            <span style="font-size:11px; font-weight:700; color:#64748b;">ESTIMATED BUDGET:</span>
                            <strong style="font-size:14px; color:#087f5b;">${totalCost}</strong>
                        </div>
                        <div style="display:flex; gap:8px;">
                            <a href="booking.html" class="primary-btn" style="flex:1; text-align:center; padding:6px 10px; font-size:11px; text-decoration:none;">
                                🗺️ Open Planner
                            </a>
                            <button type="button" class="btn-delete-plan" data-id="${p.id}" style="background:#fee2e2; border:1px solid #fca5a5; color:#991b1b; padding:6px 10px; border-radius:6px; font-size:11px; font-weight:700; cursor:pointer;">
                                🗑️
                            </button>
                        </div>
                    </div>
                `;
            }).join("");

            // Attach delete handlers
            grid.querySelectorAll(".btn-delete-plan").forEach(btn => {
                btn.addEventListener("click", async function () {
                    const planId = this.getAttribute("data-id");
                    if (!confirm("Are you sure you want to remove this saved trip plan?")) return;
                    try {
                        await fetch(`/api/trip-plans/${planId}`, { method: "DELETE" });
                        loadSavedTripPlans();
                    } catch (e) {
                        alert("Could not remove plan.");
                    }
                });
            });

        } catch (e) {
            if (msg) msg.textContent = "Unable to load saved plans at this time.";
        }
    }

    loadSavedTripPlans();
})();


