// ================= USER SESSION =================
const currentUser = JSON.parse(localStorage.getItem("currentUser"));

if (!currentUser) {
  alert("Please login first");
  window.location.href = "Login.html";
}

// ================= STORAGE =================
let bookedHostels = JSON.parse(localStorage.getItem("bookedHostels")) || [];
const bookingCount = document.getElementById("booking-count");

function updateBookingCount() {
  const userBookings = bookedHostels.filter(
    booking => booking.userId === currentUser.id
  );
  if (bookingCount) {
    bookingCount.textContent = userBookings.length;
  }
}

updateBookingCount();

// ================= BOOK HOSTEL =================
document.querySelectorAll(".book-room").forEach(button => {
  button.addEventListener("click", function () {
    const hostelName = this.dataset.hostel.trim();
    const roomType = this.dataset.room.trim();
    const location = this.dataset.location.trim();
    const price = this.dataset.price.trim();

    // ================= FIND HOSTEL IN LOCALSTORAGE =================
    const hostels = JSON.parse(localStorage.getItem("hostels")) || [];
    const hostel = hostels.find(
      h => h.name.toLowerCase().trim() === hostelName.toLowerCase()
    );

    if (!hostel) {
      alert("Hostel not found. Make sure hostels have been added by admin.");
      return;
    }

    // ================= FIND AVAILABLE ROOM IN LOCALSTORAGE =================
    const rooms = JSON.parse(localStorage.getItem("rooms")) || [];
    const roomCapacity = parseInt(roomType);

    const availableRoom = rooms.find(room => {
      const sameCapacity = !isNaN(roomCapacity) && Number(room.capacity) === roomCapacity;
      const isAvailable = !room.status || room.status.toLowerCase() === "available";
      return sameCapacity && isAvailable;
    });

    if (!availableRoom) {
      alert("No available room found for this hostel");
      return;
    }

    // ================= DUPLICATE CHECK =================
    const alreadyBooked = bookedHostels.find(
      booking =>
        booking.userId === currentUser.id &&
        booking.hostelId === hostel.id
    );

    if (alreadyBooked) {
      alert("You have already booked this hostel");
      return;
    }

    // ================= MAX BOOKINGS CHECK =================
    const userBookings = bookedHostels.filter(
      booking => booking.userId === currentUser.id
    );

    if (userBookings.length >= 5) {
      alert("You can only book a maximum of 5 hostels");
      return;
    }

    // ================= SAVE BOOKING =================
    const booking = {
      bookingId: Date.now(),
      userId: currentUser.id,
      hostelId: hostel.id,
      hostel: hostel.name,
      location,
      roomId: availableRoom.id,
      room: roomType,
      price,
      status: "Pending",
    };

    bookedHostels.push(booking);
    localStorage.setItem("bookedHostels", JSON.stringify(bookedHostels));

    updateBookingCount();
    alert("Hostel added to your bookings");
  });
});

// ================= SYNC COUNT ACROSS TABS =================
window.addEventListener("storage", () => {
  bookedHostels = JSON.parse(localStorage.getItem("bookedHostels")) || [];
  updateBookingCount();
});
