// js/LogIn.js

document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("take-In");

  loginBtn.addEventListener("click", () => {
    const email = document.getElementById("mail").value.trim().toLowerCase();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      showError("Please fill in all fields");
      return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];

    const user = users.find(
      u => u.email.toLowerCase() === email && u.password === password
    );

    if (!user) {
      showError("Invalid email or password");
      return;
    }

    const currentUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin || false
    };

    localStorage.setItem("currentUser", JSON.stringify(currentUser));
   localStorage.setItem("userLoggedIn", "true");

    showSuccess("Login successful!");

    setTimeout(() => {
      if (currentUser.isAdmin) {
        window.location.href = "AdminDashboard.html";
      } else {
        window.location.href = "LandingPage.html";
      }
    }, 1500);
  });

  function showError(message) {
    removeMessages();

    const msg = document.createElement("p");
    msg.className = "error-msg";
    msg.style.cssText = `
      color:red;
      font-size:13px;
      margin-top:8px;
      text-align:center;
    `;
    msg.textContent = message;

    document.getElementById("LogInForm").appendChild(msg);
  }

  function showSuccess(message) {
    removeMessages();

    const msg = document.createElement("p");
    msg.className = "success-msg";
    msg.style.cssText = `
      color:green;
      font-size:13px;
      margin-top:8px;
      text-align:center;
    `;
    msg.textContent = message;

    document.getElementById("LogInForm").appendChild(msg);
  }

  function removeMessages() {
    document.querySelectorAll(".error-msg, .success-msg").forEach(el => el.remove());
  }

  document.querySelectorAll(".toggle-password").forEach(icon => {
    icon.addEventListener("click", () => {
      const input = document.getElementById(icon.dataset.target);

      if (input.type === "password") {
        input.type = "text";
        icon.classList.replace("fa-eye", "fa-eye-slash");
      } else {
        input.type = "password";
        icon.classList.replace("fa-eye-slash", "fa-eye");
      }
    });
  });
});
