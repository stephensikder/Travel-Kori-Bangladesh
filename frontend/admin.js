// Dynamic API URL for localhost and Render
const API_URL = (window.location.origin && window.location.origin !== "null") ? window.location.origin : "";

// Security escape helpers
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function escapeAttr(value) {
    return String(value ?? "").replace(/["']/g, "");
}

// Get logged-in user
let user = null;
try {
    user = JSON.parse(sessionStorage.getItem("travelKoriUser") || "null");
} catch (error) {
    user = null;
}

// Check admin credentials
if (!user || !user.id || (user.userType || "").toLowerCase() !== "admin") {
    alert("Admin access only. Please log in with your admin account.");
    window.location.replace("login.html");
}

// Tab Switching
function setupTabs() {
    const tabButtons = document.querySelectorAll(".admin-tab-btn[data-tab]");
    const tabContents = document.querySelectorAll(".admin-tab-content");

    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            tabButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            const targetId = btn.getAttribute("data-tab");
            tabContents.forEach(content => {
                content.hidden = content.id !== targetId;
            });

            // Trigger data refresh on tab switch
            if (targetId === "tabBookings") loadAdminBookings();
            if (targetId === "tabSpots") loadSpots();
            if (targetId === "tabHotels") loadHotels();
            if (targetId === "tabTransport") loadTransports();
            if (targetId === "tabGuides") { loadAdminGuides(); loadAdminGuideBookings(); }
        });
    });
}

// ==========================================
// TAB 1: ALL BOOKINGS MANAGEMENT
// ==========================================
const adminMessage = document.getElementById("adminMessage");
const adminBookings = document.getElementById("adminBookings");
let allAdminBookings = [];
let currentBookingFilter = "all";

async function loadAdminBookings() {
    if (!adminMessage || !adminBookings) return;
    adminMessage.textContent = "Loading bookings...";

    try {
        const response = await fetch(
            `${API_URL}/api/admin/bookings/${encodeURIComponent(user.id)}`
        );
        const data = await response.json();

        if (response.status === 403) {
            adminMessage.textContent = "Access denied. Please log in with an admin account.";
            return;
        }

        if (!response.ok) {
            throw new Error(data.message || "Could not load bookings.");
        }

        allAdminBookings = Array.isArray(data.bookings) ? data.bookings : [];
        const counts = data.counts || {};

        // Summary counters
        const totalEl = document.getElementById("totalBookings");
        const pendEl = document.getElementById("pendingBookings");
        const confEl = document.getElementById("confirmedBookings");
        const cancEl = document.getElementById("cancelledBookings");
        if (totalEl) totalEl.textContent = counts.total ?? allAdminBookings.length;
        if (pendEl) pendEl.textContent = counts.pending ?? allAdminBookings.filter(b => (b.status || "").toLowerCase() === "pending").length;
        if (confEl) confEl.textContent = counts.confirmed ?? allAdminBookings.filter(b => (b.status || "").toLowerCase() === "confirmed").length;
        if (cancEl) cancEl.textContent = counts.cancelled ?? allAdminBookings.filter(b => (b.status || "").toLowerCase().includes("cancel") || (b.status || "").toLowerCase().includes("reject")).length;

        // Category filter badges
        const countAll = document.getElementById("countAll");
        const countTour = document.getElementById("countTour");
        const countHotel = document.getElementById("countHotel");
        const countTransport = document.getElementById("countTransport");
        const countGuide = document.getElementById("countGuide");
        if (countAll) countAll.textContent = counts.total ?? allAdminBookings.length;
        if (countTour) countTour.textContent = counts.tours ?? allAdminBookings.filter(b => b.category === "tour").length;
        if (countHotel) countHotel.textContent = counts.hotels ?? allAdminBookings.filter(b => b.category === "hotel").length;
        if (countTransport) countTransport.textContent = counts.transport ?? allAdminBookings.filter(b => b.category === "transport").length;
        if (countGuide) countGuide.textContent = counts.guides ?? allAdminBookings.filter(b => b.category === "guide").length;

        // Setup category filter click listeners
        document.querySelectorAll(".btn-bfilter").forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll(".btn-bfilter").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                currentBookingFilter = btn.getAttribute("data-bfilter");
                renderAdminBookingsList();
            };
        });

        renderAdminBookingsList();

    } catch (error) {
        console.error("Admin bookings error:", error);
        adminMessage.textContent = "Could not load bookings: " + error.message;
    }
}

