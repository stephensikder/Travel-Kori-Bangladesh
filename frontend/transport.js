const API_URL = "http://localhost:5000";

const cities = [
    "Dhaka", "Chattogram", "Cox's Bazar", "Sylhet",
    "Rajshahi", "Khulna", "Rangpur", "Mymensingh", "Barishal", "Cumilla"
];

const journeys = [
    { id: "BUS-DAC-CTG-01", type: "Bus", operator: "Demo Express", from: "Dhaka", to: "Chattogram", departure: "07:00", arrival: "13:00", duration: "6 hours", fare: 900 },
    { id: "BUS-DAC-COX-01", type: "Bus", operator: "Demo Coastal Coach", from: "Dhaka", to: "Cox's Bazar", departure: "22:00", arrival: "06:30", duration: "8 hours 30 minutes", fare: 1400 },
    { id: "BUS-DAC-SYL-01", type: "Bus", operator: "Demo Green Coach", from: "Dhaka", to: "Sylhet", departure: "08:00", arrival: "14:00", duration: "6 hours", fare: 750 },
    { id: "BUS-CTG-COX-01", type: "Bus", operator: "Demo Bay Coach", from: "Chattogram", to: "Cox's Bazar", departure: "09:00", arrival: "13:00", duration: "4 hours", fare: 500 },
    { id: "TRAIN-DAC-CTG-01", type: "Train", operator: "Demo Intercity Train", from: "Dhaka", to: "Chattogram", departure: "07:30", arrival: "14:00", duration: "6 hours 30 minutes", fare: 450 },
    { id: "TRAIN-DAC-SYL-01", type: "Train", operator: "Demo Intercity Train", from: "Dhaka", to: "Sylhet", departure: "08:15", arrival: "15:00", duration: "6 hours 45 minutes", fare: 400 },
    { id: "TRAIN-DAC-RJH-01", type: "Train", operator: "Demo Intercity Train", from: "Dhaka", to: "Rajshahi", departure: "06:30", arrival: "12:00", duration: "5 hours 30 minutes", fare: 420 },
    { id: "FLIGHT-DAC-CTG-01", type: "Flight", operator: "Demo Bangladesh Air", from: "Dhaka", to: "Chattogram", departure: "09:00", arrival: "09:55", duration: "55 minutes", fare: 4500 },
    { id: "FLIGHT-DAC-COX-01", type: "Flight", operator: "Demo Bangladesh Air", from: "Dhaka", to: "Cox's Bazar", departure: "10:00", arrival: "11:05", duration: "1 hour 5 minutes", fare: 6500 },
    { id: "FLIGHT-DAC-SYL-01", type: "Flight", operator: "Demo Bangladesh Air", from: "Dhaka", to: "Sylhet", departure: "12:00", arrival: "12:50", duration: "50 minutes", fare: 4200 }
];

let selectedType = "Bus";
let selectedJourney = null;
let selectedSeats = [];
let selectedCoach = "A";
let searchDate = "";

const fromCity = document.getElementById("fromCity");
const toCity = document.getElementById("toCity");
const journeyDate = document.getElementById("journeyDate");
const passengersInput = document.getElementById("passengers");
const results = document.getElementById("transportResults");
const message = document.getElementById("transportMessage");
const bookingPanel = document.getElementById("transportBookingPanel");
const bookingMessage = document.getElementById("transportBookingMessage");
const bookingForm = document.getElementById("transportBookingForm");

let user = null;
try {
    user = JSON.parse(sessionStorage.getItem("travelKoriUser") || "null");
} catch {
    user = null;
}

