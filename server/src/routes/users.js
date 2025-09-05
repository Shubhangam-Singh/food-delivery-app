const express = require('express');
const router = express.Router();

// User routes will be implemented here
router.get('/', (req, res) => {
  res.json({ message: 'Users routes - Coming soon' });
});

module.exports = router;
