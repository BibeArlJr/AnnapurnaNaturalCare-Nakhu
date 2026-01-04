const express = require('express');
const multer = require('multer');
const controller = require('../../controllers/packageController');
const { authenticate, requireAdmin } = require('../../middleware/authMiddleware');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', controller.getAll);
router.get('/:id', controller.getOne);
router.patch('/:id/status', authenticate, requireAdmin, controller.updateStatus);
router.post(
  '/',
  authenticate,
  requireAdmin,
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'image', maxCount: 1 },
    { name: 'galleryImages', maxCount: 10 },
    { name: 'promoVideo', maxCount: 1 },
  ]),
  controller.create
);
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'image', maxCount: 1 },
    { name: 'galleryImages', maxCount: 10 },
    { name: 'promoVideo', maxCount: 1 },
  ]),
  controller.update
);
router.delete('/:id', authenticate, requireAdmin, controller.remove);

module.exports = router;
