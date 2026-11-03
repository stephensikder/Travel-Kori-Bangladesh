// ============================================
// TRAVEL KORI BANGLADESH - DISTRICT DETAILS SCRIPT
// Live Google Maps Integration & MongoDB 64 Districts
// ============================================

const API_URL = "http://localhost:5000";

// Fallback spots in case offline
const districtSpots = {
    "Bagerhat": ["Sixty Dome Mosque", "Khan Jahan Ali Shrine", "Sundarbans Eco Gateway"],
    "Bandarban": ["Nilgiri", "Boga Lake", "Chimbuk Hill"],
    "Barguna": ["Bibichini Shahi Mosque", "Haringhata Forest", "Fatrar Char"],
    "Barishal": ["Oxford Mission Church", "Durga Sagar Dighi", "Floating Guava Market (Bhimruli)"],
    "Bhola": ["Monpura Island", "Char Kukri Mukri", "Dhal Char"],
    "Bogura": ["Mahasthangarh", "Gokul Medh (Behula Bashor Ghar)", "Kherua Mosque"],
    "Brahmanbaria": ["Arifail Mosque", "Haripur Zamindar Bari", "Titas Riverfront"],
    "Chandpur": ["Mollah Bari Confluence", "Rupsha Zamindar Bari", "Haimchar Meghna Riverbank"],
    "Chapai Nawabganj": ["Choto Sona Mosque", "Darasbari Mosque & Madrasa", "Kansat Mango Hub"],
    "Chattogram": ["Patenga Sea Beach", "Foy's Lake", "Sitakunda Chandranath Temple"],
    "Chuadanga": ["Carew & Co Historic Plant", "Darsana Border Point", "Gholdari Shahi Mosque"],
    "Cox's Bazar": ["Cox's Bazar Sea Beach", "Himchari National Park", "Inani Coral Beach & Marine Drive"],
    "Cumilla": ["Shalban Vihara & Mainamati", "Dharmasagar Dighi", "Commonwealth War Cemetery"],
    "Dhaka": ["Lalbagh Fort", "Ahsan Manzil (Pink Palace)", "National Parliament House"],
    "Dinajpur": ["Kantajew Temple (Kantanagar)", "Ramsagar National Park", "Nayabad Mosque"],
    "Faridpur": ["Mathurapur Deul", "Padma Riverfront & Chars", "Kanaipur Zamindar Bari"],
    "Feni": ["Muhuri Irrigation Reservoir", "Bijoy Singh Dighi", "Rajajhir Dighi"],
    "Gaibandha": ["Brahmaputra River Islands", "Ghagot Eco Park", "Bardhan Kuthi"],
    "Gazipur": ["Bhawal National Park", "Safari Park", "Nuhash Polli"],
    "Gopalganj": ["Tungipara Mausoleum Complex", "Orakandi Thakur Bari", "Ujani Royal Palace"],
    "Habiganj": ["Satchari National Park", "Rema-Kalenga Wildlife Sanctuary", "Tea Garden Hills"],
    "Jamalpur": ["Lauchapra Eco Leisure Spot", "Gandhi Ashram", "Jamuna River Viewpoint"],
    "Jashore": ["Sagardari Michael Madhusudan Memorial", "Godkhali Flower Capital", "Chanchra Shiva Temple"],
    "Jhalokati": ["Gabkhan Bridge & Channel", "Kirtipasha Zamindar Bari", "Floating Guava Canals"],
    "Jhenaidah": ["Naldanga Palace & Temples", "Shailkupa Shahi Mosque", "Miah Bari Dighi"],
    "Joypurhat": ["Paharpur Fringe Archaeological Outpost", "Lokma Zamindar Bari", "Hinda-Kasba Shahi Mosque"],
    "Khagrachhari": ["Alutila Mysterious Cave", "Richang Waterfall", "Hanging Bridge"],
    "Khulna": ["Sundarbans Kotka & Kochikhali", "Rupsha Bridge", "Pithavog Rabindra Complex"],
    "Kishoreganj": ["Nikli Haor", "Sholakia Eidgah Maidan", "Pagla Mosque"],
    "Kurigram": ["Dharla Bridge", "Chilmari River Port", "Chandamari Mosque"],
    "Kushtia": ["Lalon Shah Shrine", "Shilaidaha Rabindra Kuthibari", "Hardinge Bridge"],
    "Lakshmipur": ["Dalal Bazar Zamindar Bari", "Ramgati Meghna Estuary", "Khoa Sagar Dighi"],
    "Lalmonirhat": ["Teesta Barrage", "Tin Bigha Corridor", "Burimari Land Port"],
    "Madaripur": ["Shakuni Lake", "Aulapur Zamindar Bari", "Arial Khan Riverbank"],
    "Magura": ["Sreepur Zamindar Bari", "Madhumati Riverfront", "Siddheswari Kali Temple"],
    "Manikganj": ["Baliati Palace (Saturia)", "Teota Zamindar Bari", "Aricha Ghat"],
    "Meherpur": ["Mujibnagar Memorial Complex", "Amjhupi Nilkuthi", "Bhatpara Nilkuthi"],
    "Moulvibazar": ["Lawachara National Park (Srimangal)", "Madhabkunda Waterfall", "Madhabpur Lake"],
    "Munshiganj": ["Idrakpur Fort", "Baba Adam Shahid Mosque", "Mawa Padma Bridge Overlook"],
    "Mymensingh": ["Shashi Lodge (Rajbari)", "Muktagacha Zamindar Bari", "Old Brahmaputra Riverfront"],
    "Naogaon": ["Somapura Mahavihara (Paharpur)", "Kusumba Mosque", "Dibar Dighi"],
    "Narail": ["SM Sultan Memorial Complex", "Chitra River Otter Fishing", "Niribili Picnic Spot"],
    "Narayanganj": ["Sonargaon & Panam City", "Folk Art & Crafts Museum", "Goaldi Mosque"],
    "Narsingdi": ["Wari-Bateshwar Archaeological Site", "Dream Holiday Park", "Girashil Hills"],
    "Natore": ["Uttara Ganabhaban (Dighapatia Palace)", "Rani Bhabani Rajbari", "Chalan Beel Wetland"],
    "Netrokona": ["Birishiri Ceramic Hills & Lake", "Someshwari River & Garo Hills", "Ranikhong Church"],
    "Nilphamari": ["Nilsagar (Bibir Pukur)", "Chini Mosque (Sayedpur)", "Teesta Barrage Edge"],
    "Noakhali": ["Nijhum Dweep National Park", "Musapur Coastal Closure", "Gandhi Ashram Trust"],
    "Pabna": ["Hardinge Bridge & Pakshi Eco Park", "Jor Bangla Temple", "Tarash Rajbari"],
    "Panchagarh": ["Tetulia Kanchenjunga Viewpoint", "Banglabandha Zero Point", "Plainland Tea Gardens"],
    "Patuakhali": ["Kuakata Sea Beach (Sagor Kannya)", "Fatrar Ban Mangrove", "Lebur Char Red Crab Beach"],
    "Pirojpur": ["Rayerkathi Zamindar Bari", "Kuriana Floating Guava Market", "Kaukhali River Promenade"],
    "Rajbari": ["Goalanda Ghat & Padma Hilsa Hub", "Kalyan Dighi", "Mir Mosharraf Hossain Memorial"],
    "Rajshahi": ["Varendra Research Museum", "Puthia Temple Complex", "Bagha Shahi Mosque"],
    "Rangamati": ["Kaptai Lake", "Hanging Bridge", "Shuvolong Waterfall"],
    "Rangpur": ["Tajhat Palace", "Carmichael College Campus", "Chikli Beel"],
    "Satkhira": ["Sundarbans Kalagachia", "Prabartak Ashram", "Mandarbari Sea Beach"],
    "Shariatpur": ["Fatehabad Historic Mosque", "Padma River Viewpoint", "Rajnagar Historic Ruins"],
    "Sherpur": ["Madhutila Eco Park", "Gajni Recreation Centre", "Garo Pahar Frontier Trails"],
    "Sirajganj": ["Bangabandhu Jamuna Bridge", "Navaratna Temple (Hatikumrul)", "Jamuna Eco Park"],
    "Sunamganj": ["Tanguar Haor (UNESCO Ramsar)", "Jadukata River & Barek Tilla", "Shimul Bagan"],
    "Sylhet": ["Jaflong & Zero Point", "Ratargul Swamp Forest", "Lalakhal Emerald River"],
    "Tangail": ["Mohera Zamindar Bari", "Atia Mosque", "Madhupur National Park"],
    "Thakurgaon": ["Baliadangi Ancient Mango Tree", "King Jangal Fortifications", "Jagaddal Palace"]
};

