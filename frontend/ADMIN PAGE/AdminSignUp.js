// ==========================
// ADMIN SIGNUP
// ==========================
document.getElementById("signupBtn").addEventListener("click", async () => {
    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!firstName || !lastName || !email || !password) {
        alert("Please fill all fields");
        return;
    }

    const admin = {
        firstName,
        lastName,
        email,
        password
    };

    try {
        // ==========================
        // SEND TO BACKEND
        // ==========================
        const response = await fetch("http://localhost:5500/api/admin/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(admin)
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.error || "Signup failed");
            return;
        }

        // ==========================
        // SAVE TO LOCALSTORAGE
        // ==========================
        localStorage.setItem("admin", JSON.stringify({
            id: data.admin.id,
            name: data.admin.firstName + " " + data.admin.lastName,
            email: data.admin.email
        }));

        // SAVE SESSION
        localStorage.setItem("isLoggedIn", "true");

        alert("Signup successful!");
        window.location.href = "DashBoard.html";

    } catch (error) {
        console.error("Error connecting to backend:", error);
        alert("Cannot connect to server. Make sure backend is running.");
    }
});

// ==========================
// OPEN LOGIN MODAL
// ==========================
document.getElementById("openLogin").addEventListener("click", () => {
    document.getElementById("loginModal").style.display = "flex";
});

// ==========================
// CLOSE LOGIN
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
document.getElementById("loginBtn").addEventListener("click", async () => {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    if (!email || !password) {
        alert("Please fill all fields");
        return;
    }

    try {
        // ==========================
        // FETCH LOGIN FROM BACKEND
        // ==========================
        const response = await fetch("http://localhost:5500/api/admin/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.error || "Login failed");
            return;
        }

        // ==========================
        // SAVE TO LOCALSTORAGE
        // ==========================
        const adminData = {
            id: data.admin.id,
            name: data.admin.firstName + " " + data.admin.lastName,
            email: data.admin.email
        };

        localStorage.setItem("admin", JSON.stringify(adminData));
        localStorage.setItem("isLoggedIn", "true");

        alert("Login successful!");
        window.location.href = "DashBoard.html";

    } catch (error) {
        console.error("Error connecting to backend:", error);
        alert("Cannot connect to server. Make sure backend is running.");
    }
});

