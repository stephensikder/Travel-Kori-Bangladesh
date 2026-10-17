// API URL
const API_URL = "http://localhost:5000";

// Get booking form elements
const bookingForm = document.getElementById("bookingForm");
const bookingMessage = document.getElementById("bookingMessage");
const visitDateInput = document.getElementById("visitDate");

// Set the earliest visit date to today
const today = new Date();
const localToday = new Date(
    today.getTime() - today.getTimezoneOffset() * 60000
).toISOString().split("T")[0];

visitDateInput.min = localToday;

// Get the logged-in user
let user = null;

try {
    user = JSON.parse(
        sessionStorage.getItem("travelKoriUser") || "null"
    );
} catch (error) {
    user = null;
}

// Submit booking form
bookingForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    // Check login
    if (!user || !user.id) {
        bookingMessage.textContent =
            "Please log in before submitting a booking.";
        bookingMessage.style.color = "red";
        return;
    }

    const district =
        document.getElementById("district").value.trim();

    const touristSpot =
        document.getElementById("touristSpot").value.trim();

    const visitDate = visitDateInput.value;

    const people = Number(
        document.getElementById("people").value
    );

    if (!district || !touristSpot || !visitDate || people < 1) {
        bookingMessage.textContent =
            "Please complete all booking fields.";
        bookingMessage.style.color = "red";
        return;
    }

    bookingMessage.textContent = "Submitting your booking...";
    bookingMessage.style.color = "#087f5b";

    try {
        const response = await fetch(`${API_URL}/api/bookings`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userId: user.id,
                district: district,
                touristSpot: touristSpot,
                visitDate: visitDate,
                people: people
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Unable to submit booking."
            );
        }

        bookingMessage.textContent =
            "Booking request submitted successfully! Status: Pending.";

        bookingMessage.style.color = "#087f5b";

        bookingForm.reset();

        // Keep today's date as the minimum
        visitDateInput.min = localToday;

    } catch (error) {
        console.error("Booking error:", error);

        bookingMessage.textContent =
            error.message === "Failed to fetch"
                ? "Cannot connect to the backend. Please check the server."
                : error.message;

        bookingMessage.style.color = "red";
    }
});