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

const districtSpots = {
    "Bagerhat": ["Sixty Dome Mosque", "Khan Jahan Ali Shrine", "Sundarbans"],
    "Bandarban": ["Nilgiri", "Boga Lake", "Chimbuk Hill"],
    "Barguna": ["Bibichini Shahi Mosque", "Haringhata Forest", "Fatrar Char"],
    "Barishal": ["Oxford Mission Church", "Durga Sagar", "Floating Guava Market"],
    "Bhola": ["Monpura Island", "Char Kukri Mukri", "Dhal Char"],
    "Bogura": ["Mahasthangarh", "Gokul Medh", "Nawab Palace"],
    "Brahmanbaria": ["Arifail Mosque", "Haripur Zamindar Bari", "Titas River"],
    "Chandpur": ["Three River Confluence", "Meghna Riverbank", "Rupsha Zamindar Bari"],
    "Chapai Nawabganj": ["Choto Sona Mosque", "Darasbari Mosque", "Kansat Mango Market"],
    "Chattogram": ["Patenga Sea Beach", "Foy's Lake", "Sitakunda"],
    "Chuadanga": ["Carew and Company", "Darsana", "Local Heritage Sites"],
    "Cox's Bazar": ["Cox's Bazar Sea Beach", "Himchari National Park", "Inani Beach"],
    "Cumilla": ["Shalban Vihara", "Mainamati Museum", "Dharmasagar"],
    "Dhaka": ["Lalbagh Fort", "Ahsan Manzil", "National Parliament House"],
    "Dinajpur": ["Kantajew Temple", "Ramsagar National Park", "Nayabad Mosque"],
    "Faridpur": ["Mathurapur Deul", "Padma Riverbank", "Kanaipur Zamindar Bari"],
    "Feni": ["Bijoy Singh Dighi", "Muhuri Project", "Rajajhir Dighi"],
    "Gaibandha": ["Brahmaputra Riverbank", "Ghagot River", "Local River Islands"],
    "Gazipur": ["Bhawal National Park", "Nuhash Polli", "Safari Park"],
    "Gopalganj": ["Tungipara Mausoleum", "Orakandi Thakur Bari", "Ujani Rajbari"],
    "Habiganj": ["Rema-Kalenga Wildlife Sanctuary", "Satchari National Park", "Tea Gardens"],
    "Jamalpur": ["Lauchapra Picnic Spot", "Jamuna Riverbank", "Gandhi Ashram"],
    "Jashore": ["Chanchra Shiva Temple", "Sagardari", "Godkhali Flower Market"],
    "Jhalokati": ["Gabkhan Channel", "Kirtipasha Zamindar Bari", "Bhitabaria"],
    "Jhenaidah": ["Naldanga Temple", "Shailkupa Shahi Mosque", "Jor Bangla Mosque"],
    "Joypurhat": ["Panchbibi Heritage Sites", "Local Archaeological Sites", "Historic Religious Sites"],
    "Khagrachhari": ["Alutila Cave", "Richang Waterfall", "Hanging Bridge"],
    "Khulna": ["Sundarbans", "Khan Jahan Ali Bridge", "Rabindra Complex"],
    "Kishoreganj": ["Sholakia Eidgah", "Nikli Haor", "Pagla Mosque"],
    "Kurigram": ["Dharla Bridge", "Chilmari River Port", "Brahmaputra Riverbank"],
    "Kushtia": ["Lalon Shah Shrine", "Shilaidaha Kuthibari", "Tagore Lodge"],
    "Lakshmipur": ["Dalal Bazar Zamindar Bari", "Meghna Riverbank", "Ramgati Coast"],
    "Lalmonirhat": ["Tin Bigha Corridor", "Teesta Barrage", "Burimari Land Port"],
    "Madaripur": ["Shakuni Lake", "Rajoir Heritage Sites", "Arial Khan Riverbank"],
    "Magura": ["Sreepur Zamindar Bari", "Madhumati Riverbank", "Local Heritage Sites"],
    "Manikganj": ["Baliati Palace", "Teota Zamindar Bari", "Padma Riverbank"],
    "Meherpur": ["Mujibnagar Memorial Complex", "Amjhupi Nilkuthi", "Mujibnagar Memorial Museum"],
    "Moulvibazar": ["Lawachara National Park", "Madhabkunda Waterfall", "Madhabpur Lake"],
    "Munshiganj": ["Idrakpur Fort", "Baba Adam Mosque", "Bikrampur Heritage Sites"],
    "Mymensingh": ["Shashi Lodge", "Muktagacha Zamindar Bari", "Brahmaputra Riverbank"],
    "Naogaon": ["Paharpur Buddhist Monastery", "Kusumba Mosque", "Dibar Dighi"],
    "Narail": ["SM Sultan Memorial", "Chitra Riverbank", "Local Heritage Sites"],
    "Narayanganj": ["Sonargaon", "Panam City", "Goaldi Mosque"],
    "Narsingdi": ["Wari-Bateshwar Archaeological Site", "Meghna Riverbank", "Local Heritage Sites"],
    "Natore": ["Uttara Ganabhaban", "Rani Bhawani Rajbari", "Chalan Beel"],
    "Netrokona": ["Birishiri", "Durgapur Clay Hills", "Someshwari River"],
    "Nilphamari": ["Nilsagar", "Teesta Barrage", "Chini Mosque"],
    "Noakhali": ["Nijhum Dweep", "Mushapur Closure", "Gandhi Ashram"],
    "Pabna": ["Hardinge Bridge", "Jor Bangla Temple", "Pakshi Railway Bridge"],
    "Panchagarh": ["Tetulia", "Maharaja Dighi", "Banglabandha Zero Point"],
    "Patuakhali": ["Kuakata Sea Beach", "Fatra Forest", "Lebu Char"],
    "Pirojpur": ["Rayerkathi Zamindar Bari", "Kaukhali Riverfront", "Bhandaria"],
    "Rajbari": ["Goalanda Ghat", "Padma Riverbank", "Baliakandi Heritage Sites"],
    "Rajshahi": ["Varendra Research Museum", "Puthia Temple Complex", "Bagha Mosque"],
    "Rangamati": ["Kaptai Lake", "Hanging Bridge", "Shuvolong Waterfall"],
    "Rangpur": ["Tajhat Palace", "Carmichael College", "Chikli Beel"],
    "Satkhira": ["Sundarbans", "Shyamnagar Eco-Tourism Areas", "Jhaudanga Heritage Sites"],
    "Shariatpur": ["Padma Riverbank", "Local River Islands", "Historic Religious Sites"],
    "Sherpur": ["Madhutila Eco Park", "Gajni Recreation Centre", "Garo Hills"],
    "Sirajganj": ["Jamuna Bridge", "Hatikumrul Navaratna Temple", "Jamuna Riverbank"],
    "Sunamganj": ["Tanguar Haor", "Jadukata River", "Shimul Garden"],
    "Sylhet": ["Jaflong", "Ratargul Swamp Forest", "Lalakhal"],
    "Tangail": ["Mohera Zamindar Bari", "Atia Mosque", "Madhupur National Park"],
    "Thakurgaon": ["Baliadangi Surjapuri Mango Tree", "King Jangal", "Shalbagan"]
};