function localDateString(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

journeyDate.min = localDateString(new Date());

cities.forEach(city => {
    [fromCity, toCity].forEach(select => {
        const option = document.createElement("option");
        option.value = city;
        option.textContent = city;
        select.appendChild(option);
    });
});

document.querySelectorAll(".transport-tab").forEach(tab => {
    tab.addEventListener("click", function () {
        selectedType = tab.dataset.type;
        document.querySelectorAll(".transport-tab").forEach(item => {
            item.classList.toggle("active", item === tab);
        });
        document.getElementById("resultsTitle").textContent = `Available ${selectedType} Options`;
        results.replaceChildren();
        document.getElementById("resultCount").textContent = "";
        document.getElementById("resultsSubtitle").textContent = "Select your route and journey date.";
        message.textContent = "";
        bookingPanel.hidden = true;
        selectedJourney = null;
        selectedSeats = [];
    });
});

document.getElementById("transportSearchForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const from = fromCity.value;
    const to = toCity.value;
    const date = journeyDate.value;
    const passengers = Number(passengersInput.value);

    if (!from || !to || !date) {
        message.textContent = "Please complete all search fields.";
        return;
    }
    if (from === to) {
        message.textContent = "Origin and destination must be different.";
        return;
    }
    if (date < localDateString(new Date())) {
        message.textContent = "Please choose today or a future journey date.";
        return;
    }
    if (!Number.isInteger(passengers) || passengers < 1 || passengers > 10) {
        message.textContent = "Passengers must be between 1 and 10.";
        return;
    }

    searchDate = date;
    renderResults(journeys.filter(j => j.type === selectedType && j.from === from && j.to === to));
});

function renderResults(matches) {
    results.replaceChildren();
    bookingPanel.hidden = true;
    selectedJourney = null;
    selectedSeats = [];

    document.getElementById("resultCount").textContent = `${matches.length} option(s)`;
    document.getElementById("resultsSubtitle").textContent = `Journey date: ${searchDate}. Estimated fares are in BDT.`;

    if (!matches.length) {
        message.textContent = "No demo schedules found for this route. Try another route or transport type.";
        return;
    }

    message.textContent = "Demo results only. Actual schedules and fares are not verified live.";

    matches.forEach(journey => {
        const card = document.createElement("article");
        card.className = "transport-result-card";

        const title = document.createElement("h3");
        title.textContent = journey.operator;
        const route = document.createElement("p");
        route.textContent = `${journey.from} → ${journey.to}`;
        const time = document.createElement("p");
        time.textContent = `${journey.departure} – ${journey.arrival} (${journey.duration})`;
        const type = document.createElement("p");
        type.textContent = `Transport: ${journey.type}`;
        const fare = document.createElement("p");
        fare.className = "transport-fare";
        fare.textContent = `৳${journey.fare.toLocaleString("en-BD")} per passenger`;
        const button = document.createElement("button");
        button.type = "button";
        button.className = "signup-btn";
        button.textContent = journey.type === "Flight" ? "Select Flight" : "Select Journey";
        button.addEventListener("click", () => chooseJourney(journey));

        card.append(title, route, time, type, fare, button);
        results.appendChild(card);
    });
}

