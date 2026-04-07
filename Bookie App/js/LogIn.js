// =============================================
// js/LogIn.js  (user login)
// =============================================
 
document.addEventListener("DOMContentLoaded", function () {
  const LOGIN_API = "https://bookie-app-r03w.onrender.com/api";
 
  document.getElementById("take-In").addEventListener("click", async function () {
    const email    = document.getElementById("mail").value.trim();
    const password = document.getElementById("password").value.trim();
 
    if (!email || !password)             { showError("Please fill in all fields"); return; }
    if (!isValidEmail(email))            { showError("Please enter a valid email address"); return; }
    if (password.length < 6)             { showError("Password must be at least 6 characters"); return; }
 
    const btn = document.getElementById("take-In");
    btn.disabled  = true;
    btn.innerHTML = `Logging in... <i class="fa-solid fa-spinner fa-spin"></i>`;
 
    try {
      const res  = await fetch(`${LOGIN_API}/users/login`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password }),
      });
      const data = await res.json();
 
      if (!res.ok) { showError(data.error || "Login failed"); resetBtn(); return; }
 
      const loggedInUser = {
        id:       data.user.id,
        username: data.user.username,
        email:    data.user.email,
        location: data.user.location,
        isAdmin:  data.user.isAdmin,
      };
 
      sessionStorage.setItem("currentUser",  JSON.stringify(loggedInUser));
      sessionStorage.setItem("userLoggedIn", "true");
 
      showSuccess("Redirecting...");
      setTimeout(() => {
        window.location.href = loggedInUser.isAdmin ? "AdminDashboard.html" : "LandingPage.html";
      }, 1500);
 
    } catch (err) {
      console.error(err);
      showError("Cannot connect to server. Make sure the backend is running.");
      resetBtn();
    }
  });
 
  function resetBtn() {
    const btn = document.getElementById("take-In");
    btn.disabled  = false;
    btn.innerHTML = `Log In <i class="fa-solid fa-arrow-right"></i>`;
  }
 
  function isValidEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }
 
  function showError(msg) {
    removeMessages();
    const p = document.createElement("p");
    p.className = "error-msg";
    p.style.cssText = "color:red;font-size:13px;margin-top:8px;text-align:center;";
    p.textContent = msg;
    document.getElementById("LogInForm").appendChild(p);
    setTimeout(removeMessages, 4000);
  }
 
  function showSuccess(msg) {
    removeMessages();
    const p = document.createElement("p");
    p.className = "success-msg";
    p.style.cssText = "color:green;font-size:13px;margin-top:8px;text-align:center;";
    p.textContent = msg;
    document.getElementById("LogInForm").appendChild(p);
  }
 
  function removeMessages() {
    document.querySelectorAll(".error-msg,.success-msg").forEach(el => el.remove());
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

