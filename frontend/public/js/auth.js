const API_BASE = 'http://localhost:5000/api';

// =======================
// LOGIN
// =======================
const loginForm = document.getElementById('loginForm');

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!email || !password) {
      alert('Please enter email and password');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Login failed');
        return;
      }

      // ✅ Save token & user
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      redirectByRole(data.user.role);

    } catch (err) {
      console.error(err);
      alert('Server error. Please try again.');
    }
  });
}

// =======================
// REGISTER
// =======================
const registerForm = document.getElementById('registerForm');

if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
      full_name: document.getElementById('full_name').value.trim(),
      email: document.getElementById('email').value.trim(),
      password: document.getElementById('password').value.trim(),
      role: document.getElementById('role').value,
      branch_id: document.getElementById('branch_id').value
    };

    if (
      !payload.full_name ||
      !payload.email ||
      !payload.password ||
      !payload.role ||
      !payload.branch_id
    ) {
      alert('All fields are required');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Registration failed');
        return;
      }

      alert('Registration successful. Please login.');
      window.location.href = 'login.html';

    } catch (err) {
      console.error(err);
      alert('Server error. Please try again.');
    }
  });
}

// =======================
// ROLE REDIRECT
// =======================
function redirectByRole(role) {
  if (role === 'borrower') {
    window.location.href = 'borrower-dashboard.html';
  } else if (role === 'officer' || role === 'admin') {
    window.location.href = 'officer-dashboard.html';
  } else {
    alert('Unknown user role');
  }
}

// =======================
// LOAD BRANCHES (REGISTER PAGE ONLY)
// =======================
document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');
  const branchSelect = document.getElementById('branch_id');

  // ✅ Only run on register page
  if (!registerForm || !branchSelect) return;

  loadBranches();
});

async function loadBranches() {
  try {
    const res = await fetch(`${API_BASE}/branches`);
    const branches = await res.json();

    const branchSelect = document.getElementById('branch_id');
    branchSelect.innerHTML = '<option value="">-- Select branch --</option>';

    branches.forEach(branch => {
      const option = document.createElement('option');
      option.value = branch.branch_id;
      option.textContent = branch.branch_name;
      branchSelect.appendChild(option);
    });

  } catch (error) {
    console.error('Failed to load branches:', error);
  }
}
