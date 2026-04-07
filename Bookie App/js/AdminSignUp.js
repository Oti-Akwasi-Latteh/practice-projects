// js/AdminSignUp.js
// =============================================

const API = "https://bookie-app-r03w.onrender.com/api";
const AUTHORIZED_EMAIL = "quasilyphae@gmail.com";

// ── ADMIN SIGNUP ─────────────────────────────
document.getElementById("signupBtn").addEventListener("click", async () => {
  const firstName = document.getElementById("firstName").value.trim();
  const lastName  = document.getElementById("lastName").value.trim();
  const email     = document.getElementById("email").value.trim();
  const password  = document.getElementById("password").value.trim();

  if (!firstName || !lastName || !email || !password) {
    alert("Please fill all fields");
    return;
  }

  // ================= STRICT EMAIL CHECK =================
  if (email.toLowerCase() !== AUTHORIZED_EMAIL) {
    alert("Only the authorized email can register.");
    return;
  }

  try {
    const res  = await fetch(`${API}/admin/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, lastName, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Signup failed");
      return;
    }

    // Save admin session
    sessionStorage.setItem("admin", JSON.stringify({
      id: data.admin.id,
      name: `${data.admin.firstName} ${data.admin.lastName}`,
      email: data.admin.email,
    }));
    sessionStorage.setItem("isLoggedIn", "true");

    alert("Signup successful!");
    window.location.href = "DashBoard.html";

  } catch (err) {
    console.error(err);
    alert("Cannot connect to server. Make sure the backend is running.");
  }
});

// ── OPEN / CLOSE LOGIN MODAL ─────────────────
document.getElementById("openLogin").addEventListener("click",  () => {
  document.getElementById("loginModal").style.display = "flex";
});
document.getElementById("closeLogin").addEventListener("click", () => {
  document.getElementById("loginModal").style.display = "none";
});
document.getElementById("backToSignup").addEventListener("click", () => {
  document.getElementById("loginModal").style.display = "none";
});

// ── ADMIN LOGIN ──────────────────────────────
document.getElementById("loginBtn").addEventListener("click", async () => {
  const email    = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  if (!email || !password) { 
    alert("Please fill all fields"); 
    return; 
  }

  // ================= STRICT EMAIL CHECK =================
  if (email.toLowerCase() !== AUTHORIZED_EMAIL) {
    alert("Access denied. Only the authorized email can log in.");
    return;
  }

  try {
    const res  = await fetch(`${API}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Login failed");
      return;
    }

    // Save admin session
    sessionStorage.setItem("admin", JSON.stringify({
      id: data.admin.id,
      name: `${data.admin.firstName} ${data.admin.lastName}`,
      email: data.admin.email,
    }));
    sessionStorage.setItem("isLoggedIn", "true");

    alert("Login successful!");
    window.location.href = "DashBoard.html";

  } catch (err) {
    console.error(err);
    alert("Cannot connect to server. Make sure the backend is running.");
  }
});

// ── PASSWORD TOGGLE ─────────────────────────
document.querySelectorAll('.toggle-password').forEach(icon => {
  icon.addEventListener('click', () => {
    const inputId = icon.dataset.target;
    const passwordInput = document.getElementById(inputId);

    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      icon.textContent = '🙈';
      icon.classList.add('active');
    } else {
      passwordInput.type = 'password';
      icon.textContent = '👁';
      icon.classList.remove('active');
    }
  });
});
