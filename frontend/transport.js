const API_URL = "http://localhost:5000";

const cities = [
    "Dhaka", "Chattogram", "Cox's Bazar", "Sylhet",
    "Rajshahi", "Khulna", "Rangpur", "Mymensingh",
    "Barishal", "Cumilla"
];

const journeys = [
    {
        id: "BUS-DAC-CTG-01",
        type: "Bus",
        operator: "Demo Express",
        from: "Dhaka",
        to: "Chattogram",
        departure: "07:00",
        arrival: "13:00",
        duration: "6 hours",
        fare: 900
    },
    {
        id: "BUS-DAC-COX-01",
        type: "Bus",
        operator: "Demo Coastal Coach",
        from: "Dhaka",
        to: "Cox's Bazar",
        departure: "22:00",
        arrival: "06:30",
        duration: "8 hours 30 minutes",
        fare: 1400
    },
    {
        id: "BUS-DAC-SYL-01",
        type: "Bus",
        operator: "Demo Green Coach",
        from: "Dhaka",
        to: "Sylhet",
        departure: "08:00",
        arrival: "14:00",
        duration: "6 hours",
        fare: 750
    },
    {
        id: "BUS-CTG-COX-01",
        type: "Bus",
        operator: "Demo Bay Coach",
        from: "Chattogram",
        to: "Cox's Bazar",
        departure: "09:00",
        arrival: "13:00",
        duration: "4 hours",
        fare: 500
    },
    {
        id: "TRAIN-DAC-CTG-01",
        type: "Train",
        operator: "Demo Intercity Train",
        from: "Dhaka",
        to: "Chattogram",
        departure: "07:30",
        arrival: "14:00",
        duration: "6 hours 30 minutes",
        fare: 450
    },
    {
        id: "TRAIN-DAC-SYL-01",
        type: "Train",
        operator: "Demo Intercity Train",
        from: "Dhaka",
        to: "Sylhet",
        departure: "08:15",
        arrival: "15:00",
        duration: "6 hours 45 minutes",
        fare: 400
    },
    {
        id: "TRAIN-DAC-RJH-01",
        type: "Train",
        operator: "Demo Intercity Train",
        from: "Dhaka",
        to: "Rajshahi",
        departure: "06:30",
        arrival: "12:00",
        duration: "5 hours 30 minutes",
        fare: 420
    },
    {
        id: "FLIGHT-DAC-CTG-01",
        type: "Flight",
        operator: "Demo Bangladesh Air",
        from: "Dhaka",
        to: "Chattogram",
        departure: "09:00",
        arrival: "09:55",
        duration: "55 minutes",
        fare: 4500
    },
    {
        id: "FLIGHT-DAC-COX-01",
        type: "Flight",
        operator: "Demo Bangladesh Air",
        from: "Dhaka",
        to: "Cox's Bazar",
        departure: "10:00",
        arrival: "11:05",
        duration: "1 hour 5 minutes",
        fare: 6500
    },
    {
        id: "FLIGHT-DAC-SYL-01",
        type: "Flight",
        operator: "Demo Bangladesh Air",
        from: "Dhaka",
        to: "Sylhet",
        departure: "12:00",
        arrival: "12:50",
        duration: "50 minutes",
        fare: 4200
    }
];

// ================================
// GLOBAL VARIABLES
// ================================

let selectedType = "Bus";
let selectedJourney = null;
let selectedSeats = [];
let selectedCoach = "A";
let searchDate = "";

// ================================
// DOM ELEMENTS
// ================================

const fromCity = document.getElementById("fromCity");
const toCity = document.getElementById("toCity");
const journeyDate = document.getElementById("journeyDate");
const passengersInput = document.getElementById("passengers");

const results = document.getElementById("transportResults");
const message = document.getElementById("transportMessage");

const bookingPanel = document.getElementById("transportBookingPanel");
const bookingMessage = document.getElementById("transportBookingMessage");
const bookingForm = document.getElementById("transportBookingForm");

const walletPaymentFields =
    document.getElementById("walletPaymentFields");

const paymentPhoneInput =
    document.getElementById("paymentPhone");

const transactionReferenceInput =
    document.getElementById("transactionReference");

const paymentHelp =
    document.getElementById("paymentHelp");

// ================================
// PAYMENT METHOD SELECTION
// ================================

document.querySelectorAll(
    'input[name="paymentMethod"]'
).forEach(function (input) {

    input.addEventListener("change", function () {

        if (!input.checked) return;

        const isWallet =
            input.value === "bkash" ||
            input.value === "nagad";

        walletPaymentFields.hidden = !isWallet;
        paymentPhoneInput.required = isWallet;

        if (!isWallet) {
            paymentPhoneInput.value = "";
        }

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
    });
});

