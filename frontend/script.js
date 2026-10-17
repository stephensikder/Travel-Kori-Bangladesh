
const districts = [
    "Bagerhat",
    "Bandarban",
    "Barguna",
    "Barishal",
    "Bhola",
    "Bogura",
    "Brahmanbaria",
    "Chandpur",
    "Chattogram",
    "Chuadanga",
    "Cumilla",
    "Cox's Bazar",
    "Dhaka",
    "Dinajpur",
    "Faridpur",
    "Feni",
    "Gaibandha",
    "Gazipur",
    "Gopalganj",
    "Habiganj",
    "Jamalpur",
    "Jashore",
    "Jhalokati",
    "Jhenaidah",
    "Joypurhat",
    "Khagrachhari",
    "Khulna",
    "Kishoreganj",
    "Kurigram",
    "Kushtia",
    "Lakshmipur",
    "Lalmonirhat",
    "Madaripur",
    "Magura",
    "Manikganj",
    "Meherpur",
    "Moulvibazar",
    "Munshiganj",
    "Mymensingh",
    "Naogaon",
    "Narail",
    "Narayanganj",
    "Narsingdi",
    "Natore",
    "Netrokona",
    "Nilphamari",
    "Noakhali",
    "Pabna",
    "Panchagarh",
    "Patuakhali",
    "Pirojpur",
    "Rajbari",
    "Rajshahi",
    "Rangamati",
    "Rangpur",
    "Satkhira",
    "Shariatpur",
    "Sherpur",
    "Sirajganj",
    "Sunamganj",
    "Sylhet",
    "Tangail",
    "Thakurgaon"
];

const districtGrid = document.getElementById("districtGrid");
const districtSearch = document.getElementById("districtSearch");
const districtMessage = document.getElementById("districtMessage");

// Display district cards
function displayDistricts(districtList) {
    districtGrid.innerHTML = "";

    districtList.forEach(function (district) {
        
const card = document.createElement("article");
card.className = "destination-card";
card.tabIndex = 0;
card.setAttribute("role", "link");
card.setAttribute("aria-label", "View details for " + district);

const title = document.createElement("h3");
title.textContent = district;

card.appendChild(title);

// Open the district details page
function openDistrict() {
    window.location.href =
        "district-details.html?name=" + encodeURIComponent(district);
}

card.addEventListener("click", openDistrict);

card.addEventListener("keydown", function (event) {
    if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openDistrict();
    }
});

districtGrid.appendChild(card);

    });

    districtMessage.textContent =
        districtList.length + " of " + districts.length + " districts shown.";
}

// Search districts by name
districtSearch.addEventListener("input", function () {
    const searchText = districtSearch.value.trim().toLowerCase();

    const filteredDistricts = districts.filter(function (district) {
        return district.toLowerCase().includes(searchText);
    });

    displayDistricts(filteredDistricts);
});

// Display all 64 districts when the page loads
displayDistricts(districts);

// Check district count in the browser console
console.log("Total districts:", districts.length);
