const API_URL = (window.location.origin && window.location.origin !== "null") ? window.location.origin : "";

const districts = [
    "Bagerhat", "Bandarban", "Barguna", "Barishal",
    "Bhola", "Bogura", "Brahmanbaria", "Chandpur",
    "Chapainawabganj", "Chattogram", "Chuadanga",
    "Cumilla", "Cox's Bazar", "Dhaka", "Dinajpur",
    "Faridpur", "Feni", "Gaibandha", "Gazipur",
    "Gopalganj", "Habiganj", "Jamalpur", "Jashore",
    "Jhalokati", "Jhenaidah", "Joypurhat", "Khagrachhari",
    "Khulna", "Kishoreganj", "Kurigram", "Kushtia",
    "Lakshmipur", "Lalmonirhat", "Madaripur", "Magura",
    "Manikganj", "Meherpur", "Moulvibazar", "Munshiganj",
    "Mymensingh", "Naogaon", "Narail", "Narayanganj",
    "Narsingdi", "Natore", "Netrokona", "Nilphamari",
    "Noakhali", "Pabna", "Panchagarh", "Patuakhali",
    "Pirojpur", "Rajbari", "Rajshahi", "Rangamati",
    "Rangpur", "Satkhira", "Shariatpur", "Sherpur",
    "Sirajganj", "Sunamganj", "Sylhet", "Tangail",
    "Thakurgaon"
];

// Verified real hotel listings of Bangladesh with authentic photos
const hotels = [
    {
        id: "hotel-cox-sayeman",
        name: "Sayeman Beach Resort",
        district: "Cox's Bazar",
        description: "Iconic beachfront luxury resort with private infinity pool facing the rolling waves of the Bay of Bengal.",
        prices: { Standard: 4500, Deluxe: 7500, Family: 11000 },
        image: "images/hotels/sayeman-beach-resort.jpg"
    },
    {
        id: "hotel-dhaka-panpacific",
        name: "Pan Pacific Sonargaon",
        district: "Dhaka",
        description: "Prestigious 5-star landmark in central Dhaka offering timeless luxury, landscaped gardens, and gourmet restaurants.",
        prices: { Standard: 5500, Deluxe: 8500, Family: 13000 },
        image: "images/hotels/pan-pacific-sonargaon.jpg"
    },
    {
        id: "hotel-dhaka-intercon",
        name: "InterContinental Dhaka",
        district: "Dhaka",
        description: "Prestigious historic 5-star hotel in the heart of Dhaka featuring grand banquet halls and heated rooftop pool.",
        prices: { Standard: 6500, Deluxe: 9500, Family: 14500 },
        image: "images/hotels/intercontinental-dhaka.jpg"
    },
    {
        id: "hotel-ctg-radisson",
        name: "Radisson Blu Chattogram Bay View",
        district: "Chattogram",
        description: "Premier luxury hotel in Chattogram with rooftop pool, fine dining and scenic harbor views.",
        prices: { Standard: 4800, Deluxe: 7200, Family: 10500 },
        image: "images/hotels/radisson-blu-chattogram.jpg"
    },
    {
        id: "hotel-sylhet-grandsylhet",
        name: "The Grand Sylhet Hotel & Resort",
        district: "Sylhet",
        description: "Exquisite 5-star resort boasting world-class amenities, infinity pool, spa, and views of surrounding tea hills.",
        prices: { Standard: 4000, Deluxe: 6800, Family: 9500 },
        image: "images/hotels/grand-sylhet-hotel-resort.jpg"
    },
    {
        id: "hotel-moulvibazar-grandsultan",
        name: "Grand Sultan Tea Resort & Golf",
        district: "Moulvibazar",
        description: "Premier eco-resort nestled amidst pristine tea gardens featuring a 9-hole golf course and temperature-controlled pools.",
        prices: { Standard: 5200, Deluxe: 8200, Family: 12000 },
        image: "images/hotels/grand-sultan-tea-resort.jpg"
    },
    {
        id: "hotel-bandarban-sairu",
        name: "Sairu Hill Resort",
        district: "Bandarban",
        description: "Breathtaking hilltop haven perched 1,800 feet above sea level with clouds drifting past your private balcony.",
        prices: { Standard: 4200, Deluxe: 6900, Family: 9800 },
        image: "images/hotels/sairu-hill-resort.jpg"
    },
    {
        id: "hotel-bogura-momoinn",
        name: "Momo Inn Hotel & Resort",
        district: "Bogura",
        description: "5-star luxury oasis in Bogura with helipad, rooftop swimming pool and direct access to Mahasthangarh.",
        prices: { Standard: 3800, Deluxe: 6000, Family: 8900 },
        image: "images/hotels/momo-inn-hotel-resort.jpg"
    },
    {
        id: "hotel-patuakhali-kuakata",
        name: "Kuakata Grand Hotel & Sea Resort",
        district: "Patuakhali",
        description: "Modern resort located steps away from the beach to catch both sunrise and sunset in Kuakata.",
        prices: { Standard: 3200, Deluxe: 5200, Family: 7800 },
        image: "images/hotels/kuakata-grand-hotel.jpg"
    },
    {
        id: "hotel-khulna-castlesalam",
        name: "Hotel Castle Salam",
        district: "Khulna",
        description: "Centrally located comfortable business and leisure hotel, gateway to the Sundarbans.",
        prices: { Standard: 2400, Deluxe: 3800, Family: 5500 },
        image: "images/hotels/hotel-castle-salam.jpg"
    },
    {
        id: "hotel-rajshahi-nice",
        name: "Hotel Nice International",
        district: "Rajshahi",
        description: "Popular hotel situated in Rajshahi commercial center near Padma river promenade.",
        prices: { Standard: 2200, Deluxe: 3500, Family: 5000 },
        image: "images/hotels/hotel-nice-international.jpg"
    },
    {
        id: "hotel-bandarban-hillside",
        name: "Hillside Resort Bandarban",
        district: "Bandarban",
        description: "Serene boutique eco cottages surrounded by verdant hill forests and authentic ethnic cultural warmth.",
        prices: { Standard: 2500, Deluxe: 4500, Family: 6500 },
        image: "images/hotels/hillside-resort-bandarban.jpg"
    }
];

