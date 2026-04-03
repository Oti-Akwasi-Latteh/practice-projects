document.getElementById('contactForm').addEventListener('submit', function(e){
  e.preventDefault();
  alert("Thank you! Your message has been sent.");
  this.reset();
});

// Get current user
const currentUser = JSON.parse(localStorage.getItem("currentUser"));

if (!currentUser) {
    // Redirect if not logged in
    window.location.href = "Bookings.html";
} else {
    // Display username
    document.getElementById("username").textContent = currentUser.username;
}
