// =============================================
// js/DashBoard.js  — merged UI + MongoDB admin
// =============================================

const API_BASE = "https://bookie-app-r03w.onrender.com/api";

// ── Auth guard ────────────────────────────────────────────────
const isLoggedIn = sessionStorage.getItem("isLoggedIn");
if (!isLoggedIn) window.location.href = "AdminSignUp.html";

const admin = JSON.parse(sessionStorage.getItem("admin"));
if (admin) {
  const el = document.getElementById("adminName");
  if (el) el.textContent = admin.name;
}

document.getElementById("logoutBtn")?.addEventListener("click", () => {
  sessionStorage.clear();
  window.location.href = "AdminSignUp.html";
});

// ── Section switcher ──────────────────────────────────────────
function showSection(id) {
  document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
  const target = document.getElementById(id);
  if (target) target.classList.add("active");
}

// ── Section loader map ────────────────────────────────────────
const sectionLoaders = {
  hostelsSection:      () => loadHostels(),
  roomsSection:        () => loadRooms(),
  applicationsSection: () => loadApplications(),
  allocationsSection:  () => loadAllocations(),
  usersSection:        () => loadUsers(),
};

// ── HAMBURGER TOGGLE ──────────────────────────────────────────
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

// ── NAV + CLOSE ON MOBILE ─────────────────────────────────────
function navTo(sectionId) {
  showSection(sectionId);

  // Reload fresh MongoDB data when switching sections
  if (sectionLoaders[sectionId]) sectionLoaders[sectionId]();

  // Highlight active nav item
  document.querySelectorAll(".sidebar ul li").forEach(li => {
    li.classList.toggle("active", li.dataset.section === sectionId);
  });

  if (window.innerWidth <= 768) closeSidebar();
}

// ── ACTIVE NAV HIGHLIGHT ──────────────────────────────────────
document.querySelectorAll(".sidebar ul li").forEach(li => {
  li.addEventListener("click", () => {
    document.querySelectorAll(".sidebar ul li")
      .forEach(el => el.classList.remove("active"));
    li.classList.add("active");
  });
});

document.querySelector(".sidebar ul li")?.classList.add("active");

// ── DASHBOARD COUNTS (MongoDB) ────────────────────────────────
async function updateDashboardCounts() {
  try {
    const [hostels, rooms, users, students] = await Promise.all([
      fetch(`${API_BASE}/hostels`).then(r => r.json()),
      fetch(`${API_BASE}/rooms`).then(r => r.json()),
      fetch(`${API_BASE}/users`).then(r => r.json()),
      fetch(`${API_BASE}/students`).then(r => r.json()),
    ]);

    const set = (id, v) => {
      const el = document.getElementById(id);
      if (el) {
        el.textContent = v;
      } else {
        console.warn(`Dashboard stat element not found: #${id}`);
      }
    };

    set("totalHostels",      Array.isArray(hostels)  ? hostels.length  : 0);
    set("totalRooms",        Array.isArray(rooms)    ? rooms.length    : 0);
    set("totalUsers",        Array.isArray(users)    ? users.length    : 0);
    set("totalApplications", Array.isArray(students) ? students.length : 0);
    set("totalAllocations",  Array.isArray(students)
      ? students.filter(s => s.applicationStatus === "Allocated").length : 0
    );

  } catch (err) {
    console.error("Dashboard counts error:", err);
  }
}

// ── HOSTELS ───────────────────────────────────────────────────
async function addHostel() {
  const name        = document.getElementById("hostelName")?.value.trim();
  const description = document.getElementById("hostelDescription")?.value.trim();
  const location    = document.getElementById("hostelLocation")?.value.trim();
  const contactInfo = document.getElementById("hostelContact")?.value.trim();

  if (!name || !description || !location || !contactInfo) {
    alert("Please fill in all hostel fields.");
    return;
  }

  try {
    const res  = await fetch(`${API_BASE}/hostels`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ name, description, location, contactInfo }),
    });
    const data = await res.json();
    if (!res.ok) { alert(data.error || "Failed to add hostel"); return; }

    ["hostelName", "hostelDescription", "hostelLocation", "hostelContact"]
      .forEach(id => { const el = document.getElementById(id); if (el) el.value = ""; });

    await loadHostels();
    await updateDashboardCounts();
    alert(`Hostel "${name}" added successfully!`);
  } catch (err) {
    console.error(err);
    alert("Cannot connect to server. Is it running?");
  }
}

