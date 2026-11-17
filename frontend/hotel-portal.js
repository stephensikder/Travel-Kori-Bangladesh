// ===================================================
// HOTEL PARTNER OPERATIONS PORTAL JAVASCRIPT
// Handles hotel reservations, incoming guest check-ins, execution completions, and timeline filters
// ===================================================

const API_BASE = ((window.location.origin && window.location.origin !== "null") ? window.location.origin : "") + "/api";

let currentUser = null;
let allHotelBookings = [];
let currentFilter = "all";
let currentSearch = "";
let currentDistrict = "all";

// Check User Session on Page Load
function checkAuth() {
    try {
        const stored = sessionStorage.getItem("travelKoriUser");
        if (!stored) {
            window.location.href = "login.html?role=hotel";
            return false;
        }
        currentUser = JSON.parse(stored);
        const role = (currentUser.userType || "").toLowerCase();
        if (role !== "hotel" && role !== "admin") {
            alert("This portal is reserved for Hotel Partners. Redirecting...");
            window.location.href = "login.html?role=hotel";
            return false;
        }

        const userBadge = document.getElementById("portalUserBadge");
        if (userBadge) {
            const propertyName = currentUser.hotelName || "Partner Hotel";
            const avatarHtml = (currentUser.avatar && (currentUser.avatar.startsWith("data:image") || currentUser.avatar.startsWith("http") || currentUser.avatar.startsWith("/")))
                ? `<img src="${currentUser.avatar}" alt="Partner Avatar" style="width:26px; height:26px; border-radius:50%; object-fit:cover; vertical-align:middle; margin-right:6px; border:1.5px solid #ffffff; display:inline-block;">`
                : `<span style="display:inline-block; vertical-align:middle; margin-right:6px;">🏨</span>`;
            userBadge.innerHTML = `${avatarHtml}<span>${currentUser.fullName || "Hotel Partner"}</span> <small style="opacity:0.8; font-weight:400;">(${propertyName})</small>`;
        }

        return true;
    } catch (e) {
        window.location.href = "login.html?role=hotel";
        return false;
    }
}

// Fetch Hotel Bookings from Backend
async function loadHotelBookings() {
    if (!currentUser) return;
    const tbody = document.getElementById("bookingsTableBody");
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center; padding:30px; color:#64748b;">
                    🔄 Fetching latest hotel reservation records...
                </td>
            </tr>
        `;
    }

    try {
        const res = await fetch(`${API_BASE}/hotel-portal/bookings/${currentUser.id}`);
        if (!res.ok) throw new Error("Failed to load hotel bookings.");

        const data = await res.json();
        allHotelBookings = data.bookings || [];

        // Update Stats Counters
        updateStats(data.stats || {});

        // Populate District Dropdown
        populateDistrictDropdown(allHotelBookings);

        // Render Table
        renderBookingsTable();

    } catch (error) {
        console.error("Error loading hotel bookings:", error);
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align:center; padding:30px; color:#ef4444;">
                        ⚠️ Unable to load bookings: ${error.message}. Is the backend running?
                    </td>
                </tr>
            `;
        }
    }
}

