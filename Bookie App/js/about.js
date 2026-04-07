// ── Auth guard ────────────────────────────────────────────────
const dashUser = JSON.parse(sessionStorage.getItem("currentUser"));
if (!dashUser) {
    window.location.href = "Login.html";
}

// ── Display username 

const usernameEl = document.getElementById("username");
if (usernameEl) {
    usernameEl.textContent = dashUser?.username || dashUser?.name || dashUser?.email || "Student";
}

// ── Nav toggle
const navToggle = document.querySelector(".nav-toggle");
const nav       = document.querySelector("nav");

if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
        navToggle.classList.toggle("open");
        nav.classList.toggle("open");
    });

    nav.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            navToggle.classList.remove("open");
            nav.classList.remove("open");
        });
    });
}
