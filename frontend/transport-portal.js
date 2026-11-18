// ===================================================
// TRANSPORT OPERATOR OPERATIONS PORTAL JAVASCRIPT
// Handles transport ticket manifests, passenger departures, trip executions, and schedule tracking
// ===================================================

const API_BASE = ((window.location.origin && window.location.origin !== "null" && window.location.protocol !== "file:")
    ? window.location.origin
    : "http://localhost:5000") + "/api";

let currentUser = null;
let allTransportTickets = [];
let currentFilter = "all";
let currentSearch = "";
let currentType = "all";

// Check User Session on Page Load
function checkAuth() {
    try {
        const stored = sessionStorage.getItem("travelKoriUser");
        if (!stored) {
            window.location.href = "login.html?role=transport";
            return false;
        }
        currentUser = JSON.parse(stored);
        const role = (currentUser.userType || "").toLowerCase();
        if (role !== "transport" && role !== "admin") {
            alert("This portal is reserved for Transport Operators. Redirecting...");
            window.location.href = "login.html?role=transport";
            return false;
        }

        const userBadge = document.getElementById("portalUserBadge");
        if (userBadge) {
            const operatorTitle = currentUser.operatorName || "Transport Partner";
            const mode = currentUser.transportType || "Fleet";
            const avatarHtml = (currentUser.avatar && (currentUser.avatar.startsWith("data:image") || currentUser.avatar.startsWith("http") || currentUser.avatar.startsWith("/")))
                ? `<img src="${currentUser.avatar}" alt="Operator Avatar" style="width:26px; height:26px; border-radius:50%; object-fit:cover; vertical-align:middle; margin-right:6px; border:1.5px solid #ffffff; display:inline-block;">`
                : `<span style="display:inline-block; vertical-align:middle; margin-right:6px;">🚌</span>`;
            userBadge.innerHTML = `${avatarHtml}<span>${currentUser.fullName || "Transport Partner"}</span> <small style="opacity:0.85; font-weight:400;">(${operatorTitle} • ${mode})</small>`;
        }

        return true;
    } catch (e) {
        window.location.href = "login.html?role=transport";
        return false;
    }
}

