const db = require('../config/db');

exports.getAllBranches = async (req, res) => {
  try {
    const [branches] = await db.query(
      'SELECT branch_id, branch_name FROM branches ORDER BY branch_name'
    );

    res.json(branches);

  } catch (error) {
    console.error('GET BRANCHES ERROR:', error);
    res.status(500).json({ error: 'Failed to fetch branches' });
  }
};
