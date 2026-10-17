
const districtData = {
    "Dhaka": {
        description: "Dhaka is the capital of Bangladesh, known for its history, culture and vibrant city life.",
        attractions: ["Lalbagh Fort", "Ahsan Manzil", "National Parliament House"]
    },

    "Cox's Bazar": {
        description: "Cox's Bazar is famous for its long natural sandy sea beach and coastal beauty.",
        attractions: ["Cox's Bazar Sea Beach", "Himchari", "Inani Beach"]
    },

    "Sylhet": {
        description: "Sylhet is known for its green tea gardens, hills, rivers and natural beauty.",
        attractions: ["Jaflong", "Ratargul Swamp Forest", "Lalakhal"]
    },

    "Chattogram": {
        description: "Chattogram is a major port city with hills, beaches and scenic landscapes.",
        attractions: ["Patenga Beach", "Foy's Lake", "Sitakunda"]
    },

    "Rangamati": {
        description: "Rangamati is famous for its hills, forests and the beautiful Kaptai Lake.",
        attractions: ["Kaptai Lake", "Hanging Bridge", "Shuvolong Waterfall"]
    },

    "Khulna": {
        description: "Khulna is a gateway to the Sundarbans, the world's largest mangrove forest.",
        attractions: ["Sundarbans", "Khan Jahan Ali Bridge", "Rabindra Complex"]
    }
};

// Read the district name from the URL
const params = new URLSearchParams(window.location.search);
const districtName = params.get("name");

// Find the district information
const district = districtData[districtName];

const nameElement = document.getElementById("districtName");
const descriptionElement = document.getElementById("districtDescription");
const attractionGrid = document.getElementById("attractionGrid");

if (district) {
    nameElement.textContent = districtName;
    descriptionElement.textContent = district.description;

    district.attractions.forEach(function (attraction) {
        const card = document.createElement("article");
        card.className = "destination-card";

        const title = document.createElement("h3");
        title.textContent = attraction;

        card.appendChild(title);
        attractionGrid.appendChild(card);
    });
} else {
    nameElement.textContent = districtName || "District Not Found";

    descriptionElement.textContent =
        "Detailed information for this district is not available yet.";
}
