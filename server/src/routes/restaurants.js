const express = require('express');
const router = express.Router();

// Restaurant routes will be implemented here
router.get('/', (req, res) => {
  res.json({ message: 'Restaurant routes - Coming soon' });
});

module.exports = router;