function renderAdminBookingsList() {
    if (!adminBookings) return;
    adminBookings.replaceChildren();

    const filtered = allAdminBookings.filter(b => {
        if (currentBookingFilter === "all") return true;
        return b.category === currentBookingFilter;
    });

    if (filtered.length === 0) {
        adminMessage.textContent = `No bookings found for category "${currentBookingFilter}".`;
        return;
    }

    adminMessage.textContent = `Displaying ${filtered.length} booking(s).`;

    filtered.forEach(function (booking) {
        const card = document.createElement("article");
        card.className = "dashboard-ticket-card";

        const paymentMethodLabel = {
            bkash: "bKash (Demo)",
            nagad: "Nagad (Demo)",
            card: "Card (Demo)",
            cash: "Cash on Arrival"
        }[(booking.paymentMethod || "").toLowerCase()] || (booking.paymentMethod || "Cash");

        const statusLower = (booking.status || "Pending").toLowerCase();
        let statusBadgeClass = "pending";
        if (statusLower.includes("confirm")) statusBadgeClass = "confirmed";
        else if (statusLower.includes("cancel") || statusLower.includes("reject")) statusBadgeClass = "cancelled";
        else if (statusLower.includes("complete")) statusBadgeClass = "completed";

        const bookedTime = booking.createdAt
            ? new Date(booking.createdAt).toLocaleString("en-BD", { dateStyle: "medium", timeStyle: "short" })
            : "N/A";

        card.innerHTML = `
            <div class="ticket-header" style="display:flex; justify-content:space-between; align-items:center;">
                <span class="ticket-type" style="font-weight:700; font-size:13px;">${escapeHTML(booking.categoryBadge || booking.categoryLabel || "Booking")}</span>
                <span class="ticket-badge ${statusBadgeClass}">${escapeHTML(booking.status || "Pending")}</span>
            </div>
            <div class="ticket-body" style="padding-top:10px;">
                <h4 style="margin:0 0 10px; color:#123c35; font-size:15px;">${escapeHTML(booking.title)}</h4>
                <div class="ticket-details-grid">
                    <div class="ticket-meta-item">
                        <span class="meta-label">👤 Traveler Name</span>
                        <span class="meta-value" style="font-weight:700; color:#087f5b;">${escapeHTML(booking.travelerName)}</span>
                    </div>
                    <div class="ticket-meta-item">
                        <span class="meta-label">📞 Contact Phone</span>
                        <span class="meta-value">${escapeHTML(booking.travelerPhone)}</span>
                    </div>
                    <div class="ticket-meta-item">
                        <span class="meta-label">📧 Email</span>
                        <span class="meta-value" style="word-break:break-all;">${escapeHTML(booking.travelerEmail)}</span>
                    </div>
                    <div class="ticket-meta-item">
                        <span class="meta-label">📅 Service Date</span>
                        <span class="meta-value">${escapeHTML(booking.serviceDate)}</span>
                    </div>
                    <div class="ticket-meta-item">
                        <span class="meta-label">👥 Details</span>
                        <span class="meta-value">${escapeHTML(booking.people)} Person(s) ${booking.notes ? '• ' + escapeHTML(booking.notes) : ''}</span>
                    </div>
                    <div class="ticket-meta-item">
                        <span class="meta-label">⏱️ Booked At</span>
                        <span class="meta-value" style="font-size:11px;">${bookedTime}</span>
                    </div>
                    <div class="ticket-meta-item">
                        <span class="meta-label">💳 Payment</span>
                        <span class="meta-value">${escapeHTML(paymentMethodLabel)} (${escapeHTML(booking.paymentStatus || 'Pending')})</span>
                    </div>
                    <div class="ticket-meta-item">
                        <span class="meta-label">💰 Total Amount</span>
                        <span class="meta-value" style="font-weight:700; color:#087f5b;">৳${Number(booking.amount || 0).toLocaleString('en-BD')}</span>
                    </div>
                </div>
            </div>
            <div class="ticket-footer" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; border-top:1px dashed #e2e8f0; padding-top:12px; margin-top:12px;">
                <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                    <label style="font-size:12px; font-weight:700;">Status:</label>
                    <select class="status-select" style="padding:5px 8px; border-radius:6px; font-size:12px; border:1px solid #cbd5e1;">
                        <option value="Pending" ${booking.status === "Pending" ? "selected" : ""}>Pending</option>
                        <option value="Confirmed" ${booking.status === "Confirmed" ? "selected" : ""}>Confirmed</option>
                        <option value="Completed" ${booking.status === "Completed" ? "selected" : ""}>Completed</option>
                        <option value="Cancelled" ${booking.status === "Cancelled" || booking.status === "Rejected" ? "selected" : ""}>Cancelled</option>
                    </select>
                    <button type="button" class="btn-update-status" style="background:#087f68; color:white; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-weight:600; font-size:12px;">Save Status</button>
                    <button type="button" class="btn-delete-booking" style="background:#fee2e2; color:#b91c1c; border:1px solid #fca5a5; padding:6px 12px; border-radius:6px; cursor:pointer; font-weight:600; font-size:12px;">🗑️ Delete</button>
                </div>
                <small style="color:#62766d; font-size:11px; font-family:monospace; font-weight:700;">Ref: ${escapeHTML(booking.reference)}</small>
            </div>
        `;

        const selectEl = card.querySelector(".status-select");
        const updateBtn = card.querySelector(".btn-update-status");
        const deleteBtn = card.querySelector(".btn-delete-booking");

        updateBtn.addEventListener("click", async () => {
            await updateBookingStatus(booking.id, selectEl.value, booking.category, updateBtn);
        });

        deleteBtn.addEventListener("click", async () => {
            await deleteBooking(booking.id, booking.category, booking.reference, deleteBtn);
        });

        adminBookings.appendChild(card);
    });
}

