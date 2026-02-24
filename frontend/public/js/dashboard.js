const API_BASE = 'http://localhost:5000/api';

// ================= DOM READY =================
document.addEventListener('DOMContentLoaded', () => {

  // ================= AUTH CHECK =================
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  if (!token || !user) return window.location.href = 'login.html';

  // ================= LOGOUT =================
  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = 'login.html';
  });

  // ================= USER WELCOME & AVATAR =================
  const welcomeText = document.getElementById('welcomeText');
  const userAvatar = document.getElementById('userAvatar');

  if (welcomeText && userAvatar) {
    const formatted = formatUserName(user.full_name, user.title || "Ms");
    welcomeText.textContent = `Welcome Back, ${formatted.display}`;
    userAvatar.textContent = formatted.initials;
  }

  // ================= LOAD OFFICER PROFILE =================
  const officerName = document.getElementById('officerName');
  const officerEmail = document.getElementById('officerEmail');
  const officerBranch = document.getElementById('officerBranch');
  const officerRole = document.getElementById('officerRole');

  if (officerName && officerEmail && officerBranch && officerRole) {
    officerName.textContent = user.full_name || '—';
    officerEmail.textContent = user.email || '—';
    officerBranch.textContent = user.branch_name || '—';
    officerRole.textContent = user.role || '—';
  }

  // ================= LOAD LOANS =================
  if (user.role === 'borrower') loadMyLoans(token);
  else if (user.role === 'officer' || user.role === 'admin') loadLoanApplications(token);

  // ================= SIDEBAR ACTIVE LINKS =================
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', e => {
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      e.target.classList.add('active');
    });
  });

  // ================= SIDEBAR TOGGLE =================
  const sidebar = document.querySelector('.sidebar');
  const main = document.querySelector('.main');
  const toggleBtn = document.getElementById('sidebarToggle');
  const overlay = document.getElementById('overlay');

  toggleBtn?.addEventListener('click', () => {
    const isCollapsed = sidebar.classList.contains('collapsed');
    sidebar.classList.toggle('collapsed', !isCollapsed);
    main.classList.toggle('sidebar-collapsed', !isCollapsed);
    overlay.classList.toggle('active', !isCollapsed);
  });

  overlay?.addEventListener('click', () => {
    sidebar.classList.add('collapsed');
    main.classList.add('sidebar-collapsed');
    overlay.classList.remove('active');
  });

  // ================= HELPERS =================
  function formatUserName(fullName, title = "Ms") {
    const parts = fullName.trim().split(" ");
    const surname = parts[parts.length - 1];
    const initials = parts.map(p => p[0]).join("");
    return { display: `${title} ${initials}. ${surname}`, initials };
  }

  // ================= LOAD BORROWER LOANS =================
  async function loadMyLoans(token) {
    const tableBody = document.getElementById('loansTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '<tr><td colspan="7" class="text-center">Loading loans...</td></tr>';

    try {
      const res = await fetch(`${API_BASE}/loans`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const loans = await res.json();
      tableBody.innerHTML = '';

      if (!loans.length) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center">No loans found</td></tr>';
        return;
      }

      loans.forEach(loan => {
        const loanAmount = Number(loan.loan_amount);
        const totalPayable = Number(loan.total_payable);
        const remainingBalance = Number(loan.loan_balance);
        const repaymentMonths = loan.repayment_period;
        const monthlyInstallment = repaymentMonths
          ? (totalPayable / repaymentMonths).toFixed(2)
          : '—';

        const isClosed = loan.loan_status === 'closed';

        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${loan.loan_id}</td>
          <td>R ${loanAmount.toFixed(2)}</td>
          <td>R ${totalPayable.toFixed(2)}</td>
          <td>${isClosed ? 'R 0.00' : `R ${remainingBalance.toFixed(2)}`}</td>
          <td>${repaymentMonths}</td>
          <td>${repaymentMonths ? `R ${monthlyInstallment}` : '—'}</td>
          <td class="status status-${loan.loan_status.toLowerCase()} text-capitalize fw-semibold">
            ${loan.loan_status}
          </td>
        `;
        tableBody.appendChild(row);
      });

    } catch (err) {
      console.error('BORROWER LOAN LOAD ERROR:', err);
      tableBody.innerHTML =
        '<tr><td colspan="7" class="text-center text-danger">Failed to load loans</td></tr>';
    }
  }

  // ================= OFFICER / ADMIN LOANS =================
  async function loadLoanApplications(token) {
    const tableBody = document.getElementById('applicationsTableBody');
    if (!tableBody) return;

    tableBody.innerHTML =
      '<tr><td colspan="6" class="text-center">Loading applications...</td></tr>';

    try {
      const res = await fetch(`${API_BASE}/loans`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const loans = await res.json();
      tableBody.innerHTML = '';

      if (!loans.length) {
        tableBody.innerHTML =
          '<tr><td colspan="6" class="text-center">No applications found</td></tr>';
        return;
      }

      loans.forEach(loan => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${loan.loan_id}</td>
          <td>${loan.full_name}</td>
          <td>R ${loan.loan_amount}</td>
          <td>${loan.branch_name}</td>
          <td>${loan.loan_status}</td>
          <td>
            ${
              loan.loan_status === 'pending'
                ? `<button class="btn btn-sm btn-info me-1" onclick="viewDocuments(${loan.loan_id})">View Docs</button>
                   <button class="btn btn-sm btn-success me-1" onclick="approveLoan(${loan.loan_id})">Approve</button>
                   <button class="btn btn-sm btn-danger" onclick="rejectLoan(${loan.loan_id})">Reject</button>`
                : '<span class="text-muted">—</span>'
            }
          </td>
        `;
        tableBody.appendChild(row);
      });

    } catch (err) {
      console.error('APPLICATION LOAD ERROR:', err);
      tableBody.innerHTML =
        '<tr><td colspan="6" class="text-danger text-center">Failed to load applications</td></tr>';
    }
  }

});
