const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const Booking = require('../models/Booking');
const Product = require('../models/Product');
const Razorpay = require('razorpay');

const getRazorpayClient = () =>
  new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

// Helper: calculate total days between two dates
const calcDays = (start, end) => {
  const diff = new Date(end) - new Date(start);
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// @desc    Create a booking
// @route   POST /api/bookings
// @access  Private/User
const createBooking = asyncHandler(async (req, res) => {
  const { productId, startDate, endDate, notes } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (!product.isAvailable) {
    res.status(400);
    throw new Error('Product is not available for rent');
  }

  // Check date conflicts
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (start >= end) {
    res.status(400);
    throw new Error('End date must be after start date');
  }

  const conflict = product.bookedDates.some((range) => start < range.endDate && end > range.startDate);
  if (conflict) {
    res.status(400);
    throw new Error('Product is already booked for the selected dates');
  }

  const totalDays = calcDays(startDate, endDate);
  const totalAmount = totalDays * product.pricePerDay;

  const booking = await Booking.create({
    user: req.user._id,
    product: productId,
    owner: product.owner,
    startDate,
    endDate,
    totalDays,
    totalAmount,
    notes,
  });

  // Mark dates as booked on product
  product.bookedDates.push({ startDate: start, endDate: end });
  await product.save();

  res.status(201).json(booking);
});

// @desc    Create Razorpay order
// @route   POST /api/bookings/payment-order
// @access  Private
const createPaymentOrder = asyncHandler(async (req, res) => {
  const { bookingId } = req.body;

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  if (booking.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    res.status(500);
    throw new Error('Razorpay is not configured on server');
  }

  try {
    const razorpay = getRazorpayClient();
    const amountInPaise = Math.round(booking.totalAmount * 100);
    if (!amountInPaise || Number.isNaN(amountInPaise) || amountInPaise <= 0) {
      res.status(400);
      throw new Error('Invalid booking amount for payment');
    }

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `booking_${bookingId.toString().slice(-10)}`,
      notes: { bookingId: bookingId.toString() },
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      bookingId: booking._id,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    res.status(500);
    throw new Error(`Razorpay order creation failed: ${error?.description || error?.error?.description || error?.message || 'Unknown error'}`);
  }
});

// @desc    Confirm payment for booking
// @route   PUT /api/bookings/:id/pay
// @access  Private
const confirmPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    res.status(400);
    throw new Error('Invalid Razorpay payment signature');
  }

  booking.paymentStatus = 'paid';
  booking.paymentId = razorpay_payment_id;
  booking.paymentMethod = 'razorpay';
  booking.status = 'confirmed';
  await booking.save();

  // Increment totalRentals on product
  await Product.findByIdAndUpdate(booking.product, { $inc: { totalRentals: 1 } });

  res.json(booking);
});

// @desc    Get current user's bookings
// @route   GET /api/bookings/my
// @access  Private
const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate('product', 'title images pricePerDay category')
    .populate('owner', 'name email')
    .sort('-createdAt');
  res.json(bookings);
});

// @desc    Get vendor's received bookings
// @route   GET /api/bookings/vendor
// @access  Private/Vendor
const getVendorBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ owner: req.user._id })
    .populate('product', 'title images')
    .populate('user', 'name email phone')
    .sort('-createdAt');
  res.json(bookings);
});

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private/Vendor
const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  if (booking.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized');
  }

  booking.status = status;
  await booking.save();
  res.json(booking);
});

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  if (booking.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  if (booking.status === 'active' || booking.status === 'completed') {
    res.status(400);
    throw new Error('Cannot cancel an active or completed booking');
  }

  booking.status = 'cancelled';
  await booking.save();

  // Remove booked dates from product
  const product = await Product.findById(booking.product);
  if (product) {
    product.bookedDates = product.bookedDates.filter(
      (d) => !(d.startDate.getTime() === new Date(booking.startDate).getTime())
    );
    await product.save();
  }

  res.json({ message: 'Booking cancelled successfully' });
});

module.exports = { createBooking, createPaymentOrder, confirmPayment, getMyBookings, getVendorBookings, updateBookingStatus, cancelBooking };
