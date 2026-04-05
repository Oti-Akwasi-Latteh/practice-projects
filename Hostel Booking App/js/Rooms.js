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


// ================= RENDER HOSTELS DYNAMICALLY =================
function renderHostels() {
  const hostels = JSON.parse(localStorage.getItem("hostels")) || [];
  const rooms = JSON.parse(localStorage.getItem("rooms")) || [];

  const container = document.getElementById("hostelListContainer");
  if (!container) return;

  container.innerHTML = "";

  if (hostels.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>No hostels available yet</h3>
        <p>Please check back later.</p>
      </div>
    `;
    return;
  }

  // Get all available rooms
  const availableRooms = rooms.filter(
    r => !r.status || r.status.toLowerCase() === "available"
  );

  hostels.forEach(hostel => {

    // Get unique capacities from available rooms
    const capacities = [...new Set(availableRooms.map(r => Number(r.capacity)))];

    const roomButtons = capacities.length > 0
      ? capacities.map(cap => `
          <button
            class="book-room"
            data-hostelid="${hostel.id}"
            data-hostel="${hostel.name}"
            data-room="${cap}"
            data-location="${hostel.location}"
            data-price="Contact for price"
          >
            Book ${cap}-Person Room
          </button>
        `).join("")
      : `<p class="no-rooms">No rooms available at the moment</p>`;

    const card = document.createElement("div");
    card.className = "hostel-card";
    card.innerHTML = `
      <div class="hostel-info">
        <h2>${hostel.name}</h2>
        <p><strong>Location:</strong> ${hostel.location}</p>
        <p><strong>Description:</strong> ${hostel.description}</p>
        <p><strong>Contact:</strong> ${hostel.contactInfo}</p>
      </div>
      <div class="room-buttons">
        ${roomButtons}
      </div>
    `;
    container.appendChild(card);
  });

  // Attach listeners after cards are in the DOM
  attachBookListeners();
}


// ================= ATTACH BOOK LISTENERS =================
function attachBookListeners() {
  document.querySelectorAll(".book-room").forEach(button => {
    button.addEventListener("click", function () {

      const hostelId = parseInt(this.dataset.hostelid);
      const hostelName = this.dataset.hostel.trim();
      const roomType = this.dataset.room.trim();
      const location = this.dataset.location.trim();
      const price = this.dataset.price.trim();

      // ================= FIND HOSTEL BY ID =================
      const hostels = JSON.parse(localStorage.getItem("hostels")) || [];
      const hostel = hostels.find(h => h.id === hostelId);

      if (!hostel) {
        alert("Hostel not found. Please refresh the page.");
        return;
      }

      // ================= FIND AVAILABLE ROOM BY CAPACITY =================
      const rooms = JSON.parse(localStorage.getItem("rooms")) || [];
      const roomCapacity = parseInt(roomType);

      const availableRoom = rooms.find(room => {
        const sameCapacity = Number(room.capacity) === roomCapacity;
        const isAvailable = !room.status || room.status.toLowerCase() === "available";
        return sameCapacity && isAvailable;
      });

      if (!availableRoom) {
        alert("No available room for this selection. Please try another.");
        return;
      }

      // ================= DUPLICATE CHECK =================
      bookedHostels = JSON.parse(localStorage.getItem("bookedHostels")) || [];

      const alreadyBooked = bookedHostels.find(
        booking =>
          booking.userId === currentUser.id &&
          booking.hostelId === hostel.id
      );

      if (alreadyBooked) {
        alert("You have already booked this hostel.");
        return;
      }

      // ================= MAX BOOKINGS CHECK =================
      const userBookings = bookedHostels.filter(
        booking => booking.userId === currentUser.id
      );

      if (userBookings.length >= 5) {
        alert("You can only book a maximum of 5 hostels.");
        return;
      }

      // ================= SAVE BOOKING =================
      const booking = {
        bookingId: Date.now(),
        userId: currentUser.id,
        hostelId: hostel.id,
        hostel: hostel.name,
        location: hostel.location,
        roomId: availableRoom.id,
        room: roomType,
        price,
        status: "Pending",
      };

      bookedHostels.push(booking);
      localStorage.setItem("bookedHostels", JSON.stringify(bookedHostels));

      updateBookingCount();
      alert(`"${hostel.name}" added to your bookings!`);
    });
  });
}


// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
  renderHostels();
});

// ================= SYNC COUNT ACROSS TABS =================
window.addEventListener("storage", () => {
  bookedHostels = JSON.parse(localStorage.getItem("bookedHostels")) || [];
  updateBookingCount();
});
