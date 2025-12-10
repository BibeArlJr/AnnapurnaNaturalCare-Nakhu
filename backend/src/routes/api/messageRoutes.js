const express = require('express');
const controller = require('../../controllers/messageController');
const { authenticate, requireAdmin } = require('../../middleware/authMiddleware');

const router = express.Router();

// Public submit
router.post('/', controller.createMessage);

// Admin endpoints
router.get('/', authenticate, requireAdmin, controller.listMessages);
router.get('/:id', authenticate, requireAdmin, controller.getMessageById);
router.post('/:id/read', authenticate, requireAdmin, controller.setMessageStatus);
router.delete('/:id', authenticate, requireAdmin, controller.deleteMessage);

module.exports = router;
