
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
    "Sherpur": ["Madhutila Eco Park", "Gajni অবকাশ কেন্দ্র", "Garo Hills"],
    "Sirajganj": ["Jamuna Bridge", "Hatikumrul Navaratna Temple", "Jamuna Riverbank"],
    "Sunamganj": ["Tanguar Haor", "Jadukata River", "Shimul Garden"],
    "Sylhet": ["Jaflong", "Ratargul Swamp Forest", "Lalakhal"],
    "Tangail": ["Mohera Zamindar Bari", "Atia Mosque", "Madhupur National Park"],
    "Thakurgaon": ["Baliadangi Surjapuri Mango Tree", "King Jangal", "Shalbagan"]
};

const districtData = {};

Object.keys(districtSpots).forEach(function (districtName) {
    districtData[districtName] = {
        description:
            "Explore the cultural heritage, natural beauty and attractions of " +
            districtName + ", Bangladesh.",

        attractions: districtSpots[districtName].map(function (spotName) {
            return {
                name: spotName,
                description:
                    spotName + " is a destination to explore in or around " +
                    districtName + ", Bangladesh."
            };
        })
    };
});

const params = new URLSearchParams(window.location.search);
const districtName = params.get("name");

const nameElement = document.getElementById("districtName");
const descriptionElement = document.getElementById("districtDescription");
const attractionGrid = document.getElementById("attractionGrid");

if (districtName && districtData[districtName]) {
    const district = districtData[districtName];

    nameElement.textContent = districtName;
    descriptionElement.textContent = district.description;

    attractionGrid.innerHTML = "";

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
            encodeURIComponent(
                attraction.name + ", " + districtName + ", Bangladesh"
            );

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
console.log("Unique districts available:", Object.keys(districtData).length);
