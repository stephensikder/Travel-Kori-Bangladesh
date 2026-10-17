
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

function getCurrentUser() {
    try {
        return JSON.parse(sessionStorage.getItem("travelKoriUser"));
    } catch (error) {
        return null;
    }
}

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
            throw new Error(data.message || "Unable to load favorites.");
        }

        return data.favorites || [];
    } catch (error) {
        console.error("Load favorites error:", error);
        return null;
    }
}

async function toggleFavorite(district, button) {
    const user = getCurrentUser();

    if (!user || !user.id) {
        alert("Please log in before saving favorite districts.");
        window.location.href = "login.html";
        return;
    }

    button.disabled = true;

    try {
        const favorites = await getFavorites();

        if (favorites === null) {
            throw new Error("Could not load favorites. Please try again.");
        }

        let response;

        if (favorites.includes(district)) {
            response = await fetch(
                API_URL + "/" +
                encodeURIComponent(user.id) + "/" +
                encodeURIComponent(district),
                { method: "DELETE" }
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
            throw new Error(data.message || "Unable to update favorite.");
        }

        displayDistricts(
            districts.filter(function (name) {
                return name.toLowerCase().includes(
                    districtSearch.value.trim().toLowerCase()
                );
            })
        );

    } catch (error) {
        alert(error.message);
        console.error("Update favorite error:", error);
        button.disabled = false;
    }
}

async function displayDistricts(districtList) {
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
            favoriteButton.textContent = "Login / Retry Favorites";
        } else {
            const isFavorite = favorites.includes(district);
            favoriteButton.textContent = isFavorite
                ? "★ Favorited"
                : "☆ Favorite";
            favoriteButton.setAttribute("aria-pressed", String(isFavorite));
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
        districtList.length + " of " + districts.length + " districts shown.";
}

districtSearch.addEventListener("input", function () {
    const searchText = districtSearch.value.trim().toLowerCase();

    const filteredDistricts = districts.filter(function (district) {
        return district.toLowerCase().includes(searchText);
    });

    displayDistricts(filteredDistricts);
});

displayDistricts(districts);

console.log("Total districts:", districts.length);

// Homepage Login and Sign Up Navigation
document.addEventListener("DOMContentLoaded", function () {
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
});
