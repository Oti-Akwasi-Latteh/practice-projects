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





// ================= HOSTELS =================
async function addHostel() {
  const name = document.getElementById("hostelName").value.trim();
  const description = document.getElementById("hostelDescription").value.trim();
  const location = document.getElementById("hostelLocation").value.trim();
  const contactInfo = document.getElementById("hostelContact").value.trim();

  if (!name || !description || !location || !contactInfo ) {
    alert("Fill all fields");
    return;
  }

  try {
    // ==========================
    // SEND TO BACKEND
    // ==========================
    const response = await fetch("http://localhost:5500/api/hostels", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        description,
        location,
        contactInfo,
      })
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Failed to add hostel");
      return;
    }

    // ==========================
    // SAVE TO LOCALSTORAGE
    // ==========================
    let hostels = JSON.parse(localStorage.getItem("hostels")) || [];

    hostels.push(data); // use backend response
    localStorage.setItem("hostels", JSON.stringify(hostels));

    // Clear inputs
    document.getElementById("hostelName").value = "";
    document.getElementById("hostelDescription").value = "";
    document.getElementById("hostelLocation").value = "";
    document.getElementById("hostelContact").value = "";

    loadHostels();

  } catch (error) {
    console.error(error);
    alert("Cannot connect to server");
  }
}

