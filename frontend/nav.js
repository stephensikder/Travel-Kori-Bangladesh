// ===================================================
// TRAVEL KORI BANGLADESH - UNIVERSAL NAVBAR & UI SYSTEM
// Features: Dark Mode Toggle, Role Notifications, Navigation Consistency
// ===================================================

(function () {
    "use strict";

    // ----------------------------------------------------
    // GLOBAL DARK MODE CONTROLLER
    // ----------------------------------------------------
    function getStoredTheme() {
        return localStorage.getItem("travelKoriTheme") || "light";
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute("data-theme", theme);
        if (document.body) {
            if (theme === "dark") {
                document.body.classList.add("dark-theme");
            } else {
                document.body.classList.remove("dark-theme");
            }
        }
        localStorage.setItem("travelKoriTheme", theme);
        updateToggleButtons(theme);
    }

    function toggleTheme() {
        const current = getStoredTheme();
        const next = current === "dark" ? "light" : "dark";
        applyTheme(next);
    }

    function updateToggleButtons(theme) {
        const btns = document.querySelectorAll(".theme-toggle-btn");
        btns.forEach(b => {
            b.innerHTML = theme === "dark" ? "☀️ Light" : "🌙 Dark";
            b.setAttribute("aria-label", theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode");
            b.setAttribute("title", theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode");
        });
    }

    // Apply theme immediately
    applyTheme(getStoredTheme());

    // ----------------------------------------------------
    // ROLE-BASED NOTIFICATION CONTROLLER
    // ----------------------------------------------------
    let notifsPollInterval = null;

    async function fetchUserNotifications(userId) {
        if (!userId) return [];
        try {
            const res = await fetch(`/api/notifications/${userId}`);
            if (!res.ok) return [];
            const data = await res.json();
            return data.notifications || [];
        } catch (e) {
            return [];
        }
    }

    async function markNotificationRead(id, userId) {
        try {
            await fetch(`/api/notifications/${id}/read`, { method: "PUT" });
            updateNotificationsUI(userId);
        } catch (e) {}
    }

    async function markAllNotificationsRead(userId) {
        try {
            await fetch(`/api/notifications/${userId}/read-all`, { method: "PUT" });
            updateNotificationsUI(userId);
        } catch (e) {}
    }

    async function updateNotificationsUI(userId) {
        const notifs = await fetchUserNotifications(userId);
        const badge = document.getElementById("navNotifBadge");
        const listContainer = document.getElementById("navNotifList");

        const unreadCount = notifs.filter(n => !n.isRead && !n.read).length;

        if (badge) {
            if (unreadCount > 0) {
                badge.textContent = unreadCount > 9 ? "9+" : String(unreadCount);
                badge.style.display = "flex";
            } else {
                badge.style.display = "none";
            }
        }

        if (listContainer) {
            if (!notifs.length) {
                listContainer.innerHTML = '<div class="notif-empty-state"><span style="font-size:24px;">📭</span><p>No notifications yet</p></div>';
                return;
            }

            listContainer.innerHTML = notifs.map(n => {
                const isUnread = !n.isRead && !n.read;
                const timeStr = n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }) : "";
                let icon = "🔔";
                if (n.type === "security_alert") icon = "🛡️";
                else if (n.title && n.title.includes("Hotel")) icon = "🏨";
                else if (n.title && n.title.includes("Transport")) icon = "🚌";
                else if (n.title && n.title.includes("Guide")) icon = "🧭";
                else if (n.title && n.title.includes("Review")) icon = "⭐";
                else if (n.title && n.title.includes("Trip")) icon = "🗺️";

                return `
                    <div class="notif-item ${isUnread ? 'unread' : 'read'}" data-id="${n.id}">
                        <div class="notif-item-icon">${icon}</div>
                        <div class="notif-item-content">
                            <div class="notif-item-title">${escapeHTML(n.title)}</div>
                            <div class="notif-item-msg">${escapeHTML(n.message)}</div>
                            <div class="notif-item-time">${timeStr}</div>
                        </div>
                        ${isUnread ? `<button type="button" class="btn-mark-read" data-id="${n.id}" title="Mark as read">✓</button>` : ''}
                    </div>
                `;
            }).join("");

            listContainer.querySelectorAll(".btn-mark-read").forEach(btn => {
                btn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    const notifId = btn.getAttribute("data-id");
                    markNotificationRead(notifId, userId);
                });
            });
        }
    }

    function escapeHTML(str) {
        return String(str || "").replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
    }

    // ----------------------------------------------------
    // SETUP UNIVERSAL NAVBAR
    // ----------------------------------------------------
    function setupUniversalNavbar() {
        const navLinks = document.querySelector(".nav-links");
        if (!navLinks) return;

        // Clean up any duplicate or obsolete elements
        const duplicateBadges = document.querySelectorAll("#navActiveUserBadge");
        duplicateBadges.forEach(b => b.remove());

        const obsoleteStaticIds = ["navProfileBtn", "logoutBtn", "adminLogoutBtn", "loginBtn", "signupBtn"];
        obsoleteStaticIds.forEach(id => {
            const el = document.getElementById(id);
            if (el && el.parentElement === navLinks) el.remove();
        });

        // Remove redundant "Explore Districts" if present
        Array.from(navLinks.querySelectorAll("a")).forEach(a => {
            const txt = (a.textContent || "").trim();
            if (txt === "Explore Districts") a.remove();
            if (txt === "Hotel Booking") a.textContent = "Hotels";
            if (txt === "Bus / Train / Flight") a.textContent = "Transport";
        });

        // 1. Ensure primary navigation links
        ensureNavLink(navLinks, "index.html", "Home", true);
        ensureNavLink(navLinks, "hotel-booking.html", "Hotels");
        ensureNavLink(navLinks, "transport.html", "Transport");
        ensureNavLink(navLinks, "guides.html", "Guides");
        ensureNavLink(navLinks, "booking.html", "Plan Trip");
        ensureNavLink(navLinks, "64-districts.html", "64 Districts");
        ensureNavLink(navLinks, "route-map.html", "Route Map");

        // 2. Get current logged in user
        let user = null;
        try {
            user = JSON.parse(sessionStorage.getItem("travelKoriUser") || "null");
        } catch (e) {
            user = null;
        }

        // 3. Ensure container for auth actions & controls
        let authArea = document.getElementById("navUserArea");
        if (!authArea) {
            authArea = document.createElement("div");
            authArea.id = "navUserArea";
            authArea.className = "nav-user-container";
            navLinks.appendChild(authArea);
        }

        // Dark mode button element HTML
        const currentTheme = getStoredTheme();
        const themeBtnHtml = `
            <button type="button" class="theme-toggle-btn modern-theme-btn" id="navThemeToggleBtn" aria-label="Toggle theme">
                ${currentTheme === "dark" ? "☀️ Light" : "🌙 Dark"}
            </button>
        `;

        if (user && user.id) {
            const role = (user.userType || "traveler").toLowerCase();
            const isAdmin = role === "admin";
            const isGuide = role === "guide";
            const isHotel = role === "hotel";
            const isTransport = role === "transport";
            const displayName = user.fullName || user.name || (user.user && (user.user.fullName || user.user.name)) || (isAdmin ? "Admin" : (isGuide ? "Tour Guide" : (isHotel ? "Hotel Partner" : (isTransport ? "Transport Partner" : "Traveler"))));

            let roleIcon = "👤";
            let targetHref = "dashboard.html";
            let targetLabel = "Dashboard";

            if (isAdmin) {
                roleIcon = "🛡️";
                targetHref = "admin.html";
                targetLabel = "Admin Panel";
            } else if (isGuide) {
                roleIcon = "🧭";
                targetHref = "guide-portal.html";
                targetLabel = "Guide Portal";
            } else if (isHotel) {
                roleIcon = "🏨";
                targetHref = "hotel-portal.html";
                targetLabel = "Hotel Portal";
            } else if (isTransport) {
                roleIcon = "🚌";
                targetHref = "transport-portal.html";
                targetLabel = "Transport Portal";
            }

            // Custom photo check
            let avatarHtml = `<span style="font-size:14px;">${roleIcon}</span>`;
            if (user.avatar && (user.avatar.startsWith("data:image") || user.avatar.startsWith("http") || user.avatar.startsWith("/"))) {
                avatarHtml = `<img src="${user.avatar}" alt="Avatar" class="nav-avatar-img">`;
            }

            authArea.innerHTML = `
                <!-- Notification Bell with Dropdown -->
                <div class="nav-notif-wrapper" id="navNotifWrapper">
                    <button type="button" class="nav-notif-btn" id="navNotifBtn" aria-label="Notifications" title="Notifications">
                        🔔
                        <span class="nav-notif-badge" id="navNotifBadge" style="display:none;">0</span>
                    </button>
                    <div class="nav-notif-dropdown" id="navNotifDropdown" style="display:none;">
                        <div class="nav-notif-header">
                            <div>
                                <h4 style="margin:0; font-size:14px; font-weight:800; color:var(--text-main, #0f172a);">Notifications</h4>
                                <small style="color:#64748b; font-size:11px;">Real-time account alerts</small>
                            </div>
                            <button type="button" class="notif-mark-all-btn" id="notifMarkAllBtn">Mark all as read</button>
                        </div>
                        <div class="nav-notif-list" id="navNotifList">
                            <div class="notif-empty-state"><p>Loading notifications...</p></div>
                        </div>
                    </div>
                </div>

                ${themeBtnHtml}

                <a href="my-profile.html" class="user-active-badge nav-user-badge ${isAdmin ? 'admin-badge' : ''}" title="View & Edit Profile / Upload Photo">
                    ${avatarHtml}
                    <span class="nav-badge-name">${escapeHTML(displayName)}</span>
                </a>

                <a href="${targetHref}" id="navProfileLink" class="nav-portal-btn">
                    <span>${targetLabel}</span> <span>→</span>
                </a>

                <button id="navLogoutBtn" type="button" class="nav-logout-btn">
                    Logout
                </button>
            `;

            // Setup Notification dropdown events
            const notifBtn = document.getElementById("navNotifBtn");
            const notifDropdown = document.getElementById("navNotifDropdown");
            const markAllBtn = document.getElementById("notifMarkAllBtn");

            if (notifBtn && notifDropdown) {
                notifBtn.addEventListener("click", function (e) {
                    e.stopPropagation();
                    const isOpen = notifDropdown.style.display === "block";
                    notifDropdown.style.display = isOpen ? "none" : "block";
                    if (!isOpen) {
                        updateNotificationsUI(user.id);
                    }
                });

                document.addEventListener("click", function (e) {
                    if (notifDropdown && !notifDropdown.contains(e.target) && e.target !== notifBtn) {
                        notifDropdown.style.display = "none";
                    }
                });
            }

            if (markAllBtn) {
                markAllBtn.addEventListener("click", function () {
                    markAllNotificationsRead(user.id);
                });
            }

            // Initial fetch & poll every 25 seconds
            updateNotificationsUI(user.id);
            if (notifsPollInterval) clearInterval(notifsPollInterval);
            notifsPollInterval = setInterval(() => updateNotificationsUI(user.id), 25000);

            // Setup Logout
            document.getElementById("navLogoutBtn")?.addEventListener("click", function () {
                sessionStorage.removeItem("travelKoriUser");
                sessionStorage.removeItem("travelKoriPendingHotelSearch");
                window.location.href = "index.html";
            });

        } else {
            // Logged out
            authArea.innerHTML = `
                ${themeBtnHtml}
                <button id="navLoginBtn" type="button" class="modern-nav-btn modern-nav-login-btn">Login</button>
                <button id="navSignupBtn" type="button" class="modern-nav-btn modern-nav-signup-btn">Sign Up</button>
            `;

            document.getElementById("navLoginBtn")?.addEventListener("click", () => window.location.href = "login.html");
            document.getElementById("navSignupBtn")?.addEventListener("click", () => window.location.href = "signup.html");
        }

        // Theme toggle listener
        document.querySelectorAll(".theme-toggle-btn").forEach(btn => {
            btn.addEventListener("click", toggleTheme);
        });

        // Highlight active nav item
        highlightActiveNavLink(navLinks);
    }

    function ensureNavLink(navLinks, href, label, insertAtStart) {
        let link = navLinks.querySelector(`a[href="${href}"]`);
        const authAreaRef = document.getElementById("navUserArea");
        if (!link) {
            link = document.createElement("a");
            link.href = href;
            link.textContent = label;
            if (insertAtStart && navLinks.firstChild) {
                navLinks.insertBefore(link, navLinks.firstChild);
            } else if (authAreaRef) {
                navLinks.insertBefore(link, authAreaRef);
            } else {
                navLinks.appendChild(link);
            }
        } else {
            link.textContent = label;
        }
    }

    function highlightActiveNavLink(navLinks) {
        const currentPath = (window.location.pathname || "").toLowerCase();
        const anchors = navLinks.querySelectorAll('a:not(#navProfileLink):not(.user-active-badge)');
        anchors.forEach(a => {
            const href = (a.getAttribute('href') || '').toLowerCase();
            let isActive = false;
            if (currentPath.includes("booking.html") && href.includes("booking")) isActive = true;
            else if (currentPath.includes("64-districts.html") && href.includes("64-districts")) isActive = true;
            else if (currentPath.includes("hotel-booking.html") && href.includes("hotel-booking")) isActive = true;
            else if (currentPath.includes("transport.html") && href.includes("transport")) isActive = true;
            else if (currentPath.includes("guides.html") && href.includes("guides")) isActive = true;
            else if (currentPath.includes("route-map.html") && href.includes("route-map")) isActive = true;
            else if ((currentPath.endsWith("index.html") || currentPath.endsWith("/") || currentPath === "") && href === "index.html") isActive = true;

            if (isActive) a.classList.add("active");
            else a.classList.remove("active");
        });
    }

    // Expose Global Dark Mode and Setup
    window.TravelKoriTheme = {
        getTheme: getStoredTheme,
        applyTheme: applyTheme,
        toggleTheme: toggleTheme
    };
    window.TravelKoriNav = {
        updateNav: setupUniversalNavbar
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", setupUniversalNavbar);
    } else {
        setupUniversalNavbar();
    }
})();