// Update Top Statistic Cards
function updateStats(stats) {
    const statTotal = document.getElementById("statTotal");
    const statIncoming = document.getElementById("statIncoming");
    const statCompleted = document.getElementById("statCompleted");
    const statRevenue = document.getElementById("statRevenue");

    const countAll = document.getElementById("countAll");
    const countIncoming = document.getElementById("countIncoming");
    const countToday = document.getElementById("countToday");
    const countTomorrow = document.getElementById("countTomorrow");
    const countCompleted = document.getElementById("countCompleted");
    const countCancelled = document.getElementById("countCancelled");

    if (statTotal) statTotal.textContent = stats.total ?? allHotelBookings.length;
    if (statIncoming) statIncoming.textContent = stats.incoming ?? 0;
    if (statCompleted) statCompleted.textContent = stats.completed ?? 0;
    if (statRevenue) {
        statRevenue.textContent = "৳ " + Number(stats.totalRevenue || 0).toLocaleString();
    }

    // Tab counts
    const todayStr = new Date().toISOString().slice(0, 10);
    const tomorrowStr = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

    const cAll = allHotelBookings.length;
    const cInc = allHotelBookings.filter(b => b.executionCategory?.startsWith("incoming") || b.executionCategory === "in_stay").length;
    const cToday = allHotelBookings.filter(b => b.checkIn === todayStr && b.status.toLowerCase() !== "cancelled").length;
    const cTom = allHotelBookings.filter(b => b.checkIn === tomorrowStr && b.status.toLowerCase() !== "cancelled").length;
    const cComp = allHotelBookings.filter(b => b.status.toLowerCase() === "completed").length;
    const cCanc = allHotelBookings.filter(b => b.status.toLowerCase() === "cancelled" || b.status.toLowerCase() === "rejected").length;

    if (countAll) countAll.textContent = cAll;
    if (countIncoming) countIncoming.textContent = cInc;
    if (countToday) countToday.textContent = cToday;
    if (countTomorrow) countTomorrow.textContent = cTom;
    if (countCompleted) countCompleted.textContent = cComp;
    if (countCancelled) countCancelled.textContent = cCanc;
}

// Populate District Filter Dropdown
function populateDistrictDropdown(bookings) {
    const select = document.getElementById("districtFilterSelect");
    if (!select) return;

    const districts = [...new Set(bookings.map(b => b.district).filter(Boolean))].sort();
    const currentVal = select.value;

    select.innerHTML = `<option value="all">All Districts (${districts.length})</option>`;
    districts.forEach(d => {
        const opt = document.createElement("option");
        opt.value = d;
        opt.textContent = d;
        select.appendChild(opt);
    });

    if (districts.includes(currentVal)) {
        select.value = currentVal;
    }
}

