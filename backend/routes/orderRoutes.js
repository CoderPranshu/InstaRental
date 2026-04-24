const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, getMyOrders } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/').post(createOrder);
router.route('/verify').put(verifyPayment);
router.route('/my').get(getMyOrders);

module.exports = router;
