// =============================================
// js/Rooms.js  (user booking page)
// =============================================

const ROOMS_API = "https://bookie-app-r03w.onrender.com/api";

// ── Auth guard ────────────────────────────────────────────────
const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
if (!currentUser) {
  alert("Please login first");
  window.location.href = "Login.html";
}

// ── Booking count badge ───────────────────────────────────────
let bookedHostels = JSON.parse(localStorage.getItem("bookedHostels")) || [];

function updateBookingCount() {
  const el = document.getElementById("booking-count");
  if (!el) return;
  const userId = currentUser._id || currentUser.id;
  el.textContent = bookedHostels.filter(b => b.userId === userId).length;
}
updateBookingCount();

// ── Fetch all hostels and rooms from backend ──────────────────
let allHostels = [];
let allRooms   = [];

async function fetchHostelsAndRooms() {
  try {
    [allHostels, allRooms] = await Promise.all([
      fetch(`${ROOMS_API}/hostels`).then(r => r.json()),
      fetch(`${ROOMS_API}/rooms`).then(r => r.json()),
    ]);
  } catch (err) {
    console.error("Failed to fetch hostels/rooms:", err);
  }
}

// ── Fetch submitted applications from the dashboard ──────────
// Returns an array of the student's already-submitted applications
async function fetchSubmittedApplications(userId) {
  try {
    const res = await fetch(`${ROOMS_API}/students/user/${userId}`);
    if (!res.ok) return [];
    const apps = await res.json();
    return Array.isArray(apps) ? apps : [];
  } catch (err) {
    console.error("Failed to fetch submitted applications:", err);
    return [];
  }
}

// ── Fuzzy hostel match ────────────────────────────────────────
function findHostel(nameFromHTML) {
  if (!nameFromHTML) return null;
  const needle = nameFromHTML.trim().toLowerCase();

  let found = allHostels.find(h => h.name.trim().toLowerCase() === needle);
  if (found) return found;

  found = allHostels.find(h => {
    const hay = h.name.trim().toLowerCase();
    return hay.includes(needle) || needle.includes(hay);
  });
  if (found) return found;

  const firstWord = needle.split(" ")[0];
  found = allHostels.find(h =>
    h.name.trim().toLowerCase().startsWith(firstWord)
  );

  return found || null;
}

// ── Fuzzy room match ──────────────────────────────────────────
function findAvailableRoom(roomTypeFromHTML) {
  if (!roomTypeFromHTML) return null;
  const needle = roomTypeFromHTML.trim().toLowerCase();

  const numMap = { single: 1, one: 1, "1": 1, two: 2, "2": 2, three: 3, "3": 3, four: 4, "4": 4 };
  let capacityTarget = null;
  for (const [key, val] of Object.entries(numMap)) {
    if (needle.includes(key)) { capacityTarget = val; break; }
  }

  return allRooms.find(r => {
    const isAvailable = !r.status || r.status.toLowerCase() === "available";
    if (!isAvailable) return false;

    if (capacityTarget !== null && Number(r.capacity) === capacityTarget) return true;

    const rn = (r.roomNumber || "").toLowerCase();
    if (rn.includes(needle) || needle.includes(rn)) return true;

    return false;
  });
}

