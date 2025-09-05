const express = require('express');
const router = express.Router();

// Order routes will be implemented here
router.get('/', (req, res) => {
  res.json({ message: 'Order routes - Coming soon' });
});

module.exports = router;
