// ===================================================
// TRAVEL KORI BANGLADESH - HOTEL DETAILS SCRIPT
// Dynamically fetches hotel specifications & room options from MongoDB
// ===================================================

(function () {
    "use strict";

    const API_BASE = (window.location.origin && window.location.origin !== "null" && window.location.protocol !== "file:")
        ? window.location.origin
        : "http://localhost:5000";

    function getQueryParam(key) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(key);
    }

    // Facility Icon Helper (Professional 2D SVGs)
    function getFacilityIconSvg(facilityName) {
        const f = (facilityName || "").toLowerCase();
        if (f.includes("wifi") || f.includes("internet")) {
            return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>`;
        }
        if (f.includes("pool") || f.includes("swim")) {
            return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12h20"></path><path d="M2 16h20"></path><path d="M2 20h20"></path><circle cx="6" cy="6" r="2"></circle><path d="m14 8-4 4"></path></svg>`;
        }
        if (f.includes("breakfast") || f.includes("restaurant") || f.includes("dining") || f.includes("food")) {
            return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>`;
        }
        if (f.includes("ac") || f.includes("air condition") || f.includes("climate")) {
            return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 16a4 4 0 0 1-4-4 4 4 0 0 1 4-4"></path><path d="M16 8a4 4 0 0 1 4 4 4 4 0 0 1-4 4"></path><line x1="12" y1="3" x2="12" y2="21"></line></svg>`;
        }
        if (f.includes("gym") || f.includes("fitness") || f.includes("health club")) {
            return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6.5 6.5 11 11"></path><path d="m21 21-1-1"></path><path d="m3 3 1 1"></path><path d="m18 22 4-4"></path><path d="m2 6 4-4"></path><path d="m3 10 7-7"></path><path d="m14 21 7-7"></path></svg>`;
        }
        if (f.includes("parking") || f.includes("garage")) {
            return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M9 17V7h4a3 3 0 0 1 0 6H9"></path></svg>`;
        }
        if (f.includes("service") || f.includes("desk") || f.includes("security") || f.includes("reception")) {
            return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`;
        }
        return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`;
    }

    async function loadHotelDetails() {
        const loadingEl = document.getElementById("hotelDetailLoading");
        const contentEl = document.getElementById("hotelDetailContent");
        
        const hotelId = getQueryParam("id") || getQueryParam("hotelId") || getQueryParam("hotel");
        
        if (!hotelId) {
            loadingEl.innerHTML = `
                <div style="background:var(--card-bg, #ffffff); border:1px solid #fecaca; border-radius:12px; padding:36px; max-width:550px; margin:0 auto; text-align:center;">
                    <p style="font-size:18px; font-weight:800; color:#dc2626; margin:0 0 8px;">No Hotel Selected</p>
                    <p style="color:#64748b; font-size:14px; margin:0 0 20px;">Please browse our curated hotels in 64 districts and select a hotel to view details.</p>
                    <a href="hotel-booking.html" class="btn-back-link" style="display:inline-flex;">Browse Hotels →</a>
                </div>
            `;
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/api/hotels/${encodeURIComponent(hotelId)}`);
            if (!res.ok) {
                throw new Error(res.status === 404 ? "Hotel not found in database." : "Unable to load hotel record.");
            }
            const data = await res.json();
            if (!data.success || !data.hotel) {
                throw new Error(data.message || "Invalid hotel record.");
            }

            renderHotel(data.hotel);
            loadingEl.style.display = "none";
            contentEl.style.display = "block";

        } catch (err) {
            console.error("Hotel detail load error:", err);
            loadingEl.innerHTML = `
                <div style="background:var(--card-bg, #ffffff); border:1px solid #fecaca; border-radius:12px; padding:36px; max-width:550px; margin:0 auto; text-align:center;">
                    <p style="font-size:18px; font-weight:800; color:#dc2626; margin:0 0 8px;">Hotel Information Unavailable</p>
                    <p style="color:#64748b; font-size:14px; margin:0 0 20px;">${escapeHtml(err.message)}</p>
                    <a href="hotel-booking.html" class="btn-back-link" style="display:inline-flex;">Return to Hotel Directory →</a>
                </div>
            `;
        }
    }

    function renderHotel(hotel) {
        document.title = `${hotel.name} | Travel Kori Bangladesh`;

        // 1. Hotel Header & Gallery
        const heroImg = document.getElementById("detailHeroImage");
        heroImg.src = hotel.image || "images/hotels/pan-pacific-sonargaon.jpg";
        heroImg.alt = hotel.name;
        heroImg.onerror = function () {
            heroImg.src = "hotel-hero.png";
        };

        const stars = Number(hotel.starRating) || 5;
        const starBadge = document.getElementById("detailStarBadge");
        starBadge.textContent = `★ ${stars}-Star Rating`;

        document.getElementById("detailHotelName").textContent = hotel.name;
        document.getElementById("detailDistrict").textContent = `${hotel.districtName}${hotel.address ? " • " + hotel.address : ""}`;
        
        const mapQuery = encodeURIComponent(`${hotel.name}, ${hotel.districtName}, Bangladesh`);
        document.getElementById("detailMapLink").href = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

        document.getElementById("detailRatingNum").textContent = hotel.rating || `${stars}.0`;
        document.getElementById("detailReviewsCount").textContent = hotel.reviewCount || (hotel.reviews ? hotel.reviews.length : "80");

        // 2. Location & Short Description
        document.getElementById("detailDescription").textContent = hotel.description || "Experience comfortable accommodation with exceptional hospitality and modern conveniences in Bangladesh.";

        // 3. Room Options (Clean text-based cards, NO images)
        const roomsGrid = document.getElementById("detailRoomsGrid");
        roomsGrid.innerHTML = "";

        const packages = Array.isArray(hotel.packages) && hotel.packages.length ? hotel.packages : [
            {
                name: "Standard Deluxe Room",
                type: "standard",
                pricePerNight: 3500,
                availableRooms: 8,
                capacity: 2,
                bedType: "1 Queen Bed"
            }
        ];

        packages.forEach(pkg => {
            const card = document.createElement("article");
            card.className = "room-text-card";

            const seatsLeft = typeof pkg.availableRooms === "number" ? pkg.availableRooms : 6;
            const price = Number(pkg.pricePerNight || 3500);
            const capacity = pkg.capacity || 2;
            const bedType = pkg.bedType || (capacity > 2 ? "2 King Beds" : "1 King / Queen Bed");

            // Size only if available in DB
            const roomSizeHtml = pkg.roomSize ? `
                <li class="room-specs-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="M3 9h18"></path><path d="M9 21V9"></path></svg>
                    <span>Room Size: <strong>${escapeHtml(String(pkg.roomSize))} sq. ft.</strong></span>
                </li>
            ` : "";

            card.innerHTML = `
                <div class="room-card-header">
                    <h3 class="room-card-title">${escapeHtml(pkg.name)}</h3>
                    <div class="room-badge-row">
                        <span class="room-pill">${escapeHtml(pkg.type ? pkg.type.toUpperCase() : "STANDARD")}</span>
                        <span class="room-pill room-seats-pill">${seatsLeft} seats left</span>
                    </div>

                    <ul class="room-specs-list">
                        <li class="room-specs-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 4v16"></path><path d="M2 8h18a2 2 0 0 1 2 2v10"></path><path d="M2 17h20"></path><path d="M6 8v9"></path></svg>
                            <span>Bed Type: <strong>${escapeHtml(bedType)}</strong></span>
                        </li>
                        <li class="room-specs-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                            <span>Max Capacity: <strong>Up to ${capacity} Guests</strong></span>
                        </li>
                        ${roomSizeHtml}
                    </ul>
                </div>

                <div class="room-card-bottom">
                    <div class="room-price-box">
                        <span class="room-price-val">৳${price.toLocaleString("en-BD")}</span>
                        <span class="room-price-sub">per night (excl. VAT)</span>
                    </div>
                    <button type="button" class="btn-book-room" data-room="${escapeHtml(pkg.name)}" data-price="${price}">
                        Reserve Room →
                    </button>
                </div>
            `;

            // Booking action connects directly to hotel-booking.html with hotel & room prefilled
            card.querySelector(".btn-book-room").addEventListener("click", function () {
                const bookUrl = `hotel-booking.html?hotel=${encodeURIComponent(hotel.name)}&district=${encodeURIComponent(hotel.districtName)}&roomType=${encodeURIComponent(pkg.name)}#hotelBookingSection`;
                window.location.href = bookUrl;
            });

            roomsGrid.appendChild(card);
        });

        // 4. Main Facilities (Clean 2D Icons)
        const facilitiesGrid = document.getElementById("detailFacilitiesGrid");
        facilitiesGrid.innerHTML = "";
        const facilities = Array.isArray(hotel.facilities) && hotel.facilities.length
            ? hotel.facilities
            : ["Free High-Speed WiFi", "Air Conditioning", "Swimming Pool", "Complimentary Breakfast", "24/7 Room Service", "Secure Parking", "Fitness Center"];

        facilities.forEach(fac => {
            const item = document.createElement("div");
            item.className = "facility-item";
            item.innerHTML = `
                <div class="facility-icon-wrap">
                    ${getFacilityIconSvg(fac)}
                </div>
                <span>${escapeHtml(fac)}</span>
            `;
            facilitiesGrid.appendChild(item);
        });

        // 5. Check-in & Check-out Schedule
        document.getElementById("detailCheckInTime").textContent = hotel.checkInTime || "02:00 PM";
        document.getElementById("detailCheckOutTime").textContent = hotel.checkOutTime || "12:00 PM";

        // 6. Guest Reviews
        const reviewsGrid = document.getElementById("detailReviewsGrid");
        reviewsGrid.innerHTML = "";
        const reviews = Array.isArray(hotel.reviews) && hotel.reviews.length ? hotel.reviews : [
            {
                guestName: "Tanvir Ahmed",
                rating: 5,
                comment: "Excellent hospitality and sparkling clean rooms. The staff were remarkably courteous.",
                date: "Oct 2026"
            },
            {
                guestName: "Sadia Rahman",
                rating: 5,
                comment: "Breathtaking surroundings, peaceful location, and top-tier amenities. Highly recommended!",
                date: "Sep 2026"
            }
        ];

        reviews.forEach(r => {
            const rCard = document.createElement("article");
            rCard.className = "review-clean-card";
            const starsText = "★".repeat(Math.min(5, Math.max(1, Math.round(Number(r.rating) || 5))));
            rCard.innerHTML = `
                <div class="review-card-head">
                    <span class="reviewer-name">${escapeHtml(r.guestName || "Verified Guest")}</span>
                    <span class="review-date-str">${escapeHtml(r.date || "Recent Stay")}</span>
                </div>
                <div class="review-stars-row">${starsText}</div>
                <p class="review-comment-body">"${escapeHtml(r.comment || "Great experience!")}"</p>
            `;
            reviewsGrid.appendChild(rCard);
        });
    }

    function escapeHtml(str) {
        return String(str || "").replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", loadHotelDetails);
    } else {
        loadHotelDetails();
    }
})();

