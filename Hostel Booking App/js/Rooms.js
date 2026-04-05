// ================= USER SESSION =================
const currentUser = JSON.parse(localStorage.getItem("currentUser"));

if (!currentUser) {
  alert("Please login first");
  window.location.href = "Login.html";
}

// ================= STORAGE =================
let bookedHostels = JSON.parse(localStorage.getItem("bookedHostels")) || [];
const bookingCount = document.getElementById("booking-count");

// ================= UPDATE BOOKING COUNT =================
function updateBookingCount() {
  const userBookings = bookedHostels.filter(
    booking => booking.userId === currentUser.id
  );
  if (bookingCount) {
    bookingCount.textContent = userBookings.length;
  }
}

updateBookingCount();


// ================= HELPER: EXTRACT CAPACITY =================
function extractCapacity(roomType) {
  const str = (roomType || "").toLowerCase().trim();
  if (str.includes("single")) return 1;
  if (str.includes("one")) return 1;
  const match = str.match(/^(\d+)/);
  if (match) return parseInt(match[1]);
  return 1;
}


// ================= BOOK HOSTEL =================
document.querySelectorAll(".book-room").forEach(button => {
  button.addEventListener("click", function () {

    const hostelName = this.dataset.hostel.trim();
    const roomType   = this.dataset.room.trim();
    const location   = this.dataset.location.trim();
    const price      = this.dataset.price.trim();

    // ================= CHECK ADMIN HAS ADDED HOSTELS =================
    const hostels = JSON.parse(localStorage.getItem("hostels")) || [];

    if (hostels.length === 0) {
      alert("No hostels have been added by the admin yet. Please check back later.");
      return;
    }

    // ================= FIND HOSTEL BY NAME =================
    const hostel = hostels.find(
      h => h.name.trim().toLowerCase() === hostelName.toLowerCase()
    );

    if (!hostel) {
      const available = hostels.map(h => `• ${h.name}`).join("\n");
      alert(
        `"${hostelName}" has not been added to the system yet.\n\n` +
        `Currently available hostels:\n${available}\n\n` +
        `Please contact the admin to add this hostel.`
      );
      return;
    }

    // ================= CHECK ADMIN HAS ADDED ROOMS =================
    const rooms = JSON.parse(localStorage.getItem("rooms")) || [];

    if (rooms.length === 0) {
      alert("No rooms have been added by the admin yet. Please check back later.");
      return;
    }

    // ================= FIND AVAILABLE ROOM BY CAPACITY =================
    const roomCapacity = extractCapacity(roomType);

    const availableRoom = rooms.find(room => {
      const capacityMatch = Number(room.capacity) === roomCapacity;
      const isAvailable   = !room.status || room.status.toLowerCase() === "available";
      return capacityMatch && isAvailable;
    });

    if (!availableRoom) {
      alert(
        `No available "${roomType}" found.\n` +
        `All rooms of this type may be occupied or not yet added by the admin.`
      );
      return;
    }

    // ================= DUPLICATE BOOKING CHECK =================
    bookedHostels = JSON.parse(localStorage.getItem("bookedHostels")) || [];

    const alreadyBooked = bookedHostels.find(
      b => b.userId === currentUser.id && b.hostelId === hostel.id
    );

    if (alreadyBooked) {
      alert("You have already booked this hostel.");
      return;
    }

    // ================= MAX BOOKINGS CHECK =================
    const userBookings = bookedHostels.filter(
      b => b.userId === currentUser.id
    );

    if (userBookings.length >= 5) {
      alert("You can only book a maximum of 5 hostels.");
      return;
    }

    // ================= SAVE BOOKING TO LOCALSTORAGE =================
    const booking = {
      bookingId : Date.now(),
      userId    : currentUser.id,
      hostelId  : hostel.id,
      hostel    : hostel.name,
      location  : location,
      roomId    : availableRoom.id,
      room      : roomType,
      price     : price,
      status    : "Pending",
    };

    bookedHostels.push(booking);
    localStorage.setItem("bookedHostels", JSON.stringify(bookedHostels));

    updateBookingCount();
    alert(`"${hostel.name}" has been added to your bookings!`);
  });
});


// ================= SYNC COUNT ACROSS TABS =================
window.addEventListener("storage", () => {
  bookedHostels = JSON.parse(localStorage.getItem("bookedHostels")) || [];
  updateBookingCount();
});



  const navToggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector("nav");

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



