const express = require('express');
const controller = require('../../controllers/partnerHotelController');
const { authenticate, requireAdmin } = require('../../middleware/authMiddleware');

const router = express.Router();

router.get('/public', controller.listPublic);
router.get('/', authenticate, requireAdmin, controller.list);
router.post('/', authenticate, requireAdmin, controller.create);
router.put('/:id', authenticate, requireAdmin, controller.update);
router.delete('/:id', authenticate, requireAdmin, controller.remove);

module.exports = router;
