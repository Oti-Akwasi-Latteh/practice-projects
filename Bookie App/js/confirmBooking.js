// =============================================
// js/confirmBooking.js
// =============================================
 
document.addEventListener("DOMContentLoaded", () => {
  const CONFIRM_API = "http://localhost:9000/api";
 
  // ── Auth guard ────────────────────────────────────────────
  const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
  if (!currentUser) {
    alert("Please login first");
    window.location.href = "Login.html";
    return;
  }
 
  const container      = document.getElementById("bookingContainer");
  const modal          = document.getElementById("bookingModal");
  const modalText      = document.getElementById("modalText");
  const errorText      = document.getElementById("formError");
  const firstNameInput = document.getElementById("firstName");
  const lastNameInput  = document.getElementById("lastName");
  const emailInput     = document.getElementById("email");
  const schoolInput    = document.getElementById("school");
  const genderSelect   = document.getElementById("gender");
  let   selectedBooking = null;

  // ── Fetch submitted applications from the dashboard ───────
  async function fetchSubmittedApplications() {
    const userId = currentUser._id || currentUser.id;
    try {
      const res = await fetch(`${CONFIRM_API}/students/user/${userId}`);
      if (!res.ok) return [];
      const apps = await res.json();
      return Array.isArray(apps) ? apps : [];
    } catch (err) {
      console.error("Failed to fetch submitted applications:", err);
      return [];
    }
  }
 
  // ── Load bookings from local cart ─────────────────────────
  function loadBookings() {
    const allBookings = JSON.parse(localStorage.getItem("bookedHostels")) || [];
    const userId      = currentUser._id || currentUser.id;
    const myBookings  = allBookings.filter(b => b.userId === userId);
    container.innerHTML = "";
 
    if (!myBookings.length) {
      container.innerHTML = `
        <div class="empty-message">
          <h3>No hostel booked yet</h3>
          <p>Go to the <a href="Rooms.html">Rooms page</a> to book one.</p>
        </div>`;
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
          <button class="apply-btn"  data-id="${booking.bookingId}">Apply</button>
          <button class="cancel-btn" data-id="${booking.bookingId}">Cancel</button>
        </div>`;
      container.appendChild(card);
    });
 
    // Apply
    document.querySelectorAll(".apply-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = Number(btn.dataset.id);
        const booking = myBookings.find(b => b.bookingId === id);
        if (!booking) return;

        // Disable button to prevent double clicks
        btn.disabled = true;
        btn.textContent = "Checking...";

        // ── Fetch current submitted applications ────────────
        const submittedApps = await fetchSubmittedApplications();

        // ── Max 5 check (submitted + remaining cart items) ──
        const allCart        = JSON.parse(localStorage.getItem("bookedHostels")) || [];
        const userId         = currentUser._id || currentUser.id;
        const cartCount      = allCart.filter(b => b.userId === userId).length;
        const submittedCount = submittedApps.length;

        // submitted + remaining cart (excluding the one being applied now)
        if (submittedCount >= 5) {
          alert(
            `You have already submitted ${submittedCount} application(s), which is the maximum allowed.\n\n` +
            `Contact the admin if you need to change a submitted application.`
          );
          btn.disabled = false;
          btn.textContent = "Apply";
          return;
        }

        if (submittedCount + cartCount > 5) {
          alert(
            `Applying would exceed the maximum of 5 total hostel bookings.\n\n` +
            `Submitted: ${submittedCount}  |  Cart: ${cartCount}\n\n` +
            `Please cancel some cart bookings before applying.`
          );
          btn.disabled = false;
          btn.textContent = "Apply";
          return;
        }

        // ── Check if this hostel is already applied ─────────
        const alreadyAppliedHostel = submittedApps.find(
          app => app.hostel && app.hostel.trim().toLowerCase() === booking.hostel.trim().toLowerCase()
        );
        if (alreadyAppliedHostel) {
          alert(`You have already submitted an application for "${booking.hostel}". You cannot apply again.`);
          btn.disabled = false;
          btn.textContent = "Apply";
          return;
        }

        // ── Check if this specific room is already applied ──
        const alreadyAppliedRoom = submittedApps.find(app => {
          const appliedRoomId = app.roomId?._id || app.roomId;
          return appliedRoomId && appliedRoomId.toString() === booking.roomId.toString();
        });
        if (alreadyAppliedRoom) {
          alert(
            `You have already applied for this specific room in "${alreadyAppliedRoom.hostel || "another hostel"}".\n` +
            `Each room can only be applied for once. Please go back and choose a different room.`
          );
          btn.disabled = false;
          btn.textContent = "Apply";
          return;
        }

        // ── All checks passed — open modal ──────────────────
        selectedBooking = booking;

        const parts = (currentUser.username || "").trim().split(" ");
        firstNameInput.value = parts[0] || "";
        lastNameInput.value  = parts.slice(1).join(" ") || "";
        emailInput.value     = currentUser.email || "";
 
        modalText.textContent = `Applying for ${selectedBooking.hostel} — ${selectedBooking.room}`;
        errorText.textContent = "";
        modal.style.display   = "flex";

        btn.disabled = false;
        btn.textContent = "Apply";
      });
    });
 
    // Cancel
    document.querySelectorAll(".cancel-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        if (!confirm("Remove this booking?")) return;
        let bookings = JSON.parse(localStorage.getItem("bookedHostels")) || [];
        bookings = bookings.filter(b => b.bookingId !== Number(btn.dataset.id));
        localStorage.setItem("bookedHostels", JSON.stringify(bookings));
        loadBookings();
        alert("Booking removed");
      });
    });
  }
 
  // ── Close modal ───────────────────────────────────────────
  window.closeModal = () => { modal.style.display = "none"; selectedBooking = null; };
 
  // ── Submit application to backend ─────────────────────────
  document.getElementById("submitApplication").addEventListener("click", async () => {
    if (!selectedBooking) return;
 
    const firstName = firstNameInput.value.trim();
    const lastName  = lastNameInput.value.trim();
    const email     = emailInput.value.trim();
    const school    = schoolInput.value.trim();
    const gender    = genderSelect.value;
 
    if (!firstName || !lastName || !email || !school || !gender) {
      errorText.textContent = "Please fill all fields."; return;
    }
 
    // Name must match account
    const parts = (currentUser.username || "").trim().split(" ");
    if (
      firstName.toLowerCase() !== (parts[0] || "").toLowerCase() ||
      lastName.toLowerCase()  !== parts.slice(1).join(" ").toLowerCase()
    ) {
      errorText.textContent = "Name must match your account username."; return;
    }
 
    if (email.toLowerCase() !== (currentUser.email || "").toLowerCase()) {
      errorText.textContent = "Use the email you signed in with."; return;
    }

    // ── Final guard: re-check submitted apps before POSTing ──
    const submittedApps = await fetchSubmittedApplications();

    if (submittedApps.length >= 5) {
      errorText.textContent = `You already have ${submittedApps.length} submitted applications (maximum is 5).`;
      return;
    }

    const alreadyAppliedHostel = submittedApps.find(
      app => app.hostel && app.hostel.trim().toLowerCase() === selectedBooking.hostel.trim().toLowerCase()
    );
    if (alreadyAppliedHostel) {
      errorText.textContent = `You have already submitted an application for "${selectedBooking.hostel}".`;
      return;
    }

    const alreadyAppliedRoom = submittedApps.find(app => {
      const appliedRoomId = app.roomId?._id || app.roomId;
      return appliedRoomId && appliedRoomId.toString() === selectedBooking.roomId.toString();
    });
    if (alreadyAppliedRoom) {
      errorText.textContent = `You have already applied for this specific room. Please go back and choose a different room.`;
      return;
    }
 
    try {
      // Resolve room by ID from backend
      const roomRes  = await fetch(`${CONFIRM_API}/rooms/${selectedBooking.roomId}`);
      const room     = await roomRes.json();
      if (!roomRes.ok) throw new Error(room.error || "Room not found");
 
      const res  = await fetch(`${CONFIRM_API}/students`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          fullName:   `${firstName} ${lastName}`,
          email,
          school,
          gender,
          hostel:     selectedBooking.hostel,
          roomNumber: room.roomNumber,
          userId:     currentUser._id || currentUser.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit application");
 
      // Remove from local cart after applying
      let bookings = JSON.parse(localStorage.getItem("bookedHostels")) || [];
      bookings = bookings.filter(b => b.bookingId !== selectedBooking.bookingId);
      localStorage.setItem("bookedHostels", JSON.stringify(bookings));
 
      modal.style.display = "none";
      alert("Application submitted successfully!");
      window.location.href = "confirmMessage.html";
 
    } catch (err) {
      console.error(err);
      errorText.textContent = err.message;
    }
  });
 
  loadBookings();
});