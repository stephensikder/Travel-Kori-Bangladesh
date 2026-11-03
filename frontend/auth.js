const API_URL = ((window.location.origin && window.location.origin !== "null") ? window.location.origin : "") + "/api/auth";

const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

const travelerBtn = document.getElementById("loginAsTraveler");
const guideBtn = document.getElementById("loginAsGuide");
const hotelBtn = document.getElementById("loginAsHotel");
const transportBtn = document.getElementById("loginAsTransport");
const adminBtn = document.getElementById("loginAsAdmin");
const loginSubmitBtn = document.getElementById("loginSubmitBtn");
const selectedRoleText = document.getElementById("selectedRoleText");

let selectedLoginRole = "traveler";

// ============================================
// SELECT LOGIN ROLE (Traveler, Tour Guide, Hotel, Transport, Admin)
// ============================================

function selectLoginRole(role) {
    selectedLoginRole = role;

    if (travelerBtn) {
        travelerBtn.classList.toggle("active", role === "traveler");
        travelerBtn.setAttribute("aria-pressed", String(role === "traveler"));
    }
    if (guideBtn) {
        guideBtn.classList.toggle("active", role === "guide");
        guideBtn.setAttribute("aria-pressed", String(role === "guide"));
    }
    if (hotelBtn) {
        hotelBtn.classList.toggle("active", role === "hotel");
        hotelBtn.setAttribute("aria-pressed", String(role === "hotel"));
    }
    if (transportBtn) {
        transportBtn.classList.toggle("active", role === "transport");
        transportBtn.setAttribute("aria-pressed", String(role === "transport"));
    }
    if (adminBtn) {
        adminBtn.classList.toggle("active", role === "admin");
        adminBtn.setAttribute("aria-pressed", String(role === "admin"));
    }

    if (loginSubmitBtn) {
        if (role === "admin") {
            loginSubmitBtn.innerHTML = `<span>Login as Admin</span> <span class="btn-arrow">→</span>`;
        } else if (role === "guide") {
            loginSubmitBtn.innerHTML = `<span>Login as Tour Guide</span> <span class="btn-arrow">→</span>`;
        } else if (role === "hotel") {
            loginSubmitBtn.innerHTML = `<span>Login as Hotel Partner</span> <span class="btn-arrow">→</span>`;
        } else if (role === "transport") {
            loginSubmitBtn.innerHTML = `<span>Login as Transport Operator</span> <span class="btn-arrow">→</span>`;
        } else {
            loginSubmitBtn.innerHTML = `<span>Login as Traveler</span> <span class="btn-arrow">→</span>`;
        }
    }

    if (selectedRoleText) {
        if (role === "admin") {
            selectedRoleText.textContent = "You are logging in as an Admin.";
        } else if (role === "guide") {
            selectedRoleText.textContent = "You are logging in to the Tour Guide Operations Portal.";
        } else if (role === "hotel") {
            selectedRoleText.textContent = "You are logging in to the Hotel Partner Operations Portal.";
        } else if (role === "transport") {
            selectedRoleText.textContent = "You are logging in to the Transport Operations Portal.";
        } else {
            selectedRoleText.textContent = "You are logging in as a Traveler.";
        }
    }

    if (loginMessage) {
        loginMessage.textContent = "";
    }
}

if (travelerBtn) travelerBtn.addEventListener("click", () => selectLoginRole("traveler"));
if (guideBtn) guideBtn.addEventListener("click", () => selectLoginRole("guide"));
if (hotelBtn) hotelBtn.addEventListener("click", () => selectLoginRole("hotel"));
if (transportBtn) transportBtn.addEventListener("click", () => selectLoginRole("transport"));
if (adminBtn) adminBtn.addEventListener("click", () => selectLoginRole("admin"));

let lockoutTimer = null;
function startLockoutCountdown(seconds) {
    if (lockoutTimer) clearInterval(lockoutTimer);
    let remaining = Math.max(1, Math.round(seconds));
    if (loginSubmitBtn) loginSubmitBtn.disabled = true;

    function renderLockMsg() {
        if (loginMessage) {
            loginMessage.innerHTML = `⚠️ <strong>Account Temporarily Locked:</strong> 5 failed attempts reached. Please wait <span style="font-size:15px; font-weight:800; color:#dc2626; background:#fee2e2; padding:2px 8px; border-radius:6px;">${remaining}s</span> before retrying.`;
            loginMessage.style.color = "#b91c1c";
        }
    }
    renderLockMsg();

    lockoutTimer = setInterval(() => {
        remaining--;
        if (remaining <= 0) {
            clearInterval(lockoutTimer);
            lockoutTimer = null;
            if (loginSubmitBtn) {
                loginSubmitBtn.disabled = false;
                selectLoginRole(selectedLoginRole);
            }
            if (loginMessage) {
                loginMessage.textContent = "Lock period has ended. You can now try logging in again.";
                loginMessage.style.color = "#087f5b";
            }
        } else {
            renderLockMsg();
        }
    }, 1000);
}

