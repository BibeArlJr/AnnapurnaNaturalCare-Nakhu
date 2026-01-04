const express = require('express');

const router = express.Router();

// Search functionality has been removed. Keep handlers to return a safe 404 JSON response.
router.all('/', (req, res) => {
  res.status(404).json({ message: 'Search has been removed' });
});

router.all('/suggestions', (req, res) => {
  res.status(404).json({ message: 'Search has been removed' });
});

router.all('*', (req, res) => {
  res.status(404).json({ message: 'Search has been removed' });
});

module.exports = router;
