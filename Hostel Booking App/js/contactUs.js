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
