const API_BASE = "http://localhost:5000/api";

// ================= AUTH CHECK =================
document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token || !user) {
    window.location.href = "login.html";
    return;
  }

  // ================= LOGOUT =================
  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "login.html";
  });

  // ================= LOAD PROFILE DATA =================
  loadProfile(token);

  // ================= FORM SUBMITS =================
  document
    .getElementById("profileForm")
    ?.addEventListener("submit", (e) => updateProfile(e, token));

  document
    .getElementById("passwordForm")
    ?.addEventListener("submit", (e) => resetPassword(e, token));
});


// =======================================================
// LOAD USER PROFILE
// =======================================================
async function loadProfile(token) {
  try {
    const res = await fetch(`${API_BASE}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to load profile");

    const data = await res.json();

    document.getElementById("full_name").value = data.full_name || "";
    document.getElementById("email").value = data.email || "";
    document.getElementById("phone").value = data.phone || "";
  } catch (err) {
    console.error("PROFILE LOAD ERROR:", err);
    alert("Failed to load profile details.");
  }
}


// =======================================================
// UPDATE PROFILE DETAILS
// =======================================================
async function updateProfile(e, token) {
  e.preventDefault();

  const full_name = document.getElementById("full_name").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();

  if (!full_name || !email) {
    alert("Full name and email are required.");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/users/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ full_name, email, phone }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Update failed");

    // update localStorage user info
    const storedUser = JSON.parse(localStorage.getItem("user"));
    localStorage.setItem(
      "user",
      JSON.stringify({ ...storedUser, full_name, email, phone })
    );

    alert("✅ Profile updated successfully.");
  } catch (err) {
    console.error("PROFILE UPDATE ERROR:", err);
    alert("Failed to update profile.");
  }
}


// =======================================================
// RESET PASSWORD
// =======================================================
async function resetPassword(e, token) {
  e.preventDefault();

  const new_password = document.getElementById("new_password").value;
  const confirm_password = document.getElementById("confirm_password").value;

  if (new_password.length < 6) {
    alert("Password must be at least 6 characters.");
    return;
  }

  if (new_password !== confirm_password) {
    alert("Passwords do not match.");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/users/reset-password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ new_password }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Password reset failed");

    alert("✅ Password reset successful. Please login again.");

    localStorage.clear();
    window.location.href = "login.html";
  } catch (err) {
    console.error("PASSWORD RESET ERROR:", err);
    alert("Failed to reset password.");
  }
}
