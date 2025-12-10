const express = require('express');
const controller = require('../../controllers/blogController');
const { authenticate, requireAdmin } = require('../../middleware/authMiddleware');

const router = express.Router();

router.get('/', controller.getAll);
router.get('/:id', controller.getOne);
router.post('/', authenticate, requireAdmin, controller.create);
router.post('/upload', authenticate, requireAdmin, async (req, res) => {
  // simple passthrough handled in controller.create/update via imageData
  return res.status(400).json({ success: false, message: 'Use /blogs with imageData' });
});
router.put('/:id', authenticate, requireAdmin, controller.update);
router.delete('/:id', authenticate, requireAdmin, controller.remove);

module.exports = router;
