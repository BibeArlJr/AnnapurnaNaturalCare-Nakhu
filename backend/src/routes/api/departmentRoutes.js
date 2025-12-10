const express = require('express');
const controller = require('../../controllers/departmentController');
const { authenticate, requireAdmin } = require('../../middleware/authMiddleware');

const router = express.Router();

router.get('/', controller.getDepartments);
router.get('/:id', controller.getOne);
router.post('/', authenticate, requireAdmin, controller.create);
router.post('/upload', authenticate, requireAdmin, controller.uploadImageOnly);
router.put('/:id', authenticate, requireAdmin, controller.update);
router.delete('/:id', authenticate, requireAdmin, controller.remove);

module.exports = router;
