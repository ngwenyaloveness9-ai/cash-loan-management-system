const API_BASE = 'http://localhost:5000/api';

// ================= LOAD PDF LIBRARY =================
const script = document.createElement('script');
script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
document.head.appendChild(script);

// ================= AUTH HEADER =================
function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };
}

// ================= FORM SUBMIT =================
document.getElementById('filterForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  loadReports();
});

// ================= LOAD REPORTS =================
async function loadReports() {
  await loadSummary();
  await loadBranchRevenue();
  await loadClosedLoans();
}

// ================= SUMMARY =================
async function loadSummary() {
  const res = await fetch(`${API_BASE}/reports/summary`, {
    headers: getAuthHeaders()
  });

  const data = await res.json();
  const list = document.getElementById('summaryList');
  list.innerHTML = '';

  for (const key in data) {
    const li = document.createElement('li');
    li.textContent = `${key.replace(/_/g, ' ')}: ${data[key]}`;
    list.appendChild(li);
  }
}

// ================= BRANCH REVENUE =================
async function loadBranchRevenue() {
  const res = await fetch(`${API_BASE}/reports/branch-revenue`, {
    headers: getAuthHeaders()
  });

  const data = await res.json();
  const table = document.getElementById('branchRevenueTable');
  table.innerHTML = '';

  data.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.branch_name}</td>
      <td>${row.total_loans}</td>
      <td>${row.revenue}</td>
    `;
    table.appendChild(tr);
  });
}

// ================= CLOSED LOANS =================
async function loadClosedLoans() {
  const res = await fetch(`${API_BASE}/reports/closed-loans`, {
    headers: getAuthHeaders()
  });

  const data = await res.json();
  const table = document.getElementById('closedLoansTable');
  table.innerHTML = '';

  data.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.loan_id}</td>
      <td>${row.full_name}</td>
      <td>${row.branch_name}</td>
      <td>${row.loan_amount}</td>
    `;
    table.appendChild(tr);
  });
}

// ================= PDF EXPORT =================
document.getElementById('exportPdfBtn').addEventListener('click', () => {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();
  let y = 10;

  pdf.setFontSize(16);
  pdf.text('Cash Loan Management System Report', 10, y);
  y += 10;

  // SUMMARY
  pdf.setFontSize(14);
  pdf.text('Summary', 10, y);
  y += 8;

  document.querySelectorAll('#summaryList li').forEach(li => {
    pdf.setFontSize(11);
    pdf.text(li.textContent, 12, y);
    y += 6;
  });

  y += 6;

  // BRANCH REVENUE
  pdf.setFontSize(14);
  pdf.text('Branch Revenue', 10, y);
  y += 8;

  document.querySelectorAll('#branchRevenueTable tr').forEach(row => {
    const cells = row.querySelectorAll('td');
    if (cells.length) {
      pdf.setFontSize(11);
      pdf.text(
        `${cells[0].textContent} | Loans: ${cells[1].textContent} | Revenue: ${cells[2].textContent}`,
        12,
        y
      );
      y += 6;
    }
  });

  y += 6;

  // CLOSED LOANS
  pdf.setFontSize(14);
  pdf.text('Closed Loans', 10, y);
  y += 8;

  document.querySelectorAll('#closedLoansTable tr').forEach(row => {
    const cells = row.querySelectorAll('td');
    if (cells.length) {
      pdf.setFontSize(11);
      pdf.text(
        `Loan #${cells[0].textContent} | ${cells[1].textContent} | ${cells[2].textContent} | ${cells[3].textContent}`,
        12,
        y
      );
      y += 6;
    }
  });

  pdf.save('loan-reports.pdf');
});
