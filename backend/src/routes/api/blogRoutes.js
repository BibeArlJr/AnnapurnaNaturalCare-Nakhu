const express = require('express');
const multer = require('multer');
const controller = require('../../controllers/blogController');
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
    { name: 'imageFiles', maxCount: 10 },
    { name: 'videoFiles', maxCount: 10 },
  ]),
  controller.create
);
router.post('/upload', authenticate, requireAdmin, async (req, res) => {
  // simple passthrough handled in controller.create/update via imageData
  return res.status(400).json({ success: false, message: 'Use /blogs with imageData' });
});
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  upload.fields([
    { name: 'imageFiles', maxCount: 10 },
    { name: 'videoFiles', maxCount: 10 },
  ]),
  controller.update
);
router.delete('/:id', authenticate, requireAdmin, controller.remove);

module.exports = router;
