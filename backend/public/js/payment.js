const API_BASE = 'http://localhost:5000/api';

const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

if (!token || !user) {
  window.location.href = 'login.html';
}

// ================= GENERATE RECEIPT =================
function generateReceipt(payment) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Payment Receipt", 20, 20);

  doc.setFontSize(12);
  doc.text(`Payment ID: ${payment.payment_id}`, 20, 40);
  doc.text(`Loan ID: ${payment.loan_id}`, 20, 50);
  doc.text(`Amount Paid: R ${Number(payment.amount_paid).toFixed(2)}`, 20, 60);
  doc.text(`Payment Method: ${payment.payment_method}`, 20, 70);
  doc.text(`Date: ${new Date(payment.payment_date).toLocaleString()}`, 20, 80);

  doc.text("Thank you for your payment!", 20, 100);

  doc.save(`receipt_${payment.payment_id}.pdf`);
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
      table.innerHTML = `<tr><td colspan="6">No payments found</td></tr>`;
      return;
    }

    payments.forEach(p => {
      const row = document.createElement('tr');

      row.innerHTML = `
        <td>${p.payment_id}</td>
        <td>${p.loan_id}</td>
        <td>R ${Number(p.amount_paid).toFixed(2)}</td>
        <td>${p.payment_method || '—'}</td>
        <td>${new Date(p.payment_date).toLocaleDateString()}</td>
        <td>
          <button class="btn btn-sm btn-primary">Download</button>
        </td>
      `;

      // Attach download event
      row.querySelector('button').addEventListener('click', () => {
        generateReceipt(p);
      });

      table.appendChild(row);
    });

  } catch (err) {
    console.error('LOAD PAYMENTS ERROR:', err);
  }
}

loadPayments();

// ================= SHOW/HIDE SECTIONS =================
const methodSelect = document.getElementById('payment_method');
const cardSection = document.getElementById('cardSection');
const payshapSection = document.getElementById('payshapSection');

methodSelect?.addEventListener('change', () => {
  cardSection.style.display = 'none';
  payshapSection.style.display = 'none';

  if (methodSelect.value === 'card') {
    cardSection.style.display = 'block';
  }

  if (methodSelect.value === 'payshap') {
    payshapSection.style.display = 'block';
  }
});

// ================= SUBMIT PAYMENT =================
const paymentForm = document.getElementById('paymentForm');

if (user.role !== 'borrower') {
  const section = document.getElementById('makePaymentSection');
  if (section) section.style.display = 'none';
}

paymentForm?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const loanId = document.getElementById('loan_id').value;
  const amount = document.getElementById('amount').value;
  const method = document.getElementById('payment_method').value;

  if (!loanId || !amount || !method) {
    alert('All fields are required');
    return;
  }

  // Demo validation
  if (method === 'card') {
    const cardNumber = document.getElementById('card_number').value;
    const expiry = document.getElementById('expiry').value;
    const cvv = document.getElementById('cvv').value;

    if (!cardNumber || !expiry || !cvv) {
      alert('Please complete card details');
      return;
    }
  }

  if (method === 'payshap') {
    const ref = document.getElementById('reference_number').value;
    if (!ref) {
      alert('Enter PayShap reference');
      return;
    }
  }

  // Simulated processing
  const button = paymentForm.querySelector('button');
  button.disabled = true;
  button.innerText = "Processing Payment...";

  await new Promise(resolve => setTimeout(resolve, 2000));

  const payload = {
    loan_id: loanId,
    amount_paid: amount,
    payment_method: method,
    reference_number: document.getElementById('reference_number')?.value || null
  };

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
      button.disabled = false;
      button.innerText = "Submit Payment";
      return;
    }

    alert(`Payment successful via ${method.toUpperCase()} ✅`);

    // ✅ AUTO DOWNLOAD RECEIPT AFTER PAYMENT
    generateReceipt(data.payment || {
      payment_id: Date.now(),
      loan_id: loanId,
      amount_paid: amount,
      payment_method: method,
      payment_date: new Date()
    });

    paymentForm.reset();
    cardSection.style.display = 'none';
    payshapSection.style.display = 'none';

    loadPayments();

  } catch (err) {
    console.error('PAYMENT ERROR:', err);
    alert('Server error');
  }

  button.disabled = false;
  button.innerText = "Submit Payment";
});