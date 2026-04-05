// js/SignUp.js

document.addEventListener("DOMContentLoaded", () => {
  const signUpBtn = document.getElementById("signIn");

  signUpBtn.addEventListener("click", () => {
    const username = document.getElementById("user").value.trim();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirm-password").value.trim();

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

    let users = JSON.parse(localStorage.getItem("users")) || [];

    const alreadyExists = users.some(
      user => user.email.toLowerCase() === email
    );

    if (alreadyExists) {
      showError("An account with this email already exists");
      return;
    }

    signUpBtn.disabled = true;
    signUpBtn.innerHTML = `Signing up... <i class="fa-solid fa-spinner fa-spin"></i>`;

    const newUser = {
      id: Date.now(),
      username,
      email,
      password,
      isAdmin: false,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    const currentUser = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      isAdmin: newUser.isAdmin
    };

 localStorage.setItem("currentUser", JSON.stringify(currentUser));
localStorage.setItem("userLoggedIn", "true"); // <-- changed key

    showSuccess("Signup successful!");

    setTimeout(() => {
      window.location.href = "LandingPage.html";
    }, 1500);
  });

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

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

    document.getElementById("signupForm").appendChild(msg);

    signUpBtn.disabled = false;
    signUpBtn.innerHTML = `Sign up <i class="fa-solid fa-arrow-right"></i>`;
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

    document.getElementById("signupForm").appendChild(msg);
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
