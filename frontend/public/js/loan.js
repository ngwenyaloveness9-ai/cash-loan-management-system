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


// ================= AUTO REPAYMENT RULE =================

document.getElementById('loan_amount').addEventListener('input', () => {

  const amount = Number(document.getElementById('loan_amount').value);
  const periodField = document.getElementById('repayment_period');

  if (!amount) {
    periodField.value = '';
    return;
  }

  if (amount < 3000) {
    periodField.value = "3 months";
  } else {
    periodField.value = "6 months";
  }

});


// ================= APPLY LOAN =================

document.getElementById('applyLoanForm').addEventListener('submit', async (e) => {

  e.preventDefault();

  const branch_id = document.getElementById('branch_id').value;
  const loan_amount = document.getElementById('loan_amount').value;

  const idFile = document.getElementById('id').files[0];
  const bankFile = document.getElementById('bank_statement').files[0];
  const payslipFile = document.getElementById('payslip').files[0];

  const agreed = document.getElementById('agreeTerms').checked;

  if (!agreed) {
    alert("You must agree to the Terms and Conditions before applying.");
    return;
  }

  // determine repayment period

  let repayment_period = loan_amount < 3000 ? 3 : 6;

  try {

    // CREATE LOAN

    const loanRes = await fetch(`${API_BASE}/loans`, {

      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },

      body: JSON.stringify({
        branch_id,
        loan_amount,
        repayment_period
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
    formData.append('bank_statement', bankFile);

    if (payslipFile) {
      formData.append('payslip', payslipFile);
    }

    const docRes = await fetch(`${API_BASE}/loans/${loanId}/documents`, {

      method: 'POST',

      headers: {
        Authorization: `Bearer ${token}`
      },

      body: formData

    });

    const docData = await docRes.json();

    if (!docRes.ok) {
      alert(docData.error || 'Document upload failed');
      return;
    }

    alert('Loan application submitted successfully!');

    window.location.href = 'borrower-dashboard.html';

  } catch (err) {

    console.error(err);
    alert('Server error');

  }

});


// ================= INIT =================

document.addEventListener('DOMContentLoaded', loadBranches);