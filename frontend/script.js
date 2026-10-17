// ============================================
// TRAVEL KORI BANGLADESH - HOMEPAGE SCRIPT
// ============================================

// All 64 districts of Bangladesh
const districts = [
    "Bagerhat", "Bandarban", "Barguna", "Barishal", "Bhola",
    "Bogura", "Brahmanbaria", "Chandpur", "Chapai Nawabganj",
    "Chattogram", "Chuadanga", "Cumilla", "Cox's Bazar", "Dhaka",
    "Dinajpur", "Faridpur", "Feni", "Gaibandha", "Gazipur",
    "Gopalganj", "Habiganj", "Jamalpur", "Jashore", "Jhalokati",
    "Jhenaidah", "Joypurhat", "Khagrachhari", "Khulna", "Kishoreganj",
    "Kurigram", "Kushtia", "Lakshmipur", "Lalmonirhat", "Madaripur",
    "Magura", "Manikganj", "Meherpur", "Moulvibazar", "Munshiganj",
    "Mymensingh", "Naogaon", "Narail", "Narayanganj", "Narsingdi",
    "Natore", "Netrokona", "Nilphamari", "Noakhali", "Pabna",
    "Panchagarh", "Patuakhali", "Pirojpur", "Rajbari", "Rajshahi",
    "Rangamati", "Rangpur", "Satkhira", "Shariatpur", "Sherpur",
    "Sirajganj", "Sunamganj", "Sylhet", "Tangail", "Thakurgaon"
];

const API_URL = "http://localhost:5000/api/favorites";

const districtGrid = document.getElementById("districtGrid");
const districtSearch = document.getElementById("districtSearch");
const districtMessage = document.getElementById("districtMessage");

// ============================================
// CURRENT USER
// ============================================

function getCurrentUser() {
    try {
        return JSON.parse(
            sessionStorage.getItem("travelKoriUser") || "null"
        );
    } catch (error) {
        return null;
    }
}

// ============================================
// LOGIN AND SIGN UP NAVIGATION
// ============================================

const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");

if (loginBtn) {
    loginBtn.addEventListener("click", function () {
        window.location.href = "login.html";
    });
}

if (signupBtn) {
    signupBtn.addEventListener("click", function () {
        window.location.href = "signup.html";
    });
}

// ============================================
// HOMEPAGE DESTINATION SEARCH
// ============================================

const homepageSearchForm = document.getElementById("homepageSearchForm");
const destinationInput = document.getElementById("destination");
const travelDateInput = document.getElementById("travelDate");
const searchMessage = document.getElementById("searchMessage");

if (homepageSearchForm && destinationInput && travelDateInput) {

    // Prevent selecting a past date
    const today = new Date();
    const todayString = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0")
    ].join("-");

    travelDateInput.min = todayString;

    homepageSearchForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const destination = destinationInput.value.trim();
        const travelDate = travelDateInput.value;

        if (!destination) {
            if (searchMessage) {
                searchMessage.textContent =
                    "Please enter a destination.";
                searchMessage.style.color = "red";
            }

            destinationInput.focus();
            return;
        }

        if (travelDate && travelDate < todayString) {
            if (searchMessage) {
                searchMessage.textContent =
                    "Please select today or a future travel date.";
                searchMessage.style.color = "red";
            }

            travelDateInput.focus();
            return;
        }

        // Save destination and date for the next page
        const pendingSearch = {
            destination: destination,
            travelDate: travelDate
        };

        sessionStorage.setItem(
            "travelKoriPendingHotelSearch",
            JSON.stringify(pendingSearch)
        );

        const user = getCurrentUser();

        if (searchMessage) {
            searchMessage.style.color = "#087f5b";
            searchMessage.textContent =
                "Continuing to your hotel search...";
        }

        // Admin users should not enter the traveler booking flow
        if (user && user.id && user.userType === "admin") {
            window.location.href = "admin.html";
            return;
        }

        // Logged-in traveler: go to hotels
        if (user && user.id) {
            window.location.href = "hotel-booking.html";
        } else {
            // Guest: login first
            window.location.href = "login.html";
        }
    });
}

// ============================================
// POPULAR DESTINATION QUICK SEARCH BUTTONS
// ============================================

document.querySelectorAll("[data-destination]").forEach(function (button) {
    button.addEventListener("click", function () {
        if (!destinationInput) return;

        destinationInput.value = button.dataset.destination;

        const searchSection = document.getElementById(
            "destinationSearchSection"
        );

        if (searchSection) {
            searchSection.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        }

        destinationInput.focus();
    });
});

