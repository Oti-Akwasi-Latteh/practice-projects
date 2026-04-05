// ================= CHECK LOGIN =================
const isLoggedIn = localStorage.getItem("isLoggedIn");
if (!isLoggedIn) {
  window.location.href = "AdminSignUp.html";
}

// ================= LOAD ADMIN NAME =================
const admin = JSON.parse(localStorage.getItem("admin"));
if (admin) {
  document.getElementById("adminName").textContent = admin.name;
}

// ================= LOGOUT =================
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("admin");
  window.location.href = "AdminSignUp.html";
});


// ================= HELPER: GENERATE ID =================
function generateId(list) {
  return list.length > 0 ? Math.max(...list.map(i => i.id)) + 1 : 1;
}


// ================= HELPER: EXTRACT CAPACITY =================
// Must match the same logic used in Rooms.js and confirmBooking.js
function extractCapacity(roomType) {
  const str = (roomType || "").toLowerCase().trim();
  if (str.includes("single")) return 1;
  if (str.includes("one"))    return 1;
  const match = str.match(/^(\d+)/);
  if (match) return parseInt(match[1]);
  return 1;
}


// ================= SECTION SWITCH =================
function showSection(sectionId) {
  document.querySelectorAll(".section").forEach(sec => {
    sec.classList.remove("active");
  });
  document.getElementById(sectionId).classList.add("active");
}


// =======================================================
// ==================== HOSTELS ==========================
// =======================================================

function addHostel() {
  const name        = document.getElementById("hostelName").value.trim();
  const description = document.getElementById("hostelDescription").value.trim();
  const location    = document.getElementById("hostelLocation").value.trim();
  const contactInfo = document.getElementById("hostelContact").value.trim();

  if (!name || !description || !location || !contactInfo) {
    alert("Please fill all hostel fields.");
    return;
  }

  let hostels = JSON.parse(localStorage.getItem("hostels")) || [];

  // Prevent duplicate hostel names — Rooms.js matches by name
  const duplicate = hostels.find(
    h => h.name.trim().toLowerCase() === name.toLowerCase()
  );
  if (duplicate) {
    alert(
      `A hostel named "${name}" already exists.\n` +
      `Hostel names must be unique because the Rooms page matches by name.`
    );
    return;
  }

  const newHostel = {
    id          : generateId(hostels),
    name        : name.trim(),
    description,
    location,
    contactInfo,
    createdAt   : new Date().toISOString(),
  };

  hostels.push(newHostel);
  localStorage.setItem("hostels", JSON.stringify(hostels));

  // Clear inputs
  document.getElementById("hostelName").value        = "";
  document.getElementById("hostelDescription").value = "";
  document.getElementById("hostelLocation").value    = "";
  document.getElementById("hostelContact").value     = "";

  updateDashboardCounts();
  loadHostels();
  alert(`Hostel "${name}" added successfully!`);
}


function loadHostels() {
  const table = document.getElementById("hostelTable");
  if (!table) return;
  table.innerHTML = "";

  const hostels = JSON.parse(localStorage.getItem("hostels")) || [];

  if (hostels.length === 0) {
    table.innerHTML = `
      <tr><td colspan="6" style="text-align:center; color:#888;">
        No hostels added yet
      </td></tr>
    `;
    return;
  }

  hostels.forEach(hostel => {
    table.innerHTML += `
      <tr>
        <td>${hostel.id}</td>
        <td>${hostel.name}</td>
        <td>${hostel.description}</td>
        <td>${hostel.location}</td>
        <td>${hostel.contactInfo}</td>
        <td>
          <button onclick="editHostel(${hostel.id})">Edit</button>
          <button onclick="deleteHostel(${hostel.id})">Delete</button>
        </td>
      </tr>
    `;
  });
}