async function loadHostels() {
  const table = document.getElementById("hostelTable");
  if (!table) return;
  table.innerHTML = `<tr><td colspan="6" style="text-align:center;">Loading…</td></tr>`;

  try {
    const hostels = await fetch(`${API_BASE}/hostels`).then(r => r.json());

    table.innerHTML = "";
    if (!hostels.length) {
      table.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#888;">No hostels added yet</td></tr>`;
      return;
    }

    hostels.forEach(h => {
      table.innerHTML += `
        <tr>
          <td>${h._id}</td>
          <td>${h.name}</td>
          <td>${h.description}</td>
          <td>${h.location}</td>
          <td>${h.contactInfo}</td>
          <td>
            <button onclick="editHostel('${h._id}')">Edit</button>
            <button onclick="deleteHostel('${h._id}')">Delete</button>
          </td>
        </tr>`;
    });
  } catch (err) {
    console.error(err);
    table.innerHTML = `<tr><td colspan="6" style="color:red;">Failed to load hostels</td></tr>`;
  }
}

async function editHostel(id) {
  try {
    const hostels = await fetch(`${API_BASE}/hostels`).then(r => r.json());
    const h = hostels.find(x => x._id === id);
    if (!h) return alert("Hostel not found");

    const newName = prompt("Hostel Name",    h.name);
    const newDesc = prompt("Description",    h.description);
    const newLoc  = prompt("Location",       h.location);
    const newCont = prompt("Contact Info",   h.contactInfo);

    if (!newName || !newDesc || !newLoc || !newCont) return;

    const res = await fetch(`${API_BASE}/hostels/${id}`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ name: newName, description: newDesc, location: newLoc, contactInfo: newCont }),
    });
    if (!res.ok) { const d = await res.json(); alert(d.error); return; }

    await loadHostels();
    await updateDashboardCounts();
    alert("Hostel updated successfully.");
  } catch (err) {
    console.error(err);
    alert("Server error while editing hostel.");
  }
}

async function deleteHostel(id) {
  if (!confirm("Are you sure you want to delete this hostel?")) return;
  try {
    const res = await fetch(`${API_BASE}/hostels/${id}`, { method: "DELETE" });
    if (!res.ok) { const d = await res.json(); alert(d.error); return; }
    await loadHostels();
    await updateDashboardCounts();
  } catch (err) {
    alert("Delete failed. Please try again.");
  }
}

// ── ROOMS ─────────────────────────────────────────────────────
async function addRoom() {
  const roomNumber = document.getElementById("roomName")?.value.trim();
  const capacity   = document.getElementById("roomCapacity")?.value.trim();

  if (!roomNumber || !capacity) { alert("Please fill in all room fields."); return; }

  try {
    const res  = await fetch(`${API_BASE}/rooms`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ roomNumber, capacity: parseInt(capacity), status: "Available" }),
    });
    const data = await res.json();
    if (!res.ok) { alert(data.error || "Failed to add room"); return; }

    const rn = document.getElementById("roomName");
    const rc = document.getElementById("roomCapacity");
    if (rn) rn.value = "";
    if (rc) rc.value = "";

    await loadRooms();
    await updateDashboardCounts();
    alert(`Room "${roomNumber}" added successfully!`);
  } catch (err) {
    console.error(err);
    alert("Server error. Is the server running?");
  }
}

async function loadRooms() {
  const table = document.getElementById("roomList");
  if (!table) return;
  table.innerHTML = `<tr><td colspan="5" style="text-align:center;">Loading…</td></tr>`;

  try {
    const rooms = await fetch(`${API_BASE}/rooms`).then(r => r.json());

    table.innerHTML = "";
    if (!rooms.length) {
      table.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#888;">No rooms added yet</td></tr>`;
      return;
    }

    rooms.forEach(room => {
      const color =
        room.status === "Occupied" ? "color:red"    :
        room.status === "Booked"   ? "color:orange" : "color:green";

      table.innerHTML += `
        <tr>
          <td>${room._id}</td>
          <td>${room.roomNumber}</td>
          <td>${room.capacity}</td>
          <td style="${color};font-weight:bold;">${room.status || "Available"}</td>
          <td>
            <button onclick="editRoom('${room._id}')">Edit</button>
            <button onclick="deleteRoom('${room._id}')">Delete</button>
          </td>
        </tr>`;
    });
  } catch (err) {
    console.error(err);
    table.innerHTML = `<tr><td colspan="5" style="color:red;">Failed to load rooms</td></tr>`;
  }
}

