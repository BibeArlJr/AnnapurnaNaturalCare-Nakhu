const express = require('express');
const multer = require('multer');
const { authenticate, requireAdmin } = require('../../middleware/authMiddleware');
const controller = require('../../controllers/patientReviewController');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', controller.getAll);
router.get('/:id', controller.getOne);
router.post('/', authenticate, requireAdmin, upload.single('photoFile'), controller.create);
router.put('/:id', authenticate, requireAdmin, upload.single('photoFile'), controller.update);
router.patch('/:id', authenticate, requireAdmin, upload.single('photoFile'), controller.update);
router.delete('/:id', authenticate, requireAdmin, controller.remove);

module.exports = router;