const API_URL = "http://localhost:5000/api/favorites";

const districtGrid = document.getElementById("districtGrid");
const districtSearch = document.getElementById("districtSearch");
const districtMessage = document.getElementById("districtMessage");

// ============================================
// CURRENT USER & ACTIVE NAVBAR
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

function updateActiveNavbar() {
    if (typeof setupUniversalNavbar === "function") {
        setupUniversalNavbar();
        return;
    }
    const user = getCurrentUser();
    const navLinks = document.querySelector(".nav-links");
    if (!navLinks) return;

    let userArea = document.getElementById("navUserArea");
    if (!userArea) {
        userArea = document.createElement("div");
        userArea.id = "navUserArea";
        userArea.style.display = "inline-flex";
        userArea.style.alignItems = "center";
        userArea.style.gap = "10px";
        navLinks.appendChild(userArea);
    }

    if (user && user.id) {
        const isAdmin = user.userType === "admin";
        userArea.innerHTML = `
            <span class="user-active-badge ${isAdmin ? 'admin-badge' : ''}" style="display:inline-flex; align-items:center; gap:6px; font-weight:700; padding:6px 12px; border-radius:20px; font-size:13px; background:#e6f7f0; color:#087f5b; border:1px solid #b5e8d5;">
                ${isAdmin ? '🛡️ ' + (user.fullName || 'Admin') + ' (Admin Active)' : '👤 ' + (user.fullName || 'Traveler') + ' (Active)'}
            </span>
            <a href="${isAdmin ? 'admin.html' : 'dashboard.html'}" class="btn-profile-green">
                My Profile
            </a>
            <button id="navLogoutBtn" type="button" class="nav-profile-btn" style="border: 1px solid #cbd5e1; background:white; color: #475569; padding: 8px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer;">
                Logout
            </button>
        `;

        const logoutBtn = document.getElementById("navLogoutBtn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", function () {
                sessionStorage.removeItem("travelKoriUser");
                sessionStorage.removeItem("travelKoriPendingHotelSearch");
                window.location.reload();
            });
        }
    } else {
        userArea.innerHTML = `
            <button id="loginBtn" type="button" style="padding: 10px 18px; border: none; border-radius: 7px; background-color: #087f5b; color: white; font-size: 14px; font-weight: 600; cursor: pointer;">Login</button>
            <button class="signup-btn" id="signupBtn" type="button" style="padding: 10px 18px; border: none; border-radius: 7px; background-color: #18332c; color: white; font-size: 14px; font-weight: 600; cursor: pointer;">Sign Up</button>
        `;
        document.getElementById("loginBtn")?.addEventListener("click", () => window.location.href = "login.html");
        document.getElementById("signupBtn")?.addEventListener("click", () => window.location.href = "signup.html");
    }
}

