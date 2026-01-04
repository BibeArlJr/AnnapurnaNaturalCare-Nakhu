const express = require('express');
const { getAll, getOne, create, update, updateStatus, remove } = require('../../controllers/retreatProgramController');
const { authenticate, requireAdmin } = require('../../middleware/authMiddleware');
const multer = require('multer');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', getAll);
router.get('/:slug', getOne);
router.patch('/:id/status', authenticate, requireAdmin, updateStatus);
router.post(
  '/',
  authenticate,
  requireAdmin,
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'galleryImages', maxCount: 10 },
    { name: 'promoVideo', maxCount: 1 },
  ]),
  create
);
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'galleryImages', maxCount: 10 },
    { name: 'promoVideo', maxCount: 1 },
  ]),
  update
);
router.delete('/:id', authenticate, requireAdmin, remove);

module.exports = router;
