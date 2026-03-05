const API_BASE = 'http://localhost:5000/api';

// Make token global so approve/reject can reload table
let globalToken = null;

// ================= DOM READY =================
document.addEventListener('DOMContentLoaded', () => {

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  if (!token || !user) {
    window.location.href = 'login.html';
    return;
  }

  globalToken = token;

  // Logout
  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = 'login.html';
  });

  // ================= OFFICER PROFILE =================
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

  // Load Applications (Officer/Admin only)
  if (user.role === 'officer' || user.role === 'admin') {
    loadLoanApplications(token);
  }

});


// ================================
// LOAD LOAN APPLICATIONS
// ================================
async function loadLoanApplications(token) {

  const tableBody = document.getElementById('applicationsTableBody');
  if (!tableBody) return;

  tableBody.innerHTML =
    '<tr><td colspan="6" class="text-center">Loading applications...</td></tr>';

  try {
    const res = await fetch(`${API_BASE}/loans`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error('Failed to fetch loans');

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
        <td>R ${Number(loan.loan_amount).toFixed(2)}</td>
        <td>${loan.branch_name}</td>
        <td class="text-capitalize fw-semibold">
          ${loan.loan_status}
        </td>
        <td>
          ${
            loan.loan_status === 'pending'
              ? `
                <button class="btn btn-sm btn-info me-1"
                  onclick="viewDocuments(${loan.loan_id})">
                  View Docs
                </button>
                <button class="btn btn-sm btn-success me-1"
                  onclick="approveLoan(${loan.loan_id})">
                  Approve
                </button>
                <button class="btn btn-sm btn-danger"
                  onclick="rejectLoan(${loan.loan_id})">
                  Reject
                </button>
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


// ================================
// VIEW DOCUMENTS
// ================================
window.viewDocuments = async function (loanId) {

  const documentsList = document.getElementById('documentsList');
  if (!documentsList) return;

  documentsList.innerHTML =
    '<p class="text-muted">Loading documents...</p>';

  const token = localStorage.getItem('token');
  if (!token) return alert('Unauthorized!');

  try {
    const res = await fetch(`${API_BASE}/loans/${loanId}/documents`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error('Failed to fetch documents');

    const docs = await res.json();

    if (!docs.length) {
      documentsList.innerHTML =
        '<p class="text-muted">No documents uploaded for this loan.</p>';
      return;
    }

    const ul = document.createElement('ul');
    ul.classList.add('list-group');

    docs.forEach(doc => {

      const li = document.createElement('li');
      li.className =
        'list-group-item d-flex justify-content-between align-items-center';

      li.innerHTML = `
        <span>${doc.file_name}</span>
        <a href="http://localhost:5000${doc.file_url}"
           target="_blank"
           class="btn btn-sm btn-primary">
           View
        </a>
      `;

      ul.appendChild(li);
    });

    documentsList.innerHTML = '';
    documentsList.appendChild(ul);

    const modal = new bootstrap.Modal(
      document.getElementById('documentsModal')
    );
    modal.show();

  } catch (err) {
    console.error('View documents error:', err);
    documentsList.innerHTML =
      '<p class="text-danger">Failed to load documents.</p>';
  }
};


// ================================
// APPROVE LOAN (FIXED)
// ================================
window.approveLoan = async function (loanId) {

  if (!confirm(`Are you sure you want to APPROVE loan ${loanId}?`)) return;

  try {
    const res = await fetch(`${API_BASE}/loans/${loanId}/approve`, {
      method: 'PUT', // ✅ FIXED
      headers: {
        Authorization: `Bearer ${globalToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error('Approve response:', data);
      throw new Error(data.error || 'Failed to approve loan');
    }

    alert(`Loan ${loanId} approved successfully`);

    loadLoanApplications(globalToken);

  } catch (err) {
    console.error('Approve loan error:', err);
    alert(`Failed to approve loan ${loanId}`);
  }
};


// ================================
// REJECT LOAN (FIXED)
// ================================
window.rejectLoan = async function (loanId) {

  if (!confirm(`Are you sure you want to REJECT loan ${loanId}?`)) return;

  try {
    const res = await fetch(`${API_BASE}/loans/${loanId}/reject`, {
      method: 'PUT', // ✅ FIXED
      headers: {
        Authorization: `Bearer ${globalToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error('Reject response:', data);
      throw new Error(data.error || 'Failed to reject loan');
    }

    alert(`Loan ${loanId} rejected successfully`);

    loadLoanApplications(globalToken);

  } catch (err) {
    console.error('Reject loan error:', err);
    alert(`Failed to reject loan ${loanId}`);
  }
};