// Global helper for demo login chips
window.fillDemo = function (email, password, role) {
    selectLoginRole(role);
    const emailInput = document.getElementById("email");
    const passInput = document.getElementById("password");
    if (emailInput) emailInput.value = email;
    if (passInput) passInput.value = password;
    if (loginMessage) {
        loginMessage.textContent = `Demo credentials populated for ${role.toUpperCase()}. Click to continue.`;
        loginMessage.style.color = "#087f5b";
    }
};

// Check URL param for role (e.g. login.html?role=hotel)
const urlParams = new URLSearchParams(window.location.search);
const requestedRole = urlParams.get("role");
if (requestedRole && ["traveler", "guide", "hotel", "transport", "admin"].includes(requestedRole)) {
    selectLoginRole(requestedRole);
}

// ============================================
// LOGIN FORM HANDLER
// ============================================

if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        if (!email || !password) {
            loginMessage.textContent = "Please fill in all fields.";
            loginMessage.style.color = "red";
            return;
        }

        loginSubmitBtn.disabled = true;
        loginSubmitBtn.textContent = "Logging in...";
        loginMessage.textContent = "Verifying your credentials...";
        loginMessage.style.color = "#087f5b";

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.locked || data.remainingSeconds) {
                    startLockoutCountdown(data.remainingSeconds || 30);
                    return;
                }
                throw new Error(data.message || "Login failed.");
            }

            if (!data.user || !data.user.id) {
                throw new Error("Login response does not contain user information.");
            }

            const actualRole = String(data.user.userType || "traveler").toLowerCase();

            // Validate that selected role matches the user's role
            if (actualRole !== selectedLoginRole) {
                if (actualRole === "admin") {
                    throw new Error("This is an Admin account. Please select Login as Admin.");
                } else if (actualRole === "guide") {
                    throw new Error("This is a Tour Guide account. Please select Tour Guide role.");
                } else if (actualRole === "hotel") {
                    throw new Error("This is a Hotel Partner account. Please select Hotel Partner role.");
                } else if (actualRole === "transport") {
                    throw new Error("This is a Transport Operator account. Please select Transport role.");
                } else {
                    throw new Error(`This account is registered as a ${actualRole}. Please select the matching role.`);
                }
            }

            // Store user session
            sessionStorage.setItem("travelKoriUser", JSON.stringify({
                id: data.user.id,
                guideId: data.user.guideId || null,
                fullName: data.user.fullName || data.user.name || "Traveler",
                name: data.user.fullName || data.user.name || "Traveler",
                email: data.user.email,
                userType: actualRole,
                hotelName: data.user.hotelName || "",
                operatorName: data.user.operatorName || "",
                transportType: data.user.transportType || "",
                district: data.user.district || ""
            }));

            loginMessage.textContent = "Login successful! Redirecting to portal...";
            loginMessage.style.color = "#087f5b";

            // Redirect based on role
            if (actualRole === "admin") {
                sessionStorage.removeItem("travelKoriPendingHotelSearch");
                window.location.href = "admin.html";
                return;
            } else if (actualRole === "guide") {
                sessionStorage.removeItem("travelKoriPendingHotelSearch");
                window.location.href = "guide-portal.html";
                return;
            } else if (actualRole === "hotel") {
                sessionStorage.removeItem("travelKoriPendingHotelSearch");
                window.location.href = "hotel-portal.html";
                return;
            } else if (actualRole === "transport") {
                sessionStorage.removeItem("travelKoriPendingHotelSearch");
                window.location.href = "transport-portal.html";
                return;
            }

            // Traveler redirect with pending hotel search support
            const pendingHotelSearch = sessionStorage.getItem("travelKoriPendingHotelSearch");
            if (pendingHotelSearch) {
                try {
                    const searchData = JSON.parse(pendingHotelSearch);
                    if (searchData && searchData.destination) {
                        sessionStorage.removeItem("travelKoriPendingHotelSearch");
                        window.location.href = `hotel-booking.html?district=${encodeURIComponent(searchData.destination)}&checkIn=${encodeURIComponent(searchData.checkIn || "")}&checkOut=${encodeURIComponent(searchData.checkOut || "")}&rooms=${encodeURIComponent(searchData.rooms || "1")}&guests=${encodeURIComponent(searchData.guests || "2")}`;
                        return;
                    }
                } catch (e) {
                    sessionStorage.removeItem("travelKoriPendingHotelSearch");
                }
            }

            window.location.href = "dashboard.html";

        } catch (error) {
            console.error("Login error:", error);
            loginMessage.textContent = error.message === "Failed to fetch"
                ? "Cannot connect to the backend. Start the server first."
                : error.message;
            loginMessage.style.color = "red";
        } finally {
            if (!lockoutTimer) {
                loginSubmitBtn.disabled = false;
                selectLoginRole(selectedLoginRole);
            }
        }
    });
}

