const API_URL = "http://localhost:5000/api/auth";

const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

const travelerBtn = document.getElementById("loginAsTraveler");
const adminBtn = document.getElementById("loginAsAdmin");
const loginSubmitBtn = document.getElementById("loginSubmitBtn");
const selectedRoleText = document.getElementById("selectedRoleText");

let selectedLoginRole = "traveler";

// ============================================
// SELECT LOGIN ROLE
// ============================================

function selectLoginRole(role) {
    selectedLoginRole = role;

    if (travelerBtn && adminBtn) {
        travelerBtn.classList.toggle(
            "active",
            role === "traveler"
        );

        adminBtn.classList.toggle(
            "active",
            role === "admin"
        );

        travelerBtn.setAttribute(
            "aria-pressed",
            String(role === "traveler")
        );

        adminBtn.setAttribute(
            "aria-pressed",
            String(role === "admin")
        );
    }

    if (loginSubmitBtn) {
        loginSubmitBtn.textContent =
            role === "admin"
                ? "Login as Admin"
                : "Login as Traveler";
    }

    if (selectedRoleText) {
        selectedRoleText.textContent =
            role === "admin"
                ? "You are logging in as an Admin."
                : "You are logging in as a Traveler.";
    }

    if (loginMessage) {
        loginMessage.textContent = "";
    }
}

if (travelerBtn) {
    travelerBtn.addEventListener("click", function () {
        selectLoginRole("traveler");
    });
}

if (adminBtn) {
    adminBtn.addEventListener("click", function () {
        selectLoginRole("admin");
    });
}

// ============================================
// LOGIN FORM
// ============================================

if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document
            .getElementById("email")
            .value.trim();

        const password = document
            .getElementById("password")
            .value;

        if (!email || !password) {
            loginMessage.textContent =
                "Please fill in all fields.";

            loginMessage.style.color = "red";
            return;
        }

        loginSubmitBtn.disabled = true;
        loginSubmitBtn.textContent = "Logging in...";

        loginMessage.textContent = "Verifying your account...";
        loginMessage.style.color = "#087f5b";

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Login failed."
                );
            }

            if (!data.user || !data.user.id) {
                throw new Error(
                    "Login response does not contain user information."
                );
            }

            // Get the actual role returned by the backend.
            const actualRole = String(
                data.user.userType || "traveler"
            ).toLowerCase();

            // Check whether the selected role matches
            // the authenticated user's actual role.
            if (actualRole !== selectedLoginRole) {
                throw new Error(
                    selectedLoginRole === "admin"
                        ? "Access denied. This account is not an Admin account."
                        : "This is an Admin account. Please select Login as Admin."
                );
            }

            if (
                actualRole !== "admin" &&
                actualRole !== "traveler"
            ) {
                throw new Error(
                    "Invalid account role. Please contact the administrator."
                );
            }

            // Store authenticated user information.
            sessionStorage.setItem(
                "travelKoriUser",
                JSON.stringify({
                    id: data.user.id,
                    fullName: data.user.fullName,
                    email: data.user.email,
                    userType: actualRole
                })
            );

            loginMessage.textContent =
                "Login successful! Redirecting...";

            loginMessage.style.color = "#087f5b";

            // ========================================
            // ADMIN REDIRECT
            // ========================================

            if (actualRole === "admin") {
                sessionStorage.removeItem(
                    "travelKoriPendingHotelSearch"
                );

                window.location.href = "admin.html";
                return;
            }

            // ========================================
            // TRAVELER: PENDING HOTEL SEARCH
            // ========================================

            const pendingHotelSearch = sessionStorage.getItem(
                "travelKoriPendingHotelSearch"
            );

            if (pendingHotelSearch) {
                try {
                    const searchData = JSON.parse(
                        pendingHotelSearch
                    );

                    if (
                        searchData &&
                        typeof searchData.destination === "string" &&
                        searchData.destination.trim() !== ""
                    ) {
                        window.location.href =
                            "hotel-booking.html";

                        return;
                    }

                    sessionStorage.removeItem(
                        "travelKoriPendingHotelSearch"
                    );

                } catch (error) {
                    console.error(
                        "Invalid pending hotel search:",
                        error
                    );

                    sessionStorage.removeItem(
                        "travelKoriPendingHotelSearch"
                    );
                }
            }

            // ========================================
            // NORMAL TRAVELER REDIRECT
            // ========================================

            window.location.href = "dashboard.html";

        } catch (error) {
            console.error("Login error:", error);

            loginMessage.textContent =
                error.message === "Failed to fetch"
                    ? "Cannot connect to backend. Start the server first."
                    : error.message;

            loginMessage.style.color = "red";

        } finally {
            loginSubmitBtn.disabled = false;

            loginSubmitBtn.textContent =
                selectedLoginRole === "admin"
                    ? "Login as Admin"
                    : "Login as Traveler";
        }
    });
}

// ============================================
// SIGN UP FORM
// ============================================

const signupForm = document.getElementById("signupForm");
const signupMessage = document.getElementById("signupMessage");

if (signupForm) {
    signupForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const fullName = document
            .getElementById("fullName")
            .value.trim();

        const email = document
            .getElementById("signupEmail")
            .value.trim();

        const password = document
            .getElementById("signupPassword")
            .value;

        const confirmPassword = document
            .getElementById("confirmPassword")
            .value;

        if (!fullName || !email || !password || !confirmPassword) {
            signupMessage.textContent =
                "Please fill in all fields.";

            signupMessage.style.color = "red";
            return;
        }

        if (password.length < 8) {
            signupMessage.textContent =
                "Password must contain at least 8 characters.";

            signupMessage.style.color = "red";
            return;
        }

        if (password !== confirmPassword) {
            signupMessage.textContent =
                "Passwords do not match.";

            signupMessage.style.color = "red";
            return;
        }

        signupMessage.textContent =
            "Creating your account...";

        signupMessage.style.color = "#087f5b";

        try {
            const response = await fetch(`${API_URL}/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    fullName,
                    email,
                    password
                })
            });

            const responseText = await response.text();

            let data;

            try {
                data = JSON.parse(responseText);
            } catch {
                throw new Error(
                    "Unexpected server response. Check the backend."
                );
            }

            if (!response.ok) {
                throw new Error(
                    data.message || "Registration failed."
                );
            }

            signupMessage.textContent =
                (data.message || "Registration successful.") +
                " You can now log in.";

            signupMessage.style.color = "#087f5b";

            signupForm.reset();

        } catch (error) {
            console.error("Registration error:", error);

            signupMessage.textContent =
                error.message === "Failed to fetch"
                    ? "Cannot connect to the backend. Start the server first."
                    : error.message;

            signupMessage.style.color = "red";
        }
    });
}