const searchDistrict = document.getElementById("searchDistrict");
const searchRoomType = document.getElementById("searchRoomType");
const searchGuests = document.getElementById("searchGuests");
const hotelList = document.getElementById("hotelList");
const hotelCount = document.getElementById("hotelCount");
const hotelSearchMessage = document.getElementById("hotelSearchMessage");

const hotelBookingForm = document.getElementById("hotelBookingForm");
const hotelBookingMessage = document.getElementById("hotelBookingMessage");
const selectedHotelMessage = document.getElementById("selectedHotelMessage");

const hotelNameInput = document.getElementById("hotelName");
const hotelDistrictInput = document.getElementById("hotelDistrict");
const hotelRoomType = document.getElementById("hotelRoomType");
const checkInInput = document.getElementById("checkIn");
const checkOutInput = document.getElementById("checkOut");
const roomCountInput = document.getElementById("roomCount");
const guestCountInput = document.getElementById("guestCount");

let selectedHotel = null;
let user = null;

try {
    user = JSON.parse(sessionStorage.getItem("travelKoriUser") || "null");
} catch (error) {
    user = null;
}

// Use local calendar dates, avoiding UTC date shifts.
function localDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

const today = localDateString(new Date());

checkInInput.min = today;
checkOutInput.min = today;

// Populate district filter.
districts.forEach(function (district) {
    const option = document.createElement("option");
    option.value = district;
    option.textContent = district;
    searchDistrict.appendChild(option);
});