updateActiveNavbar();

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
        allDistrictsPanel.hidden = false;
        allDistrictsPanel.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
        const searchInput = document.getElementById("districtSearch");
        if (searchInput) searchInput.focus();
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
// DIVISION FILTERING & SEARCH
// ============================================

const districtDivisions = {
    "Dhaka": ["Dhaka", "Faridpur", "Gazipur", "Gopalganj", "Kishoreganj", "Madaripur", "Manikganj", "Munshiganj", "Narayanganj", "Narsingdi", "Rajbari", "Shariatpur", "Tangail"],
    "Chattogram": ["Bandarban", "Brahmanbaria", "Chandpur", "Chattogram", "Cumilla", "Cox's Bazar", "Feni", "Khagrachhari", "Lakshmipur", "Noakhali", "Rangamati"],
    "Rajshahi": ["Bogura", "Chapai Nawabganj", "Joypurhat", "Naogaon", "Natore", "Pabna", "Rajshahi", "Sirajganj"],
    "Khulna": ["Bagerhat", "Chuadanga", "Jashore", "Jhenaidah", "Khulna", "Kushtia", "Magura", "Meherpur", "Narail", "Satkhira"],
    "Barishal": ["Barguna", "Barishal", "Bhola", "Jhalokati", "Patuakhali", "Pirojpur"],
    "Sylhet": ["Habiganj", "Moulvibazar", "Sunamganj", "Sylhet"],
    "Rangpur": ["Dinajpur", "Gaibandha", "Kurigram", "Lalmonirhat", "Nilphamari", "Panchagarh", "Rangpur", "Thakurgaon"],
    "Mymensingh": ["Jamalpur", "Mymensingh", "Netrokona", "Sherpur"]
};

let currentSelectedDivision = "ALL";

