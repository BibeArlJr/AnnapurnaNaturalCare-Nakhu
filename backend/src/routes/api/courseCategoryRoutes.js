const express = require('express');
const controller = require('../../controllers/courseCategoryController');
const { authenticate, requireAdmin } = require('../../middleware/authMiddleware');

const router = express.Router();

router.get('/active', controller.listActive);
router.get('/', authenticate, requireAdmin, controller.list);
router.post('/', authenticate, requireAdmin, controller.create);
router.put('/:id', authenticate, requireAdmin, controller.update);
router.delete('/:id', authenticate, requireAdmin, controller.remove);

module.exports = router;