// Render hotel cards.
function renderHotels(list) {
    hotelList.replaceChildren();
    hotelCount.textContent = `${list.length} listing(s)`;

    if (list.length === 0) {
        hotelSearchMessage.textContent =
            "No demonstration listings match your filters.";
        return;
    }

    hotelSearchMessage.textContent =
        "Prices shown are estimates, not confirmed hotel offers.";

    list.forEach(function (hotel) {
        const card = document.createElement("article");
        card.className = "hotel-card";

        const image = document.createElement("img");
        image.src = hotel.image;
        image.alt = hotel.name;
        image.loading = "lazy";

        image.addEventListener("error", function () {
            image.hidden = true;
        });

        const content = document.createElement("div");
        content.className = "hotel-card-content";

        const title = document.createElement("h3");
        title.textContent = hotel.name;

        const location = document.createElement("p");
        location.innerHTML = `📍 ${hotel.district} <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.name + ', ' + hotel.district + ', Bangladesh')}" target="_blank" rel="noopener noreferrer" style="font-size:12px; color:#087f5b; margin-left:8px; text-decoration:underline; font-weight:600;">View on Google Maps ↗</a>`;

        const description = document.createElement("p");
        description.textContent = hotel.description;

        const price = document.createElement("p");
        price.className = "hotel-card-price";
        price.textContent =
            `From ৳${Math.min(...Object.values(hotel.prices)).toLocaleString("en-BD")} / night`;

        const button = document.createElement("button");
        button.type = "button";
        button.className = "signup-btn";
        button.textContent = "Select Hotel";

        button.addEventListener("click", function () {
            selectHotel(hotel);
        });

        content.append(title, location, description, price, button);
        card.append(image, content);
        hotelList.appendChild(card);
    });
}

function searchHotels() {
    const district = searchDistrict.value;
    const roomType = searchRoomType.value;
    const guests = Number(searchGuests.value);

    let results = hotels.filter(function (hotel) {
        if (district && hotel.district !== district) {
            return false;
        }

        if (roomType && !hotel.prices[roomType]) {
            return false;
        }

        // A simple demo filter. Actual capacity depends on hotel data.
        if (guests > 4 && roomType && roomType !== "Family") {
            return false;
        }

        return true;
    });

    renderHotels(results);
}

