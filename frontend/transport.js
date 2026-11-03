const API_URL = "http://localhost:5000";

// All 64 Districts of Bangladesh for origin & destination
const cities = [
    "Dhaka", "Chattogram", "Cox's Bazar", "Sylhet", "Bandarban", "Rangamati", "Khagrachhari",
    "Bagerhat", "Barguna", "Barishal", "Bhola", "Bogura", "Brahmanbaria", "Chandpur",
    "Chapai Nawabganj", "Chuadanga", "Cumilla", "Dinajpur", "Faridpur", "Feni",
    "Gaibandha", "Gazipur", "Gopalganj", "Habiganj", "Jamalpur", "Jashore",
    "Jhalokati", "Jhenaidah", "Joypurhat", "Khulna", "Kishoreganj", "Kurigram",
    "Kushtia", "Lakshmipur", "Lalmonirhat", "Madaripur", "Magura", "Manikganj",
    "Meherpur", "Moulvibazar", "Munshiganj", "Mymensingh", "Naogaon", "Narail",
    "Narayanganj", "Narsingdi", "Natore", "Netrokona", "Nilphamari", "Noakhali",
    "Pabna", "Panchagarh", "Patuakhali", "Pirojpur", "Rajbari", "Rajshahi",
    "Rangpur", "Satkhira", "Shariatpur", "Sherpur", "Sirajganj", "Sunamganj",
    "Tangail", "Thakurgaon"
];

// ========================================
// TRANSPORT DATA
// Operator names are real.
// Fares are illustrative estimates.
// Verify schedules with official operators.
// ========================================

