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

    // Load favorites
    loadFavorites();

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

        // Update profile in MongoDB
        profileEditForm.addEventListener("submit", async function (event) {
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

            profileMessage.textContent = "Saving profile...";
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
                        data.message || "Could not update profile."
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
        });

        // Cancel editing
        if (cancelEditBtn) {
            cancelEditBtn.addEventListener("click", function () {
                profileEditForm.hidden = true;

                profileMessage.textContent =
                    "Profile editing cancelled.";
            });
        }
    }
}

// Load favorites
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

// Remove favorite
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

// Logout
const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
        sessionStorage.removeItem("travelKoriUser");
        window.location.href = "login.html";
    });
}