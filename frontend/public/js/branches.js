const API_BASE = 'http://localhost:5000/api';

async function loadBranches(selectId) {
  try {
    const res = await fetch(`${API_BASE}/branches`);
    const branches = await res.json();

    const select = document.getElementById(selectId);
    select.innerHTML = '<option value="">-- Select Branch --</option>';

    branches.forEach(branch => {
      const option = document.createElement('option');
      option.value = branch.branch_id;
      option.textContent = branch.branch_name;
      select.appendChild(option);
    });

  } catch (err) {
    console.error('Failed to load branches', err);
  }
}

export { loadBranches };
