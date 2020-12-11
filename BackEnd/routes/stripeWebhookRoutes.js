/**
 * This route is for /api/stripe
 */
const express = require('express');
const { check } = require('express-validator');

const stripeWebhookController = require('../controllers/stripeWebhookController');

const checkClubAuth = require('../middleware/check-clubAuth');
const checkUserAuth = require('../middleware/check-userAuth');

const router = express.Router();

// https://stripe.com/docs/connect/webhooks
// Stripe Webhook listener
router.post('/', stripeWebhookController.webhook);

module.exports = router;
