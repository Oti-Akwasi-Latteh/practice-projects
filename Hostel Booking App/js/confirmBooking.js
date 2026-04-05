document.addEventListener("DOMContentLoaded", () => {

  // ================= USER SESSION =================
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  if (!currentUser) {
    alert("Please login first");
    window.location.href = "Login.html";
    return;
  }

  // ================= ELEMENT REFERENCES =================
  const container      = document.getElementById("bookingContainer");
  const modal          = document.getElementById("bookingModal");
  const modalText      = document.getElementById("modalText");
  const errorText      = document.getElementById("formError");
  const firstNameInput = document.getElementById("firstName");
  const lastNameInput  = document.getElementById("lastName");
  const emailInput     = document.getElementById("email");
  const schoolInput    = document.getElementById("school");
  const genderSelect   = document.getElementById("gender");
  let selectedBooking  = null;


  // ================= HELPER: EXTRACT CAPACITY =================
  function extractCapacity(roomType) {
    const str = (roomType || "").toLowerCase().trim();
    if (str.includes("single")) return 1;
    if (str.includes("one")) return 1;
    const match = str.match(/^(\d+)/);
    if (match) return parseInt(match[1]);
    return 1;
  }


  // ================= LOAD BOOKINGS =================
  function loadBookings() {
    const allBookings = JSON.parse(localStorage.getItem("bookedHostels")) || [];
    const myBookings  = allBookings.filter(b => b.userId === currentUser.id);

    container.innerHTML = "";

    if (myBookings.length === 0) {
      container.innerHTML = `
        <div class="empty-message">
          <h3>No hostel booked yet</h3>
          <p>Go to the <a href="Rooms.html">Rooms page</a> to book one.</p>
        </div>
      `;
      return;
    }

    myBookings.forEach(booking => {

      // Check if hostel still exists in admin localStorage
      const hostels      = JSON.parse(localStorage.getItem("hostels")) || [];
      const hostelExists = hostels.find(h => h.id === booking.hostelId);

      const card = document.createElement("div");
      card.className = "booking-card";

      card.innerHTML = `
        <h2>${booking.hostel}</h2>
        <p><strong>Location:</strong> ${booking.location}</p>
        <p><strong>Room Type:</strong> ${booking.room}</p>
        <p><strong>Price:</strong> ${booking.price}</p>
        ${!hostelExists
          ? `<p style="color: orange; font-size: 13px; margin-top: 6px;">
               ⚠ This hostel may no longer be available in the system
             </p>`
          : ""}
        <div class="button-group">
          <button class="apply-btn"  data-id="${booking.bookingId}">Apply</button>
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

        // Pre-fill name and email from currentUser
        const parts = (currentUser.username || "").trim().split(" ");
        firstNameInput.value = parts[0] || "";
        lastNameInput.value  = parts.slice(1).join(" ") || "";
        emailInput.value     = currentUser.email || "";

        modalText.textContent =
          `Applying for ${selectedBooking.hostel} — ${selectedBooking.room}`;
        errorText.textContent = "";
        modal.style.display   = "flex";
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
    const lastName  = lastNameInput.value.trim();
    const email     = emailInput.value.trim();
    const school    = schoolInput.value.trim();
    const gender    = genderSelect.value;

    // ================= EMPTY FIELD CHECK =================
    if (!firstName || !lastName || !email || !school || !gender) {
      errorText.textContent = "Please fill all fields.";
      return;
    }

    // ================= NAME MATCH CHECK =================
    const parts         = (currentUser.username || "").trim().split(" ");
    const expectedFirst = (parts[0] || "").toLowerCase();
    const expectedLast  = parts.slice(1).join(" ").toLowerCase();

    if (
      firstName.toLowerCase() !== expectedFirst ||
      lastName.toLowerCase()  !== expectedLast
    ) {
      errorText.textContent =
        "First and last name must match your account username.";
      return;
    }

    // ================= EMAIL MATCH CHECK =================
    if (email.toLowerCase() !== (currentUser.email || "").toLowerCase()) {
      errorText.textContent = "Please use the email you signed in with.";
      return;
    }

    // ================= VERIFY HOSTEL STILL EXISTS =================
    const hostels = JSON.parse(localStorage.getItem("hostels")) || [];
    const hostel  = hostels.find(h => h.id === selectedBooking.hostelId);

    if (!hostel) {
      errorText.textContent =
        "This hostel no longer exists. Please cancel this booking and rebook.";
      return;
    }

    // ================= FIND AVAILABLE ROOM =================
    const rooms        = JSON.parse(localStorage.getItem("rooms")) || [];
    const roomCapacity = extractCapacity(selectedBooking.room);

    // Try the exact room booked first
    let room = rooms.find(r => r.id === selectedBooking.roomId);

    // If that room is gone or now occupied, find any room with same capacity
    if (!room || (room.status && room.status.toLowerCase() !== "available")) {
      room = rooms.find(r => {
        const sameCapacity = Number(r.capacity) === roomCapacity;
        const isAvailable  = !r.status || r.status.toLowerCase() === "available";
        return sameCapacity && isAvailable;
      });
    }

    if (!room) {
      errorText.textContent =
        "No available room found. The room may have been filled. Please cancel and rebook.";
      return;
    }

    // ================= DUPLICATE APPLICATION CHECK =================
    const students = JSON.parse(localStorage.getItem("students")) || [];

    const alreadyApplied = students.find(
      s =>
        String(s.userId) === String(currentUser.id) &&
        s.hostel          === hostel.name
    );

    if (alreadyApplied) {
      errorText.textContent =
        "You have already submitted an application for this hostel.";
      return;
    }

    // ================= SAVE APPLICATION TO LOCALSTORAGE =================
    const newStudent = {
      id                : students.length > 0
                          ? Math.max(...students.map(s => s.id)) + 1
                          : 1,
      fullName          : `${firstName} ${lastName}`,
      email,
      school,
      gender,
      hostel            : hostel.name,
      hostelId          : hostel.id,
      roomNumber        : room.roomNumber,
      roomId            : room.id,
      userId            : currentUser.id,
      applicationStatus : "Pending",
      createdAt         : new Date().toISOString(),
    };

    students.push(newStudent);
    localStorage.setItem("students", JSON.stringify(students));

    // ================= REMOVE BOOKING AFTER APPLYING =================
    let bookings = JSON.parse(localStorage.getItem("bookedHostels")) || [];
    bookings = bookings.filter(b => b.bookingId !== selectedBooking.bookingId);
    localStorage.setItem("bookedHostels", JSON.stringify(bookings));

    modal.style.display = "none";
    alert("Application submitted successfully!");
    window.location.href = "confirmMessage.html";
  });


  // ================= INITIAL LOAD =================
  loadBookings();

});