function editHostel(id) {
  let hostels = JSON.parse(localStorage.getItem("hostels")) || [];
  const hostel = hostels.find(h => h.id === id);
  if (!hostel) return alert("Hostel not found.");

  const newName        = prompt("Hostel Name", hostel.name);
  const newDescription = prompt("Description", hostel.description);
  const newLocation    = prompt("Location", hostel.location);
  const newContact     = prompt("Contact Info", hostel.contactInfo);

  if (!newName || !newDescription || !newLocation || !newContact) return;

  // Check new name doesn't clash with another hostel
  const clash = hostels.find(
    h => h.name.trim().toLowerCase() === newName.trim().toLowerCase() && h.id !== id
  );
  if (clash) {
    alert(`Another hostel named "${newName}" already exists. Use a unique name.`);
    return;
  }

  // If name changed, update it in all existing bookings and applications
  const oldName = hostel.name;

  hostels = hostels.map(h =>
    h.id === id
      ? { ...h,
          name        : newName.trim(),
          description : newDescription,
          location    : newLocation,
          contactInfo : newContact }
      : h
  );
  localStorage.setItem("hostels", JSON.stringify(hostels));

  // Sync name change into bookedHostels
  if (oldName !== newName.trim()) {
    let bookings = JSON.parse(localStorage.getItem("bookedHostels")) || [];
    bookings = bookings.map(b =>
      b.hostelId === id ? { ...b, hostel: newName.trim() } : b
    );
    localStorage.setItem("bookedHostels", JSON.stringify(bookings));

    // Sync name change into student applications
    let students = JSON.parse(localStorage.getItem("students")) || [];
    students = students.map(s =>
      s.hostelId === id ? { ...s, hostel: newName.trim() } : s
    );
    localStorage.setItem("students", JSON.stringify(students));
  }

  loadHostels();
  alert("Hostel updated successfully.");
}


function deleteHostel(id) {
  if (!confirm("Delete this hostel? This will also remove all related bookings and applications.")) return;

  let hostels = JSON.parse(localStorage.getItem("hostels")) || [];
  hostels = hostels.filter(h => h.id !== id);
  localStorage.setItem("hostels", JSON.stringify(hostels));

  // Remove related bookings
  let bookings = JSON.parse(localStorage.getItem("bookedHostels")) || [];
  bookings = bookings.filter(b => b.hostelId !== id);
  localStorage.setItem("bookedHostels", JSON.stringify(bookings));

  // Remove related student applications
  let students = JSON.parse(localStorage.getItem("students")) || [];
  students = students.filter(s => s.hostelId !== id);
  localStorage.setItem("students", JSON.stringify(students));

  updateDashboardCounts();
  loadHostels();
  alert("Hostel and all related data deleted.");
}


// =======================================================
// ===================== ROOMS ===========================
// =======================================================

function addRoom() {
  const roomNumber = document.getElementById("roomName").value.trim();
  const capacity   = document.getElementById("roomCapacity").value.trim();

  if (!roomNumber || !capacity) {
    alert("Please fill all room fields.");
    return;
  }

  if (isNaN(capacity) || parseInt(capacity) <= 0) {
    alert("Capacity must be a positive number.");
    return;
  }

  let rooms = JSON.parse(localStorage.getItem("rooms")) || [];

  // Prevent duplicate room numbers
  const duplicate = rooms.find(
    r => r.roomNumber.trim().toLowerCase() === roomNumber.toLowerCase()
  );
  if (duplicate) {
    alert(`Room number "${roomNumber}" already exists.`);
    return;
  }

  const newRoom = {
    id         : generateId(rooms),
    roomNumber : roomNumber,
    capacity   : parseInt(capacity),
    status     : "Available",
    createdAt  : new Date().toISOString(),
  };

  rooms.push(newRoom);
  localStorage.setItem("rooms", JSON.stringify(rooms));

  document.getElementById("roomName").value     = "";
  document.getElementById("roomCapacity").value = "";

  updateDashboardCounts();
  loadRooms();
  alert(`Room "${roomNumber}" (capacity: ${capacity}) added successfully!`);
}


function loadRooms() {
  const table = document.getElementById("roomList");
  if (!table) return;
  table.innerHTML = "";

  const rooms = JSON.parse(localStorage.getItem("rooms")) || [];

  if (rooms.length === 0) {
    table.innerHTML = `
      <tr><td colspan="5" style="text-align:center; color:#888;">
        No rooms added yet
      </td></tr>
    `;
    return;
  }

  rooms.forEach(room => {
    const statusColor =
      room.status === "Occupied"  ? "color:red;"   :
      room.status === "Available" ? "color:green;"  : "color:orange;";

    table.innerHTML += `
      <tr>
        <td>${room.id}</td>
        <td>${room.roomNumber}</td>
        <td>${room.capacity}</td>
        <td style="${statusColor} font-weight:bold;">${room.status || "Available"}</td>
        <td>
          <button onclick="editRoom(${room.id})">Edit</button>
          <button onclick="deleteRoom(${room.id})">Delete</button>
        </td>
      </tr>
    `;
  });
}