// Filter and Render Bookings
function renderBookingsTable() {
    const tbody = document.getElementById("bookingsTableBody");
    const emptyState = document.getElementById("emptyState");
    if (!tbody) return;

    const todayStr = new Date().toISOString().slice(0, 10);
    const tomorrowStr = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

    let filtered = allHotelBookings.filter(b => {
        // Tab filter
        const statusLower = (b.status || "").toLowerCase();
        if (currentFilter === "incoming") {
            if (!b.executionCategory?.startsWith("incoming") && b.executionCategory !== "in_stay") return false;
        } else if (currentFilter === "today") {
            if (b.checkIn !== todayStr || statusLower === "cancelled") return false;
        } else if (currentFilter === "tomorrow") {
            if (b.checkIn !== tomorrowStr || statusLower === "cancelled") return false;
        } else if (currentFilter === "completed") {
            if (statusLower !== "completed") return false;
        } else if (currentFilter === "cancelled") {
            if (statusLower !== "cancelled" && statusLower !== "rejected") return false;
        }

        // District filter
        if (currentDistrict !== "all") {
            if ((b.district || "").toLowerCase() !== currentDistrict.toLowerCase()) return false;
        }

        // Search text
        if (currentSearch) {
            const query = currentSearch.toLowerCase();
            const matchName = (b.guestName || "").toLowerCase().includes(query);
            const matchPhone = (b.guestPhone || "").toLowerCase().includes(query);
            const matchRef = (b.reference || "").toLowerCase().includes(query);
            const matchHotel = (b.hotelName || "").toLowerCase().includes(query);
            const matchDist = (b.district || "").toLowerCase().includes(query);
            const matchRoom = (b.roomType || "").toLowerCase().includes(query);
            if (!matchName && !matchPhone && !matchRef && !matchHotel && !matchDist && !matchRoom) return false;
        }

        return true;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = "";
        if (emptyState) emptyState.style.display = "block";
        return;
    }

    if (emptyState) emptyState.style.display = "none";

    tbody.innerHTML = filtered.map(b => {
        const isCompleted = (b.status || "").toLowerCase() === "completed";
        const isCancelled = (b.status || "").toLowerCase() === "cancelled" || (b.status || "").toLowerCase() === "rejected";
        const isPending = (b.status || "").toLowerCase() === "pending";
        const isConfirmed = (b.status || "").toLowerCase() === "confirmed";

        // Status badge class
        let statusClass = "status-pending";
        if (isCompleted) statusClass = "status-completed";
        else if (isConfirmed) statusClass = "status-confirmed";
        else if (isCancelled) statusClass = "status-cancelled";

        // Timing badge class
        let timingBadgeClass = "timing-upcoming";
        let timingIcon = "📅";
        if (isCompleted) {
            timingBadgeClass = "timing-completed";
            timingIcon = "✅";
        } else if (isCancelled) {
            timingBadgeClass = "timing-past";
            timingIcon = "❌";
        } else if (b.checkIn === todayStr) {
            timingBadgeClass = "timing-today";
            timingIcon = "⚡ Today";
        } else if (b.checkIn === tomorrowStr) {
            timingBadgeClass = "timing-tomorrow";
            timingIcon = "⏰ Tomorrow";
        } else if (b.checkIn < todayStr) {
            timingBadgeClass = "timing-today";
            timingIcon = "🛎️ In-Stay";
        }

        return `
            <tr data-booking-id="${b.id}">
                <!-- Guest Information -->
                <td>
                    <div class="customer-info">
                        <span class="customer-name">${escapeHtml(b.guestName || 'Traveler')}</span>
                        <span class="customer-contact">📞 ${escapeHtml(b.guestPhone || 'N/A')}</span>
                        <span class="customer-contact">✉️ ${escapeHtml(b.guestEmail || 'N/A')}</span>
                        <span style="font-size:11px; font-weight:700; color:#087f5b; margin-top:2px;">
                            👥 ${b.guests || 1} Guest(s) • ${b.rooms || 1} Room(s)
                        </span>
                    </div>
                </td>

                <!-- Property & Room Information -->
                <td>
                    <div class="place-info">
                        <span class="place-hotel">${escapeHtml(b.hotelName)}</span>
                        <span class="place-district">📍 ${escapeHtml(b.district)}</span>
                        <span style="font-size:11px; color:#475569; margin-top:2px;">
                            🛏️ ${escapeHtml(b.roomType || 'Standard')} Room
                        </span>
                        <span style="font-size:10px; color:#94a3b8; font-family:monospace;">
                            Ref: ${escapeHtml(b.reference)}
                        </span>
                    </div>
                </td>

                <!-- Stay Dates & Schedule -->
                <td>
                    <div class="timing-info">
                        <span class="timing-date">Check-in: ${escapeHtml(b.checkIn)}</span>
                        <span style="font-size:12px; color:#64748b;">Check-out: ${escapeHtml(b.checkOut)}</span>
                        <span style="font-size:11px; font-weight:600; color:#0369a1;">
                            🌙 ${b.nights || 1} Night(s) Stay
                        </span>
                    </div>
                </td>

                <!-- Stay Timing / Schedule Status -->
                <td>
                    <span class="timing-badge ${timingBadgeClass}">
                        ${timingIcon} ${escapeHtml(b.timingBadge || 'Scheduled')}
                    </span>
                </td>

                <!-- Total Amount & Payment -->
                <td>
                    <div style="font-weight:800; color:#0f172a; font-size:14px;">
                        ৳ ${Number(b.totalPrice || 0).toLocaleString()}
                    </div>
                    <div style="font-size:11px; color:#64748b;">
                        ${escapeHtml(b.paymentMethod || 'Cash')} • ${escapeHtml(b.paymentStatus || 'Pending')}
                    </div>
                </td>

                <!-- Execution Status -->
                <td>
                    <span class="status-badge ${statusClass}">
                        ${isCompleted ? '✅ Execution Done' : escapeHtml(b.status || 'Pending')}
                    </span>
                </td>

                <!-- Operations / Actions -->
                <td style="text-align: right;">
                    <div class="actions-cell" style="justify-content: flex-end;">
                        ${!isCompleted && !isCancelled ? `
                            <button type="button" class="btn-act btn-act-complete" onclick="updateStatus('${b.id}', 'Completed')" title="Mark guest check-out and execution complete">
                                ✅ Mark Completed
                            </button>
                        ` : ''}

                        ${isPending ? `
                            <button type="button" class="btn-act btn-act-confirm" onclick="updateStatus('${b.id}', 'Confirmed')" title="Confirm reservation">
                                🆗 Confirm
                            </button>
                        ` : ''}

                        <button type="button" class="btn-act btn-act-details" onclick="openDetailsModal('${b.id}')" title="View reservation receipt & guest details">
                            📄 Details
                        </button>

                        ${!isCompleted && !isCancelled ? `
                            <button type="button" class="btn-act btn-act-cancel" onclick="updateStatus('${b.id}', 'Cancelled')" title="Cancel booking">
                                ✕
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;
    }).join("");
}

// Update Booking Status API Call
window.updateStatus = async function (bookingId, newStatus) {
    let confirmMsg = `Are you sure you want to mark this booking as "${newStatus}"?`;
    if (newStatus === "Completed") {
        confirmMsg = `Mark this guest stay as "Execution Completed"? This confirms the guest completed their stay.`;
    } else if (newStatus === "Cancelled") {
        confirmMsg = `Are you sure you want to cancel this reservation?`;
    }

    if (!confirm(confirmMsg)) return;

    try {
        const res = await fetch(`${API_BASE}/hotel-portal/bookings/${bookingId}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to update booking status.");

        // Refresh list
        await loadHotelBookings();

    } catch (error) {
        alert("Error: " + error.message);
    }
};

// Open Detailed Booking Modal
window.openDetailsModal = function (bookingId) {
    const booking = allHotelBookings.find(b => b.id === bookingId);
    if (!booking) return;

    const modal = document.getElementById("bookingModal");
    const content = document.getElementById("modalContent");
    if (!modal || !content) return;

    const isCompleted = (booking.status || "").toLowerCase() === "completed";

    content.innerHTML = `
        <div style="border-bottom: 2px solid #e2e8f0; padding-bottom: 14px; margin-bottom: 16px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:12px; font-weight:800; color:#087f5b; text-transform:uppercase;">Hotel Reservation Voucher</span>
                <span class="status-badge ${isCompleted ? 'status-completed' : 'status-confirmed'}">${escapeHtml(booking.status)}</span>
            </div>
            <h2 style="margin: 6px 0 0; color: #17382f; font-size: 20px;">${escapeHtml(booking.hotelName)}</h2>
            <p style="margin: 2px 0 0; color: #64748b; font-size: 13px;">District: <strong>${escapeHtml(booking.district)}</strong> • Ref: <strong>${escapeHtml(booking.reference)}</strong></p>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 18px; font-size: 13px;">
            <div style="background:#f8fafc; padding:12px; border-radius:8px; border:1px solid #e2e8f0;">
                <p style="margin:0 0 4px; font-weight:700; color:#475569;">GUEST DETAILS</p>
                <div style="font-size:15px; font-weight:800; color:#0f172a;">${escapeHtml(booking.guestName)}</div>
                <div style="color:#334155;">📞 ${escapeHtml(booking.guestPhone)}</div>
                <div style="color:#334155;">✉️ ${escapeHtml(booking.guestEmail)}</div>
                <div style="margin-top:6px; color:#087f5b; font-weight:700;">👥 ${booking.guests} Guest(s) • ${booking.rooms} Room(s)</div>
            </div>

            <div style="background:#f8fafc; padding:12px; border-radius:8px; border:1px solid #e2e8f0;">
                <p style="margin:0 0 4px; font-weight:700; color:#475569;">STAY SCHEDULE</p>
                <div>Check-in: <strong>${escapeHtml(booking.checkIn)}</strong></div>
                <div>Check-out: <strong>${escapeHtml(booking.checkOut)}</strong></div>
                <div>Duration: <strong>${booking.nights} night(s)</strong></div>
                <div style="margin-top:6px; color:#2563eb; font-weight:700;">Timing: ${escapeHtml(booking.timingBadge)}</div>
            </div>
        </div>

        <div style="background:#f0fdf4; border:1px solid #bbf7d0; padding:14px; border-radius:10px; margin-bottom: 18px; display:flex; justify-content:space-between; align-items:center;">
            <div>
                <span style="font-size:12px; color:#166534; font-weight:700;">ROOM & RATE DETAILS</span>
                <div style="font-size:14px; font-weight:700; color:#17382f;">${escapeHtml(booking.roomType)} Room (৳ ${Number(booking.pricePerNight).toLocaleString()}/night)</div>
                <div style="font-size:12px; color:#475569;">Payment: ${escapeHtml(booking.paymentMethod)} (${escapeHtml(booking.paymentStatus)})</div>
            </div>
            <div style="text-align:right;">
                <span style="font-size:12px; color:#166534; font-weight:700;">TOTAL PAYABLE</span>
                <div style="font-size:22px; font-weight:900; color:#166534;">৳ ${Number(booking.totalPrice).toLocaleString()}</div>
            </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center;">
            <button type="button" class="btn-act btn-act-details" onclick="window.print()">🖨️ Print Voucher</button>
            <div style="display:flex; gap:8px;">
                ${!isCompleted ? `
                    <button type="button" class="btn-act btn-act-complete" onclick="updateStatus('${booking.id}', 'Completed'); document.getElementById('bookingModal').style.display='none';">
                        ✅ Mark Execution Complete
                    </button>
                ` : '<span style="font-weight:700; color:#166534;">✅ Execution Completed</span>'}
            </div>
        </div>
    `;

    modal.style.display = "flex";
};

// HTML Escaper Utility
function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Event Listeners Setup
document.addEventListener("DOMContentLoaded", function () {
    if (!checkAuth()) return;

    loadHotelBookings();

    // Tab Filters
    const tabButtons = document.querySelectorAll(".tab-btn");
    tabButtons.forEach(btn => {
        btn.addEventListener("click", function () {
            tabButtons.forEach(b => b.classList.remove("active"));
            this.classList.add("active");
            currentFilter = this.getAttribute("data-filter") || "all";
            renderBookingsTable();
        });
    });

    // Search Input
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("input", function () {
            currentSearch = this.value.trim();
            renderBookingsTable();
        });
    }

    // District Filter Dropdown
    const districtSelect = document.getElementById("districtFilterSelect");
    if (districtSelect) {
        districtSelect.addEventListener("change", function () {
            currentDistrict = this.value;
            renderBookingsTable();
        });
    }

    // Refresh Button
    const refreshBtn = document.getElementById("refreshBtn");
    if (refreshBtn) {
        refreshBtn.addEventListener("click", loadHotelBookings);
    }

    // Modal Close
    const modalCloseBtn = document.getElementById("modalCloseBtn");
    const modal = document.getElementById("bookingModal");
    if (modalCloseBtn && modal) {
        modalCloseBtn.addEventListener("click", () => modal.style.display = "none");
        modal.addEventListener("click", (e) => {
            if (e.target === modal) modal.style.display = "none";
        });
    }

    // Export Report PDF (Section N)
    const exportReportBtn = document.getElementById("hotelExportReportBtn");
    if (exportReportBtn) {
        exportReportBtn.addEventListener("click", function () {
            if (typeof window.downloadHotelPartnerReport === "function") {
                window.downloadHotelPartnerReport(currentUser || {}, allHotelBookings || []);
            } else {
                alert("Report generator is initializing. Please try again.");
            }
        });
    }

    // Logout Button
    const logoutBtn = document.getElementById("portalLogoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function () {
            sessionStorage.removeItem("travelKoriUser");
            sessionStorage.removeItem("travelKoriPendingHotelSearch");
            window.location.href = "login.html?role=hotel";
        });
    }
});
