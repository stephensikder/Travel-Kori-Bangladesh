
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
