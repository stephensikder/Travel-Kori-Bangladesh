// ===================================================
// TRAVEL KORI BANGLADESH - UNIVERSAL NAVBAR & UI SYSTEM
// Features: Dark Mode Toggle, Role Notifications, Navigation Consistency
// ===================================================

(function () {
    "use strict";

    // ----------------------------------------------------
    // PROFESSIONAL 2D SVG ICONS REPOSITORY
    // ----------------------------------------------------
    const ICONS = {
        bell: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path></svg>`,
        user: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
        shield: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
        compass: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>`,
        building: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path></svg>`,
        bus: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="14" x="4" y="4" rx="2"></rect><path d="M4 10h16"></path><circle cx="7" cy="15" r="1"></circle><circle cx="17" cy="15" r="1"></circle></svg>`,
        check: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
        menu: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"></line><line x1="4" x2="20" y1="6" y2="6"></line><line x1="4" x2="20" y1="18" y2="18"></line></svg>`
    };

    // ----------------------------------------------------
    // ENFORCE CLEAN LIGHT SYSTEM (Dark Mode Removed)
    // ----------------------------------------------------
    try {
        localStorage.removeItem("travelKoriTheme");
        document.documentElement.removeAttribute("data-theme");
        if (document.body) {
            document.body.classList.remove("dark-theme");
        }
    } catch (e) {}

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
                let iconSvg = ICONS.bell;
                if (n.type === "security_alert") iconSvg = ICONS.shield;
                else if (n.title && n.title.includes("Hotel")) iconSvg = ICONS.building;
                else if (n.title && n.title.includes("Transport")) iconSvg = ICONS.bus;
                else if (n.title && n.title.includes("Guide")) iconSvg = ICONS.compass;

                return `
                    <div class="notif-item ${isUnread ? 'unread' : 'read'}" data-id="${n.id}">
                        <div class="notif-item-icon">${iconSvg}</div>
                        <div class="notif-item-content">
                            <div class="notif-item-title">${escapeHTML(n.title)}</div>
                            <div class="notif-item-msg">${escapeHTML(n.message)}</div>
                            <div class="notif-item-time">${timeStr}</div>
                        </div>
                        ${isUnread ? `<button type="button" class="btn-mark-read" data-id="${n.id}" title="Mark as read">${ICONS.check}</button>` : ''}
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

        // 1. Retrieve current logged in user FIRST
        let user = null;
        try {
            user = JSON.parse(sessionStorage.getItem("travelKoriUser") || "null");
        } catch (e) {
            user = null;
        }

        const role = ((user && user.userType) || "").toLowerCase();
        const isAdmin = role === "admin";
        const currentPath = (window.location.pathname || "").toLowerCase();
        const isCurrentPageAdmin = currentPath.includes("admin.html");

        // Clean up any duplicate or obsolete elements
        const duplicateBadges = document.querySelectorAll("#navActiveUserBadge");
        duplicateBadges.forEach(b => b.remove());

        const obsoleteStaticIds = ["navProfileBtn", "logoutBtn", "adminLogoutBtn", "loginBtn", "signupBtn"];
        obsoleteStaticIds.forEach(id => {
            const el = document.getElementById(id);
            if (el && el.parentElement === navLinks) el.remove();
        });

        // Redirect logo to admin panel if administrator
        const logo = document.querySelector(".navbar a.logo, header.navbar a.logo");
        if (logo && isAdmin) {
            logo.href = "admin.html";
        }

        // Strict Admin Navigation Isolation:
        // For authenticated System Administrator accounts or admin pages,
        // strictly REMOVE all public navigation links so ONLY:
        // 1. Logo & brand name
        // 2. Notification bell
        // 3. System Administrator profile/name
        // 4. Admin Panel button
        // 5. Logout button
        // are present.
        if (isAdmin || isCurrentPageAdmin) {
            Array.from(navLinks.querySelectorAll("a:not(#navProfileLink):not(.user-active-badge)")).forEach(a => a.remove());
        } else {
            // Remove redundant "Explore Districts" if present
            Array.from(navLinks.querySelectorAll("a")).forEach(a => {
                const txt = (a.textContent || "").trim();
                if (txt === "Explore Districts") a.remove();
                if (txt === "Hotel Booking") a.textContent = "Hotels";
                if (txt === "Bus / Train / Flight") a.textContent = "Transport";
            });

            // Ensure primary navigation links for public / user pages
            ensureNavLink(navLinks, "index.html", "Home", true);
            ensureNavLink(navLinks, "hotel-booking.html", "Hotels");
            ensureNavLink(navLinks, "transport.html", "Transport");
            ensureNavLink(navLinks, "guides.html", "Guides");
            ensureNavLink(navLinks, "booking.html", "Plan Trip");
            ensureNavLink(navLinks, "64-districts.html", "64 Districts");
            ensureNavLink(navLinks, "route-map.html", "Route Map");
        }

        // 2. Ensure container for auth actions & controls
        let authArea = document.getElementById("navUserArea");
        if (!authArea) {
            authArea = document.createElement("div");
            authArea.id = "navUserArea";
            authArea.className = "nav-user-container";
            navLinks.appendChild(authArea);
        }

        // Mobile Hamburger Menu Injection
        const navbar = document.querySelector(".navbar");
        if (navbar && !navbar.querySelector(".nav-hamburger-btn")) {
            const hamburger = document.createElement("button");
            hamburger.type = "button";
            hamburger.className = "nav-hamburger-btn";
            hamburger.setAttribute("aria-label", "Toggle navigation menu");
            hamburger.innerHTML = ICONS.menu;
            navbar.appendChild(hamburger);

            hamburger.addEventListener("click", (e) => {
                e.stopPropagation();
                navLinks.classList.toggle("nav-mobile-open");
            });

            document.addEventListener("click", (e) => {
                if (!navbar.contains(e.target)) {
                    navLinks.classList.remove("nav-mobile-open");
                }
            });
        }

        // Clean up any stray theme buttons
        document.querySelectorAll(".theme-toggle-btn, #navThemeToggleBtn").forEach(b => b.remove());

        if (user && user.id) {
            const role = (user.userType || "traveler").toLowerCase();
            const isAdmin = role === "admin";
            const isGuide = role === "guide";
            const isHotel = role === "hotel";
            const isTransport = role === "transport";
            const displayName = user.fullName || user.name || (user.user && (user.user.fullName || user.user.name)) || (isAdmin ? "System Administrator" : (isGuide ? "Tour Guide" : (isHotel ? "Hotel Partner" : (isTransport ? "Transport Partner" : "Traveler"))));

            let roleSvg = ICONS.user;
            let targetHref = "dashboard.html";
            let targetLabel = "Dashboard";

            if (isAdmin) {
                roleSvg = ICONS.shield;
                targetHref = "admin.html";
                targetLabel = "Admin Panel";
            } else if (isGuide) {
                roleSvg = ICONS.compass;
                targetHref = "guide-portal.html";
                targetLabel = "Guide Portal";
            } else if (isHotel) {
                roleSvg = ICONS.building;
                targetHref = "hotel-portal.html";
                targetLabel = "Hotel Portal";
            } else if (isTransport) {
                roleSvg = ICONS.bus;
                targetHref = "transport-portal.html";
                targetLabel = "Transport Portal";
            }

            // Custom photo check - retrieve latest profile picture or clean 2D user icon
            const userAvatarUrl = user.avatar || user.profilePhoto || "";
            let avatarHtml = `<span class="nav-avatar-placeholder" aria-hidden="true">${ICONS.user}</span>`;
            if (userAvatarUrl && (userAvatarUrl.startsWith("data:image") || userAvatarUrl.startsWith("http") || userAvatarUrl.startsWith("/"))) {
                avatarHtml = `<img src="${userAvatarUrl}" alt="Profile Photo" class="nav-avatar-img">`;
            }

            authArea.innerHTML = `
                <!-- Notification Bell with Dropdown -->
                <div class="nav-notif-wrapper" id="navNotifWrapper">
                    <button type="button" class="nav-notif-btn" id="navNotifBtn" aria-label="Notifications" title="Notifications">
                        ${ICONS.bell}
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

                <a href="my-profile.html" class="user-active-badge nav-user-badge ${isAdmin ? 'admin-badge' : ''}" title="${isAdmin ? 'System Administrator Profile' : 'View & Edit Profile / Upload Photo'}">
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

            // Background sync with database profile to always ensure latest photo
            if (user.id && !window.__navProfileSyncing) {
                window.__navProfileSyncing = true;
                fetch(`/api/users/profile/${user.id}`)
                    .then(r => r.ok ? r.json() : null)
                    .then(data => {
                        window.__navProfileSyncing = false;
                        if (data && data.profile) {
                            const liveAvatar = data.profile.avatar || "";
                            if (liveAvatar && liveAvatar !== user.avatar) {
                                user.avatar = liveAvatar;
                                sessionStorage.setItem("travelKoriUser", JSON.stringify(user));
                                const badge = document.querySelector(".user-active-badge");
                                if (badge) {
                                    const existingImg = badge.querySelector(".nav-avatar-img");
                                    const existingHolder = badge.querySelector(".nav-avatar-placeholder, .nav-role-icon");
                                    if (existingImg) {
                                        existingImg.src = liveAvatar;
                                    } else if (existingHolder) {
                                        const newImg = document.createElement("img");
                                        newImg.src = liveAvatar;
                                        newImg.alt = "Profile Photo";
                                        newImg.className = "nav-avatar-img";
                                        existingHolder.replaceWith(newImg);
                                    }
                                }
                            }
                        }
                    })
                    .catch(() => { window.__navProfileSyncing = false; });
            }

            // Setup Logout
            document.getElementById("navLogoutBtn")?.addEventListener("click", function () {
                sessionStorage.removeItem("travelKoriUser");
                sessionStorage.removeItem("travelKoriPendingHotelSearch");
                window.location.href = "index.html";
            });

        } else {
            // Logged out
            authArea.innerHTML = `
                <button id="navLoginBtn" type="button" class="modern-nav-btn modern-nav-login-btn">Login</button>
                <button id="navSignupBtn" type="button" class="modern-nav-btn modern-nav-signup-btn">Sign Up</button>
            `;

            document.getElementById("navLoginBtn")?.addEventListener("click", () => window.location.href = "login.html");
            document.getElementById("navSignupBtn")?.addEventListener("click", () => window.location.href = "signup.html");
        }

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

    // ----------------------------------------------------
    // PHASE 6: GLOBAL FLOATING BACK-TO-TOP BUTTON
    // ----------------------------------------------------
    function initBackToTop() {
        if (document.getElementById("travelKoriBackToTop")) return;
        const btn = document.createElement("button");
        btn.id = "travelKoriBackToTop";
        btn.className = "back-to-top-btn";
        btn.setAttribute("type", "button");
        btn.setAttribute("aria-label", "Back to Top");
        btn.setAttribute("title", "Back to Top");
        btn.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>`;
        document.body.appendChild(btn);

        window.addEventListener("scroll", () => {
            if (window.scrollY > 350) {
                btn.classList.add("visible");
            } else {
                btn.classList.remove("visible");
            }
        }, { passive: true });

        btn.addEventListener("click", () => {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }

    window.TravelKoriNav = {
        updateNav: setupUniversalNavbar
    };

    window.addEventListener("travelKoriProfileUpdated", function() {
        setupUniversalNavbar();
    });
    window.addEventListener("storage", function(e) {
        if (e.key === "travelKoriUser") {
            setupUniversalNavbar();
        }
    });

    function initAll() {
        setupUniversalNavbar();
        initBackToTop();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initAll);
    } else {
        initAll();
    }
})();