// ============================================
// SIGN UP FORM HANDLER (Traveler, Guide, Hotel, Transport)
// ============================================

const signupForm = document.getElementById("signupForm");
const signupMessage = document.getElementById("signupMessage");
const roleBtnTraveler = document.getElementById("roleBtnTraveler");
const roleBtnGuide = document.getElementById("roleBtnGuide");
const roleBtnHotel = document.getElementById("roleBtnHotel");
const roleBtnTransport = document.getElementById("roleBtnTransport");

const guideFields = document.getElementById("guideSpecificFields");
const hotelFields = document.getElementById("hotelSpecificFields");
const transportFields = document.getElementById("transportSpecificFields");
const signupSubmitBtn = document.getElementById("signupSubmitBtn");

let selectedSignupRole = "traveler";

function setSignupRole(role) {
    selectedSignupRole = role;

    const buttons = [
        { btn: roleBtnTraveler, key: "traveler" },
        { btn: roleBtnGuide, key: "guide" },
        { btn: roleBtnHotel, key: "hotel" },
        { btn: roleBtnTransport, key: "transport" }
    ];

    buttons.forEach(item => {
        if (!item.btn) return;
        const isActive = item.key === role;
        item.btn.classList.toggle("active", isActive);
        item.btn.setAttribute("aria-pressed", String(isActive));
        // Clear any hardcoded inline styles so modern CSS classes take full effect
        item.btn.style.background = "";
        item.btn.style.color = "";
        item.btn.style.borderColor = "";
    });

    if (guideFields) guideFields.style.display = (role === "guide") ? "block" : "none";
    if (hotelFields) hotelFields.style.display = (role === "hotel") ? "block" : "none";
    if (transportFields) transportFields.style.display = (role === "transport") ? "block" : "none";

    if (signupSubmitBtn) {
        if (role === "guide") signupSubmitBtn.innerHTML = `<span>Register as Tour Guide</span> <span class="btn-arrow">→</span>`;
        else if (role === "hotel") signupSubmitBtn.innerHTML = `<span>Register as Hotel Partner</span> <span class="btn-arrow">→</span>`;
        else if (role === "transport") signupSubmitBtn.innerHTML = `<span>Register as Transport Operator</span> <span class="btn-arrow">→</span>`;
        else signupSubmitBtn.innerHTML = `<span>Create Traveler Account</span> <span class="btn-arrow">→</span>`;
    }
}

if (roleBtnTraveler) roleBtnTraveler.addEventListener("click", () => setSignupRole("traveler"));
if (roleBtnGuide) roleBtnGuide.addEventListener("click", () => setSignupRole("guide"));
if (roleBtnHotel) roleBtnHotel.addEventListener("click", () => setSignupRole("hotel"));
if (roleBtnTransport) roleBtnTransport.addEventListener("click", () => setSignupRole("transport"));

// Check signup URL param (?role=hotel, ?role=transport)
if (requestedRole && ["traveler", "guide", "hotel", "transport"].includes(requestedRole)) {
    setSignupRole(requestedRole);
}

