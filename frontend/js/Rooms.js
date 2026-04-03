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
    (booking) => booking.userId === currentUser.id
  );

  if (bookingCount) {
    bookingCount.textContent = userBookings.length;
  }
}

updateBookingCount();

// ================= BOOK HOSTEL =================
document.querySelectorAll(".book-room").forEach((button) => {
  button.addEventListener("click", async function () {
    const hostelName = this.dataset.hostel.trim();
    const roomType = this.dataset.room.trim();
    const location = this.dataset.location.trim();
    const price = this.dataset.price.trim();

    try {
      const hostelResponse = await fetch("http://localhost:5500/api/hostels");
      const hostels = await hostelResponse.json();

      const hostel = hostels.find(
        (h) => h.name.toLowerCase().trim() === hostelName.toLowerCase()
      );

      if (!hostel) {
        alert("Hostel not found");
        return;
      }

      const roomResponse = await fetch("http://localhost:5500/api/rooms");
      const rooms = await roomResponse.json();

      const roomCapacity = parseInt(roomType);

      const availableRoom = rooms.find((room) => {
        const sameHostel = String(room.HostelId) === String(hostel.id);

        const sameCapacity =
          !isNaN(roomCapacity) && Number(room.capacity) === roomCapacity;

        const isAvailable =
          !room.status || room.status.toLowerCase() === "available";

        return sameHostel && sameCapacity && isAvailable;
      });

      if (!availableRoom) {
        alert("No available room found for this hostel");
        return;
      }

      const alreadyBooked = bookedHostels.find(
        (booking) =>
          booking.userId === currentUser.id &&
          booking.hostelId === hostel.id
      );

      if (alreadyBooked) {
        alert("You have already booked this hostel");
        return;
      }

      const userBookings = bookedHostels.filter(
        (booking) => booking.userId === currentUser.id
      );

      if (userBookings.length >= 5) {
        alert("You can only book a maximum of 5 hostels");
        return;
      }

      const booking = {
        bookingId: Date.now(),
        userId: currentUser.id,
        hostelId: hostel.id,
        hostel: hostel.name,
        location,
        roomId: availableRoom.id,
        room: roomType,
        price,
        status: "Pending"
      };

      bookedHostels.push(booking);
      localStorage.setItem("bookedHostels", JSON.stringify(bookedHostels));

      updateBookingCount();

      alert("Hostel added to your bookings");

    } catch (err) {
      console.error(err);
      alert("Unable to book hostel");
    }
  });
});

// Update count automatically if another page changes localStorage
window.addEventListener("storage", () => {
  bookedHostels = JSON.parse(localStorage.getItem("bookedHostels")) || [];
  updateBookingCount();
});

