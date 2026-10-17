const API_URL = "http://localhost:5000";

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

// Demonstration hotel listings and estimated prices in BDT.
// These are not verified real-time hotel offers.
const hotels = [
    {
        id: "hotel-dhaka-1",
        name: "Dhaka Comfort Stay",
        district: "Dhaka",
        description: "A demonstration city hotel listing.",
        prices: { Standard: 2500, Deluxe: 4000, Family: 5500 },
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80"
    },
    {
        id: "hotel-cox-1",
        name: "Cox's Bay Retreat",
        district: "Cox's Bazar",
        description: "A demonstration coastal hotel listing.",
        prices: { Standard: 3000, Deluxe: 5000, Family: 7000 },
        image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=900&q=80"
    },
    {
        id: "hotel-sylhet-1",
        name: "Sylhet Green Escape",
        district: "Sylhet",
        description: "A demonstration nature-stay listing.",
        prices: { Standard: 2200, Deluxe: 3500, Family: 5000 },
        image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=900&q=80"
    },
    {
        id: "hotel-chattogram-1",
        name: "Chattogram City Lodge",
        district: "Chattogram",
        description: "A demonstration city hotel listing.",
        prices: { Standard: 2000, Deluxe: 3300, Family: 4800 },
        image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=900&q=80"
    },
    {
        id: "hotel-rajshahi-1",
        name: "Rajshahi Riverside Stay",
        district: "Rajshahi",
        description: "A demonstration hotel listing.",
        prices: { Standard: 1800, Deluxe: 2800, Family: 4000 },
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=900&q=80"
    },
    {
        id: "hotel-khulna-1",
        name: "Khulna Gateway Hotel",
        district: "Khulna",
        description: "A demonstration hotel listing.",
        prices: { Standard: 1900, Deluxe: 3000, Family: 4500 },
        image: "https://images.unsplash.com/photo-1568084680786-a84f91d1153c?auto=format&fit=crop&w=900&q=80"
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
        location.textContent = hotel.district;

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

    const pricePerNight = selectedHotel.prices[hotelRoomType.value];

    if (!pricePerNight) {
        hotelBookingMessage.textContent =
            "That room type is not available in this demonstration listing.";
        hotelBookingMessage.style.color = "red";
        return;
    }

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
                roomType: hotelRoomType.value,
                checkIn,
                checkOut,
                nights,
                rooms,
                guests,
                guestName,
                guestPhone,
                pricePerNight,
                totalPrice
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Unable to submit hotel booking."
            );
        }

        hotelBookingMessage.textContent =
            `Request submitted! Reference ID: ${data.booking.reference}. Status: Pending.`;

        hotelBookingMessage.style.color = "#087f5b";

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
renderHotels(hotels);
updatePrice();