async function loadHostels() {
  const table = document.getElementById("hostelTable");
  table.innerHTML = "";

  try {
    // Fetch from backend
    const response = await fetch("http://localhost:5500/api/hostels");
    const hostels = await response.json();

    // Sync with localStorage
    localStorage.setItem("hostels", JSON.stringify(hostels));

    hostels.forEach((hostel, index) => {
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

  } catch (err) {
    console.error(err);
    // fallback to localStorage
    const hostels = JSON.parse(localStorage.getItem("hostels")) || [];
    hostels.forEach((hostel, index) => {
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
}

function deleteHostel(index) {
  let hostels = JSON.parse(localStorage.getItem("hostels"));
  hostels.splice(index, 1);
  localStorage.setItem("hostels", JSON.stringify(hostels));
  loadHostels();
}

function editHostel(index) {
  let hostels = JSON.parse(localStorage.getItem("hostels"));

  const newName = prompt("Name", hostels[index].name);
  const newDesc = prompt("Description", hostels[index].description);
  const newLocation = prompt("Location", hostels[index].location);
  const newContact = prompt("Contact", hostels[index].contactInfo);

  if (newName && newDesc && newLocation && newContact) {
    hostels[index] = {
      ...hostels[index],
      name: newName,
      description: newDesc,
      location: newLocation,
      contactInfo: newContact,
    };

    localStorage.setItem("hostels", JSON.stringify(hostels));
    loadHostels();
  }
}

// ================= SECTION SWITCH =================
function showSection(sectionId) {
  document.querySelectorAll(".section").forEach(sec => {
    sec.classList.remove("active");
  });

  document.getElementById(sectionId).classList.add("active");
}


// ================= APPLICATIONS =================
async function loadApplications() {
  const table = document.getElementById("applicationsTable");

  if (!table) return;

  table.innerHTML = `
    <tr>
      <td colspan="7">Loading applications...</td>
    </tr>
  `;

  try {
    // Get all submitted applications from backend
    const response = await fetch("http://localhost:5500/api/students");

    const applications = await response.json();

    if (!response.ok) {
      throw new Error(applications.error || "Failed to load applications");
    }

    table.innerHTML = "";

    if (applications.length === 0) {
      table.innerHTML = `
        <tr>
          <td colspan="7">No applications submitted yet</td>
        </tr>
      `;
      return;
    }

    applications.forEach((app) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${app.id}</td>
        <td>${app.fullName}</td>
        <td>${app.Room?.roomNumber || "N/A"}</td>
        <td>${new Date(app.createdAt).toLocaleDateString()}</td>
        <td class="status ${app.applicationStatus.toLowerCase()}">
          ${app.applicationStatus}
        </td>
        <td>${app.gender}</td>
        <td>
          <button 
            class="approve-btn"
            onclick="approveApplication(${app.id})"
            ${app.applicationStatus === "Approved" ? "disabled" : ""}
          >
            Approve
          </button>

          <button 
            class="reject-btn"
            onclick="rejectApplication(${app.id})"
            ${app.applicationStatus === "Rejected" ? "disabled" : ""}
          >
            Reject
          </button>
        </td>
      `;

      table.appendChild(row);
    });

  } catch (err) {
    console.error("Error loading applications:", err);

    table.innerHTML = `
      <tr>
        <td colspan="7">Failed to load applications</td>
      </tr>
    `;
  }
}


// ================= APPROVE APPLICATION =================
async function approveApplication(id) {
  try {
    const response = await fetch(
      `http://localhost:5500/api/students/approve/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to approve application");
    }

    alert("Application approved successfully");

    // Reload updated applications from database
    loadApplications();

  } catch (err) {
    console.error("Approve error:", err);
    alert(err.message);
  }
}


// ================= REJECT APPLICATION =================
async function rejectApplication(id) {
  try {
    const response = await fetch(
      `http://localhost:5500/api/students/reject/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to reject application");
    }

    alert("Application rejected successfully");

    // Reload updated applications from database
    loadApplications();

  } catch (err) {
    console.error("Reject error:", err);
    alert(err.message);
  }
}


// ================= AUTO LOAD =================
document.addEventListener("DOMContentLoaded", () => {
  loadApplications();
});
// ================= ROOMS =================


// Load rooms from backend (or fallback to localStorage)
// ================= ROOMS =================

// ✅ ALWAYS LOAD FROM BACKEND FIRST
async function loadRooms() {
  const table = document.getElementById("roomList");
  table.innerHTML = "";

  try {
    const response = await fetch("http://localhost:5500/api/rooms");
    const rooms = await response.json();

    // Sync localStorage
    localStorage.setItem("rooms", JSON.stringify(rooms));

    rooms.forEach((room) => {
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

  } catch (err) {
    console.error(err);

    // fallback to localStorage
    const rooms = JSON.parse(localStorage.getItem("rooms")) || [];

    rooms.forEach((room) => {
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
}


// ✅ ADD ROOM
async function addRoom() {
  const roomNumber = document.getElementById("roomName").value.trim();
  const capacity = document.getElementById("roomCapacity").value.trim();

  if (!roomNumber || !capacity) {
    alert("Fill all fields");
    return;
  }

  try {
    const response = await fetch("http://localhost:5500/api/rooms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        roomNumber,
        capacity,
        status: "Available"
      })
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Failed to add room");
      return;
    }

    // ✅ DO NOT manually push fake IDs
    await loadRooms();

    document.getElementById("roomName").value = "";
    document.getElementById("roomCapacity").value = "";

  } catch (err) {
    console.error(err);
    alert("Server error");
  }
}


// ✅ EDIT ROOM
async function editRoom(roomId) {
  const rooms = JSON.parse(localStorage.getItem("rooms")) || [];
  const room = rooms.find(r => r.id == roomId);

  if (!room) return alert("Room not found");

  const newRoomNumber = prompt("Room Number", room.roomNumber);
  const newCapacity = prompt("Capacity", room.capacity);

  if (!newRoomNumber || !newCapacity) return;

  try {
    const response = await fetch(`http://localhost:5500/api/rooms/${roomId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        roomNumber: newRoomNumber,
        capacity: parseInt(newCapacity)
      })
    });

    if (!response.ok) {
      const data = await response.json();
      alert(data.error || "Update failed");
      return;
    }

    await loadRooms();

  } catch (err) {
    console.error(err);
    alert("Cannot connect to server");
  }
}


// ✅ DELETE ROOM
async function deleteRoom(roomId) {
  if (!confirm("Delete this room?")) return;

  try {
    await fetch(`http://localhost:5500/api/rooms/${roomId}`, {
      method: "DELETE"
    });

    await loadRooms();

  } catch (err) {
    console.error(err);
    alert("Delete failed");
  }
}

// ================= HOSTEL ALLOCATION =================

document.addEventListener("DOMContentLoaded", () => {
  loadAllocations();

  const btn = document.getElementById("allocateBtn");
  if (btn) {
    btn.addEventListener("click", allocateStudent);
  }
});

// ================= LOAD APPROVED APPLICATIONS =================

document.addEventListener("DOMContentLoaded", () => {
  loadAllocations();

  const btn = document.getElementById("allocateBtn");
  if (btn) {
    btn.addEventListener("click", allocateStudent);
  }
});


// ================= LOAD APPROVED APPLICATIONS =================
async function loadAllocations() {
  const table = document.getElementById("allocationTable");
  if (!table) return;

  table.innerHTML = `<tr><td colspan="5">Loading...</td></tr>`;

  try {
    // Fetch all student applications
    const response = await fetch("http://localhost:5500/api/students");
    const students = await response.json();

    if (!response.ok) throw new Error(students.error || "Failed to load applications");

    table.innerHTML = "";

    if (students.length === 0) {
      table.innerHTML = `<tr><td colspan="5">No applications found</td></tr>`;
      return;
    }

    students.forEach(student => {
      // Determine allocation status
      let statusLabel = "Pending";
      let roomNumber = "Not Allocated";

      if (student.applicationStatus === "Allocated") {
        statusLabel = "Allocated";
        roomNumber = student.RoomId || "Assigned";
      } else if (student.applicationStatus === "Approved") {
        statusLabel = "Approved";
        roomNumber = student.RoomId || "Not Allocated";
      } else if (student.applicationStatus === "Rejected") {
        statusLabel = "Rejected";
        roomNumber = "-";
      }

      table.innerHTML += `
        <tr>
          <td>${student.id}</td>
          <td>${student.fullName}</td>
          <td>${student.hostel}</td>
          <td>${roomNumber}</td>
          <td>
            <span style="color:${
              statusLabel === "Allocated" ? "green" :
              statusLabel === "Approved" ? "orange" : "red"
            }">${statusLabel}</span>
          </td>
        </tr>
      `;
    });

  } catch (err) {
    console.error("Load allocation error:", err);
    table.innerHTML = `<tr><td colspan="5">Failed to load allocations</td></tr>`;
  }
}


// ================= ALLOCATE STUDENT =================
async function allocateStudent() {
  const studentId = document.getElementById("allocStudentId").value.trim();
  const roomId = document.getElementById("allocRoomId").value.trim();

  if (!studentId || !roomId) {
    alert("Please enter both Student ID and Room ID");
    return;
  }

  try {
    // Optional: verify student exists and is approved
    const studentsResponse = await fetch("http://localhost:5500/api/students");
    const students = await studentsResponse.json();

    const student = students.find(
      s => s.id == studentId && s.applicationStatus === "Approved"
    );

    if (!student) {
      alert("Student not found or not approved");
      return;
    }

    // Send allocation to backend
    const response = await fetch(
      "http://localhost:5500/api/allocation/allocate",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          studentId,
          roomId
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Allocation failed");
      return;
    }

    // Update student RoomId in local applications cache if you still use it
    let cachedApplications =
      JSON.parse(localStorage.getItem("applications")) || [];

    cachedApplications = cachedApplications.map(app => {
      if (app.id == studentId) {
        return {
          ...app,
          RoomId: roomId
        };
      }
      return app;
    });

    localStorage.setItem(
      "applications",
      JSON.stringify(cachedApplications)
    );

    alert("Student allocated successfully");

    document.getElementById("allocStudentId").value = "";
    document.getElementById("allocRoomId").value = "";

    loadAllocations();

  } catch (error) {
    console.error("Allocation error:", error);
    alert("Cannot connect to server");
  }
}

// ================= ALLOCATE STUDENT =================
async function allocateStudent() {
  const studentId = document.getElementById("allocStudentId").value.trim();
  const roomId = document.getElementById("allocRoomId").value.trim();

  if (!studentId || !roomId) {
    alert("Please enter both Student ID and Room ID");
    return;
  }

  try {
    // Optional: verify student exists and is approved
    const studentsResponse = await fetch("http://localhost:5500/api/students");
    const students = await studentsResponse.json();

    const student = students.find(
      s => s.id == studentId && s.applicationStatus === "Approved"
    );

    if (!student) {
      alert("Student not found or not approved");
      return;
    }

    // Send allocation to backend
    const response = await fetch(
      "http://localhost:5500/api/allocation/allocate",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          studentId,
          roomId
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Allocation failed");
      return;
    }

    // Update student RoomId in local applications cache if you still use it
    let cachedApplications =
      JSON.parse(localStorage.getItem("applications")) || [];

    cachedApplications = cachedApplications.map(app => {
      if (app.id == studentId) {
        return {
          ...app,
          RoomId: roomId
        };
      }
      return app;
    });

    localStorage.setItem(
      "applications",
      JSON.stringify(cachedApplications)
    );

    alert("Student allocated successfully");

    document.getElementById("allocStudentId").value = "";
    document.getElementById("allocRoomId").value = "";

    loadAllocations();

  } catch (error) {
    console.error("Allocation error:", error);
    alert("Cannot connect to server");
  }
}


// FETCH AND DISPLAY USERS
// ------------------------------
async function loadUsers() {
    const usersList = document.getElementById("usersList");
    usersList.innerHTML = ""; // Clear table

    try {
        const response = await fetch("http://localhost:5500/api/users");
        if (!response.ok) throw new Error("Failed to fetch users");

        const users = await response.json();

        users.forEach(user => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${user.location || "N/A"}</td>
                <td>
                    <button class="delete-btn" data-id="${user.id}">Delete</button>
                </td>
            `;

            usersList.appendChild(row);
        });

        // Attach delete handlers
        document.querySelectorAll(".delete-btn").forEach(btn => {
            btn.addEventListener("click", async () => {
                const userId = btn.getAttribute("data-id");
                if (!confirm("Are you sure you want to delete this user?")) return;

                try {
                    const res = await fetch(`http://localhost:5500/api/users/${userId}`, {
                        method: "DELETE"
                    });

                    if (!res.ok) throw new Error("Failed to delete user");

                    alert("User deleted successfully");
                    loadUsers(); 

                } catch (err) {
                    console.error(err);
                    alert("Error deleting user");
                }
            });
        });

    } catch (err) {
        console.error(err);
        alert("Failed to load users");
    }
}

// INITIAL LOAD
document.addEventListener("DOMContentLoaded", loadUsers);

// ================= INIT =================
window.addEventListener("DOMContentLoaded", () => {
  loadHostels();
  loadRooms();
  loadStudentOptions();
  loadRoomOptionsAllocation();
  loadAllocations();
});