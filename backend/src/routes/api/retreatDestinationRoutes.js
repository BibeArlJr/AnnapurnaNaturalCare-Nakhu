const express = require('express');
const {
  createDestination,
  getDestinations,
  updateDestination,
  deleteDestination,
  toggleDestination,
} = require('../../controllers/retreatDestinationController');
const { authenticate, requireAdmin } = require('../../middleware/authMiddleware');

const router = express.Router();

router.post('/', authenticate, requireAdmin, createDestination);
router.get('/', getDestinations);
router.put('/:id', authenticate, requireAdmin, updateDestination);
router.patch('/:id/toggle', authenticate, requireAdmin, toggleDestination);
router.delete('/:id', authenticate, requireAdmin, deleteDestination);

module.exports = router;