async function updateBookingStatus(bookingId, newStatus, category, button) {
    button.disabled = true;
    button.textContent = "Saving...";

    try {
        const response = await fetch(
            `${API_URL}/api/admin/bookings/${encodeURIComponent(bookingId)}`,
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.id, status: newStatus, category: category })
            }
        );

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to update status.");

        button.textContent = "Saved ✓";
        setTimeout(() => { button.textContent = "Save Status"; button.disabled = false; }, 1200);
        await loadAdminBookings();

    } catch (error) {
        console.error("Update status error:", error);
        alert("Status update failed: " + error.message);
        button.disabled = false;
        button.textContent = "Save Status";
    }
}

async function deleteBooking(bookingId, category, reference, button) {
    if (!confirm(`Are you sure you want to permanently delete booking [${reference || bookingId}]? This cannot be undone.`)) {
        return;
    }

    button.disabled = true;
    button.textContent = "Deleting...";

    try {
        const response = await fetch(
            `${API_URL}/api/admin/bookings/${encodeURIComponent(bookingId)}?category=${encodeURIComponent(category || '')}`,
            {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.id, category: category })
            }
        );

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to delete booking.");

        await loadAdminBookings();

    } catch (error) {
        console.error("Delete booking error:", error);
        alert("Delete failed: " + error.message);
        button.disabled = false;
        button.textContent = "🗑️ Delete";
    }
}

// ==========================================
// TAB 2: TOURIST SPOTS CRUD
// ==========================================
const spotForm = document.getElementById("spotForm");
const spotEditId = document.getElementById("spotEditId");
const spotName = document.getElementById("spotName");
const spotDistrict = document.getElementById("spotDistrict");
const spotSeason = document.getElementById("spotSeason");
const spotDescription = document.getElementById("spotDescription");
const spotMessage = document.getElementById("spotMessage");
const spotsTableBody = document.getElementById("spotsTableBody");
const cancelSpotEditBtn = document.getElementById("cancelSpotEditBtn");
const saveSpotBtn = document.getElementById("saveSpotBtn");

async function loadSpots() {
    if (!spotsTableBody) return;
    spotsTableBody.innerHTML = `<tr><td colspan="5">Loading spots ...</td></tr>`;

    try {
        const res = await fetch(`${API_URL}/api/attractions`);
        const json = await res.json();
        const spots = Array.isArray(json) ? json : (json.attractions || []);

        if (spots.length === 0) {
            spotsTableBody.innerHTML = `<tr><td colspan="5">No spots found in database. Add one above!</td></tr>`;
            return;
        }

        spotsTableBody.innerHTML = spots.map(s => {
            const spotId = s.id || s._id;
            return `
                <tr>
                    <td><strong>${s.name}</strong></td>
                    <td>📍 ${s.districtName || s.district || "N/A"}</td>
                    <td>${s.bestTimeToVisit || "Year-round"}</td>
                    <td style="max-width:280px;">${s.description || "Scenic tourist attraction"}</td>
                    <td>
                        <button class="admin-action-btn btn-edit" onclick="editSpot('${spotId}', '${escapeAttr(s.name)}', '${escapeAttr(s.districtName || s.district || "")}', '${escapeAttr(s.bestTimeToVisit || "")}', '${escapeAttr(s.description || "")}')">Edit</button>
                        <button class="admin-action-btn btn-delete" onclick="deleteSpot('${spotId}', '${escapeAttr(s.name)}')">Delete</button>
                    </td>
                </tr>
            `;
        }).join("");

    } catch (err) {
        console.error("Load spots error:", err);
        spotsTableBody.innerHTML = `<tr><td colspan="5" style="color:red;">Failed to load spots from backend.</td></tr>`;
    }
}

