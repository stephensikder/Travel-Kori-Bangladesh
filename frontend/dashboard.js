
const storedUser = sessionStorage.getItem("travelKoriUser");

let currentUser = null;

try {
    currentUser = storedUser ? JSON.parse(storedUser) : null;
} catch (error) {
    currentUser = null;
}

if (!currentUser || !currentUser.id) {
    window.location.href = "login.html";
} else {
    document.getElementById("userName").textContent =
        currentUser.fullName;

    document.getElementById("userEmail").textContent =
        currentUser.email;
}

const favoriteContainer =
    document.getElementById("favoriteDistricts");

const favoriteMessage =
    document.getElementById("favoriteMessage");

async function loadFavoriteDistricts() {
    if (!currentUser || !currentUser.id) {
        return;
    }

    try {
        const response = await fetch(
            "http://localhost:5000/api/favorites/" +
            encodeURIComponent(currentUser.id)
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.message || "Unable to load favorites."
            );
        }

        const favorites = data.favorites || [];

        favoriteContainer.innerHTML = "";

        if (favorites.length === 0) {
            favoriteMessage.textContent =
                "No favorite districts saved yet.";
            return;
        }

        favoriteMessage.textContent =
            favorites.length + " favorite district(s) saved.";

        favorites.forEach(function (district) {
            const card = document.createElement("article");
            card.className = "destination-card";

            const title = document.createElement("h3");
            title.textContent = district;

            const exploreLink = document.createElement("a");
            exploreLink.className = "map-link";
            exploreLink.textContent = "Explore District";
            exploreLink.href =
                "district-details.html?name=" +
                encodeURIComponent(district);

            const removeButton = document.createElement("button");
            removeButton.type = "button";
            removeButton.className = "favorite-btn";
            removeButton.textContent = "Remove Favorite";

            removeButton.addEventListener("click", async function () {
                removeButton.disabled = true;

                try {
                    const deleteResponse = await fetch(
                        "http://localhost:5000/api/favorites/" +
                        encodeURIComponent(currentUser.id) + "/" +
                        encodeURIComponent(district),
                        { method: "DELETE" }
                    );

                    const deleteData = await deleteResponse.json();

                    if (!deleteResponse.ok || !deleteData.success) {
                        throw new Error(
                            deleteData.message ||
                            "Unable to remove favorite."
                        );
                    }

                    await loadFavoriteDistricts();

                } catch (error) {
                    alert(error.message);
                    removeButton.disabled = false;
                }
            });

            card.appendChild(title);
            card.appendChild(exploreLink);
            card.appendChild(removeButton);

            favoriteContainer.appendChild(card);
        });

    } catch (error) {
        console.error("Favorites error:", error);

        favoriteMessage.textContent =
            "Unable to load favorites. Check your backend connection.";
    }
}

if (favoriteContainer && favoriteMessage) {
    loadFavoriteDistricts();
}

const logoutButton = document.getElementById("logoutBtn");

if (logoutButton) {
    logoutButton.addEventListener("click", function () {
        sessionStorage.removeItem("travelKoriUser");
        window.location.href = "login.html";
    });
}