// Fetch Transport Tickets from Backend
async function loadTransportTickets() {
    if (!currentUser) return;
    const tbody = document.getElementById("ticketsTableBody");
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center; padding:30px; color:#64748b;">
                    🔄 Fetching latest transport tickets & manifest...
                </td>
            </tr>
        `;
    }

    try {
        const res = await fetch(`${API_BASE}/transport-portal/bookings/${currentUser.id}`);
        if (!res.ok) throw new Error("Failed to load transport bookings.");

        const data = await res.json();
        allTransportTickets = data.tickets || [];

        // Update Stats Counters
        updateStats(data.stats || {});

        // Render Table
        renderTicketsTable();

    } catch (error) {
        console.error("Error loading transport tickets:", error);
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align:center; padding:30px; color:#ef4444;">
                        ⚠️ Unable to load tickets: ${error.message}. Is the backend running?
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

    if (statTotal) statTotal.textContent = stats.total ?? allTransportTickets.length;
    if (statIncoming) statIncoming.textContent = stats.incoming ?? 0;
    if (statCompleted) statCompleted.textContent = stats.completed ?? 0;
    if (statRevenue) {
        statRevenue.textContent = "৳ " + Number(stats.totalRevenue || 0).toLocaleString();
    }

    // Tab counts
    const todayStr = new Date().toISOString().slice(0, 10);
    const tomorrowStr = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

    const cAll = allTransportTickets.length;
    const cInc = allTransportTickets.filter(t => t.executionCategory?.startsWith("incoming")).length;
    const cToday = allTransportTickets.filter(t => t.journeyDate === todayStr && t.status.toLowerCase() !== "cancelled").length;
    const cTom = allTransportTickets.filter(t => t.journeyDate === tomorrowStr && t.status.toLowerCase() !== "cancelled").length;
    const cComp = allTransportTickets.filter(t => t.status.toLowerCase() === "completed").length;
    const cCanc = allTransportTickets.filter(t => t.status.toLowerCase() === "cancelled" || t.status.toLowerCase() === "rejected").length;

    if (countAll) countAll.textContent = cAll;
    if (countIncoming) countIncoming.textContent = cInc;
    if (countToday) countToday.textContent = cToday;
    if (countTomorrow) countTomorrow.textContent = cTom;
    if (countCompleted) countCompleted.textContent = cComp;
    if (countCancelled) countCancelled.textContent = cCanc;
}

// Filter and Render Tickets Table
function renderTicketsTable() {
    const tbody = document.getElementById("ticketsTableBody");
    const emptyState = document.getElementById("emptyState");
    if (!tbody) return;

    const todayStr = new Date().toISOString().slice(0, 10);
    const tomorrowStr = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

    let filtered = allTransportTickets.filter(t => {
        // Tab filter
        const statusLower = (t.status || "").toLowerCase();
        if (currentFilter === "incoming") {
            if (!t.executionCategory?.startsWith("incoming")) return false;
        } else if (currentFilter === "today") {
            if (t.journeyDate !== todayStr || statusLower === "cancelled") return false;
        } else if (currentFilter === "tomorrow") {
            if (t.journeyDate !== tomorrowStr || statusLower === "cancelled") return false;
        } else if (currentFilter === "completed") {
            if (statusLower !== "completed") return false;
        } else if (currentFilter === "cancelled") {
            if (statusLower !== "cancelled" && statusLower !== "rejected") return false;
        }

        // Vehicle Mode filter
        if (currentType !== "all") {
            if ((t.transportType || "").toLowerCase() !== currentType.toLowerCase()) return false;
        }

        // Search text
        if (currentSearch) {
            const query = currentSearch.toLowerCase();
            const matchName = (t.passengerName || "").toLowerCase().includes(query);
            const matchPhone = (t.passengerPhone || "").toLowerCase().includes(query);
            const matchRef = (t.reference || "").toLowerCase().includes(query);
            const matchOperator = (t.operator || "").toLowerCase().includes(query);
            const matchRoute = (t.route || "").toLowerCase().includes(query);
            const matchFrom = (t.from || "").toLowerCase().includes(query);
            const matchTo = (t.to || "").toLowerCase().includes(query);
            const matchSeats = String(t.seatNumbers || "").toLowerCase().includes(query);
            if (!matchName && !matchPhone && !matchRef && !matchOperator && !matchRoute && !matchFrom && !matchTo && !matchSeats) return false;
        }

        return true;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = "";
        if (emptyState) emptyState.style.display = "block";
        return;
    }

    if (emptyState) emptyState.style.display = "none";

    tbody.innerHTML = filtered.map(t => {
        const isCompleted = (t.status || "").toLowerCase() === "completed";
        const isCancelled = (t.status || "").toLowerCase() === "cancelled" || (t.status || "").toLowerCase() === "rejected";
        const isPending = (t.status || "").toLowerCase() === "pending";
        const isConfirmed = (t.status || "").toLowerCase() === "confirmed";

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
        } else if (t.journeyDate === todayStr) {
            timingBadgeClass = "timing-today";
            timingIcon = "⚡ Today";
        } else if (t.journeyDate === tomorrowStr) {
            timingBadgeClass = "timing-tomorrow";
            timingIcon = "⏰ Tomorrow";
        }

        // Mode icon
        let modeIcon = "🚌";
        if (t.transportType === "Flight") modeIcon = "✈️";
        else if (t.transportType === "Train") modeIcon = "🚆";
        else if (t.transportType === "Launch" || t.transportType === "Ship") modeIcon = "🚢";

        return `
            <tr data-ticket-id="${t.id}">
                <!-- Passenger Information -->
                <td>
                    <div class="passenger-info">
                        <span class="passenger-name">${escapeHtml(t.passengerName || 'Traveler')}</span>
                        <span class="passenger-phone">📞 ${escapeHtml(t.passengerPhone || 'N/A')}</span>
                        <span class="passenger-phone">✉️ ${escapeHtml(t.passengerEmail || 'N/A')}</span>
                        <span style="font-size:11px; font-weight:700; color:#0284c7; margin-top:2px;">
                            🪑 Seat(s): ${escapeHtml(t.seatNumbers || 'Assigned')} (${t.passengers || 1} pass)
                        </span>
                    </div>
                </td>

                <!-- Route & Vehicle Information -->
                <td>
                    <div class="route-info">
                        <span class="route-name">
                            ${modeIcon} ${escapeHtml(t.from)} → ${escapeHtml(t.to)}
                        </span>
                        <span class="route-operator">${escapeHtml(t.operator)}</span>
                        <span style="font-size:11px; color:#64748b;">
                            ${escapeHtml(t.transportType)} Class
                        </span>
                        <span style="font-size:10px; color:#94a3b8; font-family:monospace;">
                            Ref: ${escapeHtml(t.reference)}
                        </span>
                    </div>
                </td>

                <!-- Journey Date & Schedule -->
                <td>
                    <div class="timing-info">
                        <span class="timing-date">📅 ${escapeHtml(t.journeyDate)}</span>
                        <span style="font-size:11px; font-weight:600; color:#0369a1;">
                            Scheduled Departure
                        </span>
                    </div>
                </td>

                <!-- Departure Status -->
                <td>
                    <span class="timing-badge ${timingBadgeClass}">
                        ${timingIcon} ${escapeHtml(t.timingBadge || 'Upcoming')}
                    </span>
                </td>

                <!-- Fare & Payment -->
                <td>
                    <div style="font-weight:800; color:#0f172a; font-size:14px;">
                        ৳ ${Number(t.totalPrice || 0).toLocaleString()}
                    </div>
                    <div style="font-size:11px; color:#64748b;">
                        ${escapeHtml(t.paymentMethod || 'Paid')} • ${escapeHtml(t.paymentStatus || 'Confirmed')}
                    </div>
                </td>

                <!-- Execution Status -->
                <td>
                    <span class="status-badge ${statusClass}">
                        ${isCompleted ? '✅ Trip Completed' : escapeHtml(t.status || 'Pending')}
                    </span>
                </td>

                <!-- Operations / Actions -->
                <td style="text-align: right;">
                    <div class="actions-cell" style="justify-content: flex-end;">
                        ${!isCompleted && !isCancelled ? `
                            <button type="button" class="btn-act btn-act-complete" onclick="updateStatus('${t.id}', 'Completed')" title="Mark journey completed and execution done">
                                ✅ Mark Trip Done
                            </button>
                        ` : ''}

                        ${isPending ? `
                            <button type="button" class="btn-act btn-act-confirm" onclick="updateStatus('${t.id}', 'Confirmed')" title="Confirm ticket">
                                🆗 Confirm
                            </button>
                        ` : ''}

                        <button type="button" class="btn-act btn-act-details" onclick="openTicketModal('${t.id}')" title="View Boarding Pass / Ticket Voucher">
                            🎫 Boarding Pass
                        </button>

                        ${!isCompleted && !isCancelled ? `
                            <button type="button" class="btn-act btn-act-cancel" onclick="updateStatus('${t.id}', 'Cancelled')" title="Cancel ticket">
                                ✕
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;
    }).join("");
}

// Update Ticket Status API Call
window.updateStatus = async function (ticketId, newStatus) {
    let confirmMsg = `Are you sure you want to mark this ticket as "${newStatus}"?`;
    if (newStatus === "Completed") {
        confirmMsg = `Mark this passenger journey as "Execution Completed"? This confirms the trip was completed successfully.`;
    } else if (newStatus === "Cancelled") {
        confirmMsg = `Are you sure you want to cancel this ticket?`;
    }

    if (!confirm(confirmMsg)) return;

    try {
        const res = await fetch(`${API_BASE}/transport-portal/bookings/${ticketId}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to update ticket status.");

        // Refresh manifest
        await loadTransportTickets();

    } catch (error) {
        alert("Error: " + error.message);
    }
};