async function editRoom(id) {
  try {
    const rooms = await fetch(`${API_BASE}/rooms`).then(r => r.json());
    const room  = rooms.find(r => r._id === id);
    if (!room) return alert("Room not found");

    const newNumber   = prompt("Room Number", room.roomNumber);
    const newCapacity = prompt("Capacity",    room.capacity);
    const newStatus   = prompt("Status (Available / Occupied / Booked)", room.status || "Available");

    if (!newNumber || !newCapacity || !newStatus) return;

    const res = await fetch(`${API_BASE}/rooms/${id}`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ roomNumber: newNumber, capacity: parseInt(newCapacity), status: newStatus }),
    });
    if (!res.ok) { const d = await res.json(); alert(d.error); return; }

    await loadRooms();
    alert("Room updated successfully.");
  } catch (err) {
    console.error(err);
    alert("Server error while editing room.");
  }
}

async function deleteRoom(id) {
  if (!confirm("Are you sure you want to delete this room?")) return;
  try {
    const res  = await fetch(`${API_BASE}/rooms/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) { alert(data.error); return; }
    await loadRooms();
    await updateDashboardCounts();
  } catch (err) {
    alert("Delete failed. Please try again.");
  }
}

// ── APPLICATIONS ──────────────────────────────────────────────
async function loadApplications() {
  const table = document.getElementById("applicationsTable");
  if (!table) return;
  table.innerHTML = `<tr><td colspan="7" style="text-align:center;">Loading…</td></tr>`;

  try {
    const students = await fetch(`${API_BASE}/students`).then(r => r.json());

    table.innerHTML = "";
    if (!students.length) {
      table.innerHTML = `<tr><td colspan="7" style="text-align:center;color:#888;">No applications yet</td></tr>`;
      return;
    }

    students.forEach(app => {
      const statusColor =
        app.applicationStatus === "Approved"  ? "#28a745" :
        app.applicationStatus === "Rejected"  ? "#dc3545" :
        app.applicationStatus === "Allocated" ? "#1e90ff" : "#f39c12";

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${app._id}</td>
        <td>${app.fullName}</td>
        <td>${app.roomId?.roomNumber || "N/A"}</td>
        <td>${new Date(app.createdAt).toLocaleDateString()}</td>
        <td>
          <span style="color:white;background:${statusColor};padding:4px 10px;
                       border-radius:20px;font-size:12px;font-weight:bold;">
            ${app.applicationStatus}
          </span>
        </td>
        <td>${app.gender}</td>
        <td>
          <button onclick="approveApplication('${app._id}')"
            ${["Approved","Allocated"].includes(app.applicationStatus) ? "disabled" : ""}>
            Approve
          </button>
          <button onclick="rejectApplication('${app._id}')"
            ${["Rejected","Allocated"].includes(app.applicationStatus) ? "disabled" : ""}>
            Reject
          </button>
        </td>`;
      table.appendChild(row);
    });
  } catch (err) {
    console.error(err);
    table.innerHTML = `<tr><td colspan="7" style="color:red;">Failed to load applications</td></tr>`;
  }
}

async function approveApplication(id) {
  try {
    const res = await fetch(`${API_BASE}/students/approve/${id}`, { method: "PUT" });
    if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
    alert("Application approved successfully.");
    await loadApplications();
    await loadAllocations();
    await updateDashboardCounts();
  } catch (err) {
    alert(err.message || "Approval failed.");
  }
}

async function rejectApplication(id) {
  try {
    const res = await fetch(`${API_BASE}/students/reject/${id}`, { method: "PUT" });
    if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
    alert("Application rejected.");
    await loadApplications();
    await loadAllocations();
    await updateDashboardCounts();
  } catch (err) {
    alert(err.message || "Rejection failed.");
  }
}

