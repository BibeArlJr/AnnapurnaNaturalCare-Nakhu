const express = require('express');
const { authenticate, requireAdmin } = require('../../middleware/authMiddleware');
const controller = require('../../controllers/adminNotificationController');

const router = express.Router();

router.get('/unseen-counts', authenticate, requireAdmin, controller.getCounts);
router.patch('/mark-seen', authenticate, requireAdmin, controller.markSeen);

module.exports = router;
