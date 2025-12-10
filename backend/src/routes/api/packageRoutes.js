const express = require('express');
const multer = require('multer');
const controller = require('../../controllers/packageController');
const { authenticate, requireAdmin } = require('../../middleware/authMiddleware');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', controller.getAll);
router.get('/:id', controller.getOne);
router.post('/', authenticate, requireAdmin, upload.single('image'), controller.create);
router.put('/:id', authenticate, requireAdmin, upload.single('image'), controller.update);
router.delete('/:id', authenticate, requireAdmin, controller.remove);

module.exports = router;
