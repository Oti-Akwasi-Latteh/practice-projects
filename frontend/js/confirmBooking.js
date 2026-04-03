document.addEventListener("DOMContentLoaded", () => {

  // ================= USER SESSION =================
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  if (!currentUser) {
    alert("Please login first");
    window.location.href = "Login.html";
    return;
  }

  // ================= ELEMENT REFERENCES =================
  const container = document.getElementById("bookingContainer");
  const modal = document.getElementById("bookingModal");
  const modalText = document.getElementById("modalText");
  const errorText = document.getElementById("formError");
  const firstNameInput = document.getElementById("firstName");
  const lastNameInput = document.getElementById("lastName");
  const emailInput = document.getElementById("email");
  const schoolInput = document.getElementById("school");
  const genderSelect = document.getElementById("gender");
  let selectedBooking = null;

  // ================= LOAD BOOKINGS =================
  function loadBookings() {
    const allBookings = JSON.parse(localStorage.getItem("bookedHostels")) || [];
    const myBookings = allBookings.filter(b => b.userId === currentUser.id);

    container.innerHTML = "";

    if (myBookings.length === 0) {
      container.innerHTML = `<div class="empty-message"><h3>No hostel booked yet</h3></div>`;
      return;
    }

    myBookings.forEach(booking => {
      const card = document.createElement("div");
      card.className = "booking-card";

      card.innerHTML = `
        <h2>${booking.hostel}</h2>
        <p><strong>Location:</strong> ${booking.location}</p>
        <p><strong>Room:</strong> ${booking.room}</p>
        <p><strong>Price:</strong> ${booking.price}</p>
        <div class="button-group">
          <button class="apply-btn" data-id="${booking.bookingId}">Apply</button>
          <button class="cancel-btn" data-id="${booking.bookingId}">Cancel</button>
        </div>
      `;
      container.appendChild(card);
    });

    // ================= APPLY BUTTON =================
    document.querySelectorAll(".apply-btn").forEach(button => {
      button.addEventListener("click", () => {
        const bookingId = Number(button.dataset.id);
        selectedBooking = myBookings.find(b => b.bookingId === bookingId);
        if (!selectedBooking) return;

        const usernameParts = currentUser.username.trim().split(" ");
        firstNameInput.value = usernameParts[0] || "";
        lastNameInput.value = usernameParts.slice(1).join(" ") || "";
        emailInput.value = currentUser.email || "";

        modalText.textContent = `Applying for ${selectedBooking.hostel} - ${selectedBooking.room}`;
        errorText.textContent = "";
        modal.style.display = "flex";
      });
    });

    // ================= CANCEL BUTTON =================
    document.querySelectorAll(".cancel-btn").forEach(button => {
      button.addEventListener("click", () => {
        const bookingId = Number(button.dataset.id);
        let bookings = JSON.parse(localStorage.getItem("bookedHostels")) || [];
        bookings = bookings.filter(b => b.bookingId !== bookingId);
        localStorage.setItem("bookedHostels", JSON.stringify(bookings));
        loadBookings();
        alert("Booking removed successfully");
      });
    });
  }

  // ================= CLOSE MODAL =================
  function closeModal() {
    modal.style.display = "none";
    selectedBooking = null;
  }
  window.closeModal = closeModal;

  // ================= SUBMIT APPLICATION =================
  document.getElementById("submitApplication").addEventListener("click", async () => {
    if (!selectedBooking) return;

    const firstName = firstNameInput.value.trim();
    const lastName = lastNameInput.value.trim();
    const email = emailInput.value.trim();
    const school = schoolInput.value.trim();
    const gender = genderSelect.value;

    if (!firstName || !lastName || !email || !school || !gender) {
      errorText.textContent = "Fill all fields";
      return;
    }

    const usernameParts = currentUser.username.trim().split(" ");
    const expectedFirstName = (usernameParts[0] || "").toLowerCase();
    const expectedLastName = usernameParts.slice(1).join(" ").toLowerCase();

    if (firstName.toLowerCase() !== expectedFirstName || lastName.toLowerCase() !== expectedLastName) {
      errorText.textContent = "First name and last name must match your signed-in username";
      return;
    }

    if (email.toLowerCase() !== currentUser.email.toLowerCase()) {
      errorText.textContent = "Please use the same email used to log in";
      return;
    }

    try {
      const roomsResponse = await fetch("http://localhost:5500/api/rooms");
      const rooms = await roomsResponse.json();
      const room = rooms.find(r => String(r.id) === String(selectedBooking.roomId));
      if (!room) throw new Error("Room not found");

      const response = await fetch("http://localhost:5500/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: `${firstName} ${lastName}`,
          email,
          school,
          gender,
          hostel: selectedBooking.hostel,
          roomNumber: room.roomNumber,
          userId: currentUser.id
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to submit application");

      let bookings = JSON.parse(localStorage.getItem("bookedHostels")) || [];
      bookings = bookings.filter(b => b.bookingId !== selectedBooking.bookingId);
      localStorage.setItem("bookedHostels", JSON.stringify(bookings));

      alert("Application submitted successfully");
      window.location.href = "confirmMessage.html";

    } catch (err) {
      console.error(err);
      errorText.textContent = err.message;
    }
  });

  // ================= INITIAL LOAD =================
  loadBookings();
});