function editRoom(id) {
  let rooms = JSON.parse(localStorage.getItem("rooms")) || [];
  const room = rooms.find(r => r.id === id);
  if (!room) return alert("Room not found.");

  const newRoomNumber = prompt("Room Number", room.roomNumber);
  const newCapacity   = prompt("Capacity", room.capacity);
  const newStatus     = prompt("Status (Available / Occupied)", room.status || "Available");

  if (!newRoomNumber || !newCapacity || !newStatus) return;

  if (isNaN(newCapacity) || parseInt(newCapacity) <= 0) {
    alert("Capacity must be a positive number.");
    return;
  }

  const validStatuses = ["available", "occupied"];
  if (!validStatuses.includes(newStatus.trim().toLowerCase())) {
    alert('Status must be either "Available" or "Occupied".');
    return;
  }

  rooms = rooms.map(r =>
    r.id === id
      ? { ...r,
          roomNumber : newRoomNumber.trim(),
          capacity   : parseInt(newCapacity),
          status     : newStatus.trim().charAt(0).toUpperCase() +
                       newStatus.trim().slice(1).toLowerCase() }
      : r
  );
  localStorage.setItem("rooms", JSON.stringify(rooms));

  loadRooms();
  alert("Room updated successfully.");
}


function deleteRoom(id) {
  if (!confirm("Delete this room?")) return;

  // Check if any allocated student uses this room
  const students = JSON.parse(localStorage.getItem("students")) || [];
  const inUse = students.find(
    s => s.roomId === id && s.applicationStatus === "Allocated"
  );

  if (inUse) {
    alert(
      `Room is currently allocated to "${inUse.fullName}".\n` +
      `Please deallocate the student first before deleting this room.`
    );
    return;
  }

  let rooms = JSON.parse(localStorage.getItem("rooms")) || [];
  rooms = rooms.filter(r => r.id !== id);
  localStorage.setItem("rooms", JSON.stringify(rooms));

  loadRooms();
  alert("Room deleted.");
}


// =======================================================
// ================= APPLICATIONS ========================
// =======================================================