// ============================================
// ALL DISTRICTS PANEL
// ============================================

const toggleDistrictsBtn = document.getElementById("toggleDistrictsBtn");
const allDistrictsPanel = document.getElementById("allDistrictsPanel");

if (toggleDistrictsBtn && allDistrictsPanel) {
    toggleDistrictsBtn.addEventListener("click", function () {
        const isOpening = allDistrictsPanel.hidden;

        allDistrictsPanel.hidden = !isOpening;

        toggleDistrictsBtn.setAttribute(
            "aria-expanded",
            String(isOpening)
        );

        toggleDistrictsBtn.textContent = isOpening
            ? "Hide All Districts"
            : "Explore All 64 Districts";

        if (isOpening) {
            allDistrictsPanel.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    });
}

// ============================================
// LOAD FAVORITES
// ============================================

async function getFavorites() {
    const user = getCurrentUser();

    if (!user || !user.id) {
        return [];
    }

    try {
        const response = await fetch(
            API_URL + "/" + encodeURIComponent(user.id)
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.message || "Unable to load favorites."
            );
        }

        return data.favorites || [];

    } catch (error) {
        console.error("Load favorites error:", error);
        return null;
    }
}

// ============================================
// ADD OR REMOVE FAVORITE
// ============================================

async function toggleFavorite(district, button) {
    const user = getCurrentUser();

    if (!user || !user.id) {
        sessionStorage.setItem(
            "travelKoriPendingFavorite",
            district
        );

        alert("Please log in before saving favorite districts.");

        window.location.href = "login.html";
        return;
    }

    button.disabled = true;

    try {
        const favorites = await getFavorites();

        if (favorites === null) {
            throw new Error(
                "Could not load favorites. Please try again."
            );
        }

        let response;

        if (favorites.includes(district)) {
            response = await fetch(
                API_URL + "/" +
                encodeURIComponent(user.id) + "/" +
                encodeURIComponent(district),
                {
                    method: "DELETE"
                }
            );
        } else {
            response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    userId: user.id,
                    district: district
                })
            });
        }

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.message || "Unable to update favorite."
            );
        }

        await displayDistricts(getFilteredDistricts());

    } catch (error) {
        alert(error.message);
        console.error("Update favorite error:", error);

    } finally {
        button.disabled = false;
    }
}

// ============================================
// FILTER DISTRICTS
// ============================================

function getFilteredDistricts() {
    if (!districtSearch) {
        return districts;
    }

    const searchText = districtSearch.value.trim().toLowerCase();

    return districts.filter(function (district) {
        return district.toLowerCase().includes(searchText);
    });
}

// ============================================
// DISPLAY DISTRICTS
// ============================================

async function displayDistricts(districtList) {
    if (!districtGrid || !districtMessage) return;

    districtGrid.innerHTML = "";
    districtMessage.textContent = "Loading districts...";

    const favorites = await getFavorites();

    districtList.forEach(function (district) {
        const card = document.createElement("article");
        card.className = "destination-card";

        const title = document.createElement("h3");
        title.textContent = district;

        const favoriteButton = document.createElement("button");
        favoriteButton.type = "button";
        favoriteButton.className = "favorite-btn";

        if (favorites === null) {
            favoriteButton.textContent = "☆ Favorite";
            favoriteButton.setAttribute("aria-pressed", "false");
        } else {
            const isFavorite = favorites.includes(district);

            favoriteButton.textContent = isFavorite
                ? "★ Favorited"
                : "☆ Favorite";

            favoriteButton.setAttribute(
                "aria-pressed",
                String(isFavorite)
            );
        }

        favoriteButton.addEventListener("click", function () {
            toggleFavorite(district, favoriteButton);
        });

        const detailsButton = document.createElement("button");
        detailsButton.type = "button";
        detailsButton.className = "details-btn";
        detailsButton.textContent = "Explore District";

        detailsButton.addEventListener("click", function () {
            window.location.href =
                "district-details.html?name=" +
                encodeURIComponent(district);
        });

        card.appendChild(title);
        card.appendChild(favoriteButton);
        card.appendChild(detailsButton);

        districtGrid.appendChild(card);
    });

    districtMessage.textContent =
        districtList.length + " of " +
        districts.length + " districts shown.";
}

// ============================================
// DISTRICT SEARCH INPUT
// ============================================

if (districtSearch) {
    districtSearch.addEventListener("input", function () {
        displayDistricts(getFilteredDistricts());
    });
}

// ============================================
// INITIALIZE DISTRICTS
// ============================================

if (districtGrid && districtMessage) {
    displayDistricts(districts);
}

console.log("Total districts:", districts.length);