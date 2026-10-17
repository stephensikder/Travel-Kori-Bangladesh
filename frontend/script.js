
const searchBtn = document.getElementById("searchBtn");
const destination = document.getElementById("destination");
const travelDate = document.getElementById("travelDate");
const searchMessage = document.getElementById("searchMessage");

searchBtn.addEventListener("click", function () {
    const place = destination.value.trim();
    const date = travelDate.value;

    if (place === "") {
        searchMessage.textContent = "Please enter a destination.";
        return;
    }

    if (date === "") {
        searchMessage.textContent = "Please select a travel date.";
        return;
    }

    searchMessage.textContent =
        "Searching for " + place + " on " + date + "...";
});

document.getElementById("loginBtn").addEventListener("click", function () {
    alert("Login page will be available soon!");
});

document.getElementById("signupBtn").addEventListener("click", function () {
    alert("Sign Up page will be available soon!");
});