function loadApplications() {
  const table = document.getElementById("applicationsTable");
  if (!table) return;
  table.innerHTML = "";

  const students = JSON.parse(localStorage.getItem("students")) || [];

  if (students.length === 0) {
    table.innerHTML = `
      <tr><td colspan="7" style="text-align:center; color:#888;">
        No applications submitted yet
      </td></tr>
    `;
    return;
  }

  students.forEach(app => {
    const statusColor =
      app.applicationStatus === "Approved"  ? "#28a745" :
      app.applicationStatus === "Rejected"  ? "#dc3545" :
      app.applicationStatus === "Allocated" ? "#1e90ff" : "#f39c12";

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${app.id}</td>
      <td>${app.fullName}</td>
      <td>${app.roomNumber || "N/A"}</td>
      <td>${app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "N/A"}</td>
      <td>
        <span style="
          color: white;
          background: ${statusColor};
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
        ">
          ${app.applicationStatus}
        </span>
      </td>
      <td>${app.gender}</td>
      <td>
        <button
          class="approve-btn"
          onclick="approveApplication(${app.id})"
          ${app.applicationStatus === "Approved" ||
            app.applicationStatus === "Allocated" ? "disabled" : ""}
        >Approve</button>
        <button
          class="reject-btn"
          onclick="rejectApplication(${app.id})"
          ${app.applicationStatus === "Rejected" ||
            app.applicationStatus === "Allocated" ? "disabled" : ""}
        >Reject</button>
      </td>
    `;
    table.appendChild(row);
  });
}


function approveApplication(id) {
  let students = JSON.parse(localStorage.getItem("students")) || [];
  const student = students.find(s => s.id === id);

  if (!student) return alert("Student not found.");

  if (student.applicationStatus === "Allocated") {
    alert("This student is already allocated.");
    return;
  }

  students = students.map(s =>
    s.id === id ? { ...s, applicationStatus: "Approved" } : s
  );
  localStorage.setItem("students", JSON.stringify(students));

  alert(`Application for "${student.fullName}" approved.\nYou can now allocate them a room.`);
  loadApplications();
  loadAllocations();
}


function rejectApplication(id) {
  let students = JSON.parse(localStorage.getItem("students")) || [];
  const student = students.find(s => s.id === id);

  if (!student) return alert("Student not found.");

  if (!confirm(`Reject application for "${student.fullName}"?`)) return;

  students = students.map(s =>
    s.id === id ? { ...s, applicationStatus: "Rejected" } : s
  );
  localStorage.setItem("students", JSON.stringify(students));

  alert(`Application for "${student.fullName}" rejected.`);
  loadApplications();
  loadAllocations();
}


// =======================================================
// ================= ALLOCATIONS =========================
// =======================================================

function loadAllocations() {
  const table = document.getElementById("allocationTable");
  if (!table) return;
  table.innerHTML = "";

  const students = JSON.parse(localStorage.getItem("students")) || [];

  if (students.length === 0) {
    table.innerHTML = `
      <tr><td colspan="5" style="text-align:center; color:#888;">
        No applications found
      </td></tr>
    `;
    return;
  }

  students.forEach(student => {
    let statusLabel = student.applicationStatus || "Pending";
    let roomDisplay = "Not Allocated";

    if (student.applicationStatus === "Allocated") {
      roomDisplay = student.roomNumber || "Assigned";
    } else if (student.applicationStatus === "Approved") {
      roomDisplay = "Pending Allocation";
    } else if (student.applicationStatus === "Rejected") {
      roomDisplay = "—";
    }

    const statusColor =
      statusLabel === "Allocated" ? "#1e90ff"  :
      statusLabel === "Approved"  ? "orange"   :
      statusLabel === "Rejected"  ? "#dc3545"  : "#888";

    table.innerHTML += `
      <tr>
        <td>${student.id}</td>
        <td>${student.fullName}</td>
        <td>${student.hostel || "N/A"}</td>
        <td>${roomDisplay}</td>
        <td>
          <span style="
            color: white;
            background: ${statusColor};
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
          ">
            ${statusLabel}
          </span>
        </td>
      </tr>
    `;
  });
}


function allocateStudent() {
  const studentId = parseInt(
    document.getElementById("allocStudentId").value.trim()
  );
  const roomId = parseInt(
    document.getElementById("allocRoomId").value.trim()
  );

  if (!studentId || !roomId) {
    alert("Please enter both Student ID and Room ID.");
    return;
  }

  let students = JSON.parse(localStorage.getItem("students")) || [];
  const student = students.find(s => s.id === studentId);

  if (!student) {
    alert(`No student found with ID ${studentId}.`);
    return;
  }

  if (student.applicationStatus !== "Approved") {
    alert(
      `Student "${student.fullName}" has status "${student.applicationStatus}".\n` +
      `Only Approved students can be allocated a room.`
    );
    return;
  }

  let rooms = JSON.parse(localStorage.getItem("rooms")) || [];
  const room = rooms.find(r => r.id === roomId);

  if (!room) {
    alert(`No room found with ID ${roomId}.`);
    return;
  }

  if (room.status && room.status.toLowerCase() === "occupied") {
    alert(
      `Room "${room.roomNumber}" is already fully occupied.\n` +
      `Please choose a different room.`
    );
    return;
  }

  // Check room capacity — count already allocated students in this room
  const currentOccupants = students.filter(
    s => s.roomId === roomId && s.applicationStatus === "Allocated"
  ).length;

  if (currentOccupants >= room.capacity) {
    alert(
      `Room "${room.roomNumber}" is at full capacity (${room.capacity}).\n` +
      `Please choose a different room.`
    );
    return;
  }

  // Allocate student
  students = students.map(s =>
    s.id === studentId
      ? { ...s,
          applicationStatus : "Allocated",
          roomId            : room.id,
          roomNumber        : room.roomNumber }
      : s
  );
  localStorage.setItem("students", JSON.stringify(students));

  // Mark room as Occupied if now at full capacity
  const newOccupantCount = currentOccupants + 1;
  if (newOccupantCount >= room.capacity) {
    rooms = rooms.map(r =>
      r.id === roomId ? { ...r, status: "Occupied" } : r
    );
    localStorage.setItem("rooms", JSON.stringify(rooms));
  }

  document.getElementById("allocStudentId").value = "";
  document.getElementById("allocRoomId").value    = "";

  updateDashboardCounts();
  loadAllocations();
  loadApplications();
  loadRooms();

  alert(
    `"${student.fullName}" has been allocated to Room ${room.roomNumber} successfully!`
  );
}


// =======================================================
// ===================== USERS ===========================
// =======================================================

function loadUsers() {
  const usersList = document.getElementById("usersList");
  if (!usersList) return;
  usersList.innerHTML = "";

  const users = JSON.parse(localStorage.getItem("users")) || [];

  if (users.length === 0) {
    usersList.innerHTML = `
      <tr><td colspan="5" style="text-align:center; color:#888;">
        No users registered yet
      </td></tr>
    `;
    return;
  }

  users.forEach(user => {
    // Count this user's bookings
    const bookings  = JSON.parse(localStorage.getItem("bookedHostels")) || [];
    const students  = JSON.parse(localStorage.getItem("students")) || [];
    const userBooks = bookings.filter(b => b.userId === user.id).length;
    const userApps  = students.filter(
      s => String(s.userId) === String(user.id)
    ).length;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${user.id}</td>
      <td>${user.username || user.fullName || "N/A"}</td>
      <td>${user.email}</td>
      <td>${user.email}</td>
      <td>
        <button class="delete-btn" data-id="${user.id}">Delete</button>
      </td>
    `;
    usersList.appendChild(row);
  });

  // Attach delete handlers
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const userId = parseInt(btn.getAttribute("data-id"));
      const users  = JSON.parse(localStorage.getItem("users")) || [];
      const user   = users.find(u => u.id === userId);

      if (!confirm(
        `Delete user "${user?.username || user?.email}"?\n` +
        `This will also remove their bookings and applications.`
      )) return;

      // Remove user
      const updatedUsers = users.filter(u => u.id !== userId);
      localStorage.setItem("users", JSON.stringify(updatedUsers));

      // Remove their bookings
      let bookings = JSON.parse(localStorage.getItem("bookedHostels")) || [];
      bookings = bookings.filter(b => b.userId !== userId);
      localStorage.setItem("bookedHostels", JSON.stringify(bookings));

      // Remove their applications and free up allocated rooms
      let students = JSON.parse(localStorage.getItem("students")) || [];
      const userStudents = students.filter(
        s => String(s.userId) === String(userId)
      );

      // Free up rooms that were allocated to this user
      let rooms = JSON.parse(localStorage.getItem("rooms")) || [];
      userStudents.forEach(s => {
        if (s.applicationStatus === "Allocated" && s.roomId) {
          const occupantsLeft = students.filter(
            st =>
              st.roomId === s.roomId &&
              st.applicationStatus === "Allocated" &&
              String(st.userId) !== String(userId)
          ).length;

          if (occupantsLeft < 1) {
            rooms = rooms.map(r =>
              r.id === s.roomId ? { ...r, status: "Available" } : r
            );
          }
        }
      });
      localStorage.setItem("rooms", JSON.stringify(rooms));

      students = students.filter(
        s => String(s.userId) !== String(userId)
      );
      localStorage.setItem("students", JSON.stringify(students));

      updateDashboardCounts();
      loadUsers();
      loadRooms();
      loadAllocations();
      loadApplications();
      alert("User and all related data deleted.");
    });
  });
}


