// API URL
const API_URL = "http://localhost:5000";

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

    // Display user information
    document.getElementById("userName").textContent =
        user.fullName || "Traveler";

    document.getElementById("profileName").textContent =
        user.fullName || "Not provided";

    document.getElementById("userEmail").textContent =
        user.email || "Not provided";

    // Load favorites and bookings
    loadFavorites();
    loadBookings();

    // Profile elements
    const editProfileBtn =
        document.getElementById("editProfileBtn");

    const profileEditForm =
        document.getElementById("profileEditForm");

    const cancelEditBtn =
        document.getElementById("cancelEditBtn");

    const profileMessage =
        document.getElementById("profileMessage");

    // Open Edit Profile form
    if (editProfileBtn && profileEditForm) {

        editProfileBtn.addEventListener("click", function () {

            document.getElementById("editFullName").value =
                user.fullName || "";

            document.getElementById("editEmail").value =
                user.email || "";

            profileEditForm.hidden = false;
            profileMessage.textContent = "";
        });

        // Update profile
        profileEditForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();

                const newName = document
                    .getElementById("editFullName")
                    .value.trim();

                const newEmail = document
                    .getElementById("editEmail")
                    .value.trim();

                if (!newName || !newEmail) {
                    profileMessage.textContent =
                        "Please enter your name and email.";
                    return;
                }

                profileMessage.textContent =
                    "Saving profile...";

                profileMessage.style.color = "#087f5b";

                try {
                    const response = await fetch(
                        `${API_URL}/api/users/${encodeURIComponent(user.id)}`,
                        {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                fullName: newName,
                                email: newEmail
                            })
                        }
                    );

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(
                            data.message ||
                            "Could not update profile."
                        );
                    }

                    user.fullName = data.user.fullName;
                    user.email = data.user.email;

                    sessionStorage.setItem(
                        "travelKoriUser",
                        JSON.stringify(user)
                    );

                    document.getElementById("userName").textContent =
                        user.fullName;

                    document.getElementById("profileName").textContent =
                        user.fullName;

                    document.getElementById("userEmail").textContent =
                        user.email;

                    profileEditForm.hidden = true;

                    profileMessage.textContent =
                        "Profile updated successfully!";

                    profileMessage.style.color = "#087f5b";

                } catch (error) {
                    console.error("Profile update error:", error);

                    profileMessage.textContent = error.message;
                    profileMessage.style.color = "red";
                }
            }
        );

        // Cancel profile editing
        if (cancelEditBtn) {
            cancelEditBtn.addEventListener("click", function () {

                profileEditForm.hidden = true;

                profileMessage.textContent =
                    "Profile editing cancelled.";
            });
        }
    }
}

// Load favorite districts
async function loadFavorites() {

    const favoriteGrid =
        document.getElementById("favoriteDistricts");

    const favoriteMessage =
        document.getElementById("favoriteMessage");

    if (!user || !user.id || !favoriteGrid || !favoriteMessage) {
        return;
    }

    favoriteMessage.textContent = "Loading your favorites...";

    try {
        const response = await fetch(
            `${API_URL}/api/favorites/${encodeURIComponent(user.id)}`
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Could not load favorites."
            );
        }

        const favorites = Array.isArray(data.favorites)
            ? data.favorites
            : [];

        favoriteGrid.replaceChildren();

        if (favorites.length === 0) {
            favoriteMessage.textContent =
                "You have not saved any favorite districts yet.";
            return;
        }

        favorites.forEach(function (district) {

            const card = document.createElement("div");
            card.className = "destination-card";

            const title = document.createElement("h3");
            title.textContent = district;

            const exploreLink = document.createElement("a");
            exploreLink.textContent = "Explore District →";
            exploreLink.href =
                `district-details.html?district=${encodeURIComponent(district)}`;

            const removeButton = document.createElement("button");
            removeButton.type = "button";
            removeButton.className = "signup-btn";
            removeButton.textContent = "Remove Favorite";

            removeButton.addEventListener("click", function () {
                removeFavorite(district);
            });

            card.append(title, exploreLink, removeButton);
            favoriteGrid.appendChild(card);
        });

        favoriteMessage.textContent =
            `You have ${favorites.length} favorite district(s).`;

    } catch (error) {
        console.error("Favorites error:", error);

        favoriteMessage.textContent =
            "Could not load favorites. Check the backend server.";
    }
}

// Remove a favorite district
async function removeFavorite(district) {

    const favoriteMessage =
        document.getElementById("favoriteMessage");

    try {
        const response = await fetch(
            `${API_URL}/api/favorites/${encodeURIComponent(user.id)}/${encodeURIComponent(district)}`,
            {
                method: "DELETE"
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Could not remove favorite."
            );
        }

        await loadFavorites();

    } catch (error) {
        console.error("Remove favorite error:", error);

        favoriteMessage.textContent =
            "Could not remove this favorite. Please try again.";
    }
}

