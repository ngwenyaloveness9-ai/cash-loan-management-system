const API_BASE = 'http://localhost:5000/api';

// ================= DOM READY =================
document.addEventListener('DOMContentLoaded', () => {

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  if (!token || !user) return window.location.href = 'login.html';

  // Logout
  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = 'login.html';
  });

  // Welcome & Avatar
  const welcomeText = document.getElementById('welcomeText');
  const userAvatar = document.getElementById('userAvatar');
  if (welcomeText && userAvatar) {
    const formatted = formatUserName(user.full_name, user.title || "Ms");
    welcomeText.textContent = `Welcome Back, ${formatted.display}`;
    userAvatar.textContent = formatted.initials;
  }

  // Officer Profile
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

  // Load data
  if (user.role === 'borrower') loadMyLoans(token);
  else if (user.role === 'officer' || user.role === 'admin') loadLoanApplications(token);

  // Helper
  function formatUserName(fullName, title = "Ms") {
    const parts = fullName.trim().split(" ");
    const surname = parts[parts.length - 1];
    const initials = parts.map(p => p[0]).join("");
    return { display: `${title} ${initials}. ${surname}`, initials };
  }

  // ================= Borrower Loans =================
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

      let totalPayableSum = 0;
      let remainingBalanceSum = 0;
      let overallStatus = '—';

      loans.forEach(loan => {
        const loanAmount = Number(loan.loan_amount);
        const totalPayable = Number(loan.total_payable);
        const remainingBalance = Number(loan.loan_balance);
        const repaymentMonths = loan.repayment_period;
        const monthlyInstallment = repaymentMonths
          ? (totalPayable / repaymentMonths).toFixed(2)
          : '—';

        const isClosed = loan.loan_status === 'closed';

        totalPayableSum += totalPayable;
        remainingBalanceSum += remainingBalance;
        if (loan.loan_status !== 'closed') overallStatus = loan.loan_status;

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

      document.getElementById('totalPayable').textContent = `R ${totalPayableSum.toFixed(2)}`;
      document.getElementById('remainingBalance').textContent = `R ${remainingBalanceSum.toFixed(2)}`;
      document.getElementById('loanStatus').textContent = overallStatus;

    } catch (err) {
      console.error('BORROWER LOAN LOAD ERROR:', err);
      tableBody.innerHTML =
        '<tr><td colspan="7" class="text-center text-danger">Failed to load loans</td></tr>';
    }
  }

  // ================= Officer/Admin Applications =================
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
          <td class="status status-${loan.loan_status.toLowerCase()} text-capitalize fw-semibold">${loan.loan_status}</td>
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

}); // DOMContentLoaded end

// ================================
// VIEW DOCUMENTS (OFFICER)
// ================================
window.viewDocuments = async function (loanId) {
  const documentsList = document.getElementById('documentsList');
  if (!documentsList) return;

  documentsList.innerHTML = '<p class="text-muted">Loading documents...</p>';

  const token = localStorage.getItem('token');
  if (!token) return alert('Unauthorized!');

  try {
    const res = await fetch(`${API_BASE}/loans/${loanId}/documents`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error('Failed to fetch documents');
    const docs = await res.json();

    if (!docs.length) {
      documentsList.innerHTML = '<p class="text-muted">No documents uploaded for this loan.</p>';
      return;
    }

    const ul = document.createElement('ul');
    ul.classList.add('list-group');
    docs.forEach(doc => {
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between align-items-center';
      li.innerHTML = `
        <span>${doc.name}</span>
        <a href="${doc.url}" target="_blank" class="btn btn-sm btn-primary">View</a>
      `;
      ul.appendChild(li);
    });

    documentsList.innerHTML = '';
    documentsList.appendChild(ul);

    const documentsModal = new bootstrap.Modal(document.getElementById('documentsModal'));
    documentsModal.show();

  } catch (err) {
    console.error('View documents error:', err);
    documentsList.innerHTML = `<p class="text-danger">Failed to load documents.</p>`;
  }
};

// ================================
// APPROVE / REJECT LOANS
// ================================
window.approveLoan = async function (loanId) {
  if (!confirm(`Are you sure you want to APPROVE loan ${loanId}?`)) return;

  const token = localStorage.getItem('token');
  try {
    const res = await fetch(`${API_BASE}/loans/${loanId}/approve`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to approve loan');

    alert(`Loan ${loanId} approved successfully`);
    loadLoanApplications(token);

  } catch (err) {
    console.error('Approve loan error:', err);
    alert(`Failed to approve loan ${loanId}`);
  }
};

window.rejectLoan = async function (loanId) {
  if (!confirm(`Are you sure you want to REJECT loan ${loanId}?`)) return;

  const token = localStorage.getItem('token');
  try {
    const res = await fetch(`${API_BASE}/loans/${loanId}/reject`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to reject loan');

    alert(`Loan ${loanId} rejected successfully`);
    loadLoanApplications(token);

  } catch (err) {
    console.error('Reject loan error:', err);
    alert(`Failed to reject loan ${loanId}`);
  }
};