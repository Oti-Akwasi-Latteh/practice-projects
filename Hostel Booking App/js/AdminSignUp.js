// ==========================
// ADMIN SIGNUP
// ==========================
document.getElementById("signupBtn").addEventListener("click", () => {
  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!firstName || !lastName || !email || !password) {
    alert("Please fill all fields");
    return;
  }

  // ================= STRICT EMAIL CHECK =================
  if (email.toLowerCase() !== "quasilyphae@gmail.com") {
    alert(" Only the authorized email can register.");
    return;
  }

  let admins = JSON.parse(localStorage.getItem("admins")) || [];

  // Only block duplicate if same email AND same name combination
  const exists = admins.find(
    a => a.email.toLowerCase() === email.toLowerCase() &&
         a.firstName.toLowerCase() === firstName.toLowerCase() &&
         a.lastName.toLowerCase() === lastName.toLowerCase()
  );

  if (exists) {
    alert("This name is already registered. Try logging in instead.");
    return;
  }

  const newAdmin = {
    id: admins.length > 0 ? Math.max(...admins.map(a => a.id)) + 1 : 1,
    firstName,
    lastName,
    email: email.toLowerCase(),
    password,
  };

  admins.push(newAdmin);
  localStorage.setItem("admins", JSON.stringify(admins));

  localStorage.setItem("admin", JSON.stringify({
    id: newAdmin.id,
    name: `${newAdmin.firstName} ${newAdmin.lastName}`,
    email: newAdmin.email,
  }));
  localStorage.setItem("isLoggedIn", "true");

  alert("Signup successful!");
  window.location.href = "DashBoard.html";
});


// ==========================
// OPEN LOGIN MODAL
// ==========================
document.getElementById("openLogin").addEventListener("click", () => {
  document.getElementById("loginModal").style.display = "flex";
});

// ==========================
// CLOSE LOGIN MODAL
// ==========================
document.getElementById("closeLogin").addEventListener("click", () => {
  document.getElementById("loginModal").style.display = "none";
});

// ==========================
// BACK TO SIGNUP
// ==========================
document.getElementById("backToSignup").addEventListener("click", () => {
  document.getElementById("loginModal").style.display = "none";
});


// ==========================
// ADMIN LOGIN
// ==========================
document.getElementById("loginBtn").addEventListener("click", () => {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  if (!email || !password) {
    alert("Please fill all fields");
    return;
  }

  // ================= STRICT EMAIL CHECK =================
  if (email.toLowerCase() !== "quasilyphae@gmail.com") {
    alert("Access denied. Only the authorized email can log in.");
    return;
  }

  const admins = JSON.parse(localStorage.getItem("admins")) || [];

  // Match by email and password only — name can be anything
  const admin = admins.find(
    a => a.email.toLowerCase() === email.toLowerCase() &&
         a.password === password
  );

  if (!admin) {
    alert("Invalid password. Please check your credentials.");
    return;
  }

  localStorage.setItem("admin", JSON.stringify({
    id: admin.id,
    name: `${admin.firstName} ${admin.lastName}`,
    email: admin.email,
  }));
  localStorage.setItem("isLoggedIn", "true");

  alert("Login successful!");
  window.location.href = "DashBoard.html";
});

// ================= PASSWORD TOGGLE =================
document.querySelectorAll('.toggle-password').forEach(icon => {
  icon.addEventListener('click', () => {
    const inputId = icon.getAttribute('data-target');
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