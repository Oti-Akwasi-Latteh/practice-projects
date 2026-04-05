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
      container.innerHTML = `
        <div class="empty-message">
          <h3>No hostel booked yet</h3>
          <p>Go to the hostels page to book one.</p>
        </div>
      `;
      return;
    }

    myBookings.forEach(booking => {

      // Check if hostel still exists in admin's localStorage
      const hostels = JSON.parse(localStorage.getItem("hostels")) || [];
      const hostelStillExists = hostels.find(h => h.id === booking.hostelId);

      const card = document.createElement("div");
      card.className = "booking-card";
      card.innerHTML = `
        <h2>${booking.hostel}</h2>
        <p><strong>Location:</strong> ${booking.location}</p>
        <p><strong>Room Capacity:</strong> ${booking.room}-Person Room</p>
        <p><strong>Price:</strong> ${booking.price}</p>
        ${!hostelStillExists
          ? `<p class="warn-text">⚠ This hostel may no longer be available</p>`
          : ""}
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

        modalText.textContent =
          `Applying for ${selectedBooking.hostel} — ${selectedBooking.room}-Person Room`;
        errorText.textContent = "";
        modal.style.display = "flex";
      });
    });


    // ================= CANCEL BUTTON =================
    document.querySelectorAll(".cancel-btn").forEach(button => {
      button.addEventListener("click", () => {
        const bookingId = Number(button.dataset.id);
        if (!confirm("Remove this booking?")) return;

        let bookings = JSON.parse(localStorage.getItem("bookedHostels")) || [];
        bookings = bookings.filter(b => b.bookingId !== bookingId);
        localStorage.setItem("bookedHostels", JSON.stringify(bookings));
        loadBookings();
        alert("Booking removed successfully.");
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
  document.getElementById("submitApplication").addEventListener("click", () => {
    if (!selectedBooking) return;

    const firstName = firstNameInput.value.trim();
    const lastName = lastNameInput.value.trim();
    const email = emailInput.value.trim();
    const school = schoolInput.value.trim();
    const gender = genderSelect.value;

    if (!firstName || !lastName || !email || !school || !gender) {
      errorText.textContent = "Please fill all fields.";
      return;
    }

    // ================= NAME MATCH CHECK =================
    const usernameParts = currentUser.username.trim().split(" ");
    const expectedFirst = (usernameParts[0] || "").toLowerCase();
    const expectedLast = usernameParts.slice(1).join(" ").toLowerCase();

    if (
      firstName.toLowerCase() !== expectedFirst ||
      lastName.toLowerCase() !== expectedLast
    ) {
      errorText.textContent = "Name must match your account username.";
      return;
    }

    // ================= EMAIL MATCH CHECK =================
    if (email.toLowerCase() !== currentUser.email.toLowerCase()) {
      errorText.textContent = "Please use the email you signed in with.";
      return;
    }

    // ================= VERIFY HOSTEL STILL EXISTS =================
    const hostels = JSON.parse(localStorage.getItem("hostels")) || [];
    const hostel = hostels.find(h => h.id === selectedBooking.hostelId);

    if (!hostel) {
      errorText.textContent = "This hostel no longer exists. Please cancel and rebook.";
      return;
    }

    // ================= FIND MATCHING AVAILABLE ROOM =================
    const rooms = JSON.parse(localStorage.getItem("rooms")) || [];
    const roomCapacity = parseInt(selectedBooking.room);

    // First try to find the exact room that was booked
    let room = rooms.find(r => r.id === selectedBooking.roomId);

    // If that room is now occupied or gone, find any available room
    // with the same capacity as a fallback
    if (!room || (room.status && room.status.toLowerCase() !== "available")) {
      room = rooms.find(r => {
        const sameCapacity = Number(r.capacity) === roomCapacity;
        const isAvailable = !r.status || r.status.toLowerCase() === "available";
        return sameCapacity && isAvailable;
      });
    }

    if (!room) {
      errorText.textContent = "No available room found. The room may have been filled.";
      return;
    }

    // ================= DUPLICATE APPLICATION CHECK =================
    const students = JSON.parse(localStorage.getItem("students")) || [];

    const alreadyApplied = students.find(
      s =>
        String(s.userId) === String(currentUser.id) &&
        s.hostel === hostel.name
    );

    if (alreadyApplied) {
      errorText.textContent = "You have already applied for this hostel.";
      return;
    }

    // ================= SAVE APPLICATION =================
    const newStudent = {
      id: students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1,
      fullName: `${firstName} ${lastName}`,
      email,
      school,
      gender,
      hostel: hostel.name,
      hostelId: hostel.id,
      roomNumber: room.roomNumber,
      roomId: room.id,
      userId: currentUser.id,
      applicationStatus: "Pending",
      createdAt: new Date().toISOString(),
    };

    students.push(newStudent);
    localStorage.setItem("students", JSON.stringify(students));

    // ================= REMOVE BOOKING AFTER APPLYING =================
    let bookings = JSON.parse(localStorage.getItem("bookedHostels")) || [];
    bookings = bookings.filter(b => b.bookingId !== selectedBooking.bookingId);
    localStorage.setItem("bookedHostels", JSON.stringify(bookings));

    alert("Application submitted successfully!");
    window.location.href = "confirmMessage.html";
  });


  // ================= INITIAL LOAD =================
  loadBookings();
});
