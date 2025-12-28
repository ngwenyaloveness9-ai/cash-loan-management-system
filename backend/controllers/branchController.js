const Branch = require('../models/Branch');

exports.getAllBranches = (req, res) => {
  Branch.getAll((err, results) => {
    if (err) {
      console.error('BRANCH ERROR:', err);
      return res.status(500).json({ error: 'Failed to fetch branches' });
    }

    res.json(results);
  });
};