function getFilteredDistricts() {
    let list = districts;

    if (currentSelectedDivision && currentSelectedDivision.toUpperCase() !== "ALL") {
        const divKey = Object.keys(districtDivisions).find(k => k.toLowerCase() === currentSelectedDivision.toLowerCase());
        const divisionMembers = divKey ? districtDivisions[divKey] : [];
        list = list.filter(d => divisionMembers.includes(d));
    }

    if (districtSearch) {
        const searchText = districtSearch.value.trim().toLowerCase();
        if (searchText) {
            list = list.filter(d => d.toLowerCase().includes(searchText));
        }
    }

    return list;
}

// Wire up division buttons
document.querySelectorAll(".division-pill-btn").forEach(btn => {
    btn.addEventListener("click", function() {
        document.querySelectorAll(".division-pill-btn").forEach(b => b.classList.remove("active"));
        this.classList.add("active");
        currentSelectedDivision = (this.getAttribute("data-division") || "ALL").trim();
        displayDistricts(getFilteredDistricts());
    });
});

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
        card.className = "destination-card modern-destination-card";

        // Determine division
        let divisionName = "Bangladesh";
        for (const [divKey, dists] of Object.entries(districtDivisions)) {
            if (dists.includes(district)) {
                divisionName = divKey;
                break;
            }
        }

        // Top bar with Division badge and Favorite button
        const cardTopBar = document.createElement("div");
        cardTopBar.className = "card-top-bar";

        const divisionBadge = document.createElement("span");
        divisionBadge.className = "card-division-badge";
        divisionBadge.innerHTML = `<span class="badge-pin">📍</span> ${divisionName} Division`;

        const favoriteButton = document.createElement("button");
        favoriteButton.type = "button";
        favoriteButton.className = "favorite-btn modern-fav-btn";

        const isFavorite = Array.isArray(favorites) && favorites.includes(district);
        favoriteButton.textContent = isFavorite ? "★ Favorited" : "☆ Favorite";
        favoriteButton.setAttribute("aria-pressed", String(isFavorite));

        favoriteButton.addEventListener("click", function () {
            toggleFavorite(district, favoriteButton);
        });

        cardTopBar.appendChild(divisionBadge);
        cardTopBar.appendChild(favoriteButton);

        // Title
        const title = document.createElement("h3");
        title.className = "card-district-title";
        title.textContent = district;

        // Popular Spots
        const spots = districtSpots[district] || ["Local Attractions", "Scenic Spots", "Historic Landmarks"];

        const spotsPreview = document.createElement("div");
        spotsPreview.className = "spots-preview-container";
        spotsPreview.innerHTML = `
            <span class="spots-label-text">Popular Attractions:</span>
            <div class="spots-tags-row">
                ${spots.map(s => `<span class="spot-pill-tag"><span class="tag-bullet"></span>${s}</span>`).join("")}
            </div>
        `;

        // Expandable Details Drawer
        const spotDetailsDiv = document.createElement("div");
        spotDetailsDiv.className = "spot-details-panel";
        spotDetailsDiv.hidden = true;

        spotDetailsDiv.innerHTML = `
            <div class="spot-details-inner">
                <p class="drawer-header-title">✨ Key Highlights in ${district}:</p>
                <div class="spot-items-list">
                    ${spots.map((spot, i) => `
                        <div class="spot-item-card">
                            <span class="spot-num-circle">${i + 1}</span>
                            <div class="spot-item-content">
                                <strong>${spot}</strong>
                                <span class="spot-item-desc">Premier tourist landmark with scenic views and cultural importance in ${district}.</span>
                            </div>
                        </div>
                    `).join("")}
                </div>
                <div class="card-shortcuts-grid">
                    <a href="transport.html?destination=${encodeURIComponent(district)}" class="shortcut-pill transport-pill">
                        <span>🚌</span> Book Transport →
                    </a>
                    <a href="hotel-booking.html?district=${encodeURIComponent(district)}" class="shortcut-pill hotel-pill">
                        <span>🏨</span> Find Hotels →
                    </a>
                    <a href="district-details.html?district=${encodeURIComponent(district)}" class="shortcut-pill guide-pill">
                        <span>🗺️</span> Full Guide & Map →
                    </a>
                </div>
            </div>
        `;

        // Explore Action Button
        const detailsButton = document.createElement("button");
        detailsButton.type = "button";
        detailsButton.className = "details-btn modern-explore-btn";
        detailsButton.innerHTML = `<span>Explore Destination</span> <span class="btn-chevron">▼</span>`;

        detailsButton.addEventListener("click", function () {
            const isHidden = spotDetailsDiv.hidden;
            spotDetailsDiv.hidden = !isHidden;
            detailsButton.classList.toggle("active-open", isHidden);
            detailsButton.innerHTML = isHidden 
                ? `<span>Hide Destination</span> <span class="btn-chevron">▲</span>` 
                : `<span>Explore Destination</span> <span class="btn-chevron">▼</span>`;
        });

        // Assemble Card
        card.appendChild(cardTopBar);
        card.appendChild(title);
        card.appendChild(spotsPreview);
        card.appendChild(detailsButton);
        card.appendChild(spotDetailsDiv);

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

