const API = 'http://localhost:5000/api';
const token = localStorage.getItem('token');
const loanId = new URLSearchParams(window.location.search).get('loanId');

document.getElementById('docForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);

  const res = await fetch(`${API}/documents/${loanId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  });

  const data = await res.json();
  if (!res.ok) return alert(data.error);

  alert('Documents uploaded');
});