// URL Parameters
const params = new URLSearchParams(window.location.search);
const requestedDistrict = (params.get("name") || params.get("district") || "Dhaka").trim();

// DOM elements
const nameEl = document.getElementById("districtName");
const descEl = document.getElementById("districtDescription");
const metaBadgeEl = document.getElementById("districtMetaBadge");
const mapIframe = document.getElementById("districtMapIframe");
const externalMapLink = document.getElementById("externalMapLink");
const attractionGrid = document.getElementById("attractionGrid");
const attractionMessage = document.getElementById("attractionMessage");
const actionButtonsEl = document.getElementById("districtActionButtons");
const hotelsSection = document.getElementById("districtHotelsSection");
const hotelsGrid = document.getElementById("districtHotelsGrid");

async function loadDistrictPage() {
    let districtData = null;

    // Fetch from backend API
    try {
        const res = await fetch(`${API_URL}/api/districts/${encodeURIComponent(requestedDistrict)}`);
        if (res.ok) {
            const json = await res.json();
            if (json.success && json.district) {
                districtData = json.district;
            }
        }
    } catch (err) {
        console.warn("Could not fetch district from API, using client fallback:", err);
    }

    // Fallback if API was unreachable or district not found
    if (!districtData) {
        const matchedName = Object.keys(districtSpots).find(k => k.toLowerCase() === requestedDistrict.toLowerCase()) || "Dhaka";
        const spots = districtSpots[matchedName] || ["Scenic Highlights", "Historical Sites", "Local Markets"];
        districtData = {
            name: matchedName,
            division: "Bangladesh",
            description: `Explore the vibrant tourist attractions, rich cultural history, and scenic landscapes of ${matchedName}.`,
            latitude: 23.8103,
            longitude: 90.4125,
            attractions: spots.map(s => ({
                name: s,
                category: "attraction",
                description: `Discover ${s} in ${matchedName}, Bangladesh. A must-visit attraction for domestic travelers.`,
                entranceFee: 0,
                openingHours: "Open daily"
            })),
            hotels: []
        };
    }

    renderDistrictUI(districtData);
}

