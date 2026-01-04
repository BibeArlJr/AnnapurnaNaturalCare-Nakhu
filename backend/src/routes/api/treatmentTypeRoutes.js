const express = require('express');
const {
  getAllTreatmentTypes,
  createTreatmentType,
  updateTreatmentType,
  deleteTreatmentType,
} = require('../../controllers/treatmentTypeController');
const { authenticate, requireAdmin } = require('../../middleware/authMiddleware');

const router = express.Router();

router.get('/', getAllTreatmentTypes);
router.post('/', authenticate, requireAdmin, createTreatmentType);
router.put('/:id', authenticate, requireAdmin, updateTreatmentType);
router.delete('/:id', authenticate, requireAdmin, deleteTreatmentType);

module.exports = router;