function chooseJourney(journey) {
    selectedJourney = journey;
    selectedSeats = [];
    selectedCoach = "A";
    bookingPanel.hidden = false;
    bookingMessage.textContent = "";

    const summary = document.getElementById("selectedJourney");
    summary.replaceChildren();
    const details = document.createElement("p");
    details.textContent = `${journey.type}: ${journey.operator} | ${journey.from} → ${journey.to} | ${searchDate}`;
    summary.appendChild(details);

    renderSeatSelection(journey);
    bookingPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderSeatSelection(journey) {
    const oldPicker = document.getElementById("seatSelection");
    if (oldPicker) oldPicker.remove();

    const passengers = Number(passengersInput.value);
    const picker = document.createElement("section");
    picker.id = "seatSelection";
    picker.className = "seat-selection";

    const heading = document.createElement("h3");
    heading.textContent = journey.type === "Train"
        ? "Train Seat Selection"
        : journey.type === "Bus"
            ? "Bus Seat Selection"
            : "Flight Seat Selection";

    const instructions = document.createElement("p");
    instructions.textContent =
        `Choose exactly ${passengers} seat(s) for your journey.`;

    picker.append(heading, instructions);

    if (journey.type === "Train") {
        const coachLabel = document.createElement("label");
        coachLabel.htmlFor = "coachSelect";
        coachLabel.textContent = "Select Coach: ";
        const coachSelect = document.createElement("select");
        coachSelect.id = "coachSelect";

        ["A", "B", "C"].forEach(coach => {
            const option = document.createElement("option");
            option.value = coach;
            option.textContent = `Coach ${coach}`;
            coachSelect.appendChild(option);
        });

        coachSelect.addEventListener("change", () => {
            selectedCoach = coachSelect.value;
            selectedSeats = [];
            drawSeats();
        });

        coachLabel.appendChild(coachSelect);
        picker.appendChild(coachLabel);
    }

    const legend = document.createElement("div");
    legend.className = "seat-legend";
    [["available", "Available"], ["chosen", "Selected"], ["occupied", "Unavailable (demo)"]].forEach(([cls, labelText]) => {
        const label = document.createElement("span");
        const sample = document.createElement("i");
        sample.className = `seat-example ${cls}`;
        const text = document.createElement("span");
        text.textContent = labelText;
        label.append(sample, text);
        legend.appendChild(label);
    });
    picker.appendChild(legend);

    const vehicle = document.createElement("div");
    vehicle.className = "vehicle-layout";
    const front = document.createElement("div");
    front.className = "vehicle-front";
    front.textContent = journey.type === "Train" ? "TRAIN FRONT" : "DRIVER";
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

    function drawSeats() {
        layout.replaceChildren();
        const isFlight = journey.type === "Flight";
        const seatsPerRow = isFlight ? 6 : 4;
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

            for (let position = 0; position < totalPositions; position++) {
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
                    const letterIndex = position < 3 ? position : position - 1;
                    const letter = ["A", "B", "C", "D", "E", "F"][letterIndex];
                    seatNumber = `${row + 1}${letter}`;
                    seatIndex = seatNumber;
                } else {
                    seatIndex = row * 4 + (position < 2 ? position : position - 1) + 1;
                    seatNumber = journey.type === "Train"
                        ? `${selectedCoach}${seatIndex}`
                        : `B${seatIndex}`;
                }

                const button = document.createElement("button");
                button.type = "button";
                button.className = "seat";
                button.textContent = isFlight ? seatNumber : seatIndex;
                button.setAttribute("aria-label", `Seat ${seatNumber}`);

                const isUnavailable = unavailable.includes(seatIndex);

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

                button.addEventListener("click", () => {
                    if (selectedSeats.includes(seatNumber)) {
                        selectedSeats = selectedSeats.filter(seat => seat !== seatNumber);
                    } else {
                        if (selectedSeats.length >= Number(passengersInput.value)) {
                            info.textContent = `You can select only ${passengersInput.value} seat(s).`;
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
            ? `Selected: ${selectedSeats.join(", ")} (${selectedSeats.length}/${passengersInput.value})`
            : `No seats selected (0/${passengersInput.value})`;
        fare.textContent = `Estimated total: ৳${(journey.fare * Number(passengersInput.value)).toLocaleString("en-BD")}`;
    }

    drawSeats();
}

bookingForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (!user || !user.id) {
        bookingMessage.textContent = "Please log in before submitting a booking.";
        bookingMessage.style.color = "red";
        return;
    }
    if (!selectedJourney) {
        bookingMessage.textContent = "Please select a journey first.";
        bookingMessage.style.color = "red";
        return;
    }
    if (selectedSeats.length !== Number(passengersInput.value)) {
        bookingMessage.textContent = `Please select exactly ${passengersInput.value} seat(s).`;
        bookingMessage.style.color = "red";
        return;
    }

    const passengerName = document.getElementById("passengerName").value.trim();
    const passengerPhone = document.getElementById("passengerPhone").value.trim();
    const button = document.getElementById("confirmTransportBtn");

    button.disabled = true;
    button.textContent = "Submitting...";

    try {
        const response = await fetch(`${API_URL}/api/transport-bookings`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: user.id,
                journeyId: selectedJourney.id,
                journeyDate: searchDate,
                passengers: Number(passengersInput.value),
                seatNumbers: selectedSeats,
                passengerName,
                passengerPhone
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Booking request failed.");

        bookingMessage.textContent =
            `Booking request submitted! Reference ID: ${data.booking.reference}. ` +
            `Status: Pending. Seats: ${selectedSeats.join(", ")}.`;
        bookingMessage.style.color = "#087f5b";
    } catch (error) {
        console.error("Transport booking error:", error);
        bookingMessage.textContent = error.message === "Failed to fetch"
            ? "Cannot connect to backend. Check the server."
            : error.message;
        bookingMessage.style.color = "red";
    } finally {
        button.disabled = false;
        button.textContent = "Submit Booking Request";
    }
});
