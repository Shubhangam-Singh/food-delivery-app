const express = require('express');
const router = express.Router();

// Menu routes will be implemented here
router.get('/', (req, res) => {
  res.json({ message: 'Menu routes - Coming soon' });
});

module.exports = router;
