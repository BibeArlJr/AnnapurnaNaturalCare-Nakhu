const express = require('express');
const controller = require('../../controllers/authController');
const { authenticate } = require('../../middleware/authMiddleware');

const router = express.Router();

router.post('/register-admin', controller.registerAdmin);
router.post('/login', controller.login);
router.post('/logout', controller.logout);
router.get('/me', authenticate, controller.me);

module.exports = router;
