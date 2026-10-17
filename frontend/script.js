
const districts = [
    "Bagerhat",
    "Bandarban",
    "Barguna",
    "Barishal",
    "Bhola",
    "Bogura",
    "Brahmanbaria",
    "Chandpur",
    "Chapai Nawabganj",
    "Chattogram",
    "Chuadanga",
    "Cumilla",
    "Cox's Bazar",
    "Dhaka",
    "Dinajpur",
    "Faridpur",
    "Feni",
    "Gaibandha",
    "Gazipur",
    "Gopalganj",
    "Habiganj",
    "Jamalpur",
    "Jashore",
    "Jhalokati",
    "Jhenaidah",
    "Joypurhat",
    "Khagrachhari",
    "Khulna",
    "Kishoreganj",
    "Kurigram",
    "Kushtia",
    "Lakshmipur",
    "Lalmonirhat",
    "Madaripur",
    "Magura",
    "Manikganj",
    "Meherpur",
    "Moulvibazar",
    "Munshiganj",
    "Mymensingh",
    "Naogaon",
    "Narail",
    "Narayanganj",
    "Narsingdi",
    "Natore",
    "Netrokona",
    "Nilphamari",
    "Noakhali",
    "Pabna",
    "Panchagarh",
    "Patuakhali",
    "Pirojpur",
    "Rajbari",
    "Rajshahi",
    "Rangamati",
    "Rangpur",
    "Satkhira",
    "Shariatpur",
    "Sherpur",
    "Sirajganj",
    "Sunamganj",
    "Sylhet",
    "Tangail",
    "Thakurgaon"
];

const districtGrid = document.getElementById("districtGrid");
const districtSearch = document.getElementById("districtSearch");
const districtMessage = document.getElementById("districtMessage");

// Load saved favorites from localStorage
function getFavorites() {
    try {
        return JSON.parse(
            localStorage.getItem("travelKoriFavorites") || "[]"
        );
    } catch (error) {
        return [];
    }
}

// Save favorites to localStorage
function saveFavorites(favorites) {
    localStorage.setItem(
        "travelKoriFavorites",
        JSON.stringify(favorites)
    );
}

// Display district cards
function displayDistricts(districtList) {
    districtGrid.innerHTML = "";

    districtList.forEach(function (district) {
        const card = document.createElement("article");
        card.className = "destination-card";

        const title = document.createElement("h3");
        title.textContent = district;

        const favoriteButton = document.createElement("button");
        favoriteButton.type = "button";
        favoriteButton.className = "favorite-btn";

        function updateFavoriteButton() {
            const favorites = getFavorites();
            const isFavorite = favorites.includes(district);

            favoriteButton.textContent = isFavorite ? "★ Favorited" : "☆ Favorite";
            favoriteButton.setAttribute(
                "aria-label",
                isFavorite
                    ? "Remove " + district + " from favorites"
                    : "Add " + district + " to favorites"
            );
            favoriteButton.setAttribute(
                "aria-pressed",
                String(isFavorite)
            );
        }

        favoriteButton.addEventListener("click", function (event) {
            event.stopPropagation();

            let favorites = getFavorites();

            if (favorites.includes(district)) {
                favorites = favorites.filter(function (item) {
                    return item !== district;
                });
            } else {
                favorites.push(district);
            }

            saveFavorites(favorites);
            updateFavoriteButton();
        });

        const openButton = document.createElement("button");
        openButton.type = "button";
        openButton.className = "details-btn";
        openButton.textContent = "Explore District";

        openButton.addEventListener("click", function () {
            window.location.href =
                "district-details.html?name=" +
                encodeURIComponent(district);
        });

        updateFavoriteButton();

        card.appendChild(title);
        card.appendChild(favoriteButton);
        card.appendChild(openButton);

        districtGrid.appendChild(card);
    });

    districtMessage.textContent =
        districtList.length + " of " + districts.length + " districts shown.";
}

// Search districts by name
districtSearch.addEventListener("input", function () {
    const searchText = districtSearch.value.trim().toLowerCase();

    const filteredDistricts = districts.filter(function (district) {
        return district.toLowerCase().includes(searchText);
    });

    displayDistricts(filteredDistricts);

    if (filteredDistricts.length === 0) {
        districtMessage.textContent =
            "No districts found. Try another name.";
    } else {
        districtMessage.textContent =
            filteredDistricts.length + " district(s) found.";
    }
});

// Display all districts when the page loads
displayDistricts(districts);

// Check district count in the browser console
console.log("Total districts:", districts.length);
console.log("Saved favorites:", getFavorites());
