const express = require('express');
const { authenticate, requireAdmin } = require('../../middleware/authMiddleware');
const controller = require('../../controllers/heroImageController');

const router = express.Router();

router.get('/', controller.list);
router.post('/', authenticate, requireAdmin, controller.create);
router.put('/reorder', authenticate, requireAdmin, controller.reorder);
router.delete('/:id', authenticate, requireAdmin, controller.remove);

module.exports = router;