const journeys = [
    // ================= BUS =================

    {
        id: "BUS-GREEN-DAC-CTG",
        type: "Bus",
        operator: "Green Line Paribahan",
        from: "Dhaka",
        to: "Chattogram",
        departure: "Schedule varies",
        arrival: "Schedule varies",
        duration: "Approx. 6–8 hours",
        fare: 1200,
        scheduleUrl: "https://greenlinebd.com/service/"
    },
    {
        id: "BUS-HANIF-DAC-CTG",
        type: "Bus",
        operator: "Hanif Enterprise",
        from: "Dhaka",
        to: "Chattogram",
        departure: "Schedule varies",
        arrival: "Schedule varies",
        duration: "Approx. 6–8 hours",
        fare: 1000,
        scheduleUrl: "https://hanifenterprisebd.com/"
    },
    {
        id: "BUS-ENA-DAC-CTG",
        type: "Bus",
        operator: "Ena Transport",
        from: "Dhaka",
        to: "Chattogram",
        departure: "Schedule varies",
        arrival: "Schedule varies",
        duration: "Approx. 6–8 hours",
        fare: 1000,
        scheduleUrl: "https://ena.shohoz.com/booking/"
    },
    {
        id: "BUS-GREEN-DAC-COX",
        type: "Bus",
        operator: "Green Line Paribahan",
        from: "Dhaka",
        to: "Cox's Bazar",
        departure: "Schedule varies",
        arrival: "Schedule varies",
        duration: "Approx. 9–12 hours",
        fare: 1800,
        scheduleUrl: "https://greenlinebd.com/coxs-bazar/"
    },
    {
        id: "BUS-HANIF-DAC-COX",
        type: "Bus",
        operator: "Hanif Enterprise",
        from: "Dhaka",
        to: "Cox's Bazar",
        departure: "Schedule varies",
        arrival: "Schedule varies",
        duration: "Approx. 9–12 hours",
        fare: 1500,
        scheduleUrl: "https://hanifenterprisebd.com/"
    },
    {
        id: "BUS-ENA-DAC-COX",
        type: "Bus",
        operator: "Ena Transport",
        from: "Dhaka",
        to: "Cox's Bazar",
        departure: "Schedule varies",
        arrival: "Schedule varies",
        duration: "Approx. 9–12 hours",
        fare: 1500,
        scheduleUrl: "https://ena.shohoz.com/booking/"
    },
    {
        id: "BUS-GREEN-DAC-SYL",
        type: "Bus",
        operator: "Green Line Paribahan",
        from: "Dhaka",
        to: "Sylhet",
        departure: "Schedule varies",
        arrival: "Schedule varies",
        duration: "Approx. 6–8 hours",
        fare: 1000,
        scheduleUrl: "https://greenlinebd.com/service/"
    },
    {
        id: "BUS-ENA-DAC-SYL",
        type: "Bus",
        operator: "Ena Transport",
        from: "Dhaka",
        to: "Sylhet",
        departure: "Schedule varies",
        arrival: "Schedule varies",
        duration: "Approx. 6–8 hours",
        fare: 900,
        scheduleUrl: "https://ena.shohoz.com/booking/"
    },
    {
        id: "BUS-HANIF-DAC-RNG",
        type: "Bus",
        operator: "Hanif Enterprise",
        from: "Dhaka",
        to: "Rangpur",
        departure: "Schedule varies",
        arrival: "Schedule varies",
        duration: "Approx. 7–9 hours",
        fare: 1000,
        scheduleUrl: "https://hanifenterprisebd.com/"
    },
    {
        id: "BUS-ENA-DAC-RNG",
        type: "Bus",
        operator: "Ena Transport",
        from: "Dhaka",
        to: "Rangpur",
        departure: "Schedule varies",
        arrival: "Schedule varies",
        duration: "Approx. 7–9 hours",
        fare: 1000,
        scheduleUrl: "https://ena.shohoz.com/booking/"
    },
    {
        id: "BUS-GREEN-DAC-KHL",
        type: "Bus",
        operator: "Green Line Paribahan",
        from: "Dhaka",
        to: "Khulna",
        departure: "Schedule varies",
        arrival: "Schedule varies",
        duration: "Approx. 7–9 hours",
        fare: 1200,
        scheduleUrl: "https://greenlinebd.com/service/"
    },
    {
        id: "BUS-GREEN-DAC-RJH",
        type: "Bus",
        operator: "Green Line Paribahan",
        from: "Dhaka",
        to: "Rajshahi",
        departure: "Schedule varies",
        arrival: "Schedule varies",
        duration: "Approx. 5–7 hours",
        fare: 1000,
        scheduleUrl: "https://greenlinebd.com/service/"
    },
    {
        id: "BUS-HANIF-DAC-RJH",
        type: "Bus",
        operator: "Hanif Enterprise",
        from: "Dhaka",
        to: "Rajshahi",
        departure: "Schedule varies",
        arrival: "Schedule varies",
        duration: "Approx. 5–7 hours",
        fare: 900,
        scheduleUrl: "https://hanifenterprisebd.com/"
    },
    {
        id: "BUS-GREEN-CTG-SYL",
        type: "Bus",
        operator: "Green Line Paribahan",
        from: "Chattogram",
        to: "Sylhet",
        departure: "Schedule varies",
        arrival: "Schedule varies",
        duration: "Approx. 7–9 hours",
        fare: 1200,
        scheduleUrl: "https://greenlinebd.com/service/"
    },
    {
        id: "BUS-HANIF-CTG-COX",
        type: "Bus",
        operator: "Hanif Enterprise",
        from: "Chattogram",
        to: "Cox's Bazar",
        departure: "Schedule varies",
        arrival: "Schedule varies",
        duration: "Approx. 4–5 hours",
        fare: 600,
        scheduleUrl: "https://hanifenterprisebd.com/"
    },

    // ================= TRAIN =================

    {
        id: "TRAIN-SONARBANGLA-DAC-CTG",
        type: "Train",
        operator: "Sonar Bangla Express",
        from: "Dhaka",
        to: "Chattogram",
        departure: "07:00",
        arrival: "12:15",
        duration: "Approx. 5 hours 15 minutes",
        fare: 900,
        scheduleUrl:
            "https://railway.gov.bd/pages/static-pages/691997d5933eb65569ddf8e2"
    },
    {
        id: "TRAIN-SUBARNA-DAC-CTG",
        type: "Train",
        operator: "Subarna Express",
        from: "Dhaka",
        to: "Chattogram",
        departure: "16:30",
        arrival: "21:50",
        duration: "Approx. 5 hours 20 minutes",
        fare: 900,
        scheduleUrl:
            "https://railway.gov.bd/pages/static-pages/691997d5933eb65569ddf8e2"
    },
    {
        id: "TRAIN-MOHANAGAR-DAC-CTG",
        type: "Train",
        operator: "Mohanagar Provati",
        from: "Dhaka",
        to: "Chattogram",
        departure: "07:45",
        arrival: "13:35",
        duration: "Approx. 5 hours 50 minutes",
        fare: 700,
        scheduleUrl:
            "https://railway.gov.bd/pages/static-pages/691997d5933eb65569ddf8e2"
    },
    {
        id: "TRAIN-TURNA-DAC-CTG",
        type: "Train",
        operator: "Turna Express",
        from: "Dhaka",
        to: "Chattogram",
        departure: "23:15",
        arrival: "05:15",
        duration: "Approx. 6 hours",
        fare: 800,
        scheduleUrl:
            "https://railway.gov.bd/pages/static-pages/691997d5933eb65569ddf8e2"
    },
    {
        id: "TRAIN-COXEXP-DAC-COX",
        type: "Train",
        operator: "Cox's Bazar Express",
        from: "Dhaka",
        to: "Cox's Bazar",
        departure: "22:30",
        arrival: "03:40",
        duration: "Approx. 7 hours",
        fare: 1200,
        scheduleUrl:
            "https://railway.gov.bd/pages/static-pages/691997d5933eb65569ddf8e2"
    },
    {
        id: "TRAIN-PARJOTOK-DAC-COX",
        type: "Train",
        operator: "Parjotok Express",
        from: "Dhaka",
        to: "Cox's Bazar",
        departure: "06:15",
        arrival: "11:20",
        duration: "Approx. 7 hours",
        fare: 1200,
        scheduleUrl:
            "https://railway.gov.bd/pages/static-pages/691997d5933eb65569ddf8e2"
    },
    {
        id: "TRAIN-PARABAT-DAC-SYL",
        type: "Train",
        operator: "Parabat Express",
        from: "Dhaka",
        to: "Sylhet",
        departure: "06:30",
        arrival: "13:00",
        duration: "Approx. 6 hours 30 minutes",
        fare: 500,
        scheduleUrl:
            "https://railway.gov.bd/pages/static-pages/691997d5933eb65569ddf8e2"
    },
    {
        id: "TRAIN-JAYANTIKA-DAC-SYL",
        type: "Train",
        operator: "Jayantika Express",
        from: "Dhaka",
        to: "Sylhet",
        departure: "11:15",
        arrival: "18:00",
        duration: "Approx. 6 hours 45 minutes",
        fare: 500,
        scheduleUrl:
            "https://railway.gov.bd/pages/static-pages/691997d5933eb65569ddf8e2"
    },
    {
        id: "TRAIN-DHUMKETU-DAC-RJH",
        type: "Train",
        operator: "Dhumketu Express",
        from: "Dhaka",
        to: "Rajshahi",
        departure: "06:00",
        arrival: "11:40",
        duration: "Approx. 5 hours 40 minutes",
        fare: 550,
        scheduleUrl:
            "https://railway.gov.bd/pages/static-pages/691997d5933eb65569ddf8e2"
    },
    {
        id: "TRAIN-SUNDARBAN-DAC-KHL",
        type: "Train",
        operator: "Sundarban Express",
        from: "Dhaka",
        to: "Khulna",
        departure: "08:00",
        arrival: "17:40",
        duration: "Approx. 9 hours 40 minutes",
        fare: 600,
        scheduleUrl:
            "https://railway.gov.bd/pages/static-pages/691997d5933eb65569ddf8e2"
    },

    // ================= FLIGHTS =================

    {
        id: "FLIGHT-BIMAN-DAC-CTG",
        type: "Flight",
        operator: "Biman Bangladesh Airlines",
        from: "Dhaka",
        to: "Chattogram",
        departure: "Check airline schedule",
        arrival: "Check airline schedule",
        duration: "Approx. 55 minutes",
        fare: 5500,
        scheduleUrl: "https://www.biman-airlines.com/"
    },
    {
        id: "FLIGHT-USBAIR-DAC-CTG",
        type: "Flight",
        operator: "US-Bangla Airlines",
        from: "Dhaka",
        to: "Chattogram",
        departure: "Check airline schedule",
        arrival: "Check airline schedule",
        duration: "Approx. 55 minutes",
        fare: 5000,
        scheduleUrl: "https://usbair.com/"
    },
    {
        id: "FLIGHT-BIMAN-DAC-COX",
        type: "Flight",
        operator: "Biman Bangladesh Airlines",
        from: "Dhaka",
        to: "Cox's Bazar",
        departure: "Check airline schedule",
        arrival: "Check airline schedule",
        duration: "Approx. 1 hour 5 minutes",
        fare: 7000,
        scheduleUrl: "https://www.biman-airlines.com/"
    },
    {
        id: "FLIGHT-USBAIR-DAC-COX",
        type: "Flight",
        operator: "US-Bangla Airlines",
        from: "Dhaka",
        to: "Cox's Bazar",
        departure: "Check airline schedule",
        arrival: "Check airline schedule",
        duration: "Approx. 1 hour 5 minutes",
        fare: 6500,
        scheduleUrl: "https://usbair.com/"
    },
    {
        id: "FLIGHT-USBAIR-DAC-SYL",
        type: "Flight",
        operator: "US-Bangla Airlines",
        from: "Dhaka",
        to: "Sylhet",
        departure: "Check airline schedule",
        arrival: "Check airline schedule",
        duration: "Approx. 50 minutes",
        fare: 5000,
        scheduleUrl: "https://usbair.com/"
    }
];

