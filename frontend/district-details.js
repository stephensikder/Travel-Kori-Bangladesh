
const districtData = {
    "Dhaka": {
        description: "Dhaka is the capital of Bangladesh, famous for its history, architecture, culture and vibrant city life.",
        attractions: [
            "Lalbagh Fort",
            "Ahsan Manzil",
            "National Parliament House"
        ]
    },

    "Cox's Bazar": {
        description: "Cox's Bazar is famous for its long sandy sea beach, coastal scenery and beautiful sunsets.",
        attractions: [
            "Cox's Bazar Sea Beach",
            "Himchari National Park",
            "Inani Beach"
        ]
    },

    "Sylhet": {
        description: "Sylhet is known for its green tea gardens, hills, rivers and beautiful natural landscapes.",
        attractions: [
            "Jaflong",
            "Ratargul Swamp Forest",
            "Lalakhal"
        ]
    },

    "Chattogram": {
        description: "Chattogram is a major port city surrounded by hills, beaches and scenic landscapes.",
        attractions: [
            "Patenga Sea Beach",
            "Foy's Lake",
            "Sitakunda"
        ]
    },

    "Rangamati": {
        description: "Rangamati is famous for its green hills, indigenous culture and scenic Kaptai Lake.",
        attractions: [
            "Kaptai Lake",
            "Hanging Bridge",
            "Shuvolong Waterfall"
        ]
    },

    "Khulna": {
        description: "Khulna is an important gateway to the Sundarbans, the world's largest mangrove forest.",
        attractions: [
            "Sundarbans",
            "Khan Jahan Ali Bridge",
            "Rabindra Complex"
        ]
    },

    "Rajshahi": {
        description: "Rajshahi is known for its mangoes, silk, educational institutions and historical landmarks.",
        attractions: [
            "Varendra Research Museum",
            "Puthia Temple Complex",
            "Bagha Mosque"
        ]
    },

    "Bogura": {
        description: "Bogura is a historic district known for archaeological heritage and its famous yogurt.",
        attractions: [
            "Mahasthangarh",
            "Gokul Medh",
            "Nawab Palace"
        ]
    },

    "Bandarban": {
        description: "Bandarban is known for its mountain scenery, waterfalls, green forests and indigenous communities.",
        attractions: [
            "Nilgiri",
            "Boga Lake",
            "Chimbuk Hill"
        ]
    },

    "Sunamganj": {
        description: "Sunamganj is famous for its wetlands, seasonal natural beauty and traditional Baul music heritage.",
        attractions: [
            "Tanguar Haor",
            "Jadukata River",
            "Shimul Garden"
        ]
    }
};

// Read the district name from the URL
const params = new URLSearchParams(window.location.search);
const districtName = params.get("name");

// Get the required HTML elements
const nameElement = document.getElementById("districtName");
const descriptionElement = document.getElementById("districtDescription");
const attractionGrid = document.getElementById("attractionGrid");

// Find and display district information
const district = districtData[districtName];

if (district) {
    nameElement.textContent = districtName;
    descriptionElement.textContent = district.description;

    district.attractions.forEach(function (attraction) {
        const card = document.createElement("article");
        card.className = "destination-card";

        
const title = document.createElement("h3");
title.textContent = attraction;

const mapLink = document.createElement("a");
mapLink.textContent = "View on Google Maps";
mapLink.href =
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(attraction + ", Bangladesh");

mapLink.target = "_blank";
mapLink.rel = "noopener noreferrer";
mapLink.className = "map-link";

card.appendChild(title);
card.appendChild(mapLink);
attractionGrid.appendChild(card);

    });
} else {
    nameElement.textContent = districtName || "District Not Found";

    descriptionElement.textContent =
        "Detailed information for this district is not available yet.";
}

console.log("District details loaded:", districtName);
