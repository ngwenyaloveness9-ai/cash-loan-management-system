const API_BASE = 'http://localhost:5000/api';

const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

if (!token || !user) {
  window.location.href = 'login.html';
}

// ================= LOAD PAYMENTS =================
async function loadPayments() {
  try {
    const res = await fetch(`${API_BASE}/payments`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const payments = await res.json();
    const table = document.getElementById('paymentsTable');
    if (!table) return;

    table.innerHTML = '';

    if (!Array.isArray(payments) || payments.length === 0) {
      table.innerHTML = `<tr><td colspan="4">No payments found</td></tr>`;
      return;
    }

    payments.forEach(p => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${p.payment_id}</td>
        <td>${p.loan_id}</td>
        <td>R ${p.amount_paid}</td>
        <td>${new Date(p.payment_date).toLocaleDateString()}</td>

      `;
      table.appendChild(row);
    });

  } catch (err) {
    console.error('LOAD PAYMENTS ERROR:', err);
  }
}

loadPayments();

// ================= MAKE PAYMENT (Borrower only) =================
const paymentForm = document.getElementById('paymentForm');

if (user.role !== 'borrower') {
  const section = document.getElementById('makePaymentSection');
  if (section) section.style.display = 'none';
}

paymentForm?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = {
    loan_id: document.getElementById('loan_id').value,
    amount_paid: document.getElementById('amount').value,
    payment_method: document.getElementById('payment_method')?.value || null,
    reference_number: document.getElementById('reference_number')?.value || null
  };

  if (!payload.loan_id || !payload.amount_paid) {
    alert('Loan ID and amount are required');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || 'Payment failed');
      return;
    }

    alert('Payment recorded successfully');
    paymentForm.reset();
    loadPayments();

  } catch (err) {
    console.error('PAYMENT SUBMIT ERROR:', err);
    alert('Server error');
  }
});