// ========================================
// GLOBAL VARIABLES
// ========================================

let selectedType = "Bus";
let selectedJourney = null;
let selectedSeats = [];
let selectedCoach = "A";
let searchDate = "";

// ========================================
// DOM ELEMENTS
// ========================================

const fromCity = document.getElementById("fromCity");
const toCity = document.getElementById("toCity");
const journeyDate = document.getElementById("journeyDate");
const passengersInput = document.getElementById("passengers");

const results = document.getElementById("transportResults");
const message = document.getElementById("transportMessage");

const bookingPanel = document.getElementById("transportBookingPanel");
const bookingMessage = document.getElementById("transportBookingMessage");
const bookingForm = document.getElementById("transportBookingForm");

const walletPaymentFields = document.getElementById("walletPaymentFields");
const paymentPhoneInput = document.getElementById("paymentPhone");
const transactionReferenceInput =
    document.getElementById("transactionReference");
const paymentHelp = document.getElementById("paymentHelp");

// ========================================
// PAYMENT METHOD SELECTION
// ========================================

document.querySelectorAll('input[name="paymentMethod"]').forEach(
    function (input) {
        input.addEventListener("change", function () {
            if (!input.checked) return;

            const isWallet =
                input.value === "bkash" ||
                input.value === "nagad";

            if (walletPaymentFields) {
                walletPaymentFields.hidden = !isWallet;
            }

            if (paymentPhoneInput) {
                paymentPhoneInput.required = isWallet;

                if (!isWallet) {
                    paymentPhoneInput.value = "";
                }
            }

            if (paymentHelp) {
                if (input.value === "bkash") {
                    paymentHelp.textContent =
                        "bKash demo selected. This does not connect to the real wallet service.";
                } else if (input.value === "nagad") {
                    paymentHelp.textContent =
                        "Nagad demo selected. This does not connect to the real wallet service.";
                } else if (input.value === "card") {
                    paymentHelp.textContent =
                        "Card demo selected. No card number or CVV is requested or charged.";
                } else if (input.value === "cash") {
                    paymentHelp.textContent =
                        "Cash selected. Payment status will be Pay on travel day.";
                }
            }
        });
    }
);

