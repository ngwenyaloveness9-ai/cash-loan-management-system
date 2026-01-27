const API_BASE = 'http://localhost:5000/api';

// ================= AUTH =================
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

if (!token || !user || user.role !== 'borrower') {
  window.location.href = 'login.html';
}

// ================= LOAD BRANCHES =================
async function loadBranches() {
  try {
    const res = await fetch(`${API_BASE}/branches`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const branches = await res.json();
    const select = document.getElementById('branch_id');

    select.innerHTML = '<option value="">-- Select Branch --</option>';

    branches.forEach(branch => {
      const option = document.createElement('option');
      option.value = branch.branch_id;
      option.textContent = branch.branch_name;
      select.appendChild(option);
    });

  } catch (err) {
    console.error(err);
    alert('Unable to load branches');
  }
}

// ================= APPLY LOAN + UPLOAD DOCUMENTS =================
document.getElementById('applyLoanForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const branch_id = document.getElementById('branch_id').value;
  const loan_amount = document.getElementById('loan_amount').value;
  const repayment_period = document.getElementById('repayment_period').value;

  const idFile = document.getElementById('id').files[0];
  const payslipFile = document.getElementById('payslip').files[0];
  const bankFile = document.getElementById('bank_statement').files[0];

  if (!branch_id || !loan_amount || !repayment_period) {
    alert('Fill in all loan details');
    return;
  }

  if (!idFile) {
    alert('ID document is required');
    return;
  }

  if (!payslipFile && !bankFile) {
    alert('Upload either a payslip or bank statement');
    return;
  }

  try {
    // ================= CREATE LOAN =================
    const loanRes = await fetch(`${API_BASE}/loans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        branch_id,
        loan_amount,
        repayment_period,
        interest_rate: null
      })
    });

    const loanData = await loanRes.json();

    if (!loanRes.ok) {
      alert(loanData.error || 'Loan creation failed');
      return;
    }

    const loanId = loanData.loan_id;

    // ================= UPLOAD DOCUMENTS =================
    const formData = new FormData();
    formData.append('id', idFile);

    if (payslipFile) formData.append('payslip', payslipFile);
    if (bankFile) formData.append('bank_statement', bankFile);

    const docRes = await fetch(
      `${API_BASE}/loans/${loanId}/documents`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      }
    );

    const docData = await docRes.json();

    if (!docRes.ok) {
      alert(docData.error || 'Document upload failed');
      return;
    }

    alert('Loan application submitted successfully!');
    window.location.href = 'borrower-dashboard.html';

  } catch (err) {
    console.error('Apply loan error:', err);
    alert('Server error');
  }
});

// ================= INIT =================
document.addEventListener('DOMContentLoaded', loadBranches);