function selectHotel(hotel) {
    selectedHotel = hotel;

    hotelNameInput.value = hotel.name;
    hotelDistrictInput.value = hotel.district;

    // If a chosen room type is unavailable, select Standard.
    if (!hotel.prices[hotelRoomType.value]) {
        hotelRoomType.value = "Standard";
    }

    selectedHotelMessage.textContent =
        `${hotel.name} — estimated prices in BDT. Availability must be confirmed.`;

    hotelBookingMessage.textContent = "";

    updatePrice();

    document.getElementById("hotelBookingSection").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function getNights() {
    if (!checkInInput.value || !checkOutInput.value) {
        return 0;
    }

    const start = new Date(`${checkInInput.value}T00:00:00`);
    const end = new Date(`${checkOutInput.value}T00:00:00`);

    return Math.round((end - start) / 86400000);
}

function updatePrice() {
    const nights = getNights();
    const roomType = hotelRoomType.value;
    const rooms = Number(roomCountInput.value) || 0;

    const price = selectedHotel
        ? selectedHotel.prices[roomType] || 0
        : 0;

    document.getElementById("roomPrice").textContent =
        `৳${price.toLocaleString("en-BD")}`;

    document.getElementById("nightCount").textContent =
        Math.max(0, nights);

    document.getElementById("totalPrice").textContent =
        `৳${(price * Math.max(0, nights) * rooms).toLocaleString("en-BD")}`;
}

checkInInput.addEventListener("change", function () {
    checkOutInput.min = checkInInput.value || today;

    if (checkOutInput.value && checkOutInput.value <= checkInInput.value) {
        checkOutInput.value = "";
    }

    updatePrice();
});

checkOutInput.addEventListener("change", updatePrice);
hotelRoomType.addEventListener("change", updatePrice);
roomCountInput.addEventListener("input", updatePrice);

document.getElementById("searchHotelsBtn").addEventListener(
    "click",
    searchHotels
);

searchDistrict.addEventListener("change", searchHotels);
searchRoomType.addEventListener("change", searchHotels);
searchGuests.addEventListener("change", searchHotels);

// Update Active User Badge in Navbar
function updateActiveUserBadge() {
    const navLinks = document.querySelector(".nav-links");
    if (!navLinks) return;

    const existingBadge = document.getElementById("navActiveUserBadge");
    if (existingBadge) existingBadge.remove();

    if (user && user.name) {
        const badge = document.createElement("li");
        badge.id = "navActiveUserBadge";
        const isAdmin = (user.userType || "").toLowerCase() === "admin";
        badge.className = "user-active-badge " + (isAdmin ? "admin" : "traveler");
        badge.innerHTML = `<span class="status-dot"></span><span>${isAdmin ? "🛡️ " + user.name + " (Admin Active)" : "👤 " + user.name + " (Active)"}</span>`;
        navLinks.prepend(badge);

        const dashboardLink = navLinks.querySelector('a[href="dashboard.html"]');
        if (dashboardLink && isAdmin) {
            dashboardLink.setAttribute("href", "admin.html");
            dashboardLink.textContent = "Admin Panel";
        }
    }
}

// Payment method listener
function setupHotelPaymentListeners() {
    const paymentRadios = document.querySelectorAll('input[name="hotelPaymentMethod"]');
    const walletFields = document.getElementById("hotelWalletFields");
    const walletPhone = document.getElementById("hotelPaymentPhone");

    paymentRadios.forEach(radio => {
        radio.addEventListener("change", (e) => {
            const method = e.target.value;
            if (method === "bkash" || method === "nagad") {
                if (walletFields) {
                    walletFields.hidden = false;
                    if (walletPhone) {
                        walletPhone.required = true;
                        walletPhone.placeholder = method === "bkash" ? "017XXXXXXXX (bKash Wallet)" : "018XXXXXXXX (Nagad Wallet)";
                    }
                }
            } else {
                if (walletFields) {
                    walletFields.hidden = true;
                    if (walletPhone) {
                        walletPhone.required = false;
                        walletPhone.value = "";
                    }
                }
            }
        });
    });
}

// Fetch hotels from backend MongoDB and merge with verified listings
async function loadApiHotels() {
    try {
        const hotelImageMap = {
            "pan pacific sonargaon": "images/hotels/pan-pacific-sonargaon.jpg",
            "intercontinental dhaka": "images/hotels/intercontinental-dhaka.jpg",
            "sayeman beach resort": "images/hotels/sayeman-beach-resort.jpg",
            "radisson blu chattogram bay view": "images/hotels/radisson-blu-chattogram.jpg",
            "the grand sylhet hotel & resort": "images/hotels/grand-sylhet-hotel-resort.jpg",
            "grand sultan tea resort & golf": "images/hotels/grand-sultan-tea-resort.jpg",
            "sairu hill resort": "images/hotels/sairu-hill-resort.jpg",
            "momo inn hotel & resort": "images/hotels/momo-inn-hotel-resort.jpg",
            "hotel castle salam": "images/hotels/hotel-castle-salam.jpg",
            "hotel nice international": "images/hotels/hotel-nice-international.jpg",
            "kuakata grand hotel & sea resort": "images/hotels/kuakata-grand-hotel.jpg",
            "kuakata grand prince hotel": "images/hotels/kuakata-grand-hotel.jpg",
            "hillside resort bandarban": "images/hotels/hillside-resort-bandarban.jpg"
        };

        const res = await fetch(`${API_URL}/api/hotels`);
        if (res.ok) {
            const json = await res.json();
            const apiHotels = Array.isArray(json) ? json : (json.hotels || []);
            if (Array.isArray(apiHotels) && apiHotels.length > 0) {
                apiHotels.forEach(ah => {
                    const normName = (ah.name || "").toLowerCase().trim();
                    let matchedImg = ah.image;
                    if (!matchedImg || matchedImg.includes("unsplash.com")) {
                        matchedImg = hotelImageMap[normName];
                        if (!matchedImg) {
                            for (const [key, val] of Object.entries(hotelImageMap)) {
                                if (normName.includes(key) || key.includes(normName)) {
                                    matchedImg = val;
                                    break;
                                }
                            }
                        }
                    }
                    if (!matchedImg) {
                        matchedImg = "images/hotels/pan-pacific-sonargaon.jpg";
                    }

                    const standardPrice = ah.packages && ah.packages[0] ? (ah.packages[0].pricePerNight || ah.packages[0].price) : (ah.priceStandard || 2500);
                    const deluxePrice = ah.packages && ah.packages[1] ? (ah.packages[1].pricePerNight || ah.packages[1].price) : (ah.priceDeluxe || Math.round(standardPrice * 1.5));
                    const familyPrice = ah.packages && ah.packages[2] ? (ah.packages[2].pricePerNight || ah.packages[2].price) : (ah.priceFamily || Math.round(standardPrice * 2.2));

                    const existingIndex = hotels.findIndex(h => h.name.toLowerCase() === normName);
                    const hotelObj = {
                        id: ah._id || ah.id || `hotel-${Date.now()}`,
                        name: ah.name,
                        district: ah.districtName || ah.district || "Dhaka",
                        description: ah.description || "Comfortable stay with modern amenities.",
                        prices: {
                            Standard: standardPrice,
                            Deluxe: deluxePrice,
                            Family: familyPrice
                        },
                        image: matchedImg
                    };

                    if (existingIndex >= 0) {
                        hotels[existingIndex] = { ...hotels[existingIndex], ...hotelObj };
                    } else {
                        hotels.push(hotelObj);
                    }
                });
                renderHotels(hotels);
            }
        }
    } catch (err) {
        console.warn("Could not load backend hotels:", err);
    }
}

// Handle query params like ?district=...&hotel=...
function checkHotelUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const distParam = params.get("district");
    const hotelParam = params.get("hotel");

    if (distParam && searchDistrict) {
        searchDistrict.value = distParam;
        searchHotels();
    }

    if (hotelParam) {
        const match = hotels.find(h => h.name.toLowerCase() === hotelParam.toLowerCase() || h.name.toLowerCase().includes(hotelParam.toLowerCase()));
        if (match) {
            selectHotel(match);
        }
    }
}

