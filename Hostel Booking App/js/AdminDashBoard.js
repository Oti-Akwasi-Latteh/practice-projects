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
  window.location.href = "AdminSignUp.html";
});


// ================= HELPERS =================
function generateId(list) {
  return list.length > 0 ? Math.max(...list.map(i => i.id)) + 1 : 1;
}


// ================= HOSTELS =================
function addHostel() {
  const name = document.getElementById("hostelName").value.trim();
  const description = document.getElementById("hostelDescription").value.trim();
  const location = document.getElementById("hostelLocation").value.trim();
  const contactInfo = document.getElementById("hostelContact").value.trim();

  if (!name || !description || !location || !contactInfo) {
    alert("Fill all fields");
    return;
  }

  let hostels = JSON.parse(localStorage.getItem("hostels")) || [];

  const newHostel = {
    id: generateId(hostels),
    name,
    description,
    location,
    contactInfo,
  };

  hostels.push(newHostel);
  localStorage.setItem("hostels", JSON.stringify(hostels));

  document.getElementById("hostelName").value = "";
  document.getElementById("hostelDescription").value = "";
  document.getElementById("hostelLocation").value = "";
  document.getElementById("hostelContact").value = "";

  loadHostels();
}

function loadHostels() {
  const table = document.getElementById("hostelTable");
  table.innerHTML = "";

  const hostels = JSON.parse(localStorage.getItem("hostels")) || [];

  if (hostels.length === 0) {
    table.innerHTML = `<tr><td colspan="6">No hostels added yet</td></tr>`;
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

function deleteHostel(id) {
  if (!confirm("Delete this hostel?")) return;
  let hostels = JSON.parse(localStorage.getItem("hostels")) || [];
  hostels = hostels.filter(h => h.id !== id);
  localStorage.setItem("hostels", JSON.stringify(hostels));
  loadHostels();
}

function editHostel(id) {
  let hostels = JSON.parse(localStorage.getItem("hostels")) || [];
  const hostel = hostels.find(h => h.id === id);
  if (!hostel) return alert("Hostel not found");

  const newName = prompt("Name", hostel.name);
  const newDesc = prompt("Description", hostel.description);
  const newLocation = prompt("Location", hostel.location);
  const newContact = prompt("Contact", hostel.contactInfo);

  if (newName && newDesc && newLocation && newContact) {
    hostels = hostels.map(h =>
      h.id === id
        ? { ...h, name: newName, description: newDesc, location: newLocation, contactInfo: newContact }
        : h
    );
    localStorage.setItem("hostels", JSON.stringify(hostels));
    loadHostels();
  }
}


// ================= ROOMS =================
function loadRooms() {
  const table = document.getElementById("roomList");
  table.innerHTML = "";

  const rooms = JSON.parse(localStorage.getItem("rooms")) || [];

  if (rooms.length === 0) {
    table.innerHTML = `<tr><td colspan="5">No rooms added yet</td></tr>`;
    return;
  }

  rooms.forEach(room => {
    table.innerHTML += `
      <tr>
        <td>${room.id}</td>
        <td>${room.roomNumber}</td>
        <td>${room.capacity}</td>
        <td>${room.status || "Available"}</td>
        <td>
          <button onclick="editRoom(${room.id})">Edit</button>
          <button onclick="deleteRoom(${room.id})">Delete</button>
        </td>
      </tr>
    `;
  });
}

function addRoom() {
  const roomNumber = document.getElementById("roomName").value.trim();
  const capacity = document.getElementById("roomCapacity").value.trim();

  if (!roomNumber || !capacity) {
    alert("Fill all fields");
    return;
  }

  let rooms = JSON.parse(localStorage.getItem("rooms")) || [];

  const newRoom = {
    id: generateId(rooms),
    roomNumber,
    capacity: parseInt(capacity),
    status: "Available",
  };

  rooms.push(newRoom);
  localStorage.setItem("rooms", JSON.stringify(rooms));

  document.getElementById("roomName").value = "";
  document.getElementById("roomCapacity").value = "";

  loadRooms();
}

function editRoom(id) {
  let rooms = JSON.parse(localStorage.getItem("rooms")) || [];
  const room = rooms.find(r => r.id === id);
  if (!room) return alert("Room not found");

  const newRoomNumber = prompt("Room Number", room.roomNumber);
  const newCapacity = prompt("Capacity", room.capacity);

  if (!newRoomNumber || !newCapacity) return;

  rooms = rooms.map(r =>
    r.id === id
      ? { ...r, roomNumber: newRoomNumber, capacity: parseInt(newCapacity) }
      : r
  );

  localStorage.setItem("rooms", JSON.stringify(rooms));
  loadRooms();
}

function deleteRoom(id) {
  if (!confirm("Delete this room?")) return;
  let rooms = JSON.parse(localStorage.getItem("rooms")) || [];
  rooms = rooms.filter(r => r.id !== id);
  localStorage.setItem("rooms", JSON.stringify(rooms));
  loadRooms();
}


// ================= APPLICATIONS =================
function loadApplications() {
  const table = document.getElementById("applicationsTable");
  if (!table) return;

  const applications = JSON.parse(localStorage.getItem("students")) || [];

  table.innerHTML = "";

  if (applications.length === 0) {
    table.innerHTML = `<tr><td colspan="7">No applications submitted yet</td></tr>`;
    return;
  }

  applications.forEach(app => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${app.id}</td>
      <td>${app.fullName}</td>
      <td>${app.roomNumber || "N/A"}</td>
      <td>${app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "N/A"}</td>
      <td class="status ${app.applicationStatus.toLowerCase()}">${app.applicationStatus}</td>
      <td>${app.gender}</td>
      <td>
        <button
          class="approve-btn"
          onclick="approveApplication(${app.id})"
          ${app.applicationStatus === "Approved" ? "disabled" : ""}
        >Approve</button>
        <button
          class="reject-btn"
          onclick="rejectApplication(${app.id})"
          ${app.applicationStatus === "Rejected" ? "disabled" : ""}
        >Reject</button>
      </td>
    `;
    table.appendChild(row);
  });
}

function approveApplication(id) {
  let students = JSON.parse(localStorage.getItem("students")) || [];
  students = students.map(s =>
    s.id === id ? { ...s, applicationStatus: "Approved" } : s
  );
  localStorage.setItem("students", JSON.stringify(students));
  alert("Application approved successfully");
  loadApplications();
}

function rejectApplication(id) {
  let students = JSON.parse(localStorage.getItem("students")) || [];
  students = students.map(s =>
    s.id === id ? { ...s, applicationStatus: "Rejected" } : s
  );
  localStorage.setItem("students", JSON.stringify(students));
  alert("Application rejected successfully");
  loadApplications();
}


// ================= ALLOCATIONS =================
function loadAllocations() {
  const table = document.getElementById("allocationTable");
  if (!table) return;

  const students = JSON.parse(localStorage.getItem("students")) || [];

  table.innerHTML = "";

  if (students.length === 0) {
    table.innerHTML = `<tr><td colspan="5">No applications found</td></tr>`;
    return;
  }

  students.forEach(student => {
    let statusLabel = "Pending";
    let roomDisplay = "Not Allocated";

    if (student.applicationStatus === "Allocated") {
      statusLabel = "Allocated";
      roomDisplay = student.roomNumber || "Assigned";
    } else if (student.applicationStatus === "Approved") {
      statusLabel = "Approved";
      roomDisplay = student.roomNumber || "Not Allocated";
    } else if (student.applicationStatus === "Rejected") {
      statusLabel = "Rejected";
      roomDisplay = "-";
    }

    const color =
      statusLabel === "Allocated" ? "green" :
      statusLabel === "Approved" ? "orange" : "red";

    table.innerHTML += `
      <tr>
        <td>${student.id}</td>
        <td>${student.fullName}</td>
        <td>${student.hostel || "N/A"}</td>
        <td>${roomDisplay}</td>
        <td><span style="color:${color}">${statusLabel}</span></td>
      </tr>
    `;
  });
}

function allocateStudent() {
  const studentId = parseInt(document.getElementById("allocStudentId").value.trim());
  const roomId = parseInt(document.getElementById("allocRoomId").value.trim());

  if (!studentId || !roomId) {
    alert("Please enter both Student ID and Room ID");
    return;
  }

  let students = JSON.parse(localStorage.getItem("students")) || [];
  const student = students.find(s => s.id === studentId && s.applicationStatus === "Approved");

  if (!student) {
    alert("Student not found or not approved");
    return;
  }

  let rooms = JSON.parse(localStorage.getItem("rooms")) || [];
  const room = rooms.find(r => r.id === roomId && r.status === "Available");

  if (!room) {
    alert("Room not found or not available");
    return;
  }

  // Assign student to room
  students = students.map(s =>
    s.id === studentId
      ? { ...s, applicationStatus: "Allocated", RoomId: roomId, roomNumber: room.roomNumber }
      : s
  );
  localStorage.setItem("students", JSON.stringify(students));

  // Mark room occupied if at capacity
  const occupants = students.filter(
    s => s.RoomId === roomId && s.applicationStatus === "Allocated"
  ).length;

  if (occupants >= room.capacity) {
    rooms = rooms.map(r => r.id === roomId ? { ...r, status: "Occupied" } : r);
    localStorage.setItem("rooms", JSON.stringify(rooms));
  }

  alert("Student allocated successfully");
  document.getElementById("allocStudentId").value = "";
  document.getElementById("allocRoomId").value = "";
  loadAllocations();
}


// ================= USERS =================
function loadUsers() {
  const usersList = document.getElementById("usersList");
  if (!usersList) return;
  usersList.innerHTML = "";

  const users = JSON.parse(localStorage.getItem("users")) || [];

  if (users.length === 0) {
    usersList.innerHTML = `<tr><td colspan="5">No users found</td></tr>`;
    return;
  }

  users.forEach(user => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${user.id}</td>
      <td>${user.username}</td>
      <td>${user.email}</td>
      <td>${user.email}</td>
      <td>
        <button class="delete-btn" data-id="${user.id}">Delete</button>
      </td>
    `;
    usersList.appendChild(row);
  });

  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const userId = parseInt(btn.getAttribute("data-id"));
      if (!confirm("Are you sure you want to delete this user?")) return;

      let users = JSON.parse(localStorage.getItem("users")) || [];
      users = users.filter(u => u.id !== userId);
      localStorage.setItem("users", JSON.stringify(users));
      alert("User deleted successfully");
      loadUsers();
    });
  });
}

