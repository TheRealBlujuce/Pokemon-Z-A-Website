import { login, logout, getCurrentUser } from "./firebaseData.js"; // your auth file

document.addEventListener("DOMContentLoaded", () => {

    // --- Prevent multiple modals ---
    if (!document.getElementById("login-modal")) {
        loadLoginModal();
    }

});

async function loadLoginModal() {
    const response = await fetch("../html/loginModal.html");
    const modalHTML = await response.text();

    // Insert it at the end of body only once
    document.body.insertAdjacentHTML("beforeend", modalHTML);

    const loginModal = document.getElementById("login-modal");
    const closeLogin = document.getElementById("close-login");
    const loginForm = document.getElementById("login-form");
    const loginError = document.getElementById("login-error");
    const logoutBtn = document.getElementById("logout-btn");
    const loginBtn = document.getElementById("login-btn");

    // --- Show / hide modal ---
    function showLoginModal() {
        loginModal.classList.remove("hidden");
        loginModal.classList.add("flex");
        loginError.classList.add("hidden");
    }

    function hideLoginModal() {
        loginModal.classList.add("hidden");
        loginModal.classList.remove("flex");
    }

    loginBtn.addEventListener("click", showLoginModal);
    closeLogin.addEventListener("click", hideLoginModal);

    // --- Login ---
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        try {
            const user = await login(email, password);
            alert(`Logged in as ${user.email}`);
            hideLoginModal();

            // Show admin button if this is the admin
            const adminEmail = "willmarda@icloud.com"; // replace with your admin email
            const toggleBtn = document.getElementById("admin-btn");
            if (user.email === adminEmail && toggleBtn) {
                toggleBtn.style.display = "flex";
            }

        } catch (err) {
            loginError.textContent = err.message;
            loginError.classList.remove("hidden");
        }
    });

    // --- Logout ---
    logoutBtn.addEventListener("click", async () => {
        try {
            const user = getCurrentUser(); // get user before logging out
            if (!user) return alert("No user is currently logged in.");

            await logout();

            alert(`Logged out from ${user.email}`);
            hideLoginModal();

            // Hide admin button on logout
            const toggleBtn = document.getElementById("admin-btn");
            if (toggleBtn) toggleBtn.style.display = "none";

        } catch (err) {
            console.error(err);
            alert(`Logout failed: ${err.message}`);
        }
    });

    // --- Optional: show/hide admin button on page load if already logged in ---
    const currentUser = getCurrentUser();
    const toggleBtn = document.getElementById("admin-btn");
    const adminEmail = "willmarda@icloud.com";
    if (currentUser && currentUser.email === adminEmail && toggleBtn) {
        toggleBtn.style.display = "flex";
    } else if (toggleBtn) {
        toggleBtn.style.display = "none";
    }
}
