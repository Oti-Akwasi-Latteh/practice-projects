// js/SignUp.js

document.addEventListener("DOMContentLoaded", function () {

  document.getElementById("signIn").addEventListener("click", async function () {

    // ================= GET VALUES =================
    const username = document.getElementById("user").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirm-password").value.trim();

    // ================= VALIDATION =================
    if (!username || !email || !password || !confirmPassword) {
      showError("Please fill in all fields");
      return;
    }

    if (!isValidEmail(email)) {
      showError("Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      showError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      showError("Passwords do not match");
      return;
    }

    // ================= DISABLE BUTTON =================
    const btn = document.getElementById("signIn");
    btn.disabled = true;
    btn.innerHTML = `Signing up... <i class="fa-solid fa-spinner fa-spin"></i>`;

    try {
      // ================= SEND TO BACKEND =================
      // Only send username, email, password — backend handles location
      const response = await fetch("https://bookie-hostel.onrender.com/api/users/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        showError(data.error || "Signup failed. Please try again.");
        resetButton();
        return;
      }

      // ================= SAVE TO LOCALSTORAGE =================
      const newUser = {
        id: data.user.id,
        username: data.user.username,
        email: data.user.email,
        location: data.user.location,   // will be same as email
        isAdmin: data.user.isAdmin,
      };

      // Add to users list
      let users = JSON.parse(localStorage.getItem("users")) || [];
      users.push(newUser);
      localStorage.setItem("users", JSON.stringify(users));

      // Save current session
      localStorage.setItem("currentUser", JSON.stringify(newUser));

      // ================= SUCCESS =================
      showSuccess("Signup successful! Redirecting...");

      setTimeout(() => {
        window.location.href = "LandingPage.html";
      }, 1500);

    } catch (error) {
      console.error("Signup error:", error);
      showError("Cannot connect to server. Make sure the backend is running.");
      resetButton();
    }
  });


  // ============== Reset Button =================
  function resetButton() {
    const btn = document.getElementById("signIn");
    btn.disabled = false;
    btn.innerHTML = `Sign up <i class="fa-solid fa-arrow-right"></i>`;
  }


  // ============ Email Validator =================
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }


  // ============== Show Error =================
  function showError(message) {
    removeMessages();

    const msg = document.createElement("p");
    msg.className = "error-msg";
    msg.style.cssText = `
      color: red;
      font-size: 13px;
      margin-top: 8px;
      text-align: center;
    `;
    msg.textContent = message;

    document.getElementById("signupForm").appendChild(msg);

    setTimeout(removeMessages, 4000);
  }


  // ============Show Success =================
  function showSuccess(message) {
    removeMessages();

    const msg = document.createElement("p");
    msg.className = "success-msg";
    msg.style.cssText = `
      color: green;
      font-size: 13px;
      margin-top: 8px;
      text-align: center;
    `;
    msg.textContent = message;

    document.getElementById("signupForm").appendChild(msg);
  }


  // ==============Remove Messages =================
  function removeMessages() {
    document.querySelectorAll(".error-msg, .success-msg").forEach(el => el.remove());
  }

  // ================= SHOW / HIDE PASSWORD =================
document.querySelectorAll(".toggle-password").forEach(icon => {
  icon.addEventListener("click", () => {
    const targetId = icon.getAttribute("data-target");
    const input = document.getElementById(targetId);

    if (input.type === "password") {
      input.type = "text";
      icon.classList.remove("fa-eye");
      icon.classList.add("fa-eye-slash");
    } else {
      input.type = "password";
      icon.classList.remove("fa-eye-slash");
      icon.classList.add("fa-eye");
    }
  });
});

});

