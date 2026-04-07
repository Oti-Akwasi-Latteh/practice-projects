// ── Auth guard ────────────────────────────────────────────────
const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
if (!currentUser) {
    window.location.href = "Login.html";
}

// ── Display username
const usernameEl = document.getElementById("username");
if (usernameEl) {
    usernameEl.textContent = currentUser?.username || currentUser?.name || currentUser?.email || "Student";
}

// ── Contact form submission 
const contactForm = document.getElementById("contactForm");
if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
        e.preventDefault();
        alert("Thank you! Your message has been sent.");
        this.reset();
    });
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