// Submit hotel booking.
hotelBookingForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (!user || !user.id) {
        hotelBookingMessage.textContent =
            "Please log in before booking a hotel.";
        hotelBookingMessage.style.color = "red";
        return;
    }

    if (!selectedHotel) {
        hotelBookingMessage.textContent =
            "Please select a hotel first.";
        hotelBookingMessage.style.color = "red";
        return;
    }

    const checkIn = checkInInput.value;
    const checkOut = checkOutInput.value;
    const rooms = Number(roomCountInput.value);
    const guests = Number(guestCountInput.value);
    const guestName = document.getElementById("guestName").value.trim();
    const guestPhone = document.getElementById("guestPhone").value.trim();
    const nights = getNights();

    const selectedPayment = document.querySelector('input[name="hotelPaymentMethod"]:checked');
    const paymentMethod = selectedPayment ? selectedPayment.value : "cash";
    const walletPhone = document.getElementById("hotelPaymentPhone");
    const paymentPhone = walletPhone ? walletPhone.value.trim() : "";

    if (!checkIn || !checkOut || checkIn < today || nights < 1) {
        hotelBookingMessage.textContent =
            "Choose a valid check-in date and a later check-out date.";
        hotelBookingMessage.style.color = "red";
        return;
    }

    if (
        !Number.isInteger(rooms) || rooms < 1 || rooms > 10 ||
        !Number.isInteger(guests) || guests < 1 || guests > 20 ||
        !guestName || !guestPhone
    ) {
        hotelBookingMessage.textContent =
            "Please check the guest details, rooms and number of visitors.";
        hotelBookingMessage.style.color = "red";
        return;
    }

    if ((paymentMethod === "bkash" || paymentMethod === "nagad") && !paymentPhone) {
        hotelBookingMessage.textContent = `Please enter your ${paymentMethod.toUpperCase()} wallet mobile number.`;
        hotelBookingMessage.style.color = "red";
        return;
    }

    const pricePerNight = selectedHotel.prices[hotelRoomType.value];

    if (!pricePerNight) {
        hotelBookingMessage.textContent =
            "That room type is not available in this demonstration listing.";
        hotelBookingMessage.style.color = "red";
        return;
    }

    const roomType = hotelRoomType.value;
    const totalPrice = pricePerNight * rooms * nights;
    const submitButton = document.getElementById("submitHotelBooking");

    submitButton.disabled = true;
    submitButton.textContent = "Submitting...";
    hotelBookingMessage.textContent = "Submitting your booking request...";
    hotelBookingMessage.style.color = "#087f5b";

    try {
        const response = await fetch(`${API_URL}/api/hotel-bookings`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userId: user.id,
                hotelId: selectedHotel.id,
                hotelName: selectedHotel.name,
                district: selectedHotel.district,
                roomType: roomType,
                checkIn,
                checkOut,
                nights,
                rooms,
                guests,
                guestName,
                guestPhone,
                pricePerNight,
                totalPrice,
                paymentMethod,
                paymentPhone
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Unable to submit hotel booking."
            );
        }

        const isPayAtHotel = paymentMethod === "cash" || paymentMethod === "pay_at_hotel";
        const paymentLabel = isPayAtHotel ? "Pay at Hotel (Payment Pending)" : `${paymentMethod.toUpperCase()} (Demo Paid)`;

        const paymentNote = isPayAtHotel 
            ? "Payment Method: Pay at Hotel Front Desk (Pending)" 
            : `Payment: Paid via ${paymentMethod.toUpperCase()} (${data.booking.transactionReference || 'DEMO-TXN'})`;

        const voucherData = {
            reference: data.booking.reference,
            hotelName: selectedHotel.name,
            district: selectedHotel.district,
            guestName: guestName,
            guestPhone: guestPhone,
            checkIn: checkIn,
            checkOut: checkOut,
            roomType: roomType,
            rooms: rooms,
            nights: nights,
            paymentMethod: paymentLabel,
            paymentStatus: isPayAtHotel ? "Payment Pending" : "Paid",
            totalPrice: totalPrice
        };

        hotelBookingMessage.innerHTML = `
            <div style="background: #e6f7f0; border: 2px solid #087f5b; border-radius: 10px; padding: 18px; text-align: left; margin-top: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
                    <span style="color: #087f5b; font-weight: 800; font-size: 16px;">🎉 Hotel Booking Placed!</span>
                    <span style="font-size: 12px; font-weight: 700; background: #087f5b; color: white; padding: 4px 10px; border-radius: 6px;">Ref: ${data.booking.reference}</span>
                </div>
                <p style="margin: 4px 0; font-size: 14px; color: #17382f;">
                    <strong>Hotel:</strong> ${selectedHotel.name} • 📍 ${selectedHotel.district}
                </p>
                <p style="margin: 4px 0; font-size: 13px; color: #475569;">
                    <strong>Room:</strong> ${roomType} (${rooms} room) • <strong>Dates:</strong> ${checkIn} to ${checkOut} (${nights} night(s))
                </p>
                <p style="margin: 4px 0; font-size: 13px; color: #475569;">
                    <strong>Payment:</strong> ${paymentLabel} • <strong>Total:</strong> ৳${totalPrice.toLocaleString('en-BD')} BDT
                </p>
                <div style="display: flex; gap: 10px; margin-top: 14px; flex-wrap: wrap;">
                    <button id="downloadHotelVoucherBtn" type="button" class="btn-download-pdf">
                        📥 Download Hotel Confirmation (PDF)
                    </button>
                    <a href="dashboard.html" class="signup-btn" style="padding: 8px 14px; font-size: 12px; text-decoration: none; border-radius: 7px; background: #17382f; color: white;">
                        View in Dashboard →
                    </a>
                </div>
            </div>
        `;

        document.getElementById("downloadHotelVoucherBtn")?.addEventListener("click", () => {
            if (window.TravelKoriPDF) {
                window.TravelKoriPDF.downloadHotelVoucher(voucherData);
            }
        });

        // Keep the selected hotel visible so the user can submit another request.
        hotelBookingForm.reset();
        hotelNameInput.value = selectedHotel.name;
        hotelDistrictInput.value = selectedHotel.district;
        hotelRoomType.value = "Standard";
        roomCountInput.value = "1";
        guestCountInput.value = "2";
        checkInInput.min = today;
        checkOutInput.min = today;

        updatePrice();

    } catch (error) {
        console.error("Hotel booking error:", error);

        hotelBookingMessage.textContent =
            error.message === "Failed to fetch"
                ? "Cannot connect to the backend. Check that the server is running."
                : error.message;

        hotelBookingMessage.style.color = "red";

    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Submit Hotel Booking Request";
    }
});

