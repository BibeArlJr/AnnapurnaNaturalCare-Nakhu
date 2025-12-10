const express = require('express');
const controller = require('../../controllers/contactController');
const { authenticate, requireAdmin } = require('../../middleware/authMiddleware');

const router = express.Router();

router.post('/', controller.create);
router.get('/', authenticate, requireAdmin, controller.getAll);
router.get('/:id', authenticate, requireAdmin, controller.getOne);
router.put('/:id', authenticate, requireAdmin, controller.update);
router.delete('/:id', authenticate, requireAdmin, controller.remove);

module.exports = router;
