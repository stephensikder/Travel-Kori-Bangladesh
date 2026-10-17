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

// HTML elements
const adminMessage = document.getElementById("adminMessage");
const adminBookings = document.getElementById("adminBookings");

// Check login
if (!user || !user.id) {
    window.location.replace("login.html");
} else {
    loadAdminBookings();
}

// Load all bookings
async function loadAdminBookings() {
    adminMessage.textContent = "Loading bookings...";

    try {
        const response = await fetch(
            `${API_URL}/api/admin/bookings/${encodeURIComponent(user.id)}`
        );

        const data = await response.json();

        if (response.status === 403) {
            adminMessage.textContent =
                "Access denied. Please log in with an admin account.";
            return;
        }

        if (!response.ok) {
            throw new Error(
                data.message || "Could not load bookings."
            );
        }

        const bookings = Array.isArray(data.bookings)
            ? data.bookings
            : [];

        // Update summary
        document.getElementById("totalBookings").textContent =
            bookings.length;

        document.getElementById("pendingBookings").textContent =
            bookings.filter(b => b.status === "Pending").length;

        document.getElementById("confirmedBookings").textContent =
            bookings.filter(b => b.status === "Confirmed").length;

        document.getElementById("cancelledBookings").textContent =
            bookings.filter(b => b.status === "Cancelled").length;

        // Clear old booking cards
        adminBookings.replaceChildren();

        if (bookings.length === 0) {
            adminMessage.textContent = "No bookings found.";
            return;
        }

        bookings.forEach(function (booking) {
            const card = document.createElement("div");
            card.className = "destination-card";

            const title = document.createElement("h3");
            title.textContent = booking.touristSpot || "Tourist Spot";

            const reference = document.createElement("p");
            reference.textContent =
                `Reference ID: ${booking.reference || "Not available"}`;

            const district = document.createElement("p");
            district.textContent =
                `District: ${booking.district || "Not provided"}`;

            const visitDate = document.createElement("p");
            visitDate.textContent =
                `Visit Date: ${booking.visitDate || "Not provided"}`;

            const people = document.createElement("p");
            people.textContent =
                `Visitors: ${booking.people ?? "Not provided"}`;

            const statusText = document.createElement("p");
            statusText.textContent =
                `Current Status: ${booking.status || "Pending"}`;

            statusText.style.fontWeight = "bold";

            const statusLabel = document.createElement("label");
            statusLabel.textContent = "Update Status";

            const statusSelect = document.createElement("select");

            ["Pending", "Confirmed", "Cancelled"].forEach(
                function (status) {
                    const option = document.createElement("option");
                    option.value = status;
                    option.textContent = status;

                    if ((booking.status || "Pending") === status) {
                        option.selected = true;
                    }

                    statusSelect.appendChild(option);
                }
            );

            const updateButton = document.createElement("button");
            updateButton.type = "button";
            updateButton.className = "signup-btn";
            updateButton.textContent = "Update Status";

            updateButton.addEventListener("click", async function () {
                await updateBookingStatus(
                    booking.id,
                    statusSelect.value,
                    updateButton
                );
            });

            card.append(
                title,
                reference,
                district,
                visitDate,
                people,
                statusText,
                statusLabel,
                statusSelect,
                updateButton
            );

            adminBookings.appendChild(card);
        });

        adminMessage.textContent =
            `Loaded ${bookings.length} booking(s).`;

    } catch (error) {
        console.error("Admin bookings error:", error);

        adminMessage.textContent =
            "Could not load bookings. Check the backend server.";
    }
}

// Update booking status
async function updateBookingStatus(bookingId, status, button) {
    button.disabled = true;
    button.textContent = "Updating...";

    try {
        const response = await fetch(
            `${API_URL}/api/admin/bookings/${encodeURIComponent(user.id)}/${encodeURIComponent(bookingId)}/status`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ status: status })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Could not update booking status."
            );
        }

        adminMessage.textContent =
            "Booking status updated successfully!";

        await loadAdminBookings();

    } catch (error) {
        console.error("Update status error:", error);

        adminMessage.textContent = error.message;

    } finally {
        button.disabled = false;
        button.textContent = "Update Status";
    }
}

// Admin logout
const adminLogoutBtn = document.getElementById("adminLogoutBtn");

if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener("click", function () {
        sessionStorage.removeItem("travelKoriUser");
        window.location.href = "login.html";
    });
}