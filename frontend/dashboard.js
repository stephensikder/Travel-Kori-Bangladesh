
const storedUser = sessionStorage.getItem("travelKoriUser");

if (!storedUser) {
    window.location.href = "login.html";
} else {
    const user = JSON.parse(storedUser);

    document.getElementById("userName").textContent = user.fullName;
    document.getElementById("userEmail").textContent = user.email;
}

document.getElementById("logoutBtn").addEventListener("click", function () {
    sessionStorage.removeItem("travelKoriUser");
    window.location.href = "login.html";
});
