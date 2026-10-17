
const districtData = {
    "Dhaka": {
        description: "Dhaka is the capital of Bangladesh, famous for its history, architecture and vibrant city life.",
        attractions: [
            { name: "Lalbagh Fort", description: "A historic Mughal-era fort in Old Dhaka." },
            { name: "Ahsan Manzil", description: "A historic pink palace beside the Buriganga River." },
            { name: "National Parliament House", description: "A famous architectural landmark designed by Louis Kahn." }
        ]
    },

    "Cox's Bazar": {
        description: "Cox's Bazar is famous for its long sandy sea beach and coastal scenery.",
        attractions: [
            { name: "Cox's Bazar Sea Beach", description: "A popular destination known for its long sandy shoreline." },
            { name: "Himchari National Park", description: "A natural area known for hills, forest and coastal views." },
            { name: "Inani Beach", description: "A scenic beach known for its rocky coral stones." }
        ]
    },

    "Sylhet": {
        description: "Sylhet is known for its tea gardens, hills, rivers and natural landscapes.",
        attractions: [
            { name: "Jaflong", description: "A scenic area known for hills, rivers and stone collection." },
            { name: "Ratargul Swamp Forest", description: "A freshwater swamp forest with trees growing in water during the rainy season." },
            { name: "Lalakhal", description: "A beautiful river destination known for its clear blue-green water." }
        ]
    },

    "Chattogram": {
        description: "Chattogram is a major port city surrounded by hills and beaches.",
        attractions: [
            { name: "Patenga Sea Beach", description: "A popular seaside destination near Chattogram city." },
            { name: "Foy's Lake", description: "An artificial lake surrounded by hills and greenery." },
            { name: "Sitakunda", description: "An area known for hills, trails and natural scenery." }
        ]
    },

    "Rangamati": {
        description: "Rangamati is famous for its hills, indigenous culture and Kaptai Lake.",
        attractions: [
            { name: "Kaptai Lake", description: "A large lake surrounded by green hills." },
            { name: "Hanging Bridge", description: "A well-known bridge and popular sightseeing spot." },
            { name: "Shuvolong Waterfall", description: "A waterfall that is especially attractive during the rainy season." }
        ]
    },

    "Khulna": {
        description: "Khulna is an important gateway to the Sundarbans mangrove forest.",
        attractions: [
            { name: "Sundarbans", description: "A vast mangrove forest famous for its unique wildlife." },
            { name: "Khan Jahan Ali Bridge", description: "A notable bridge over the Rupsha River." },
            { name: "Rabindra Complex", description: "A cultural and historical site associated with Rabindranath Tagore." }
        ]
    },

    "Rajshahi": {
        description: "Rajshahi is known for mangoes, silk and historical landmarks.",
        attractions: [
            { name: "Varendra Research Museum", description: "A museum preserving archaeological and historical collections." },
            { name: "Puthia Temple Complex", description: "A group of historic temples known for their architecture." },
            { name: "Bagha Mosque", description: "A historic mosque known for its terracotta ornamentation." }
        ]
    },

    "Bogura": {
        description: "Bogura is a historic district known for archaeological heritage and yogurt.",
        attractions: [
            { name: "Mahasthangarh", description: "One of the oldest known urban archaeological sites in Bangladesh." },
            { name: "Gokul Medh", description: "An archaeological mound associated with local historical legends." },
            { name: "Nawab Palace", description: "A historic palace associated with Bogura's local heritage." }
        ]
    },

    "Bandarban": {
        description: "Bandarban is known for mountain scenery, waterfalls and green forests.",
        attractions: [
            { name: "Nilgiri", description: "A hilltop destination offering panoramic mountain views." },
            { name: "Boga Lake", description: "A scenic lake surrounded by hills." },
            { name: "Chimbuk Hill", description: "A popular hill destination known for wide-ranging views." }
        ]
    },

    "Sunamganj": {
        description: "Sunamganj is famous for wetlands, natural beauty and Baul music heritage.",
        attractions: [
            { name: "Tanguar Haor", description: "A large wetland ecosystem rich in birds and aquatic life." },
            { name: "Jadukata River", description: "A scenic river known for its clear water and surrounding landscape." },
            { name: "Shimul Garden", description: "A garden area known for its seasonal red Shimul blossoms." }
        ]
    }
};

const params = new URLSearchParams(window.location.search);
const districtName = params.get("name");

const nameElement = document.getElementById("districtName");
const descriptionElement = document.getElementById("districtDescription");
const attractionGrid = document.getElementById("attractionGrid");

const district = districtData[districtName];

if (district) {
    nameElement.textContent = districtName;
    descriptionElement.textContent = district.description;

    district.attractions.forEach(function (attraction) {
        const card = document.createElement("article");
        card.className = "destination-card";

        const title = document.createElement("h3");
        title.textContent = attraction.name;

        const details = document.createElement("p");
        details.textContent = attraction.description;

        const mapLink = document.createElement("a");
        mapLink.textContent = "View on Google Maps";
        mapLink.href =
            "https://www.google.com/maps/search/?api=1&query=" +
            encodeURIComponent(attraction.name + ", Bangladesh");
        mapLink.target = "_blank";
        mapLink.rel = "noopener noreferrer";
        mapLink.className = "map-link";

        card.appendChild(title);
        card.appendChild(details);
        card.appendChild(mapLink);

        attractionGrid.appendChild(card);
    });
} else {
    nameElement.textContent = districtName || "District Not Found";
    descriptionElement.textContent =
        "Detailed information for this district is not available yet.";
}

console.log("District details loaded:", districtName);
