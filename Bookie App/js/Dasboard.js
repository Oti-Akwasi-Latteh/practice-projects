// =============================================
// js/Dasboard.js  (user bookings dashboard)
// =============================================

const DASH_API = "http://localhost:9000/api";

// ── Auth guard ────────────────────────────────────────────────
const dashUser = JSON.parse(sessionStorage.getItem("currentUser"));
if (!dashUser) window.location.href = "Login.html";

// ── Username ──────────────────────────────────────────────────
const usernameEl = document.getElementById("username");
if (usernameEl) usernameEl.textContent = dashUser?.username || "Student";

// ── Hamburger toggle ──────────────────────────────────────────
const hamburger = document.getElementById("hamburger");
const sidebar   = document.getElementById("sidebar");
const overlay   = document.getElementById("overlay");

function openSidebar() {
  sidebar?.classList.add("open");
  overlay?.classList.add("show");
}

function closeSidebar() {
  sidebar?.classList.remove("open");
  overlay?.classList.remove("show");
}

hamburger?.addEventListener("click", () => {
  sidebar?.classList.contains("open") ? closeSidebar() : openSidebar();
});

overlay?.addEventListener("click", closeSidebar);

// Close sidebar when a menu link is clicked on mobile
document.querySelectorAll(".menu li a").forEach(link => {
  link.addEventListener("click", () => {
    if (window.innerWidth <= 768) closeSidebar();
  });
});

// ── Logout ────────────────────────────────────────────────────
document.getElementById("remove-user")?.addEventListener("click", () => {
  sessionStorage.clear();
  localStorage.removeItem("bookedHostels");
  alert("Logged out successfully");
  window.location.href = "Login.html";
});

// ── Load this user's applications ─────────────────────────────
async function loadUserApplications() {
  const container = document.getElementById("dashboardContainer");
  if (!container) return;

  container.innerHTML = `<div class="booking-card"><p>Loading your bookings...</p></div>`;

  try {
    const userId = dashUser._id || dashUser.id;
    const res    = await fetch(`${DASH_API}/students/user/${userId}`);

    let apps;
    try {
      apps = await res.json();
    } catch (err) {
      console.error("Invalid JSON response", err);
      container.innerHTML = `
        <div class="booking-card error">
          <h3>Error</h3>
          <p>Server returned invalid data. Is the backend running?</p>
        </div>`;
      return;
    }

    if (!res.ok) throw new Error(apps.error || "Failed to load applications");

    container.innerHTML = "";

    if (!apps.length) {
      container.innerHTML = `
        <div class="booking-card empty">
          <h3>No submitted applications</h3>
          <p>You have not applied for any hostel yet.<br>
             Go to the <a href="Rooms.html" style="color:#1f58b2;">Rooms page</a> to book one.</p>
        </div>`;
      return;
    }

    apps.forEach(app => {
      const status      = app.applicationStatus || "Pending";
      const statusClass = status.toLowerCase();
      const card        = document.createElement("div");
      card.className    = "booking-card";
      card.innerHTML    = `
        <div style="flex:1;">
          <div class="booking-header">
            <h3>${app.hostel || "N/A"}</h3>
            <span class="status ${statusClass}">${status}</span>
          </div>
          <div class="booking-body">
            <p><strong>Name:</strong> ${app.fullName}</p>
            <p><strong>Gender:</strong> ${app.gender}</p>
            <p><strong>Room:</strong> ${app.roomId?.roomNumber || "Not Assigned"}</p>
            <p><strong>Date Applied:</strong> ${new Date(app.createdAt).toLocaleDateString()}</p>
          </div>
        </div>`;
      container.appendChild(card);
    });

  } catch (err) {
    console.error(err);
    container.innerHTML = `
      <div class="booking-card error">
        <h3>Error</h3>
        <p>${err.message}</p>
      </div>`;
  }
}

document.addEventListener("DOMContentLoaded", loadUserApplications);