// ================================
// LOGIN SESSION
// ================================

let user = null;

try {
    user = JSON.parse(
        sessionStorage.getItem("travelKoriUser") || "null"
    );
} catch (error) {
    user = null;
}

// ================================
// DATE HELPER
// ================================

function localDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

journeyDate.min = localDateString(new Date());

// ================================
// POPULATE CITY OPTIONS
// ================================

cities.forEach(function (city) {

    [fromCity, toCity].forEach(function (select) {

        const option = document.createElement("option");

        option.value = city;
        option.textContent = city;

        select.appendChild(option);
    });
});

// ================================
// BUS / TRAIN / FLIGHT TABS
// ================================

document.querySelectorAll(".transport-tab").forEach(function (tab) {

    tab.addEventListener("click", function () {

        selectedType = tab.dataset.type;

        document.querySelectorAll(".transport-tab").forEach(function (item) {
            item.classList.toggle("active", item === tab);
        });

        document.getElementById("resultsTitle").textContent =
            `Available ${selectedType} Options`;

        results.replaceChildren();

        document.getElementById("resultCount").textContent = "";

        document.getElementById("resultsSubtitle").textContent =
            "Select your route and journey date.";

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

// ================================
// TRANSPORT SEARCH
// ================================

document.getElementById("transportSearchForm").addEventListener(
    "submit",
    function (event) {

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

        const matches = journeys.filter(function (journey) {
            return (
                journey.type === selectedType &&
                journey.from === from &&
                journey.to === to
            );
        });

        renderResults(matches);
    }
);

// ================================
// DISPLAY SEARCH RESULTS
// ================================

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
        `${matches.length} option(s)`;

    document.getElementById("resultsSubtitle").textContent =
        `Journey date: ${searchDate}. Estimated fares are in BDT.`;

    if (!matches.length) {

        message.textContent =
            "No demo schedules found for this route. Try another route or transport type.";

        return;
    }

    message.textContent =
        "Demo results only. Actual schedules and fares are not verified live.";

    matches.forEach(function (journey) {

        const card = document.createElement("article");
        card.className = "transport-result-card";

        const title = document.createElement("h3");
        title.textContent = journey.operator;

        const route = document.createElement("p");
        route.textContent =
            `${journey.from} → ${journey.to}`;

        const time = document.createElement("p");
        time.textContent =
            `${journey.departure} – ${journey.arrival} (${journey.duration})`;

        const type = document.createElement("p");
        type.textContent = `Transport: ${journey.type}`;

        const fare = document.createElement("p");
        fare.className = "transport-fare";
        fare.textContent =
            `৳${journey.fare.toLocaleString("en-BD")} per passenger`;

        const button = document.createElement("button");
        button.type = "button";
        button.className = "signup-btn";

        button.textContent =
            journey.type === "Flight"
                ? "Select Flight"
                : "Select Journey";

        button.addEventListener("click", function () {
            chooseJourney(journey);
        });

        card.append(title, route, time, type, fare, button);

        results.appendChild(card);
    });
}

// ================================
// SELECT A JOURNEY
// ================================

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

// ================================
// SEAT SELECTION
// ================================

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

// ================================
// BOOKING SUBMISSION + PAYMENT
// ================================

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
        paymentMethodInput ? paymentMethodInput.value : "";

    const paymentPhone =
        paymentPhoneInput.value.trim();

    const transactionReference =
        transactionReferenceInput.value.trim();

    const button =
        document.getElementById("confirmTransportBtn");

    // Validate payment selection
    if (!paymentMethod) {

        bookingMessage.textContent =
            "Please select a payment method.";

        bookingMessage.style.color = "red";

        return;
    }

    // Normalize mobile number by removing whitespace
    const cleanPaymentPhone = paymentPhone.replace(/\s+/g, "");

    // Validate bKash / Nagad mobile number
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

                    journeyId: selectedJourney.id,

                    journeyDate: searchDate,

                    passengers: Number(passengersInput.value),

                    seatNumbers: selectedSeats,

                    passengerName: passengerName,

                    passengerPhone: passengerPhone,

                    paymentMethod: paymentMethod,

                    // Send the same normalized number that was validated
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

        bookingMessage.textContent =
            `Booking request submitted! ` +
            `Reference ID: ${data.booking.reference}. ` +
            `Booking status: Pending. ` +
            `Seats: ${selectedSeats.join(", ")}. ` +
            `Payment: ${paymentLabel} — ${payment.status || "Pending"}. ` +
            (
                payment.transactionReference
                    ? `Demo reference: ${payment.transactionReference}.`
                    : ""
            );

        bookingMessage.style.color = "#087f5b";

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