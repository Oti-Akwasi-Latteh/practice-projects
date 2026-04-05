
// Get current user
const currentUser = JSON.parse(localStorage.getItem("currentUser"));

if (!currentUser) {
    // Redirect if not logged in
    window.location.href = "about.html";
} else {
    // Display username
    document.getElementById("username").textContent = currentUser.username;
}