console.log("Total districts initialized:", districts.length);

// ============================================
// POPULAR DESTINATIONS MODAL & REVIEW SYSTEM (SECTIONS E & F)
// ============================================

const popularDestinationsData = {
    "coxs-bazar": {
        id: "coxs-bazar",
        title: "Cox's Bazar Beach & Kolatoli Point",
        district: "Cox's Bazar",
        category: "Beach",
        image: "images/destinations/coxs-bazar.jpg",
        rating: 4.9,
        reviewsCount: 1420,
        description: "The world's longest unbroken natural sandy sea beach stretching 120 km along the Bay of Bengal. Famous for spectacular sunsets, fresh seafood stalls, and lively beach walks along Kolatoli, Laboni, and Sugandha beaches.",
        entranceFee: "Free Entry",
        operatingHours: "Open 24 Hours",
        bestSeason: "October to March"
    },
    "sajek-valley": {
        id: "sajek-valley",
        title: "Sajek Cloud Valley & Helipad Viewpoint",
        district: "Rangamati",
        category: "Hill Escape",
        image: "images/destinations/sajek-valley.jpg",
        rating: 4.9,
        reviewsCount: 980,
        description: "Known as the Queen of Hills in Bangladesh, Sajek Valley sits 1,800 feet above sea level surrounded by rolling green hill tracts and drifting white clouds.",
        entranceFee: "BDT 50",
        operatingHours: "Open 24 Hours",
        bestSeason: "Monsoon & Winter (Sept - Feb)"
    },
    "sylhet": {
        id: "sylhet",
        title: "Sylhet Ratargul Swamp & Jaflong River",
        district: "Sylhet",
        category: "Tea Gardens",
        image: "images/destinations/sylhet.jpg",
        rating: 4.8,
        reviewsCount: 1150,
        description: "The land of two leaves and a bud, featuring emerald green freshwater swamp forests in Ratargul and crystal clear mountain waters along Jaflong and Lalakhal.",
        entranceFee: "Free Entry (Boat hire ~BDT 500-1000)",
        operatingHours: "06:00 AM - 06:00 PM",
        bestSeason: "June - October for swamp, Nov - Mar for clear water"
    },
    "bandarban": {
        id: "bandarban",
        title: "Bandarban Nilgiri & Boga Lake Peak",
        district: "Bandarban",
        category: "Mountains",
        image: "images/destinations/bandarban.jpg",
        rating: 4.8,
        reviewsCount: 890,
        description: "The highest hill peaks of Bangladesh with winding mountain roads, clouds at your feet at Nilgiri resort, and trekking trails to mystical Boga Lake and Keokradong.",
        entranceFee: "BDT 100",
        operatingHours: "07:00 AM - 06:00 PM",
        bestSeason: "September to March"
    },
    "sundarbans": {
        id: "sundarbans",
        title: "Sundarbans Mangrove Tiger Safari",
        district: "Bagerhat",
        category: "Mangrove Wildlife",
        image: "images/destinations/sundarbans.jpg",
        rating: 4.9,
        reviewsCount: 760,
        description: "UNESCO World Heritage site and the largest halophytic mangrove forest on earth, home to the majestic Royal Bengal Tiger, spotted deer, and winding tidal estuaries.",
        entranceFee: "BDT 150 (Plus boat entry)",
        operatingHours: "07:00 AM - 05:30 PM",
        bestSeason: "November to March"
    },
    "kuakata": {
        id: "kuakata",
        title: "Kuakata Sagar Kannya Beach",
        district: "Patuakhali",
        category: "Coastal Beach",
        image: "images/destinations/kuakata.jpg",
        rating: 4.7,
        reviewsCount: 640,
        description: "The unique Daughter of the Sea where travelers can witness both the sunrise and sunset over the Bay of Bengal from the same unbroken sandy beach.",
        entranceFee: "Free Entry",
        operatingHours: "Open 24 Hours",
        bestSeason: "October to March"
    }
};