window.editSpot = function (id, name, district, season, desc) {
    spotEditId.value = id;
    spotName.value = name;
    spotDistrict.value = district;
    spotSeason.value = season;
    spotDescription.value = desc;
    saveSpotBtn.textContent = "Update Tourist Spot ";
    cancelSpotEditBtn.hidden = false;
    spotForm.scrollIntoView({ behavior: "smooth" });
};

cancelSpotEditBtn.addEventListener("click", () => {
    spotForm.reset();
    spotEditId.value = "";
    saveSpotBtn.textContent = "Save Tourist Spot ";
    cancelSpotEditBtn.hidden = true;
});

spotForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = spotEditId.value;
    const isEdit = Boolean(id);

    spotMessage.textContent = isEdit ? "Updating spot ..." : "Saving spot ...";
    spotMessage.className = "admin-success-msg";

    try {
        const url = isEdit ? `${API_URL}/api/attractions/${id}` : `${API_URL}/api/attractions`;
        const method = isEdit ? "PUT" : "POST";

        const res = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: spotName.value.trim(),
                district: spotDistrict.value.trim(),
                bestTimeToVisit: spotSeason.value.trim(),
                description: spotDescription.value.trim()
            })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to save spot.");

        spotMessage.textContent = isEdit ? "✓ Tourist spot updated !" : "✓ New tourist spot added !";
        spotForm.reset();
        spotEditId.value = "";
        saveSpotBtn.textContent = "Save Tourist Spot ";
        cancelSpotEditBtn.hidden = true;
        loadSpots();

    } catch (err) {
        console.error("Save spot error:", err);
        spotMessage.textContent = err.message;
        spotMessage.className = "admin-error-msg";
    }
});

window.deleteSpot = async function (id, name) {
    if (!confirm(`Are you sure you want to delete tourist spot "${name}" ?`)) return;

    try {
        const res = await fetch(`${API_URL}/api/attractions/${id}`, { method: "DELETE" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to delete spot.");
        loadSpots();
    } catch (err) {
        alert("Delete failed: " + err.message);
    }
};

// ==========================================
// TAB 3: HOTELS CRUD
// ==========================================
const hotelForm = document.getElementById("hotelForm");
const hotelEditId = document.getElementById("hotelEditId");
const adminHotelName = document.getElementById("adminHotelName");
const adminHotelDistrict = document.getElementById("adminHotelDistrict");
const adminHotelMinPrice = document.getElementById("adminHotelMinPrice");
const adminHotelAddress = document.getElementById("adminHotelAddress");
const adminHotelDesc = document.getElementById("adminHotelDesc");
const hotelAdminMessage = document.getElementById("hotelAdminMessage");
const hotelsTableBody = document.getElementById("hotelsTableBody");
const cancelHotelEditBtn = document.getElementById("cancelHotelEditBtn");
const saveHotelBtn = document.getElementById("saveHotelBtn");

async function loadHotels() {
    if (!hotelsTableBody) return;
    hotelsTableBody.innerHTML = `<tr><td colspan="5">Loading hotels ...</td></tr>`;

    try {
        const res = await fetch(`${API_URL}/api/hotels`);
        const json = await res.json();
        const hotels = Array.isArray(json) ? json : (json.hotels || []);

        if (hotels.length === 0) {
            hotelsTableBody.innerHTML = `<tr><td colspan="5">No hotels found. Add one above!</td></tr>`;
            return;
        }

        hotelsTableBody.innerHTML = hotels.map(h => {
            const hotelId = h.id || h._id;
            const price = h.packages && h.packages[0] ? h.packages[0].price : (h.priceStandard || h.minPrice || 2500);
            return `
                <tr>
                    <td><strong>${h.name}</strong></td>
                    <td>📍 ${h.districtName || "Dhaka"}</td>
                    <td>৳${Number(price).toLocaleString()} / night</td>
                    <td style="max-width:280px;">${h.location || h.address || h.description || "Standard Deluxe stay"}</td>
                    <td>
                        <button class="admin-action-btn btn-edit" onclick="editHotel('${hotelId}', '${escapeAttr(h.name)}', '${escapeAttr(h.districtName || "")}', '${price}', '${escapeAttr(h.location || h.address || "")}', '${escapeAttr(h.description || "")}')">Edit</button>
                        <button class="admin-action-btn btn-delete" onclick="deleteHotel('${hotelId}', '${escapeAttr(h.name)}')">Delete</button>
                    </td>
                </tr>
            `;
        }).join("");

    } catch (err) {
        console.error("Load hotels error:", err);
        hotelsTableBody.innerHTML = `<tr><td colspan="5" style="color:red;">Failed to load hotels.</td></tr>`;
    }
}

window.editHotel = function (id, name, district, price, location, desc) {
    hotelEditId.value = id;
    adminHotelName.value = name;
    adminHotelDistrict.value = district;
    adminHotelMinPrice.value = price;
    adminHotelAddress.value = location;
    adminHotelDesc.value = desc;
    saveHotelBtn.textContent = "Update Hotel ";
    cancelHotelEditBtn.hidden = false;
    hotelForm.scrollIntoView({ behavior: "smooth" });
};

cancelHotelEditBtn.addEventListener("click", () => {
    hotelForm.reset();
    hotelEditId.value = "";
    saveHotelBtn.textContent = "Save Hotel ";
    cancelHotelEditBtn.hidden = true;
});

hotelForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = hotelEditId.value;
    const isEdit = Boolean(id);

    hotelAdminMessage.textContent = isEdit ? "Updating hotel ..." : "Saving hotel ...";
    hotelAdminMessage.className = "admin-success-msg";

    try {
        const url = isEdit ? `${API_URL}/api/hotels/${id}` : `${API_URL}/api/hotels`;
        const method = isEdit ? "PUT" : "POST";

        const res = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: adminHotelName.value.trim(),
                districtName: adminHotelDistrict.value.trim(),
                minPrice: Number(adminHotelMinPrice.value),
                address: adminHotelAddress.value.trim(),
                description: adminHotelDesc.value.trim()
            })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to save hotel.");

        hotelAdminMessage.textContent = isEdit ? "✓ Hotel updated !" : "✓ New hotel added !";
        hotelForm.reset();
        hotelEditId.value = "";
        saveHotelBtn.textContent = "Save Hotel ";
        cancelHotelEditBtn.hidden = true;
        loadHotels();

    } catch (err) {
        console.error("Save hotel error:", err);
        hotelAdminMessage.textContent = err.message;
        hotelAdminMessage.className = "admin-error-msg";
    }
});