// =======================================================
// =============== DASHBOARD COUNTS ======================
// =======================================================

function updateDashboardCounts() {
  const hostels  = JSON.parse(localStorage.getItem("hostels"))      || [];
  const bookings = JSON.parse(localStorage.getItem("bookedHostels")) || [];
  const users    = JSON.parse(localStorage.getItem("users"))         || [];
  const students = JSON.parse(localStorage.getItem("students"))      || [];

  const allocated = students.filter(
    s => s.applicationStatus === "Allocated"
  ).length;

  const totalHostelsEl     = document.getElementById("totalHostels");
  const totalBookingsEl    = document.getElementById("totalBookings");
  const totalUsersEl       = document.getElementById("totalUsers");
  const totalAllocationsEl = document.getElementById("totalAllocations");

  if (totalHostelsEl)     totalHostelsEl.textContent     = hostels.length;
  if (totalBookingsEl)    totalBookingsEl.textContent     = bookings.length;
  if (totalUsersEl)       totalUsersEl.textContent        = users.length;
  if (totalAllocationsEl) totalAllocationsEl.textContent  = allocated;
}


// =======================================================
// ======================= INIT ==========================
// =======================================================

window.addEventListener("DOMContentLoaded", () => {
  updateDashboardCounts();
  loadHostels();
  loadRooms();
  loadApplications();
  loadAllocations();
  loadUsers();

  const allocBtn = document.getElementById("allocateBtn");
  if (allocBtn) {
    allocBtn.addEventListener("click", allocateStudent);
  }
});
