const API_BASE = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', () => {
  // ================= AUTH CHECK =================
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  if (!token || !user) {
    window.location.href = 'login.html';
    return;
  }

  // ================= LOGOUT =================
  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = 'login.html';
  });

  // ================= LOAD USER INFO =================
  if (user.role === 'borrower') {
    document.getElementById('userName').textContent = user.full_name;
    document.getElementById('userEmail').textContent = user.email;
    document.getElementById('userBranch').textContent =
      user.branch_name || `Branch ID: ${user.branch_id}`;

    loadMyLoans(token);
  }

  if (user.role === 'officer' || user.role === 'admin') {
    document.getElementById('officerName').textContent = user.full_name;
    document.getElementById('officerEmail').textContent = user.email;
    document.getElementById('officerBranch').textContent =
      user.branch_name || `Branch ID: ${user.branch_id}`;
    document.getElementById('officerRole').textContent = user.role;

    loadLoanApplications(token);
  }
});

// ================= BORROWER: LOAD MY LOANS (CORRECT & FINAL) =================
async function loadMyLoans(token) {
  const tableBody = document.getElementById('loansTableBody');
  if (!tableBody) return;

  tableBody.innerHTML =
    '<tr><td colspan="7" class="text-center">Loading loans...</td></tr>';

  try {
    const res = await fetch(`${API_BASE}/loans`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const loans = await res.json();
    tableBody.innerHTML = '';

    if (!loans.length) {
      tableBody.innerHTML =
        '<tr><td colspan="7" class="text-center">No loans found</td></tr>';
      return;
    }

    loans.forEach(loan => {
      const loanAmount = Number(loan.loan_amount);
      const totalPayable = Number(loan.total_payable);
      const remainingBalance = Number(loan.loan_balance);
      const repaymentMonths = loan.repayment_period;
      const monthlyInstallment =
        repaymentMonths ? (totalPayable / repaymentMonths).toFixed(2) : '—';

      const isApproved = loan.loan_status === 'approved';
      const isClosed = loan.loan_status === 'closed';

      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${loan.loan_id}</td>

        <td>R ${loanAmount.toFixed(2)}</td>

        <td>R ${totalPayable.toFixed(2)}</td>

        <!-- ✅ REMAINING BALANCE -->
        <td>
          ${
            isClosed
              ? '<span class="text-success">R 0.00</span>'
              : `R ${remainingBalance.toFixed(2)}`
          }
        </td>

        <td>${repaymentMonths}</td>

        <td>
          ${repaymentMonths ? `R ${monthlyInstallment}` : '—'}
        </td>

        <!-- ✅ STATUS -->
        <td class="text-capitalize fw-semibold">
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

// ================= OFFICER / ADMIN: LOAD ALL LOANS =================
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
        '<tr><td colspan="6" class="text-center">No loan applications found</td></tr>';
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
              ? `
                <button class="btn btn-sm btn-info me-1"
                  onclick="viewDocuments(${loan.loan_id})">
                  View Docs
                </button>
                <button class="btn btn-sm btn-success me-1"
                  onclick="approveLoan(${loan.loan_id})">Approve</button>
                <button class="btn btn-sm btn-danger"
                  onclick="rejectLoan(${loan.loan_id})">Reject</button>
              `
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

// ================= VIEW DOCUMENTS =================
async function viewDocuments(loanId) {
  const token = localStorage.getItem('token');
  const list = document.getElementById('documentsList');

  list.innerHTML = '<p class="text-muted">Loading documents...</p>';

  try {
    const res = await fetch(`${API_BASE}/loans/${loanId}/documents`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const docs = await res.json();
    list.innerHTML = '';

    if (!docs.length) {
      list.innerHTML = '<p class="text-muted">No documents uploaded.</p>';
    } else {
      docs.forEach(doc => {
        const div = document.createElement('div');
        div.className = 'mb-2';
        div.innerHTML = `
          <a href="${doc.file_url}" target="_blank"
             class="btn btn-outline-primary btn-sm">
            ${doc.file_name || 'View Document'}
          </a>
        `;
        list.appendChild(div);
      });
    }

    new bootstrap.Modal(
      document.getElementById('documentsModal')
    ).show();

  } catch (err) {
    console.error('DOCUMENT LOAD ERROR:', err);
    list.innerHTML =
      '<p class="text-danger">Failed to load documents</p>';
  }
}

// ================= APPROVE / REJECT =================
async function approveLoan(loanId) {
  if (!confirm('Approve this loan?')) return;

  await fetch(`${API_BASE}/loans/${loanId}/approve`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });

  loadLoanApplications(localStorage.getItem('token'));
}

async function rejectLoan(loanId) {
  if (!confirm('Reject this loan?')) return;

  await fetch(`${API_BASE}/loans/${loanId}/reject`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });

  loadLoanApplications(localStorage.getItem('token'));
}