// Initial page setup.
updateActiveUserBadge();
setupHotelPaymentListeners();
renderHotels(hotels);
updatePrice();
loadApiHotels().then(checkHotelUrlParams);

// Continue the pending destination search after login
document.addEventListener("DOMContentLoaded", function () {
    const savedSearch = sessionStorage.getItem(
        "travelKoriPendingHotelSearch"
    );

    if (!savedSearch) return;

    let searchData;

    try {
        searchData = JSON.parse(savedSearch);
    } catch (error) {
        sessionStorage.removeItem("travelKoriPendingHotelSearch");
        return;
    }

    const destination = (searchData.destination || "").trim();

    const districtSelect = document.getElementById("searchDistrict");
    const searchButton = document.getElementById("searchHotelsBtn");
    const checkInInput = document.getElementById("checkIn");

    if (!destination || !districtSelect || !searchButton) return;

    // Popular tourist destinations mapped to their districts
    const destinationDistricts = {
        "cox's bazar": "Cox's Bazar",
        "cox's bazar beach": "Cox's Bazar",
        "sajek valley": "Rangamati",
        "sundarbans": "Bagerhat",
        "saint martin's island": "Cox's Bazar",
        "kuakata": "Patuakhali",
        "srimangal": "Moulvibazar",
        "tea gardens": "Moulvibazar",
        "bandarban": "Bandarban",
        "rangamati": "Rangamati",
        "sylhet": "Sylhet",
        "dhaka": "Dhaka",
        "chattogram": "Chattogram",
        "rajshahi": "Rajshahi",
        "khulna": "Khulna",
        "bagerhat": "Bagerhat",
        "patuakhali": "Patuakhali",
        "moulvibazar": "Moulvibazar"
    };

    const normalizedDestination = destination.toLowerCase();

    const targetDistrict =
        destinationDistricts[normalizedDestination] || destination;

    // Match the saved destination to an available district option
    const matchingOption = Array.from(districtSelect.options).find(
        function (option) {
            return (
                option.value.toLowerCase() === targetDistrict.toLowerCase() ||
                option.textContent.trim().toLowerCase() ===
                    targetDistrict.toLowerCase()
            );
        }
    );

    if (matchingOption) {
        districtSelect.value = matchingOption.value;
    } else {
        // If no district matches, do not silently show unrelated hotels
        const message = document.getElementById("hotelSearchMessage");

        if (message) {
            message.textContent =
                "No matching district was found for " +
                destination +
                ". Please choose a district manually.";
        }

        sessionStorage.removeItem("travelKoriPendingHotelSearch");
        return;
    }

    // Carry the selected travel date into the booking form
    if (checkInInput && searchData.travelDate) {
        checkInInput.value = searchData.travelDate;
        checkInInput.min = searchData.travelDate;

        const checkOutInput = document.getElementById("checkOut");

        if (checkOutInput) {
            checkOutInput.min = searchData.travelDate;
        }
    }

    // Trigger the existing hotel search logic
    searchButton.click();

    // Clear the pending search after it has been applied
    sessionStorage.removeItem("travelKoriPendingHotelSearch");
});