// ================= SECTION SWITCH =================
function showSection(sectionId) {
  document.querySelectorAll(".section").forEach(sec => {
    sec.classList.remove("active");
  });
  document.getElementById(sectionId).classList.add("active");
}


// ================= INIT =================
window.addEventListener("DOMContentLoaded", () => {
  loadHostels();
  loadRooms();
  loadApplications();
  loadAllocations();
  loadUsers();

  const allocBtn = document.getElementById("allocateBtn");
  if (allocBtn) allocBtn.addEventListener("click", allocateStudent);
});


 // ================= HAMBURGER TOGGLE =================
  const hamburger = document.getElementById("hamburger");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");

  function openSidebar() {
    sidebar.classList.add("open");
    overlay.classList.add("show");
  }

  function closeSidebar() {
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
  }

  hamburger.addEventListener("click", () => {
    sidebar.classList.contains("open") ? closeSidebar() : openSidebar();
  });

  overlay.addEventListener("click", closeSidebar);

  // ================= NAV + CLOSE ON MOBILE =================
  function navTo(sectionId) {
    showSection(sectionId);
    if (window.innerWidth <= 768) closeSidebar();
  }

  // ================= ACTIVE NAV HIGHLIGHT =================
  document.querySelectorAll(".sidebar ul li").forEach(li => {
    li.addEventListener("click", () => {
      document.querySelectorAll(".sidebar ul li").forEach(el => el.classList.remove("active"));
      li.classList.add("active");
    });
  });

  // Set first item active on load
  document.querySelector(".sidebar ul li").classList.add("active");

  // ================= LIVE DASHBOARD COUNTS =================
  function updateCounts() {
    const hostels = JSON.parse(localStorage.getItem("hostels")) || [];
    const bookings = JSON.parse(localStorage.getItem("bookedHostels")) || [];
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const students = JSON.parse(localStorage.getItem("students")) || [];
    const allocated = students.filter(s => s.applicationStatus === "Allocated");

    document.getElementById("totalHostels").textContent = hostels.length;
    document.getElementById("totalBookings").textContent = bookings.length;
    document.getElementById("totalUsers").textContent = users.length;
    document.getElementById("totalAllocations").textContent = allocated.length;
  }

  document.addEventListener("DOMContentLoaded", updateCounts);