// ========================================
// LOGIN SESSION
// ========================================

let user = null;

try {
    user = JSON.parse(
        sessionStorage.getItem("travelKoriUser") || "null"
    );
} catch (error) {
    user = null;
}

// ========================================
// DATE HELPER
// ========================================

function localDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

journeyDate.min = localDateString(new Date());

// ========================================
// POPULATE CITY OPTIONS
// ========================================

cities.forEach(function (city) {
    [fromCity, toCity].forEach(function (select) {
        const option = document.createElement("option");
        option.value = city;
        option.textContent = city;
        select.appendChild(option);
    });
});

// ========================================
// LIVE ROUTE CALCULATION (FR-15 to FR-19)
// ========================================
let currentRouteInfo = null;
async function updateRouteCalculation() {
    const from = fromCity.value;
    const to = toCity.value;
    const existing = document.getElementById("transportRouteBanner");

    if (from && to && from !== to) {
        try {
            const res = await fetch(`${API_URL}/api/routes?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
            const data = await res.json();
            if (data.success) {
                currentRouteInfo = data;
                let b = document.getElementById("transportRouteBanner");
                if (!b) {
                    b = document.createElement("div");
                    b.id = "transportRouteBanner";
                    b.className = "route-summary-banner";
                    const form = document.getElementById("transportSearchForm");
                    form.parentNode.insertBefore(b, form.nextSibling);
                }
                b.innerHTML = `
                    <div class="route-summary-info">
                        📍 <strong>${data.from} ➔ ${data.to}</strong>: ~${data.distanceKm} km (Road Distance)
                        <span style="margin: 0 8px; color: #cbd5e1;">|</span>
                        🚌 Bus: ~${data.durations.bus} | 🚆 Train: ~${data.durations.train} | ✈️ Flight: ${data.durations.flight}
                    </div>
                    <a href="${data.directionsUrl}" target="_blank" rel="noopener noreferrer" style="font-size: 13px; font-weight: 700; color: #087f5b; text-decoration: underline;">
                        View Live Route on Google Maps ↗
                    </a>
                `;
            }
        } catch (e) {
            console.warn("Route calc error:", e);
        }
    } else if (existing) {
        existing.remove();
    }
}

fromCity.addEventListener("change", updateRouteCalculation);
toCity.addEventListener("change", updateRouteCalculation);

// ========================================
// BUS / TRAIN / FLIGHT TABS
// ========================================

document.querySelectorAll(".transport-tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
        selectedType = tab.dataset.type;

        document.querySelectorAll(".transport-tab").forEach(function (item) {
            item.classList.toggle("active", item === tab);
        });

        document.getElementById("resultsTitle").textContent =
            `Available ${selectedType} Options`;

        results.replaceChildren();

        const featured = journeys.filter(j => j.type === selectedType).slice(0, 6);
        renderResults(featured);

        document.getElementById("resultsSubtitle").textContent =
            `Popular verified ${selectedType.toLowerCase()} routes across Bangladesh. Search above to filter by origin, destination and date.`;

        message.textContent = "";

        bookingPanel.hidden = true;
        selectedJourney = null;
        selectedSeats = [];

        const oldPicker = document.getElementById("seatSelection");

        if (oldPicker) {
            oldPicker.remove();
        }
    });
});

// Render initial default journeys
function loadDefaultJourneys() {
    searchDate = journeyDate.value || localDateString(new Date());
    const featured = journeys.filter(j => j.type === selectedType).slice(0, 6);
    renderResults(featured);
    const subtitle = document.getElementById("resultsSubtitle");
    if (subtitle) {
        subtitle.textContent = "Popular verified routes across Bangladesh. Choose any journey below or search a custom route above.";
    }
}
loadDefaultJourneys();

// ========================================
// TRANSPORT SEARCH
// ========================================

document.getElementById("transportSearchForm").addEventListener(
    "submit",
    async function (event) {
        event.preventDefault();

        const from = fromCity.value;
        const to = toCity.value;
        const date = journeyDate.value;
        const passengers = Number(passengersInput.value);

        if (!from || !to || !date) {
            message.textContent =
                "Please complete all search fields.";
            return;
        }

        if (from === to) {
            message.textContent =
                "Origin and destination must be different.";
            return;
        }

        if (date < localDateString(new Date())) {
            message.textContent =
                "Please choose today or a future journey date.";
            return;
        }

        if (
            !Number.isInteger(passengers) ||
            passengers < 1 ||
            passengers > 10
        ) {
            message.textContent =
                "Passengers must be between 1 and 10.";
            return;
        }

        searchDate = date;

        let matches = journeys.filter(function (journey) {
            return (
                journey.type === selectedType &&
                journey.from.toLowerCase() === from.toLowerCase() &&
                journey.to.toLowerCase() === to.toLowerCase()
            );
        });

        // Also fetch any dynamic routes from MongoDB
        try {
            const apiRes = await fetch(`${API_URL}/api/transportations?type=${selectedType}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
            const apiData = await apiRes.json();
            const list = Array.isArray(apiData) ? apiData : (apiData.transportations || []);
            list.forEach(item => {
                if (!matches.some(m => m.operator === item.operator)) {
                    matches.push({
                        id: item._id || item.id || `TR-${Date.now()}`,
                        type: item.type,
                        operator: item.operator,
                        from: item.from,
                        to: item.to,
                        departure: item.departureTime || "08:00 AM",
                        duration: item.duration ? `${Math.round(item.duration/60)} hours` : "Approx. 5–7 hours",
                        fare: item.farePerSeat || item.fare || 1000,
                        scheduleUrl: "https://shohoz.com"
                    });
                }
            });
        } catch (e) {}

        // Fallback dynamic generator using real road distances from 64 districts
        if (matches.length === 0) {
            if (!currentRouteInfo) await updateRouteCalculation();
            const dist = currentRouteInfo ? currentRouteInfo.distanceKm : 220;
            const dur = currentRouteInfo ? currentRouteInfo.durations : { bus: "5h 30m", train: "6h 00m", flight: "50 mins", flightAvailable: false };

            if (selectedType === "Bus") {
                const fareEstimate = Math.round(Math.max(450, dist * 3.2) / 50) * 50;
                matches = [
                    { id: `BUS-GREEN-${from.slice(0,3)}-${to.slice(0,3)}`, type: "Bus", operator: "Green Line Paribahan (Scania AC)", from, to, departure: "08:30 AM", duration: dur.bus, fare: fareEstimate + 200, scheduleUrl: "https://greenlinebd.com" },
                    { id: `BUS-HANIF-${from.slice(0,3)}-${to.slice(0,3)}`, type: "Bus", operator: "Hanif Enterprise (AC Chair Coach)", from, to, departure: "10:00 AM", duration: dur.bus, fare: fareEstimate, scheduleUrl: "https://hanifenterprisebd.com" },
                    { id: `BUS-SHOHOZ-${from.slice(0,3)}-${to.slice(0,3)}`, type: "Bus", operator: "Shohoz Express Premium", from, to, departure: "09:30 PM", duration: dur.bus, fare: Math.max(400, fareEstimate - 100), scheduleUrl: "https://shohoz.com" }
                ];
            } else if (selectedType === "Train") {
                const trainFare = Math.round(Math.max(250, dist * 1.8) / 20) * 20;
                matches = [
                    { id: `TRAIN-INTERCITY-${from.slice(0,3)}-${to.slice(0,3)}`, type: "Train", operator: "Bangladesh Railway (Intercity Express)", from, to, departure: "07:15 AM", duration: dur.train, fare: trainFare, scheduleUrl: "https://eticket.railway.gov.bd" },
                    { id: `TRAIN-SNIGDHA-${from.slice(0,3)}-${to.slice(0,3)}`, type: "Train", operator: "Bangladesh Railway (Snigdha AC Chair)", from, to, departure: "03:45 PM", duration: dur.train, fare: trainFare + 250, scheduleUrl: "https://eticket.railway.gov.bd" }
                ];
            } else if (selectedType === "Flight" && (dur.flightAvailable || dist > 150)) {
                matches = [
                    { id: `FLIGHT-BIMAN-${from.slice(0,3)}-${to.slice(0,3)}`, type: "Flight", operator: "Biman Bangladesh Airlines (Boeing 737)", from, to, departure: "11:30 AM", duration: "50 minutes", fare: 5500, scheduleUrl: "https://biman-airlines.com" },
                    { id: `FLIGHT-USBAIR-${from.slice(0,3)}-${to.slice(0,3)}`, type: "Flight", operator: "US-Bangla Airlines (ATR 72-600)", from, to, departure: "03:15 PM", duration: "45 minutes", fare: 4900, scheduleUrl: "https://usbair.com" }
                ];
            }
        }

        renderResults(matches);
    }
);

// ========================================
// DISPLAY SEARCH RESULTS
// ========================================

function renderResults(matches) {
    results.replaceChildren();

    bookingPanel.hidden = true;
    selectedJourney = null;
    selectedSeats = [];

    const oldPicker = document.getElementById("seatSelection");

    if (oldPicker) {
        oldPicker.remove();
    }

    document.getElementById("resultCount").textContent =
        `${matches.length} listed option(s)`;

    document.getElementById("resultsSubtitle").textContent =
        `Journey date: ${searchDate}. Listed fares are estimates in BDT, not live quotes.`;

    if (!matches.length) {
        message.textContent =
            "No listed option found for this route. Try another route or transport type.";
        return;
    }

    message.textContent =
        "Important: these are route/operator listings and indicative estimates, not live schedules, seat availability, or confirmed fares. Check the official link before booking.";

    matches.forEach(function (journey) {
        const card = document.createElement("article");
        card.className = "transport-result-card modern-transport-card";

        const typeIcon = journey.type === "Flight" ? "✈️" : (journey.type === "Train" ? "🚆" : "🚌");
        const classLabel = journey.type === "Flight" ? "Economy Class" : (journey.type === "Train" ? "Shovon Chair / AC" : "AC Multi-Axle Luxury");
        const availableSeatsCount = Math.floor(Math.random() * 15) + 12;

        card.innerHTML = `
            <div class="card-transport-top">
                <div class="operator-info">
                    <span class="operator-icon-badge">${typeIcon}</span>
                    <div>
                        <h3 class="operator-name">${journey.operator}</h3>
                        <span class="transport-class-badge">${classLabel}</span>
                    </div>
                </div>
                <div class="seat-badge-pill">
                    <span class="seat-dot"></span>
                    <span>${availableSeatsCount} seats left</span>
                </div>
            </div>

            <div class="transport-route-timeline">
                <div class="timeline-station">
                    <span class="time-main">${journey.departure === "Schedule varies" ? "Daily Service" : journey.departure}</span>
                    <span class="station-city">📍 ${journey.from}</span>
                </div>
                <div class="timeline-track">
                    <span class="timeline-duration">${journey.duration}</span>
                    <div class="timeline-line">
                        <span class="track-dot start"></span>
                        <span class="track-vehicle">${typeIcon}</span>
                        <span class="track-dot end"></span>
                    </div>
                    <span class="timeline-direct">Express Route</span>
                </div>
                <div class="timeline-station right">
                    <span class="time-main">${journey.arrival === "Schedule varies" ? "Direct Route" : journey.arrival}</span>
                    <span class="station-city">📍 ${journey.to}</span>
                </div>
            </div>

            <div class="transport-amenities-row">
                <span class="amenity-chip">❄️ Air Conditioned</span>
                <span class="amenity-chip">💺 Reclining Seats</span>
                <span class="amenity-chip">🔌 Charging Port</span>
                <span class="amenity-chip">🛡️ Verified Route</span>
            </div>

            <div class="card-transport-bottom">
                <div class="transport-fare-wrap">
                    <span class="fare-label">Estimated Fare</span>
                    <span class="transport-fare">৳${journey.fare.toLocaleString("en-BD")} <small>/ seat</small></span>
                </div>
                <div class="transport-card-actions">
                    ${journey.scheduleUrl ? `<a href="${journey.scheduleUrl}" target="_blank" rel="noopener noreferrer" class="transport-operator-link">Official Portal ↗</a>` : ''}
                    <button type="button" class="modern-select-journey-btn">
                        <span>${journey.type === "Flight" ? "Select Flight" : (journey.type === "Train" ? "Select Train" : "Select Seats & Book")}</span>
                        <span class="btn-arrow">→</span>
                    </button>
                </div>
            </div>
        `;

        card.querySelector(".modern-select-journey-btn").addEventListener("click", function () {
            chooseJourney(journey);
        });

        results.appendChild(card);
    });
}

// ========================================
// SELECT A JOURNEY
// ========================================

function chooseJourney(journey) {
    selectedJourney = journey;
    selectedSeats = [];
    selectedCoach = "A";

    bookingPanel.hidden = false;
    bookingMessage.textContent = "";

    const summary = document.getElementById("selectedJourney");
    summary.replaceChildren();

    const details = document.createElement("p");
    details.textContent =
        `${journey.type}: ${journey.operator} | ` +
        `${journey.from} → ${journey.to} | ${searchDate}`;

    summary.appendChild(details);

    renderSeatSelection(journey);

    bookingPanel.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

// ========================================
// SEAT SELECTION
// ========================================

function renderSeatSelection(journey) {
    const oldPicker = document.getElementById("seatSelection");

    if (oldPicker) {
        oldPicker.remove();
    }

    const passengers = Number(passengersInput.value);

    const picker = document.createElement("section");
    picker.id = "seatSelection";
    picker.className = "seat-selection";

    const heading = document.createElement("h3");

    heading.textContent =
        journey.type === "Train"
            ? "Train Seat Selection"
            : journey.type === "Bus"
                ? "Bus Seat Selection"
                : "Flight Seat Selection";

    const instructions = document.createElement("p");
    instructions.textContent =
        `Choose exactly ${passengers} seat(s) for your journey.`;

    picker.append(heading, instructions);

    // Train coach selection
    if (journey.type === "Train") {
        const coachLabel = document.createElement("label");
        coachLabel.htmlFor = "coachSelect";
        coachLabel.textContent = "Select Coach: ";

        const coachSelect = document.createElement("select");
        coachSelect.id = "coachSelect";

        ["A", "B", "C"].forEach(function (coach) {
            const option = document.createElement("option");
            option.value = coach;
            option.textContent = `Coach ${coach}`;
            coachSelect.appendChild(option);
        });

        coachSelect.addEventListener("change", function () {
            selectedCoach = coachSelect.value;
            selectedSeats = [];
            drawSeats();
        });

        coachLabel.appendChild(coachSelect);
        picker.appendChild(coachLabel);
    }

    // Seat legend
    const legend = document.createElement("div");
    legend.className = "seat-legend";

    [
        ["available", "Available"],
        ["chosen", "Selected"],
        ["occupied", "Unavailable (demo)"]
    ].forEach(function ([className, labelText]) {
        const label = document.createElement("span");

        const sample = document.createElement("i");
        sample.className = `seat-example ${className}`;

        const text = document.createElement("span");
        text.textContent = labelText;

        label.append(sample, text);
        legend.appendChild(label);
    });

    picker.appendChild(legend);

    // Vehicle and seat grid
    const vehicle = document.createElement("div");
    vehicle.className = "vehicle-layout";

    const front = document.createElement("div");
    front.className = "vehicle-front";
    front.textContent =
        journey.type === "Train" ? "TRAIN FRONT" : "DRIVER";

    const layout = document.createElement("div");
    layout.className = "seat-grid";

    vehicle.append(front, layout);

    const info = document.createElement("p");
    info.id = "selectedSeatInfo";
    info.className = "selected-seat-info";

    const fare = document.createElement("p");
    fare.id = "selectedSeatFare";
    fare.className = "selected-seat-fare";

    picker.append(vehicle, info, fare);

    bookingForm.insertBefore(picker, bookingForm.firstChild);

    // Draw seats
    function drawSeats() {
        layout.replaceChildren();

        const isFlight = journey.type === "Flight";
        const rows = isFlight ? 5 : 8;

        const unavailable = isFlight
            ? ["1C", "2A", "3D", "4B", "5E"]
            : journey.type === "Train"
                ? [3, 8, 14, 21, 27, 35]
                : [4, 9, 16, 22, 29];

        if (isFlight) {
            layout.classList.add("flight-seat-grid");
        } else {
            layout.classList.remove("flight-seat-grid");
        }

        for (let row = 0; row < rows; row++) {
            const totalPositions = isFlight ? 7 : 5;

            for (
                let position = 0;
                position < totalPositions;
                position++
            ) {
                const aislePosition = isFlight ? 3 : 2;

                if (position === aislePosition) {
                    const aisle = document.createElement("div");
                    aisle.className = "seat-aisle";
                    aisle.setAttribute("aria-hidden", "true");

                    layout.appendChild(aisle);
                    continue;
                }

                let seatNumber;
                let seatIndex;

                if (isFlight) {
                    const letterIndex =
                        position < 3 ? position : position - 1;

                    const letter =
                        ["A", "B", "C", "D", "E", "F"][letterIndex];

                    seatNumber = `${row + 1}${letter}`;
                    seatIndex = seatNumber;
                } else {
                    seatIndex =
                        row * 4 +
                        (position < 2 ? position : position - 1) +
                        1;

                    seatNumber =
                        journey.type === "Train"
                            ? `${selectedCoach}${seatIndex}`
                            : `B${seatIndex}`;
                }

                const button = document.createElement("button");
                button.type = "button";
                button.className = "seat";
                button.textContent = isFlight ? seatNumber : seatIndex;

                button.setAttribute(
                    "aria-label",
                    `Seat ${seatNumber}`
                );

                const isUnavailable =
                    unavailable.includes(seatIndex);

                if (isUnavailable) {
                    button.classList.add("occupied");
                    button.disabled = true;
                    button.title = "Unavailable demo seat";
                } else if (selectedSeats.includes(seatNumber)) {
                    button.classList.add("chosen");
                    button.setAttribute("aria-pressed", "true");
                } else {
                    button.classList.add("available");
                    button.setAttribute("aria-pressed", "false");
                }

                button.addEventListener("click", function () {
                    if (selectedSeats.includes(seatNumber)) {
                        selectedSeats = selectedSeats.filter(
                            seat => seat !== seatNumber
                        );
                    } else {
                        if (
                            selectedSeats.length >=
                            Number(passengersInput.value)
                        ) {
                            info.textContent =
                                `You can select only ${passengersInput.value} seat(s).`;
                            return;
                        }

                        selectedSeats.push(seatNumber);
                    }

                    drawSeats();
                });

                layout.appendChild(button);
            }
        }

        info.textContent = selectedSeats.length
            ? `Selected: ${selectedSeats.join(", ")} ` +
              `(${selectedSeats.length}/${passengersInput.value})`
            : `No seats selected (0/${passengersInput.value})`;

        fare.textContent =
            `Estimated total: ৳${(
                journey.fare * Number(passengersInput.value)
            ).toLocaleString("en-BD")}`;
    }

    drawSeats();
}

// ========================================
// USER & ACTIVE BADGE SETUP
// ========================================

try {
    user = JSON.parse(sessionStorage.getItem("travelKoriUser") || "null");
} catch (e) {
    user = null;
}

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

function setupTransportPaymentListeners() {
    const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
    const walletFields = document.getElementById("transportWalletFields");
    const walletPhone = document.getElementById("transportPaymentPhone");

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

document.addEventListener("DOMContentLoaded", () => {
    updateActiveUserBadge();
    setupTransportPaymentListeners();
});

// ========================================
// BOOKING SUBMISSION + PAYMENT
// ========================================

bookingForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (!user || !user.id) {
        bookingMessage.textContent =
            "Please log in before submitting a booking.";
        bookingMessage.style.color = "red";
        return;
    }

    if (!selectedJourney) {
        bookingMessage.textContent =
            "Please select a journey first.";
        bookingMessage.style.color = "red";
        return;
    }

    if (
        selectedSeats.length !== Number(passengersInput.value)
    ) {
        bookingMessage.textContent =
            `Please select exactly ${passengersInput.value} seat(s).`;
        bookingMessage.style.color = "red";
        return;
    }

    const passengerName =
        document.getElementById("passengerName").value.trim();

    const passengerPhone =
        document.getElementById("passengerPhone").value.trim();

    const paymentMethodInput = document.querySelector(
        'input[name="paymentMethod"]:checked'
    );

    const paymentMethod =
        paymentMethodInput ? paymentMethodInput.value : "cash";

    const paymentPhoneInput = document.getElementById("transportPaymentPhone");
    const paymentPhone =
        paymentPhoneInput ? paymentPhoneInput.value.trim() : "";

    const transactionReference = "";

    const button =
        document.getElementById("confirmTransportBtn");

    if (!paymentMethod) {
        bookingMessage.textContent =
            "Please select a payment method.";
        bookingMessage.style.color = "red";
        return;
    }

    const cleanPaymentPhone = paymentPhone.replace(/\s+/g, "");

    if (
        (paymentMethod === "bkash" || paymentMethod === "nagad") &&
        !/^01[3-9][0-9]{8}$/.test(cleanPaymentPhone)
    ) {
        bookingMessage.textContent =
            "Enter a valid 11-digit Bangladeshi mobile number for demo wallet payment.";
        bookingMessage.style.color = "red";
        return;
    }

    button.disabled = true;
    button.textContent = "Processing demo checkout...";

    try {
        const response = await fetch(
            `${API_URL}/api/transport-bookings`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    userId: user.id,
                    journeyId: selectedJourney.id || `TRP-${selectedJourney.from}-${selectedJourney.to}`,
                    from: selectedJourney.from,
                    to: selectedJourney.to,
                    type: selectedJourney.type,
                    operator: selectedJourney.operator,
                    fare: selectedJourney.fare,
                    journeyDate: searchDate,
                    passengers: Number(passengersInput.value),
                    seatNumbers: selectedSeats,
                    passengerName: passengerName,
                    passengerPhone: passengerPhone,
                    paymentMethod: paymentMethod,
                    paymentPhone:
                        paymentMethod === "bkash" ||
                        paymentMethod === "nagad"
                            ? cleanPaymentPhone
                            : null,
                    transactionReference:
                        transactionReference || null
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Booking request failed."
            );
        }

        const payment = data.booking.payment || {};

        const paymentLabel = {
            bkash: "bKash (Demo)",
            nagad: "Nagad (Demo)",
            card: "Card (Demo)",
            cash: "Cash"
        }[payment.method] || payment.method;

        const totalFareAmount = selectedJourney.fare * Number(passengersInput.value);

        bookingMessage.innerHTML = `
            <div style="background: #e6f7f0; border: 2px solid #087f5b; border-radius: 10px; padding: 20px; margin-top: 15px; text-align: left;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
                    <span style="color: #087f5b; font-weight: 800; font-size: 16px;">✅ Ticket Confirmed!</span>
                    <span style="font-size: 12px; font-weight: 700; background: #087f5b; color: white; padding: 4px 10px; border-radius: 6px;">Ref: ${data.booking.reference}</span>
                </div>
                <p style="margin: 4px 0; font-size: 14px; color: #17382f;">
                    <strong>Journey:</strong> ${selectedJourney.operator} (${selectedJourney.type}) • ${selectedJourney.from} ➔ ${selectedJourney.to}
                </p>
                <p style="margin: 4px 0; font-size: 13px; color: #475569;">
                    <strong>Date:</strong> ${searchDate} • <strong>Seat(s):</strong> <span style="color:#087f5b; font-weight:700;">${selectedSeats.join(", ")}</span>
                </p>
                <p style="margin: 4px 0; font-size: 13px; color: #475569;">
                    <strong>Payment:</strong> ${paymentLabel} — <span style="color: #087f5b; font-weight: 700;">Demo Paid</span> • <strong>Total:</strong> ৳${totalFareAmount.toLocaleString('en-BD')} BDT
                </p>
                <div style="display: flex; gap: 10px; margin-top: 14px; flex-wrap: wrap;">
                    <button id="downloadTicketBtn" type="button" class="btn-download-pdf">
                        📥 Download Official Ticket (PDF)
                    </button>
                    <a href="dashboard.html" class="signup-btn" style="padding: 8px 14px; font-size: 12px; text-decoration: none; border-radius: 7px; background: #17382f; color: white;">
                        View in Dashboard →
                    </a>
                </div>
            </div>
        `;

        document.getElementById("downloadTicketBtn")?.addEventListener("click", function () {
            if (window.TravelKoriPDF) {
                window.TravelKoriPDF.downloadTransportTicket({
                    reference: data.booking.reference,
                    from: selectedJourney.from,
                    to: selectedJourney.to,
                    type: selectedJourney.type,
                    operator: selectedJourney.operator,
                    journeyDate: searchDate,
                    passengerName: passengerName,
                    passengerPhone: passengerPhone,
                    seatNumbers: selectedSeats,
                    passengers: Number(passengersInput.value),
                    paymentMethod: paymentMethod,
                    totalFare: totalFareAmount
                });
            }
        });
    } catch (error) {
        console.error("Transport booking error:", error);

        bookingMessage.textContent =
            error.message === "Failed to fetch"
                ? "Cannot connect to backend. Check the server."
                : error.message;

        bookingMessage.style.color = "red";
    } finally {
        button.disabled = false;
        button.textContent = "Confirm Demo Booking";
    }
});