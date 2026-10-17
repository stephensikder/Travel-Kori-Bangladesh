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