window.deleteHotel = async function (id, name) {
    if (!confirm(`Are you sure you want to remove hotel "${name}" ?`)) return;

    try {
        const res = await fetch(`${API_URL}/api/hotels/${id}`, { method: "DELETE" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to delete hotel.");
        loadHotels();
    } catch (err) {
        alert("Delete failed: " + err.message);
    }
};

// ==========================================
// TAB 4: TRANSPORT CRUD
// ==========================================
const transportForm = document.getElementById("transportForm");
const transportEditId = document.getElementById("transportEditId");
const adminTransportType = document.getElementById("adminTransportType");
const adminTransportOperator = document.getElementById("adminTransportOperator");
const adminTransportFrom = document.getElementById("adminTransportFrom");
const adminTransportTo = document.getElementById("adminTransportTo");
const adminTransportFare = document.getElementById("adminTransportFare");
const transportAdminMessage = document.getElementById("transportAdminMessage");
const transportsTableBody = document.getElementById("transportsTableBody");
const cancelTransportEditBtn = document.getElementById("cancelTransportEditBtn");
const saveTransportBtn = document.getElementById("saveTransportBtn");

async function loadTransports() {
    if (!transportsTableBody) return;
    transportsTableBody.innerHTML = `<tr><td colspan="5">Loading routes ...</td></tr>`;

    try {
        const res = await fetch(`${API_URL}/api/transportations`);
        const json = await res.json();
        const routes = Array.isArray(json) ? json : (json.transportations || []);

        if (routes.length === 0) {
            transportsTableBody.innerHTML = `<tr><td colspan="5">No transport routes found. Add one above!</td></tr>`;
            return;
        }

        transportsTableBody.innerHTML = routes.map(r => {
            const routeId = r.id || r._id;
            const fare = r.farePerSeat || r.fare || 1000;
            return `
                <tr>
                    <td><strong>${r.type}</strong></td>
                    <td>${r.operator}</td>
                    <td>${r.from} → ${r.to}</td>
                    <td>৳${Number(fare).toLocaleString()}</td>
                    <td>
                        <button class="admin-action-btn btn-edit" onclick="editTransport('${routeId}', '${escapeAttr(r.type)}', '${escapeAttr(r.operator)}', '${escapeAttr(r.from)}', '${escapeAttr(r.to)}', '${fare}')">Edit</button>
                        <button class="admin-action-btn btn-delete" onclick="deleteTransport('${routeId}', '${escapeAttr(r.operator)}')">Delete</button>
                    </td>
                </tr>
            `;
        }).join("");

    } catch (err) {
        console.error("Load transport error:", err);
        transportsTableBody.innerHTML = `<tr><td colspan="5" style="color:red;">Failed to load routes.</td></tr>`;
    }
}

window.editTransport = function (id, type, operator, from, to, fare) {
    transportEditId.value = id;
    adminTransportType.value = type;
    adminTransportOperator.value = operator;
    adminTransportFrom.value = from;
    adminTransportTo.value = to;
    adminTransportFare.value = fare;
    saveTransportBtn.textContent = "Update Transport Route ";
    cancelTransportEditBtn.hidden = false;
    transportForm.scrollIntoView({ behavior: "smooth" });
};

cancelTransportEditBtn.addEventListener("click", () => {
    transportForm.reset();
    transportEditId.value = "";
    saveTransportBtn.textContent = "Save Route ";
    cancelTransportEditBtn.hidden = true;
});

transportForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = transportEditId.value;
    const isEdit = Boolean(id);

    transportAdminMessage.textContent = isEdit ? "Updating route ..." : "Saving route ...";
    transportAdminMessage.className = "admin-success-msg";

    try {
        const url = isEdit ? `${API_URL}/api/transportations/${id}` : `${API_URL}/api/transportations`;
        const method = isEdit ? "PUT" : "POST";

        const res = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                type: adminTransportType.value,
                operator: adminTransportOperator.value.trim(),
                from: adminTransportFrom.value.trim(),
                to: adminTransportTo.value.trim(),
                farePerSeat: Number(adminTransportFare.value)
            })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to save route.");

        transportAdminMessage.textContent = isEdit ? "✓ Transport route updated !" : "✓ New transport route added !";
        transportForm.reset();
        transportEditId.value = "";
        saveTransportBtn.textContent = "Save Route ";
        cancelTransportEditBtn.hidden = true;
        loadTransports();

    } catch (err) {
        console.error("Save transport error:", err);
        transportAdminMessage.textContent = err.message;
        transportAdminMessage.className = "admin-error-msg";
    }
});