// ── Book a hostel ─────────────────────────────────────────────
async function handleBooking(button) {
  const hostelName = (button.dataset.hostel    || "").trim();
  const roomType   = (button.dataset.room      || "").trim();
  const location   = (button.dataset.location  || "").trim();
  const price      = (button.dataset.price     || "").trim();

  // Always fetch fresh data so newly added admin hostels/rooms appear
  await fetchHostelsAndRooms();

  const userId = currentUser._id || currentUser.id;

  // ── Find hostel (flexible match) ──────────────────────────
  const hostel = findHostel(hostelName);
  if (!hostel) {
    const names = allHostels.length
      ? allHostels.map(h => `• ${h.name}`).join("\n")
      : "No hostels have been added yet.";
    alert(
      `"${hostelName}" could not be matched to any hostel in the system.\n\n` +
      `Available hostels:\n${names}\n\n` +
      `Tip: Ask the admin to add "${hostelName}" or check the spelling.`
    );
    return;
  }

  // ── Find available room (flexible match) ──────────────────
  const availableRoom = findAvailableRoom(roomType);
  if (!availableRoom) {
    alert(
      `No available room found for room type "${roomType}".\n` +
      `All matching rooms may be occupied or none have been added yet.\n` +
      `Please check back later or contact the admin.`
    );
    return;
  }

  // ── Fetch already-submitted applications from the backend ──
  const submittedApps = await fetchSubmittedApplications(userId);

  // ── Check if this specific hostel is already applied (backend) ──
  const alreadyAppliedHostel = submittedApps.find(
    app => app.hostel && app.hostel.trim().toLowerCase() === hostel.name.trim().toLowerCase()
  );
  if (alreadyAppliedHostel) {
    alert(`You have already submitted an application for "${hostel.name}". You cannot book it again.`);
    return;
  }

  // ── Check if this specific room is already applied (backend) ──
  const alreadyAppliedRoom = submittedApps.find(app => {
    const appliedRoomId = app.roomId?._id || app.roomId;
    return appliedRoomId && appliedRoomId.toString() === availableRoom._id.toString();
  });
  if (alreadyAppliedRoom) {
    alert(`You have already applied for this specific room. Please choose a different room.`);
    return;
  }

  // ── Duplicate cart booking check (same hostel in local cart) ──
  const alreadyInCart = bookedHostels.find(
    b => b.userId === userId && b.hostelId === hostel._id
  );
  if (alreadyInCart) {
    alert(`"${hostel.name}" is already in your booking cart. Go to Confirm Booking to apply.`);
    return;
  }

  // ── Duplicate cart booking check (same room in local cart) ──
  const roomAlreadyInCart = bookedHostels.find(
    b => b.userId === userId && b.roomId === availableRoom._id
  );
  if (roomAlreadyInCart) {
    alert(`This specific room is already in your booking cart.`);
    return;
  }

  // ── Max 5 bookings check (cart + submitted applications combined) ──
  const cartCount      = bookedHostels.filter(b => b.userId === userId).length;
  const submittedCount = submittedApps.length;
  const totalCount     = cartCount + submittedCount;

  if (totalCount >= 5) {
    alert(
      `You have reached the maximum of 5 hostel bookings.\n\n` +
      `Cart: ${cartCount}  |  Submitted applications: ${submittedCount}\n\n` +
      `Cancel a cart booking or contact the admin if you need to change a submitted application.`
    );
    return;
  }

  // ── Save booking to local cart ────────────────────────────
  const booking = {
    bookingId : Date.now(),
    userId,
    hostelId  : hostel._id,
    hostel    : hostel.name,
    location  : hostel.location || location,
    roomId    : availableRoom._id,
    room      : availableRoom.roomNumber || roomType,
    capacity  : availableRoom.capacity,
    price,
    status    : "Pending",
  };

  bookedHostels.push(booking);
  localStorage.setItem("bookedHostels", JSON.stringify(bookedHostels));
  updateBookingCount();
  alert(`"${hostel.name}" added to your bookings! (${totalCount + 1}/5 total)`);
}

// ── Attach listeners to all Book buttons ──────────────────────
document.querySelectorAll(".book-room").forEach(button => {
  button.addEventListener("click", function () {
    handleBooking(this);
  });
});

// ── Sync booking count across tabs ───────────────────────────
window.addEventListener("storage", () => {
  bookedHostels = JSON.parse(localStorage.getItem("bookedHostels")) || [];
  updateBookingCount();
});

// ── Hamburger / nav toggle ────────────────────────────────────
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
