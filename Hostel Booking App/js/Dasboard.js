// ================= USER SESSION =================
const currentUser = JSON.parse(localStorage.getItem("currentUser"));

if (!currentUser) {
  window.location.href = "Login.html";
}

// ================= USERNAME =================
const usernameElement = document.getElementById("username");
if (usernameElement) {
  usernameElement.textContent =
    currentUser.username || currentUser.fullName || "Student";
}

// ================= LOGOUT =================
const logoutBtn = document.getElementById("remove-user");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    alert("Logged out successfully");
    window.location.href = "Login.html";
  });
}

// ================= LOAD APPLICATIONS =================
function loadUserApplications() {
  const container = document.getElementById("dashboardContainer");
  if (!container) return;

  const allStudents = JSON.parse(localStorage.getItem("students")) || [];

  const myApplications = allStudents.filter(
    app => String(app.userId) === String(currentUser.id)
  );

  container.innerHTML = "";

  if (myApplications.length === 0) {
    container.innerHTML = `
      <div class="booking-card empty">
        <h3>No submitted applications</h3>
        <p>You have not applied for any hostel yet.</p>
      </div>
    `;
    return;
  }

  myApplications.forEach(app => {
    const status = app.applicationStatus || "Pending";
    const statusClass = status.toLowerCase();

    const card = document.createElement("div");
    card.className = "booking-card";

    card.innerHTML = `
      <div class="booking-header">
        <h3>${app.hostel}</h3>
        <span class="status ${statusClass}">${status}</span>
      </div>
      <div class="booking-body">
        <p><strong>Name:</strong> ${app.fullName}</p>
        <p><strong>Gender:</strong> ${app.gender}</p>
        <p><strong>Room:</strong> ${app.roomNumber || "Not Assigned"}</p>
        <p><strong>Date Applied:</strong> ${new Date(app.createdAt).toLocaleDateString()}</p>
      </div>
    `;

    container.appendChild(card);
  });
}

// ================= AUTO LOAD =================
document.addEventListener("DOMContentLoaded", () => {
  loadUserApplications();
});