let currentModalDestination = null;
let currentSelectedRating = 5;

window.openDestinationDetails = async function (key) {
    const dest = popularDestinationsData[key] || Object.values(popularDestinationsData).find(d => d.district.toLowerCase() === String(key).toLowerCase()) || popularDestinationsData["coxs-bazar"];
    currentModalDestination = dest;

    const modal = document.getElementById("destinationModal");
    if (!modal) return;

    // Populate Visuals and details
    document.getElementById("destModalImg").src = dest.image;
    document.getElementById("destModalTag").textContent = dest.category;
    document.getElementById("destModalTitle").textContent = dest.title;
    document.getElementById("destModalLocation").textContent = `📍 ${dest.district} District, Bangladesh`;
    document.getElementById("destModalRatingVal").textContent = dest.rating;
    document.getElementById("destModalReviewsCount").textContent = `(${dest.reviewsCount.toLocaleString()} reviews)`;
    document.getElementById("destModalDesc").textContent = dest.description;
    document.getElementById("destModalFee").textContent = dest.entranceFee;
    document.getElementById("destModalHours").textContent = dest.operatingHours;
    document.getElementById("destModalSeason").textContent = dest.bestSeason;

    // Shortcuts
    document.getElementById("destModalMapBtn").href = `route-map.html?destination=${encodeURIComponent(dest.district)}`;
    document.getElementById("destModalHotelBtn").href = `hotel-booking.html?district=${encodeURIComponent(dest.district)}`;
    document.getElementById("destModalTransportBtn").href = `transport.html?destination=${encodeURIComponent(dest.district)}`;

    // Reset review form
    const reviewForm = document.getElementById("destReviewForm");
    if (reviewForm) reviewForm.reset();
    const feedback = document.getElementById("destReviewFeedback");
    if (feedback) feedback.textContent = "";
    setStarRating(5);

    // Show modal
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";

    // Load real reviews from backend
    loadDestinationReviews(dest);
};

function setStarRating(val) {
    currentSelectedRating = val;
    const numDisplay = document.getElementById("starRatingNum");
    if (numDisplay) numDisplay.textContent = Number(val).toFixed(1);
    document.querySelectorAll(".star-pill").forEach(p => {
        const pVal = Number(p.getAttribute("data-val"));
        p.classList.toggle("active", pVal <= val);
    });
}

// Setup star click events
document.querySelectorAll(".star-pill").forEach(pill => {
    pill.addEventListener("click", function () {
        const val = Number(this.getAttribute("data-val")) || 5;
        setStarRating(val);
    });
});