window.deleteTransport = async function (id, operator) {
    if (!confirm(`Are you sure you want to remove ${operator} route ?`)) return;

    try {
        const res = await fetch(`${API_URL}/api/transportations/${id}`, { method: "DELETE" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to delete route.");
        loadTransports();
    } catch (err) {
        alert("Delete failed: " + err.message);
    }
};

function escapeAttr(str) {
    return String(str || "").replace(/'/g, "\\'").replace(/"/g, "&quot;");
}

// ==========================================
// TAB 5: TOUR GUIDES MANAGEMENT (FR-48 to FR-56)
// ==========================================

const adminGuidesTableBody = document.getElementById("adminGuidesTableBody");
const adminGuideBookingsTableBody = document.getElementById("adminGuideBookingsTableBody");
const adminTotalGuides = document.getElementById("adminTotalGuides");
const adminPendingGuides = document.getElementById("adminPendingGuides");
const adminActiveGuides = document.getElementById("adminActiveGuides");
const adminGuideBookingsCount = document.getElementById("adminGuideBookingsCount");
const adminAddGuideForm = document.getElementById("adminAddGuideForm");
const adminGuideAddMsg = document.getElementById("adminGuideAddMsg");

async function loadAdminGuides() {
    if (!adminGuidesTableBody) return;
    try {
        const res = await fetch(`${API_URL}/api/admin/guides/${user.id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load guides.");

        const guides = data.guides || [];
        const total = guides.length;
        const pending = guides.filter(g => !g.isApproved).length;
        const active = guides.filter(g => g.isApproved && g.isActive !== false).length;

        if (adminTotalGuides) adminTotalGuides.textContent = total;
        if (adminPendingGuides) adminPendingGuides.textContent = pending;
        if (adminActiveGuides) adminActiveGuides.textContent = active;

        if (guides.length === 0) {
            adminGuidesTableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#64748b;">No tour guides found in database.</td></tr>`;
            return;
        }

        adminGuidesTableBody.innerHTML = guides.map(g => {
            const isApproved = g.isApproved;
            const isActive = g.isActive !== false;
            let statusBadge = "";

            if (!isApproved) {
                statusBadge = `<span style="background:#fef3c7; color:#92400e; padding:3px 8px; border-radius:12px; font-size:11px; font-weight:700;">Pending Approval</span>`;
            } else if (!isActive) {
                statusBadge = `<span style="background:#fee2e2; color:#b91c1c; padding:3px 8px; border-radius:12px; font-size:11px; font-weight:700;">Deactivated</span>`;
            } else {
                statusBadge = `<span style="background:#e6f7f0; color:#087f5b; padding:3px 8px; border-radius:12px; font-size:11px; font-weight:700;">Active & Approved</span>`;
            }

            const districtsStr = Array.isArray(g.specialization) ? g.specialization.join(", ") : g.specialization;

            return `
                <tr>
                    <td>
                        <strong>${escapeHTML(g.name)}</strong>
                        <div style="font-size:11px; color:#64748b;">Exp: ${g.experience} yr(s) • Bookings: ${g.bookingCount || 0}</div>
                    </td>
                    <td>
                        <div>${escapeHTML(g.email || 'N/A')}</div>
                        <div style="font-size:11px; color:#64748b;">${escapeHTML(g.phone || 'N/A')}</div>
                    </td>
                    <td style="max-width:200px; font-size:12px;">${escapeHTML(districtsStr)}</td>
                    <td style="font-weight:700; color:#087f5b;">৳${Number(g.dailyRate).toLocaleString('en-BD')}</td>
                    <td>
                        ⭐ ${Number(g.rating).toFixed(1)}
                        <span style="font-size:11px; color:#64748b;">(${g.reviews})</span>
                    </td>
                    <td>${statusBadge}</td>
                    <td>
                        ${!isApproved ? `
                            <button type="button" class="admin-action-btn" style="background:#087f5b; color:white;" onclick="adminApproveGuide('${g.id}', true)">
                                ✓ Approve
                            </button>
                        ` : `
                            <button type="button" class="admin-action-btn" style="background:${isActive ? '#fed7aa; color:#9a3412;' : '#e2e8f0; color:#334155;'}" onclick="adminToggleGuideActive('${g.id}', ${!isActive})">
                                ${isActive ? 'Deactivate' : 'Activate'}
                            </button>
                        `}
                        <button type="button" class="admin-action-btn btn-delete" onclick="adminDeleteGuide('${g.id}', '${escapeAttr(g.name)}')">
                            Delete
                        </button>
                    </td>
                </tr>
            `;
        }).join("");

    } catch (err) {
        console.error("Load admin guides error:", err);
        adminGuidesTableBody.innerHTML = `<tr><td colspan="7" style="color:red; text-align:center;">${err.message}</td></tr>`;
    }
}

// Load Guide Booking Requests in Admin Panel
async function loadAdminGuideBookings() {
    if (!adminGuideBookingsTableBody) return;
    try {
        const res = await fetch(`${API_URL}/api/admin/guide-bookings/${user.id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load guide bookings.");

        const bookings = data.bookings || [];
        if (adminGuideBookingsCount) adminGuideBookingsCount.textContent = bookings.length;

        if (bookings.length === 0) {
            adminGuideBookingsTableBody.innerHTML = `<tr><td colspan="9" style="text-align:center; color:#64748b;">No guide bookings recorded yet.</td></tr>`;
            return;
        }

        adminGuideBookingsTableBody.innerHTML = bookings.map(b => {
            const statusClass = `status-${(b.status || 'pending').toLowerCase()}`;
            const bookedTime = b.createdAt ? new Date(b.createdAt).toLocaleString("en-BD", { dateStyle: "short", timeStyle: "short" }) : "N/A";
            return `
                <tr>
                    <td style="font-family:monospace; font-weight:700; font-size:11px; color:#087f5b;">${escapeHTML(b.reference)}</td>
                    <td><strong>${escapeHTML(b.guideName)}</strong></td>
                    <td>
                        <div><strong>${escapeHTML(b.guestName)}</strong></div>
                        <div style="font-size:11px; color:#64748b;">${escapeHTML(b.guestPhone || '')}</div>
                    </td>
                    <td>${escapeHTML(b.destination)}</td>
                    <td>${escapeHTML(b.tourDate)} (${b.days || 1}d)</td>
                    <td style="font-weight:700; color:#087f5b;">৳${Number(b.totalAmount || 0).toLocaleString('en-BD')}</td>
                    <td><span class="status-pill ${statusClass}">${escapeHTML(b.status)}</span></td>
                    <td style="font-size:11px; color:#64748b;">${bookedTime}</td>
                    <td>
                        <div style="display:flex; align-items:center; gap:4px;">
                            <select id="guideStatus_${b.id}" style="padding:4px; font-size:11px; border-radius:4px; border:1px solid #cbd5e1;">
                                <option value="Pending" ${b.status === "Pending" ? "selected" : ""}>Pending</option>
                                <option value="Confirmed" ${b.status === "Confirmed" ? "selected" : ""}>Confirmed</option>
                                <option value="Completed" ${b.status === "Completed" ? "selected" : ""}>Completed</option>
                                <option value="Rejected" ${b.status === "Rejected" ? "selected" : ""}>Rejected</option>
                                <option value="Cancelled" ${b.status === "Cancelled" ? "selected" : ""}>Cancelled</option>
                            </select>
                            <button type="button" class="admin-action-btn" style="background:#087f5b; color:white; padding:4px 8px; font-size:11px;" onclick="adminSaveGuideBookingStatus('${b.id}')">
                                Save
                            </button>
                            <button type="button" class="admin-action-btn btn-delete" style="padding:4px 8px; font-size:11px;" onclick="adminDeleteGuideBooking('${b.id}', '${escapeAttr(b.reference)}')">
                                Delete
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join("");

    } catch (err) {
        console.error("Load admin guide bookings error:", err);
        adminGuideBookingsTableBody.innerHTML = `<tr><td colspan="9" style="color:red; text-align:center;">${err.message}</td></tr>`;
    }
}

window.adminSaveGuideBookingStatus = async function (bookingId) {
    const selectEl = document.getElementById(`guideStatus_${bookingId}`);
    if (!selectEl) return;
    const newStatus = selectEl.value;

    try {
        const res = await fetch(`${API_URL}/api/admin/bookings/${encodeURIComponent(bookingId)}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.id, status: newStatus, category: "guide" })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to update status.");
        await loadAdminGuideBookings();
    } catch (err) {
        alert("Failed to update status: " + err.message);
    }
};

window.adminDeleteGuideBooking = async function (bookingId, reference) {
    if (!confirm(`Are you sure you want to permanently delete guide booking [${reference || bookingId}]?`)) return;

    try {
        const res = await fetch(`${API_URL}/api/admin/bookings/${encodeURIComponent(bookingId)}?category=guide`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.id, category: "guide" })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to delete guide booking.");
        await loadAdminGuideBookings();
    } catch (err) {
        alert("Failed to delete booking: " + err.message);
    }
};

// Admin Action: Approve Guide
window.adminApproveGuide = async function (guideId, approve) {
    try {
        const res = await fetch(`${API_URL}/api/admin/guides/${user.id}/${guideId}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isApproved: approve, isAvailable: approve })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to update guide status.");
        loadAdminGuides();
    } catch (err) {
        alert("Action failed: " + err.message);
    }
};

// Admin Action: Toggle Active Status
window.adminToggleGuideActive = async function (guideId, activate) {
    try {
        const res = await fetch(`${API_URL}/api/admin/guides/${user.id}/${guideId}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isActive: activate, isAvailable: activate })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to update guide active status.");
        loadAdminGuides();
    } catch (err) {
        alert("Action failed: " + err.message);
    }
};

// Admin Action: Delete Guide
window.adminDeleteGuide = async function (guideId, name) {
    if (!confirm(`Are you sure you want to remove or deactivate guide "${name}"? Existing bookings will be safely preserved.`)) return;
    try {
        const res = await fetch(`${API_URL}/api/admin/guides/${user.id}/${guideId}`, { method: "DELETE" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to delete guide.");
        alert(data.message);
        loadAdminGuides();
    } catch (err) {
        alert("Delete failed: " + err.message);
    }
};

// Admin Add Guide Form Handler
if (adminAddGuideForm) {
    adminAddGuideForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        adminGuideAddMsg.textContent = "Creating guide...";
        adminGuideAddMsg.style.color = "#087f5b";

        const name = document.getElementById("adminGuideName").value.trim();
        const email = document.getElementById("adminGuideEmail").value.trim();
        const phone = document.getElementById("adminGuidePhone").value.trim();
        const dailyRate = document.getElementById("adminGuideRate").value;
        const experience = document.getElementById("adminGuideExp").value;
        const languages = document.getElementById("adminGuideLangs").value.trim();
        const specialization = document.getElementById("adminGuideSpec").value.trim();
        const bio = document.getElementById("adminGuideBio").value.trim();

        try {
            const res = await fetch(`${API_URL}/api/admin/guides/${user.id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    email,
                    phone,
                    dailyRate: Number(dailyRate),
                    experience: Number(experience),
                    languages,
                    specialization,
                    bio
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to add guide.");

            adminGuideAddMsg.textContent = "✅ " + data.message;
            adminGuideAddMsg.style.color = "#087f5b";
            adminAddGuideForm.reset();
            loadAdminGuides();

            setTimeout(() => { adminGuideAddMsg.textContent = ""; }, 3000);

        } catch (err) {
            console.error("Add guide error:", err);
            adminGuideAddMsg.textContent = "❌ " + err.message;
            adminGuideAddMsg.style.color = "red";
        }
    });
}

// Logout
const adminLogoutBtn = document.getElementById("adminLogoutBtn");
if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener("click", () => {
        sessionStorage.removeItem("travelKoriUser");
        window.location.href = "login.html";
    });
}

// Initialize
function initAdmin() {
    setupTabs();
    loadAdminBookings();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAdmin);
} else {
    initAdmin();
}