if (signupForm) {
    signupForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const fullName = document.getElementById("fullName").value.trim();
        const email = document.getElementById("signupEmail").value.trim();
        const password = document.getElementById("signupPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (!fullName || !email || !password || !confirmPassword) {
            signupMessage.textContent = "Please fill in all required fields.";
            signupMessage.style.color = "red";
            return;
        }

        if (password.length < 8) {
            signupMessage.textContent = "Password must contain at least 8 characters.";
            signupMessage.style.color = "red";
            return;
        }

        if (password !== confirmPassword) {
            signupMessage.textContent = "Passwords do not match.";
            signupMessage.style.color = "red";
            return;
        }

        if (signupSubmitBtn) {
            signupSubmitBtn.disabled = true;
            signupSubmitBtn.textContent = "Submitting registration...";
        }

        signupMessage.textContent = "Creating your account...";
        signupMessage.style.color = "#087f5b";

        try {
            if (selectedSignupRole === "guide") {
                // Tour Guide Registration
                const phone = document.getElementById("guidePhone")?.value || "";
                const dailyRate = document.getElementById("guideDailyRate")?.value || "2000";
                const experience = document.getElementById("guideExperience")?.value || "1";
                const languages = document.getElementById("guideLanguages")?.value || "Bengali, English";
                const specialization = document.getElementById("guideSpecialization")?.value || "Dhaka";
                const bio = document.getElementById("guideBio")?.value || "";

                const res = await fetch(`${API_URL}/guide/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        fullName, email, password, phone,
                        dailyRate: Number(dailyRate),
                        experience: Number(experience),
                        languages, specialization, bio
                    })
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Guide registration failed.");

                signupMessage.innerHTML = `
                    <div style="background:#eef8f4; border:1px solid #b5e8d5; color:#087f5b; padding:12px; border-radius:8px; font-size:13px; font-weight:700;">
                        ✅ ${data.message}<br>
                        <span style="font-size:11px; font-weight:400; color:#475569;">Your account will be verified by administration. You may log in once approved.</span>
                    </div>
                `;
                signupForm.reset();
                setSignupRole("traveler");

            } else if (selectedSignupRole === "hotel") {
                // Hotel Partner Registration
                const hotelName = document.getElementById("hotelName")?.value.trim() || "";
                const district = document.getElementById("hotelDistrict")?.value.trim() || "";
                const phone = document.getElementById("hotelPhone")?.value.trim() || "";
                const minPrice = document.getElementById("hotelMinPrice")?.value || "2500";
                const stars = document.getElementById("hotelStars")?.value || "3";
                const address = document.getElementById("hotelAddress")?.value.trim() || "";
                const description = document.getElementById("hotelDescription")?.value.trim() || "";

                if (!hotelName || !district) {
                    throw new Error("Hotel name and district are required.");
                }

                const res = await fetch(`${API_URL}/hotel/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        fullName, email, password, hotelName, district, phone,
                        minPrice: Number(minPrice),
                        stars: Number(stars),
                        address, description
                    })
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Hotel registration failed.");

                signupMessage.innerHTML = `
                    <div style="background:#eef8f4; border:1px solid #b5e8d5; color:#087f5b; padding:12px; border-radius:8px; font-size:13px; font-weight:700;">
                        🏨 ${data.message} <a href="login.html?role=hotel" style="color:#087f5b; text-decoration:underline;">Click here to Login</a>
                    </div>
                `;
                signupForm.reset();
                setSignupRole("hotel");

            } else if (selectedSignupRole === "transport") {
                // Transport Operator Registration
                const operatorName = document.getElementById("transportOperator")?.value.trim() || "";
                const transportType = document.getElementById("transportType")?.value || "Bus";
                const routes = document.getElementById("transportRoutes")?.value.trim() || "";
                const phone = document.getElementById("transportPhone")?.value.trim() || "";
                const fare = document.getElementById("transportFare")?.value || "1200";
                const licenseNumber = document.getElementById("transportLicense")?.value.trim() || "";

                if (!operatorName) {
                    throw new Error("Transport operator/company name is required.");
                }

                const res = await fetch(`${API_URL}/transport/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        fullName, email, password, operatorName, transportType,
                        routes, phone, fare: Number(fare), licenseNumber
                    })
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Transport registration failed.");

                signupMessage.innerHTML = `
                    <div style="background:#fff7ed; border:1px solid #fed7aa; color:#c2410c; padding:12px; border-radius:8px; font-size:13px; font-weight:700;">
                        🚌 ${data.message} <a href="login.html?role=transport" style="color:#c2410c; text-decoration:underline;">Click here to Login</a>
                    </div>
                `;
                signupForm.reset();
                setSignupRole("transport");

            } else {
                // Traveler Registration
                const response = await fetch(`${API_URL}/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ fullName, email, password })
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.message || "Registration failed.");

                signupMessage.textContent = (data.message || "Registration successful.") + " You can now log in.";
                signupMessage.style.color = "#087f5b";
                signupForm.reset();
            }

        } catch (error) {
            console.error("Registration error:", error);
            signupMessage.textContent = error.message === "Failed to fetch"
                ? "Cannot connect to the backend. Start the server first."
                : error.message;
            signupMessage.style.color = "red";
        } finally {
            if (signupSubmitBtn) signupSubmitBtn.disabled = false;
            setSignupRole(selectedSignupRole);
        }
    });
}