// Open Detailed Boarding Pass Modal
window.openTicketModal = function (ticketId) {
    const ticket = allTransportTickets.find(t => t.id === ticketId);
    if (!ticket) return;

    const modal = document.getElementById("ticketModal");
    const content = document.getElementById("modalContent");
    if (!modal || !content) return;

    const isCompleted = (ticket.status || "").toLowerCase() === "completed";

    let modeIcon = "🚌";
    if (ticket.transportType === "Flight") modeIcon = "✈️";
    else if (ticket.transportType === "Train") modeIcon = "🚆";
    else if (ticket.transportType === "Launch" || ticket.transportType === "Ship") modeIcon = "🚢";

    content.innerHTML = `
        <div style="border-bottom: 2px solid #e2e8f0; padding-bottom: 14px; margin-bottom: 16px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:12px; font-weight:800; color:#0284c7; text-transform:uppercase;">Official Boarding Pass</span>
                <span class="status-badge ${isCompleted ? 'status-completed' : 'status-confirmed'}">${escapeHtml(ticket.status)}</span>
            </div>
            <h2 style="margin: 6px 0 0; color: #0f172a; font-size: 20px;">${modeIcon} ${escapeHtml(ticket.route)}</h2>
            <p style="margin: 2px 0 0; color: #64748b; font-size: 13px;">Operator: <strong>${escapeHtml(ticket.operator)}</strong> • Ticket Ref: <strong>${escapeHtml(ticket.reference)}</strong></p>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 18px; font-size: 13px;">
            <div style="background:#f8fafc; padding:12px; border-radius:8px; border:1px solid #e2e8f0;">
                <p style="margin:0 0 4px; font-weight:700; color:#475569;">PASSENGER DETAILS</p>
                <div style="font-size:15px; font-weight:800; color:#0f172a;">${escapeHtml(ticket.passengerName)}</div>
                <div style="color:#334155;">📞 ${escapeHtml(ticket.passengerPhone)}</div>
                <div style="color:#334155;">✉️ ${escapeHtml(ticket.passengerEmail)}</div>
                <div style="margin-top:6px; color:#0284c7; font-weight:700;">🪑 Seat(s): ${escapeHtml(ticket.seatNumbers)}</div>
            </div>

            <div style="background:#f8fafc; padding:12px; border-radius:8px; border:1px solid #e2e8f0;">
                <p style="margin:0 0 4px; font-weight:700; color:#475569;">SCHEDULE & ROUTE</p>
                <div>Departure Date: <strong>${escapeHtml(ticket.journeyDate)}</strong></div>
                <div>Origin: <strong>${escapeHtml(ticket.from)}</strong></div>
                <div>Destination: <strong>${escapeHtml(ticket.to)}</strong></div>
                <div style="margin-top:6px; color:#ea580c; font-weight:700;">Timing: ${escapeHtml(ticket.timingBadge)}</div>
            </div>
        </div>

        <div style="background:#eff6ff; border:1px solid #bfdbfe; padding:14px; border-radius:10px; margin-bottom: 18px; display:flex; justify-content:space-between; align-items:center;">
            <div>
                <span style="font-size:12px; color:#1d4ed8; font-weight:700;">FARE BREAKDOWN</span>
                <div style="font-size:14px; font-weight:700; color:#0f172a;">${ticket.passengers} Passenger(s) • ${escapeHtml(ticket.transportType)} Service</div>
                <div style="font-size:12px; color:#475569;">Payment: ${escapeHtml(ticket.paymentMethod)} (${escapeHtml(ticket.paymentStatus)})</div>
            </div>
            <div style="text-align:right;">
                <span style="font-size:12px; color:#1d4ed8; font-weight:700;">TOTAL FARE PAID</span>
                <div style="font-size:22px; font-weight:900; color:#1d4ed8;">৳ ${Number(ticket.totalPrice).toLocaleString()}</div>
            </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center;">
            <button type="button" class="btn-act btn-act-details" onclick="window.print()">🖨️ Print Boarding Pass</button>
            <div style="display:flex; gap:8px;">
                ${!isCompleted ? `
                    <button type="button" class="btn-act btn-act-complete" onclick="updateStatus('${ticket.id}', 'Completed'); document.getElementById('ticketModal').style.display='none';">
                        ✅ Mark Trip Completed
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

    loadTransportTickets();

    // Tab Filters
    const tabButtons = document.querySelectorAll(".tab-btn");
    tabButtons.forEach(btn => {
        btn.addEventListener("click", function () {
            tabButtons.forEach(b => b.classList.remove("active"));
            this.classList.add("active");
            currentFilter = this.getAttribute("data-filter") || "all";
            renderTicketsTable();
        });
    });

    // Search Input
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("input", function () {
            currentSearch = this.value.trim();
            renderTicketsTable();
        });
    }

    // Vehicle Type Filter Dropdown
    const typeSelect = document.getElementById("typeFilterSelect");
    if (typeSelect) {
        typeSelect.addEventListener("change", function () {
            currentType = this.value;
            renderTicketsTable();
        });
    }

    // Refresh Button
    const refreshBtn = document.getElementById("refreshBtn");
    if (refreshBtn) {
        refreshBtn.addEventListener("click", loadTransportTickets);
    }

    // Modal Close
    const modalCloseBtn = document.getElementById("modalCloseBtn");
    const modal = document.getElementById("ticketModal");
    if (modalCloseBtn && modal) {
        modalCloseBtn.addEventListener("click", () => modal.style.display = "none");
        modal.addEventListener("click", (e) => {
            if (e.target === modal) modal.style.display = "none";
        });
    }

    // Export Report PDF (Section O)
    const exportReportBtn = document.getElementById("transportExportReportBtn");
    if (exportReportBtn) {
        exportReportBtn.addEventListener("click", function () {
            if (typeof window.downloadTransportPartnerReport === "function") {
                window.downloadTransportPartnerReport(currentUser || {}, allTransportTickets || []);
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
            window.location.href = "login.html?role=transport";
        });
    }
});
