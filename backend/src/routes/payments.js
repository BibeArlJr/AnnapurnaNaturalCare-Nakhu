const express = require('express');
const { createStripeCheckout, markPaymentStatus } = require('../controllers/paymentController');

const router = express.Router();

router.post('/stripe/checkout', createStripeCheckout);
router.post('/mark-status', markPaymentStatus);

module.exports = router;