// Load bookings for the logged-in user
async function loadBookings() {

    const bookingsGrid =
        document.getElementById("myBookings");

    const bookingListMessage =
        document.getElementById("bookingListMessage");

    if (!user || !user.id || !bookingsGrid || !bookingListMessage) {
        return;
    }

    bookingListMessage.textContent = "Loading your bookings...";

    try {
        const response = await fetch(
            `${API_URL}/api/bookings/${encodeURIComponent(user.id)}`
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Could not load bookings."
            );
        }

        const bookings = Array.isArray(data.bookings)
            ? data.bookings
            : [];

        bookingsGrid.replaceChildren();

        if (bookings.length === 0) {
            bookingListMessage.textContent =
                "You have no bookings yet. Book a trip to get started.";
            return;
        }

        bookings.forEach(function (booking) {

            const card = document.createElement("div");
            card.className = "destination-card";

            const title = document.createElement("h3");
            title.textContent = booking.touristSpot || "Tourist Spot";

            const district = document.createElement("p");
            district.textContent =
                `District: ${booking.district || "Not provided"}`;

            const visitDate = document.createElement("p");
            visitDate.textContent =
                `Visit Date: ${booking.visitDate || "Not provided"}`;

            const people = document.createElement("p");
            people.textContent =
                `Number of Visitors: ${booking.people ?? "Not provided"}`;

            const status = document.createElement("p");
            status.textContent =
                `Status: ${booking.status || "Pending"}`;

            status.style.fontWeight = "bold";

            card.append(
                title,
                district,
                visitDate,
                people,
                status
            );

            bookingsGrid.appendChild(card);
        });

        bookingListMessage.textContent =
            `You have ${bookings.length} booking request(s).`;

    } catch (error) {
        console.error("Bookings error:", error);

        bookingListMessage.textContent =
            "Could not load bookings. Please check the backend server.";
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

// Load hotel bookings
async function loadHotelBookings() {
    const grid = document.getElementById("myHotelBookings");
    const message = document.getElementById("hotelBookingsMessage");

    if (!grid || !message || !user || !user.id) {
        return;
    }

    message.textContent = "Loading your hotel bookings...";

    try {
        const response = await fetch(
            `${API_URL}/api/hotel-bookings/${encodeURIComponent(user.id)}`
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Could not load hotel bookings."
            );
        }

        grid.replaceChildren();

        const bookings = Array.isArray(data.bookings)
            ? data.bookings
            : [];

        if (bookings.length === 0) {
            message.textContent = "You have no hotel bookings yet.";
            return;
        }

        bookings.forEach(function (booking) {
            const card = document.createElement("div");
            card.className = "destination-card";

            const title = document.createElement("h3");
            title.textContent = booking.hotelName;

            const reference = document.createElement("p");
            reference.textContent = `Reference: ${booking.reference}`;

            const district = document.createElement("p");
            district.textContent = `District: ${booking.district}`;

            const dates = document.createElement("p");
            dates.textContent =
                `Stay: ${booking.checkIn} to ${booking.checkOut}`;

            const room = document.createElement("p");
            room.textContent =
                `Room: ${booking.roomType} × ${booking.rooms}`;

            const guests = document.createElement("p");
            guests.textContent = `Guests: ${booking.guests}`;

            const total = document.createElement("p");
            total.textContent =
                `Estimated total: ৳${Number(booking.totalPrice).toLocaleString("en-BD")}`;

            const status = document.createElement("p");
            status.textContent = `Status: ${booking.status}`;

            card.append(
                title,
                reference,
                district,
                dates,
                room,
                guests,
                total,
                status
            );

            grid.appendChild(card);
        });

        message.textContent = `You have ${bookings.length} hotel booking(s).`;

    } catch (error) {
        console.error("Hotel bookings error:", error);
        message.textContent =
            "Could not load hotel bookings. Check the backend server.";
    }
}

// Load hotel bookings on the dashboard.
if (user && user.id) {
    loadHotelBookings();
}


/* =========================================
   MY TRANSPORT TICKETS
   Bus + Train + Flight
========================================= */

(function initTransportDashboard() {
    const API_URL = "http://localhost:5000";

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

        container.innerHTML = visibleBookings.map(booking => {
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

                    <div class="transport-ticket-footer">
                        <div>
                            <span>Total fare</span>
                            <strong class="transport-total">
                                ${formatMoney(total)}
                            </strong>
                        </div>

                        <span class="transport-footer-note">
                            Booking details
                        </span>
                    </div>
                </article>
            `;
        }).join("");
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
