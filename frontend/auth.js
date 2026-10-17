
const API_URL = "http://localhost:5000/api/auth";

const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");


// Login form
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

        loginMessage.textContent = "Logging in...";
        loginMessage.style.color = "#087f5b";

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Login failed.");
            }

            if (!data.user || !data.user.id) {
                throw new Error("Login response does not contain user information.");
            }

            // Store logged-in user information
           sessionStorage.setItem(
    "travelKoriUser",
    JSON.stringify({
        id: data.user.id,
        fullName: data.user.fullName,
        email: data.user.email,
        userType: data.user.userType || "traveler"
    })
);

            loginMessage.textContent =
                "Login successful! Redirecting to dashboard...";
            loginMessage.style.color = "#087f5b";

            // Redirect only once
            if (data.user.userType === "admin") {
    window.location.href = "admin.html";
} else {
    window.location.href = "dashboard.html";
}

        } catch (error) {
            console.error("Login error:", error);

            loginMessage.textContent =
                error.message === "Failed to fetch"
                    ? "Cannot connect to backend. Start the server first."
                    : error.message;

            loginMessage.style.color = "red";
        }
    });
}



// Sign Up form
const signupForm = document.getElementById("signupForm");
const signupMessage = document.getElementById("signupMessage");

if (signupForm) {
    signupForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const fullName = document.getElementById("fullName").value.trim();
        const email = document.getElementById("signupEmail").value.trim();
        const password = document.getElementById("signupPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (!fullName || !email || !password || !confirmPassword) {
            signupMessage.textContent = "Please fill in all fields.";
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
            signupMessage.textContent = "Passwords do not match.";
            signupMessage.style.color = "red";
            return;
        }

        signupMessage.textContent = "Creating your account...";
        signupMessage.style.color = "#087f5b";

        try {
            const response = await fetch(`${API_URL}/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ fullName, email, password })
            });

            const responseText = await response.text();
            let data;

            try {
                data = JSON.parse(responseText);
            } catch {
                throw new Error("Unexpected server response. Check the backend.");
            }

            if (!response.ok) {
                throw new Error(data.message || "Registration failed.");
            }

            signupMessage.textContent =
                data.message + " You can now log in.";
            signupMessage.style.color = "#087f5b";

            signupForm.reset();

        } catch (error) {
            signupMessage.textContent =
                error.message === "Failed to fetch"
                    ? "Cannot connect to the backend. Start the server first."
                    : error.message;

            signupMessage.style.color = "red";
        }
    });
}
