
const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        if (email === "" || password === "") {
            loginMessage.textContent = "Please fill in all fields.";
            loginMessage.style.color = "red";
            return;
        }

        loginMessage.textContent =
            "Form validation successful. Backend authentication is not connected yet.";
        loginMessage.style.color = "#087f5b";
    });
}

// Sign Up form validation
const signupForm = document.getElementById("signupForm");
const signupMessage = document.getElementById("signupMessage");

if (signupForm) {
    signupForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const fullName =
            document.getElementById("fullName").value.trim();

        const email =
            document.getElementById("signupEmail").value.trim();

        const password =
            document.getElementById("signupPassword").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;

        if (fullName === "" || email === "" ||
            password === "" || confirmPassword === "") {
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
            signupMessage.textContent =
                "Passwords do not match. Please try again.";
            signupMessage.style.color = "red";
            return;
        }

        signupMessage.textContent =
            "Form validation successful. Account creation will be available after backend integration.";
        signupMessage.style.color = "#087f5b";
    });
}