async function loadDestinationReviews(dest) {
    const listEl = document.getElementById("destReviewsList");
    if (!listEl) return;
    listEl.innerHTML = `<div style="padding:16px; text-align:center; color:#64748b; font-size:13px;">Loading real reviews...</div>`;

    let reviews = [];
    try {
        const res = await fetch(`http://localhost:5000/api/destinations/${encodeURIComponent(dest.title)}/reviews`);
        if (res.ok) {
            const data = await res.json();
            if (data.reviews && data.reviews.length > 0) {
                reviews = data.reviews;
            }
        }
    } catch (e) {
        console.warn("Could not fetch remote reviews:", e.message);
    }

    if (!reviews || reviews.length === 0) {
        // Fallback realistic reviews
        reviews = [
            {
                userName: "Tanvir Chowdhury",
                rating: 5,
                comment: "Spectacular ocean views and great evening breeze! Tried fresh grilled pomfret near Laboni point. Highly recommended during winter.",
                date: new Date(Date.now() - 86400000 * 2).toISOString()
            },
            {
                userName: "Nusrat Jahan",
                rating: 5,
                comment: "Beautiful sunset photos, clear skyline and very safe beach walk with family. Hotel booking through Travel Kori was seamless.",
                date: new Date(Date.now() - 86400000 * 5).toISOString()
            },
            {
                userName: "Stephen Sikder",
                rating: 4,
                comment: "Longest unbroken beach in the world and definitely worth visiting! Make sure to take an electric auto to Inani for marine drive views.",
                date: new Date(Date.now() - 86400000 * 12).toISOString()
            }
        ];
    }

    listEl.innerHTML = reviews.map(r => `
        <div class="dest-review-card">
            <div class="review-card-top">
                <div class="reviewer-meta">
                    <span class="reviewer-avatar">👤</span>
                    <div>
                        <strong class="reviewer-name">${escapeHTML(r.userName || "Verified Traveler")}</strong>
                        <span class="reviewer-date">${r.date ? new Date(r.date).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' }) : "Recent Visit"}</span>
                    </div>
                </div>
                <div class="review-stars-badge">${"★".repeat(Math.round(r.rating || 5))}</div>
            </div>
            <p class="review-comment-text">${escapeHTML(r.comment)}</p>
        </div>
    `).join("");
}

// Handle Review Submission
const destReviewForm = document.getElementById("destReviewForm");
if (destReviewForm) {
    destReviewForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        const feedback = document.getElementById("destReviewFeedback");
        const submitBtn = document.getElementById("destReviewSubmitBtn");
        const comment = document.getElementById("destReviewText").value.trim();

        const user = getCurrentUser();
        if (!user || !user.id) {
            if (feedback) {
                feedback.innerHTML = `<span style="color:#dc2626;">Please <a href="login.html" style="text-decoration:underline; font-weight:700;">Login</a> first to post a review.</span>`;
            }
            return;
        }

        if (!comment) return;

        submitBtn.disabled = true;
        submitBtn.textContent = "Posting...";

        try {
            const destTitle = currentModalDestination ? currentModalDestination.title : "Cox's Bazar Beach & Kolatoli Point";
            const res = await fetch(`http://localhost:5000/api/destinations/${encodeURIComponent(destTitle)}/reviews`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user.id,
                    rating: currentSelectedRating,
                    comment: comment
                })
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || "Failed to post review.");
            }

            if (feedback) {
                feedback.innerHTML = `<span style="color:#087f5b; font-weight:700;">✓ Review posted successfully!</span>`;
            }
            document.getElementById("destReviewText").value = "";

            // Reload reviews list
            if (currentModalDestination) {
                loadDestinationReviews(currentModalDestination);
            }
        } catch (err) {
            if (feedback) {
                feedback.innerHTML = `<span style="color:#dc2626;">${err.message}</span>`;
            }
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = "Post Review →";
        }
    });
}

// Close Modal handlers
document.getElementById("destModalCloseBtn")?.addEventListener("click", function () {
    const modal = document.getElementById("destinationModal");
    if (modal) modal.style.display = "none";
    document.body.style.overflow = "auto";
});

document.getElementById("destinationModal")?.addEventListener("click", function (e) {
    if (e.target === this) {
        this.style.display = "none";
        document.body.style.overflow = "auto";
    }
});

function escapeHTML(str) {
    return String(str || "").replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}