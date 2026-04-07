// =============================================
// js/SignUp.js  (user signup)
// =============================================
 
document.addEventListener("DOMContentLoaded", function () {
  const SIGNUP_API = "http://localhost:9000/api";
 
  document.getElementById("signIn").addEventListener("click", async function () {
    const username        = document.getElementById("user").value.trim();
    const email           = document.getElementById("email").value.trim();
    const password        = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirm-password").value.trim();
 
    if (!username || !email || !password || !confirmPassword) { showError("Please fill in all fields"); return; }
    if (!isValidEmail(email))   { showError("Please enter a valid email address"); return; }
    if (password.length < 6)    { showError("Password must be at least 6 characters"); return; }
    if (password !== confirmPassword) { showError("Passwords do not match"); return; }
 
    const btn = document.getElementById("signIn");
    btn.disabled  = true;
    btn.innerHTML = `Signing up... <i class="fa-solid fa-spinner fa-spin"></i>`;
 
    try {
      const res  = await fetch(`${SIGNUP_API}/users/signup`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
 
      if (!res.ok) { showError(data.error || "Signup failed"); resetBtn(); return; }
 
      const newUser = {
        id:       data.user.id,
        username: data.user.username,
        email:    data.user.email,
        location: data.user.location,
        isAdmin:  data.user.isAdmin,
      };
 
      sessionStorage.setItem("currentUser",  JSON.stringify(newUser));
      sessionStorage.setItem("userLoggedIn", "true");
 
      showSuccess("Signup successful! Redirecting...");
      setTimeout(() => { window.location.href = "LandingPage.html"; }, 1500);
 
    } catch (err) {
      console.error(err);
      showError("Cannot connect to server.");
      resetBtn();
    }
  });
 
  function resetBtn() {
    const btn = document.getElementById("signIn");
    btn.disabled  = false;
    btn.innerHTML = `Sign up <i class="fa-solid fa-arrow-right"></i>`;
  }
 
  function isValidEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }
 
  function showError(msg) {
    removeMessages();
    const p = document.createElement("p");
    p.className = "error-msg";
    p.style.cssText = "color:red;font-size:13px;margin-top:8px;text-align:center;";
    p.textContent = msg;
    document.getElementById("signupForm").appendChild(p);
    setTimeout(removeMessages, 4000);
    resetBtn();
  }
 
  function showSuccess(msg) {
    removeMessages();
    const p = document.createElement("p");
    p.className = "success-msg";
    p.style.cssText = "color:green;font-size:13px;margin-top:8px;text-align:center;";
    p.textContent = msg;
    document.getElementById("signupForm").appendChild(p);
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
