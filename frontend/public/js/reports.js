const API_BASE = 'http://localhost:5000/api/reports';

// ================= AUTH HEADERS =================
function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };
}

// ================= DOM =================
const reportPeriod = document.getElementById('reportPeriod');
const fromDate = document.getElementById('fromDate');
const toDate = document.getElementById('toDate');
const reportSelect = document.getElementById('reportSelect');
const reportContainer = document.getElementById('reportContainer');
const exportPdfBtn = document.getElementById('exportPdfBtn');

// ================= PERIOD HANDLER =================
reportPeriod.addEventListener('change', () => {
  const period = reportPeriod.value;
  const today = new Date();
  let start, end;

  switch (period) {
    case 'today':
      start = end = today;
      break;

    case 'weekly':
      start = new Date();
      start.setDate(today.getDate() - 7);
      end = today;
      break;

    case 'monthly':
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      end = today;
      break;

    case 'yearly':
      start = new Date(today.getFullYear(), 0, 1);
      end = today;
      break;

    case 'custom':
      fromDate.disabled = false;
      toDate.disabled = false;
      return;
  }

  fromDate.value = formatDate(start);
  toDate.value = formatDate(end);
  fromDate.disabled = true;
  toDate.disabled = true;

  loadReport();
});

// ================= LOAD REPORT =================
async function loadReport() {
  const reportName = reportSelect.value;
  const period = reportPeriod.value;
  const from = fromDate.value;
  const to = toDate.value;

  if (!from || !to) {
    reportContainer.innerHTML =
      '<p class="text-center text-muted">Select valid dates.</p>';
    return;
  }

  reportContainer.innerHTML =
    '<p class="text-center text-muted">Loading report...</p>';

  try {
    const url =
      `${API_BASE}/${reportName}?period=${period}&fromDate=${from}&toDate=${to}`;

    const res = await fetch(url, { headers: getAuthHeaders() });
    const data = await res.json();

    if (!data || data.length === 0) {
      reportContainer.innerHTML =
        '<p class="text-center text-muted">No data found.</p>';
      return;
    }

    renderReport(reportName, data);

  } catch (err) {
    console.error(err);
    reportContainer.innerHTML =
      '<p class="text-danger text-center">Failed to load report.</p>';
  }
}

// ================= RENDER =================
function renderReport(name, data) {

  // ===== BRANCH REVENUE PIE CHART =====
  if (name === 'branch-revenue') {
    renderPieChart(data);
    return;
  }

  let html = `
    <div class="table-responsive">
      <table class="table table-bordered table-striped align-middle">
        <thead class="table-dark">
          <tr>
  `;

  const columns = Object.keys(data[0]);

  columns.forEach(col => {
    html += `<th>${col.replace(/_/g, ' ')}</th>`;
  });

  html += '</tr></thead><tbody>';

  data.forEach(row => {
    html += '<tr>';
    columns.forEach(col => {
      html += `<td>${row[col]}</td>`;
    });
    html += '</tr>';
  });

  html += '</tbody></table></div>';

  reportContainer.innerHTML = html;
}

// ================= PIE CHART =================
function renderPieChart(data) {

  reportContainer.innerHTML = `
    <canvas id="revenueChart"></canvas>
  `;

  const ctx = document.getElementById('revenueChart');

  const labels = data.map(item => item.branch_name);
  const values = data.map(item => item.revenue);

  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: values
      }]
    }
  });
}

// ================= EXPORT PDF =================
exportPdfBtn.addEventListener('click', () => {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();
  pdf.text("Cash Loan Report", 10, 10);
  pdf.text(reportContainer.innerText, 10, 20);
  pdf.save(`${reportSelect.value}-report.pdf`);
});

// ================= HELPERS =================
function formatDate(d) {
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

// ================= INIT =================
reportSelect.addEventListener('change', loadReport);
fromDate.addEventListener('change', loadReport);
toDate.addEventListener('change', loadReport);
reportPeriod.dispatchEvent(new Event('change'));