function renderDistrictUI(district) {
    document.title = `${district.name} Details | Travel Kori Bangladesh`;

    if (nameEl) nameEl.textContent = district.name;
    if (descEl) descEl.textContent = district.description;

    document.querySelectorAll(".active-district-title").forEach(el => {
        el.textContent = district.name;
    });

    // Meta Badges
    if (metaBadgeEl) {
        metaBadgeEl.innerHTML = `
            <span style="background: #e6f7f0; color: #087f5b; padding: 4px 10px; border-radius: 6px; font-size: 13px; font-weight: 700; border: 1px solid #b5e8d5;">
                📍 ${district.division || "Bangladesh"}
            </span>
            ${district.area ? `<span style="background: #f1f5f9; color: #475569; padding: 4px 10px; border-radius: 6px; font-size: 13px; font-weight: 600;">Area: ${district.area.toLocaleString()} sq km</span>` : ''}
            ${district.population ? `<span style="background: #f1f5f9; color: #475569; padding: 4px 10px; border-radius: 6px; font-size: 13px; font-weight: 600;">Population: ${district.population.toLocaleString()}</span>` : ''}
        `;
    }

    // Action Buttons
    if (actionButtonsEl) {
        actionButtonsEl.innerHTML = `
            <a href="transport.html" class="btn-profile-green" style="font-size: 12px; padding: 7px 14px;">
                🚌 Book Bus / Train to ${district.name}
            </a>
            <a href="hotel-booking.html" class="signup-btn" style="padding: 7px 14px; font-size: 12px; text-decoration: none; border-radius: 7px; background: #17382f; color: white;">
                🏨 Find Hotels in ${district.name}
            </a>
            <button id="favoriteDistrictBtn" type="button" style="padding: 7px 14px; font-size: 12px; border: 1px solid #087f5b; background: white; color: #087f5b; border-radius: 7px; font-weight: 700; cursor: pointer;">
                ⭐ Save to Favorites
            </button>
        `;

        document.getElementById("favoriteDistrictBtn")?.addEventListener("click", () => saveToFavorites(district.name));
    }

    // Set Live Google Map Iframe
    setLiveMapQuery(district.name + ", Bangladesh");

    // Render Attractions
    if (attractionGrid) {
        attractionGrid.innerHTML = "";
        const spots = district.attractions || [];

        if (attractionMessage) {
            attractionMessage.textContent = `${spots.length} tourist spot(s) available`;
        }

        spots.forEach(spot => {
            const card = document.createElement("article");
            card.className = "destination-card attraction-card";
            card.style.display = "flex";
            card.style.flexDirection = "column";
            card.style.justifyContent = "space-between";
            card.style.padding = "20px";
            card.style.background = "#ffffff";
            card.style.borderRadius = "10px";
            card.style.border = "1px solid #dce7e2";

            const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.name + ', ' + district.name + ', Bangladesh')}`;

            card.innerHTML = `
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                        <h3 style="margin: 0; font-size: 17px; color: #17382f;">${spot.name}</h3>
                        <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; background: #e6f7f0; color: #087f5b; padding: 2px 6px; border-radius: 4px;">
                            ${spot.category || 'Spot'}
                        </span>
                    </div>
                    <p style="font-size: 13px; color: #556b63; line-height: 1.6; margin: 6px 0 12px;">
                        ${spot.description || `Experience ${spot.name} in ${district.name}.`}
                    </p>
                    <div style="font-size: 12px; color: #64748b; margin-bottom: 14px;">
                        <span>🎫 Fee: ${spot.entranceFee ? '৳' + spot.entranceFee : 'Free'}</span>
                        <span style="margin: 0 6px;">•</span>
                        <span>🕒 ${spot.openingHours || 'Open daily'}</span>
                    </div>
                </div>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <button class="btn-focus-map" type="button" style="padding: 6px 12px; font-size: 12px; font-weight: 700; background: #087f5b; color: white; border: none; border-radius: 6px; cursor: pointer;">
                        🗺️ View on Live Map
                    </button>
                    <a href="${googleMapsUrl}" target="_blank" rel="noopener noreferrer" style="padding: 6px 12px; font-size: 12px; font-weight: 600; color: #087f5b; border: 1px solid #087f5b; border-radius: 6px; text-decoration: none; display: inline-flex; align-items: center;">
                        Directions ↗
                    </a>
                </div>
            `;

            card.querySelector(".btn-focus-map")?.addEventListener("click", () => {
                setLiveMapQuery(`${spot.name}, ${district.name}, Bangladesh`);
                document.getElementById("districtLiveMapSection")?.scrollIntoView({ behavior: "smooth" });
            });

            attractionGrid.appendChild(card);
        });
    }

    // Render Hotels
    if (hotelsSection && district.hotels && district.hotels.length > 0) {
        hotelsSection.hidden = false;
        if (hotelsGrid) {
            hotelsGrid.innerHTML = district.hotels.map(h => {
                const img = h.image || `images/hotels/${h.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.jpg`;
                return `
                <div style="background: white; border: 1px solid #dce7e2; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04); display: flex; flex-direction: column;">
                    <img src="${img}" alt="${h.name}" style="width: 100%; height: 160px; object-fit: cover; background: #f1f5f9;" onerror="this.onerror=null; this.src='images/hotels/pan-pacific-sonargaon.jpg';">
                    <div style="padding: 16px; display: flex; flex-direction: column; flex-grow: 1;">
                        <h4 style="margin: 0 0 6px; color: #17382f; font-size: 16px; font-weight: 700;">${h.name}</h4>
                        <p style="margin: 4px 0; font-size: 12px; color: #64748b;">📍 ${h.address || district.name}</p>
                        <p style="margin: 6px 0; font-size: 15px; font-weight: 800; color: #087f5b;">৳${(h.priceStandard || 2500).toLocaleString()} <span style="font-size:12px; font-weight:normal; color:#64748b;">/ night</span></p>
                        <a href="hotel-booking.html?district=${encodeURIComponent(district.name)}&hotel=${encodeURIComponent(h.name)}" class="signup-btn" style="display: block; text-align: center; margin-top: auto; padding: 8px 12px; font-size: 12.5px; text-decoration: none; border-radius: 8px;">
                            Book this Hotel →
                        </a>
                    </div>
                </div>
            `;}).join("");
        }
    }
}

function setLiveMapQuery(query) {
    if (mapIframe) {
        mapIframe.src = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
    }
    if (externalMapLink) {
        externalMapLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    }
}

async function saveToFavorites(districtName) {
    const user = JSON.parse(sessionStorage.getItem("travelKoriUser") || "null");
    if (!user || !user.id) {
        alert("Please log in first to save this district to your favorites!");
        window.location.href = "login.html";
        return;
    }

    try {
        const res = await fetch(`${API_URL}/api/favorites`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.id, district: districtName })
        });
        const data = await res.json();
        if (res.ok) {
            alert(`⭐ ${districtName} saved to your favorites! You can view it anytime in your Profile Dashboard.`);
        } else {
            alert(data.message || "Could not save favorite.");
        }
    } catch (e) {
        alert("Could not connect to server. Please try again.");
    }
}

document.addEventListener("DOMContentLoaded", loadDistrictPage);