// ── ALLOCATIONS ───────────────────────────────────────────────
async function loadAllocations() {
  const table = document.getElementById("allocationTable");
  if (!table) return;
  table.innerHTML = `<tr><td colspan="5" style="text-align:center;">Loading…</td></tr>`;

  try {
    const [students, rooms] = await Promise.all([
      fetch(`${API_BASE}/students`).then(r => r.json()),
      fetch(`${API_BASE}/rooms`).then(r => r.json()),
    ]);

    // ── Populate student dropdown (Approved only) ──────────
    const studentSelect = document.getElementById("allocStudentId");
    if (studentSelect) {
      const approved = students.filter(s => s.applicationStatus === "Approved");
      studentSelect.innerHTML = approved.length
        ? `<option value="">— Select Approved Student —</option>` +
          approved.map(s => `<option value="${s._id}">${s.fullName} (${s.hostel || "N/A"})</option>`).join("")
        : `<option value="">No approved students yet</option>`;
    }

    // ── Populate room dropdown (Available only) ────────────
    const roomSelect = document.getElementById("allocRoomId");
    if (roomSelect) {
      const available = rooms.filter(r => r.status === "Available");
      roomSelect.innerHTML = available.length
        ? `<option value="">— Select Available Room —</option>` +
          available.map(r => `<option value="${r._id}">Room ${r.roomNumber} (Capacity: ${r.capacity})</option>`).join("")
        : `<option value="">No available rooms</option>`;
    }

    // ── Render allocation table ────────────────────────────
    table.innerHTML = "";
    if (!students.length) {
      table.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#888;">No applications found</td></tr>`;
      return;
    }

    students.forEach(s => {
      const label = s.applicationStatus || "Pending";
      const roomDisplay =
        label === "Allocated" ? (s.roomId?.roomNumber || "Assigned") :
        label === "Approved"  ? "Pending Allocation" :
        label === "Rejected"  ? "—" : "Not Allocated";

      const color =
        label === "Allocated" ? "#1e90ff" :
        label === "Approved"  ? "orange"  :
        label === "Rejected"  ? "#dc3545" : "#888";

      table.innerHTML += `
        <tr>
          <td>${s._id}</td>
          <td>${s.fullName}</td>
          <td>${s.hostel || "N/A"}</td>
          <td>${roomDisplay}</td>
          <td>
            <span style="color:white;background:${color};padding:4px 10px;
                         border-radius:20px;font-size:12px;font-weight:bold;">
              ${label}
            </span>
          </td>
        </tr>`;
    });
  } catch (err) {
    console.error(err);
    table.innerHTML = `<tr><td colspan="5" style="color:red;">Failed to load allocations</td></tr>`;
  }
}

async function allocateStudent() {
  const studentId = document.getElementById("allocStudentId")?.value.trim();
  const roomId    = document.getElementById("allocRoomId")?.value.trim();

  if (!studentId || !roomId) {
    alert("Please select both a student and a room.");
    return;
  }

  try {
    const res  = await fetch(`${API_BASE}/allocation/allocate`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ studentId, roomId }),
    });
    const data = await res.json();
    if (!res.ok) { alert(data.error || "Allocation failed"); return; }

    // Reset dropdowns
    const si = document.getElementById("allocStudentId");
    const ri = document.getElementById("allocRoomId");
    if (si) si.value = "";
    if (ri) ri.value = "";

    alert("Student allocated successfully.");
    await loadAllocations();
    await loadApplications();
    await loadRooms();
    await updateDashboardCounts();
  } catch (err) {
    console.error(err);
    alert("Cannot connect to server. Is it running?");
  }
}

// ── USERS ─────────────────────────────────────────────────────
async function loadUsers() {
  const usersList = document.getElementById("usersList");
  if (!usersList) return;
  usersList.innerHTML = `<tr><td colspan="5" style="text-align:center;">Loading…</td></tr>`;

  try {
    const users = await fetch(`${API_BASE}/users`).then(r => r.json());

    usersList.innerHTML = "";
    if (!users.length) {
      usersList.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#888;">No users yet</td></tr>`;
      return;
    }

    users.forEach(u => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${u._id}</td>
        <td>${u.username}</td>
        <td>${u.email}</td>
        <td>${u.location || "N/A"}</td>
        <td><button class="delete-btn" data-id="${u._id}">Delete</button></td>`;
      usersList.appendChild(row);
    });

    // Attach delete listeners after rows are in the DOM
    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        if (!confirm("Delete this user and all their data?")) return;
        try {
          const res = await fetch(`${API_BASE}/users/${btn.dataset.id}`, { method: "DELETE" });
          if (!res.ok) { const d = await res.json(); alert(d.error); return; }
          alert("User deleted successfully.");
          await loadUsers();
          await updateDashboardCounts();
        } catch (err) {
          alert("Delete failed. Please try again.");
        }
      });
    });
  } catch (err) {
    console.error(err);
    usersList.innerHTML = `<tr><td colspan="5" style="color:red;">Failed to load users</td></tr>`;
  }
}

// ── INIT ──────────────────────────────────────────────────────
window.addEventListener("DOMContentLoaded", async () => {
  await Promise.all([
    updateDashboardCounts(),
    loadHostels(),
    loadRooms(),
    loadApplications(),
    loadAllocations(),
    loadUsers(),
  ]);

  document.getElementById("allocateBtn")?.addEventListener("click", allocateStudent);
});

// ── GLOBAL EXPORTS (for inline onclick in HTML) ───────────────
window.showSection        = showSection;
window.navTo              = navTo;
window.addHostel          = addHostel;
window.editHostel         = editHostel;
window.deleteHostel       = deleteHostel;
window.addRoom            = addRoom;
window.editRoom           = editRoom;
window.deleteRoom         = deleteRoom;
window.approveApplication = approveApplication;
window.rejectApplication  = rejectApplication;
window.allocateStudent    = allocateStudent;
