// ===================================================
// TRAVEL KORI BANGLADESH - DOMESTIC TRIP PLANNER CONTROLLER
// Intelligent Itinerary Generation, BDT Budget Estimator & Trip Plan Saving
// ===================================================

(function () {
    "use strict";

    // State
    let selectedDuration = 3;
    let selectedBudget = "standard";
    let selectedDestinations = ["Cox's Bazar"];
    let lastCalculatedPlan = null;

    // Elements
    const originSelect = document.getElementById("originDistrict");
    const travelersSelect = document.getElementById("travelersCount");
    const durationPills = document.querySelectorAll("#durationPillsGroup .planner-pill");
    const budgetPills = document.querySelectorAll("#budgetTierGroup .planner-pill");
    const destChips = document.querySelectorAll("#destinationChipsGroup .planner-dest-chip");
    const calculateBtn = document.getElementById("calculatePlanBtn");
    const resultContainer = document.getElementById("planResultContainer");
    const savePlanBtn = document.getElementById("saveTripPlanBtn");

    // 1. Duration Pills Selection
    durationPills.forEach(pill => {
        pill.addEventListener("click", function () {
            durationPills.forEach(p => p.classList.remove("active"));
            this.classList.add("active");
            selectedDuration = Number(this.getAttribute("data-days")) || 3;
        });
    });

    // 2. Budget Tier Selection
    budgetPills.forEach(pill => {
        pill.addEventListener("click", function () {
            budgetPills.forEach(p => p.classList.remove("active"));
            this.classList.add("active");
            selectedBudget = this.getAttribute("data-budget") || "standard";
        });
    });

    // 3. Multi-Select Destination Chips
    destChips.forEach(chip => {
        chip.addEventListener("click", function () {
            const dest = this.getAttribute("data-dest");
            this.classList.toggle("active");
            if (this.classList.contains("active")) {
                if (!selectedDestinations.includes(dest)) selectedDestinations.push(dest);
            } else {
                selectedDestinations = selectedDestinations.filter(d => d !== dest);
            }
            if (selectedDestinations.length === 0) {
                // Ensure at least one destination
                this.classList.add("active");
                selectedDestinations.push(dest);
            }
        });
    });

    // 4. Calculate Plan & Estimated Budget
    if (calculateBtn) {
        calculateBtn.addEventListener("click", calculateTripPlan);
    }

    function calculateTripPlan() {
        const origin = originSelect ? originSelect.value : "Dhaka";
        const travelers = Number(travelersSelect ? travelersSelect.value : 2) || 2;
        const days = selectedDuration;
        const tier = selectedBudget;
        const destinations = selectedDestinations.length ? selectedDestinations : ["Cox's Bazar"];

        // Budget Multipliers
        let transportPerPerson = 1200; // Economy
        let hotelPerNight = 1800;
        let foodPerDayPerPerson = 500;
        let entryPerDayPerPerson = 200;

        if (tier === "standard") {
            transportPerPerson = 2200;
            hotelPerNight = 3800;
            foodPerDayPerPerson = 900;
            entryPerDayPerPerson = 400;
        } else if (tier === "luxury") {
            transportPerPerson = 4500;
            hotelPerNight = 8500;
            foodPerDayPerPerson = 1800;
            entryPerDayPerPerson = 800;
        }

        // Room calculation (1 room per 2 travelers)
        const roomsNeeded = Math.ceil(travelers / 2);
        const nights = Math.max(1, days - 1);

        const totalTransport = Math.round(transportPerPerson * travelers);
        const totalHotel = Math.round(hotelPerNight * roomsNeeded * nights);
        const totalFood = Math.round(foodPerDayPerPerson * travelers * days);
        const totalSightseeing = Math.round(entryPerDayPerPerson * travelers * days);
        const totalEstimated = totalTransport + totalHotel + totalFood + totalSightseeing;

        // Update UI Breakdown Cards
        document.getElementById("costTransport").textContent = `৳ ${totalTransport.toLocaleString()}`;
        document.getElementById("noteTransport").textContent = `${tier.toUpperCase()} journey for ${travelers} pax`;

        document.getElementById("costHotel").textContent = `৳ ${totalHotel.toLocaleString()}`;
        document.getElementById("noteHotel").textContent = `${roomsNeeded} room(s) × ${nights} night(s)`;

        document.getElementById("costFood").textContent = `৳ ${totalFood.toLocaleString()}`;
        document.getElementById("noteFood").textContent = `3 meals/day × ${days} days`;

        document.getElementById("costSightseeing").textContent = `৳ ${totalSightseeing.toLocaleString()}`;
        document.getElementById("noteSightseeing").textContent = `Attraction entry & local boats`;

        document.getElementById("costTotal").textContent = `৳ ${totalEstimated.toLocaleString()}`;
        document.getElementById("noteTotal").textContent = `Complete ${days}-day estimate for ${travelers} traveler(s)`;

        // Generate Day-by-Day Itinerary Timeline
        const primaryDest = destinations[0] || "Cox's Bazar";
        const itineraryList = generateTimelineSchedule(origin, primaryDest, destinations, days, tier);

        const timelineContainer = document.getElementById("itineraryTimelineList");
        if (timelineContainer) {
            timelineContainer.innerHTML = itineraryList.map((item, idx) => `
                <div class="timeline-day-card" style="border-left: 4px solid #087f5b; padding: 16px 20px; background: #f8fafc; border-radius: 12px; margin-bottom: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="background: #087f5b; color: white; font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 999px;">
                            DAY ${item.day}
                        </span>
                        <strong style="color: #0f172a; font-size: 15px;">${item.title}</strong>
                    </div>
                    <p style="color: #475569; font-size: 13px; line-height: 1.5; margin: 0 0 10px 0;">
                        ${item.description}
                    </p>
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                        <span style="font-size: 11px; background: #e2e8f0; color: #334155; padding: 3px 8px; border-radius: 6px; font-weight: 600;">
                            🌅 Morning: ${item.morning}
                        </span>
                        <span style="font-size: 11px; background: #e2e8f0; color: #334155; padding: 3px 8px; border-radius: 6px; font-weight: 600;">
                            ☀️ Afternoon: ${item.afternoon}
                        </span>
                        <span style="font-size: 11px; background: #e2e8f0; color: #334155; padding: 3px 8px; border-radius: 6px; font-weight: 600;">
                            🌙 Evening: ${item.evening}
                        </span>
                    </div>
                </div>
            `).join("");
        }

        // Update Subtitle
        document.getElementById("itinerarySubtitle").textContent = `Custom ${days}-Day plan from ${origin} to ${destinations.join(" & ")}`;

        // Update booking shortcuts
        document.getElementById("ctaBookTransport").href = `transport.html?destination=${encodeURIComponent(primaryDest)}`;
        document.getElementById("ctaBookHotel").href = `hotel-booking.html?district=${encodeURIComponent(primaryDest)}`;

        // Save last plan state
        lastCalculatedPlan = {
            origin,
            durationDays: days,
            travelers: `${travelers} Traveler(s)`,
            budgetCategory: tier === "luxury" ? "Luxury / Premium" : tier === "economy" ? "Budget / Economy" : "Standard / Comfort",
            destinations,
            itinerary: itineraryList,
            costBreakdown: {
                transport: totalTransport,
                hotel: totalHotel,
                food: totalFood,
                sightseeing: totalSightseeing,
                total: totalEstimated
            }
        };

        // Reveal result
        if (resultContainer) {
            resultContainer.style.display = "block";
            resultContainer.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }

    function generateTimelineSchedule(origin, primaryDest, dests, days, tier) {
        const schedule = [];
        for (let d = 1; d <= days; d++) {
            if (d === 1) {
                schedule.push({
                    day: 1,
                    title: `Departure from ${origin} & Arrival in ${primaryDest}`,
                    description: `Begin your journey from ${origin} station via comfortable scheduled coach/express service. Arrive in ${primaryDest}, check into your verified hotel, enjoy fresh local cuisine and evening relaxation.`,
                    morning: `Board scheduled transport from ${origin}`,
                    afternoon: `Check-in, freshen up, and lunch`,
                    evening: `Sunset walk & welcome dinner`
                });
            } else if (d === days) {
                schedule.push({
                    day: d,
                    title: `Sunrise Views, Souvenir Shopping & Return to ${origin}`,
                    description: `Catch the morning golden hour and peaceful dawn breeze. Visit local handicraft and authentic specialty markets. Check out from your resort and board return journey back to ${origin}.`,
                    morning: `Dawn photography & hotel breakfast`,
                    afternoon: `Local artisan markets & souvenirs`,
                    evening: `Return transit to ${origin}`
                });
            } else {
                const currentDest = dests[(d - 1) % dests.length] || primaryDest;
                schedule.push({
                    day: d,
                    title: `Full Day Exploration & Sightseeing in ${currentDest}`,
                    description: `Immerse in the prime natural attractions, guided sightseeing, river cruises or trekking trails. Relish authentic regional delicacies and capture memorable travel photographs.`,
                    morning: `Scenic tour & prime attraction exploration`,
                    afternoon: `Traditional lunch & cultural visits`,
                    evening: `Tea garden or beach promenade stroll`
                });
            }
        }
        return schedule;
    }

    // 5. Save Trip Plan to MongoDB (Section H)
    if (savePlanBtn) {
        savePlanBtn.addEventListener("click", async function () {
            let user = null;
            try {
                user = JSON.parse(sessionStorage.getItem("travelKoriUser") || "null");
            } catch (e) {
                user = null;
            }

            if (!user || !user.id) {
                alert("Please log in with your Traveler account to save this itinerary to your profile.");
                window.location.href = "login.html";
                return;
            }

            if (!lastCalculatedPlan) {
                alert("Please calculate a trip plan first before saving.");
                return;
            }

            savePlanBtn.disabled = true;
            savePlanBtn.textContent = "Saving Plan...";

            try {
                const res = await fetch("http://localhost:5000/api/trip-plans", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userId: user.id,
                        ...lastCalculatedPlan
                    })
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Failed to save plan.");

                savePlanBtn.textContent = "✓ Plan Saved to Profile!";
                savePlanBtn.style.background = "#059669";
                alert("Success! Your custom itinerary and budget estimate has been saved to your Traveler Dashboard.");
            } catch (err) {
                alert("Error saving trip plan: " + err.message);
                savePlanBtn.disabled = false;
                savePlanBtn.textContent = "💾 Save Plan to My Profile";
            }
        });
    }

    // Auto-calculate on initial page load
    calculateTripPlan();

})();
