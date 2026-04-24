const express = require('express');
const router = express.Router();
const {
  createBooking,
  createPaymentOrder,
  confirmPayment,
  getMyBookings,
  getVendorBookings,
  updateBookingStatus,
  cancelBooking,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, createBooking);
router.post('/payment-order', protect, createPaymentOrder);
router.get('/my', protect, getMyBookings);
router.get('/vendor', protect, authorize('vendor', 'admin'), getVendorBookings);
router.put('/:id/pay', protect, confirmPayment);
router.put('/:id/status', protect, authorize('vendor', 'admin'), updateBookingStatus);
router.put('/:id/cancel', protect, cancelBooking);

module.exports = router;
