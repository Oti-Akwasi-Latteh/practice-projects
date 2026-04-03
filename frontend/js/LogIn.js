// LogIn.js




// js/LogIn.js

document.addEventListener("DOMContentLoaded", function () {

  document.getElementById("take-In").addEventListener("click", async function () {

    // ================= GET VALUES =================
    const email = document.getElementById("mail").value.trim();
    const password = document.getElementById("password").value.trim();

    // ================= VALIDATION =================
    if (!email || !password) {
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

    // ================= DISABLE BUTTON =================
    const btn = document.getElementById("take-In");
    btn.disabled = true;
    btn.innerHTML = `Logging in... <i class="fa-solid fa-spinner fa-spin"></i>`;

    try {
      // ================= SEND TO BACKEND =================
      const response = await fetch("http://localhost:5500/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        showError(data.error || "Login failed. Please try again.");
        resetButton();
        return;
      }

      // ================= SAVE SESSION =================
      const loggedInUser = {
        id: data.user.id,
        username: data.user.username,
        email: data.user.email,
        location: data.user.location,
        isAdmin: data.user.isAdmin,
      };

      localStorage.setItem("currentUser", JSON.stringify(loggedInUser));
      localStorage.setItem("isLoggedIn", "true");

      // ================= SUCCESS + REDIRECT =================
      showSuccess("Redirecting...");

      setTimeout(() => {
        if (loggedInUser.isAdmin) {
          window.location.href = "AdminDashboard.html";
        } else {
          window.location.href = "LandingPage.html";
        }
      }, 1500);

    } catch (error) {
      console.error("Login error:", error);
      showError("Cannot connect to server. Make sure the backend is running.");
      resetButton();
    }
  });


  // ================= HELPER: Reset Button =================
  function resetButton() {
    const btn = document.getElementById("take-In");
    btn.disabled = false;
    btn.innerHTML = `Log In <i class="fa-solid fa-arrow-right"></i>`;
  }


  // ================= HELPER: Email Validator =================
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }


  // ================= HELPER: Show Error =================
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

    // Append inside the form
    document.getElementById("LogInForm").appendChild(msg);

    setTimeout(removeMessages, 4000);
  }


  // ================= HELPER: Show Success =================
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

    document.getElementById("LogInForm").appendChild(msg);
  }


// ================= SHOW / HIDE PASSWORD =================
document.querySelectorAll(".toggle-password").forEach(icon => {
  icon.addEventListener("click", () => {
    const input = document.getElementById(icon.dataset.target);

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

  // ================= HELPER: Remove Messages =================
  function removeMessages() {
    document.querySelectorAll(".error-msg, .success-msg").forEach(el => el.remove());
  }
  

});
/*--



document.getElementById("take-In").addEventListener("click", async () => {

    // ------------------------------
    // GET FORM VALUES
    // ------------------------------
    const email = document.getElementById("mail").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("password-confirm").value.trim();

    // ------------------------------
    // VALIDATION
    // ------------------------------
    if (!email || !password || !confirmPassword) {
        alert("Please fill all fields");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
    }

    try {
        // ------------------------------
        // SEND LOGIN REQUEST TO BACKEND
        // ------------------------------
       const response = await fetch("http://localhost:5500/api/users/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password })
});

        const data = await response.json();

        if (!response.ok) {
            alert(data.error || "Login failed");
            return;
        }

        // ------------------------------
        // SAVE CURRENT USER SESSION
        // ------------------------------
        localStorage.setItem("currentUser", JSON.stringify(data.user));

        alert("Login successful!");

        // ------------------------------
        // REDIRECT TO DASHBOARD / LANDING PAGE
        // ------------------------------
        window.location.href = "LandingPage.html";

    } catch (error) {
        console.error(error);
        alert("Cannot connect to server. Make sure backend is running.");
    }

});




--*/

