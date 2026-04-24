const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const Order = require('../models/Order');
const Booking = require('../models/Booking');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

const getRazorpayClient = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    console.error('❌ Razorpay credentials missing in .env');
    throw new Error('Razorpay is not configured on the server');
  }

  return new Razorpay({ key_id, key_secret });
};

// @desc    Create order from cart (Checkout)
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const cartItems = await Cart.find({ user: req.user._id }).populate('product');

  if (!cartItems || cartItems.length === 0) {
    res.status(400);
    throw new Error('Cart is empty');
  }

  // 1. Create bookings for each cart item
  const bookings = [];
  let totalAmount = 0;

  for (const item of cartItems) {
    if (!item.product || !item.product.isAvailable) {
      res.status(400);
      throw new Error(`Product ${item.product?.title || 'Unknown'} is no longer available`);
    }

    const booking = await Booking.create({
      user: req.user._id,
      product: item.product._id,
      owner: item.product.owner,
      startDate: item.startDate,
      endDate: item.endDate,
      totalDays: item.totalDays,
      totalAmount: item.totalAmount,
      status: 'pending',
      paymentStatus: 'unpaid',
    });

    // Mark product dates as booked
    await Product.findByIdAndUpdate(item.product._id, {
      $push: { bookedDates: { startDate: item.startDate, endDate: item.endDate } },
    });

    bookings.push(booking._id);
    totalAmount += item.totalAmount;
  }

  // 2. Create Razorpay order
  const razorpay = getRazorpayClient();
  const amountInPaise = Math.round(totalAmount * 100);

  console.log(`💳 Creating Razorpay Order for ₹${totalAmount} (${amountInPaise} paise)`);

  if (isNaN(amountInPaise) || amountInPaise <= 0) {
    res.status(400);
    throw new Error(`Invalid total amount: ${totalAmount}`);
  }

  const options = {
    amount: amountInPaise,
    currency: 'INR',
    receipt: `order_rcpt_${Date.now()}`,
    notes: {
      userId: req.user._id.toString(),
      numItems: cartItems.length
    }
  };

  try {
    const razorpayOrder = await razorpay.orders.create(options);
    console.log('✅ Razorpay Order Created:', razorpayOrder.id);

    // 3. Create Order record
    const order = await Order.create({
      user: req.user._id,
      bookings,
      totalAmount,
      razorpayOrderId: razorpayOrder.id,
      paymentStatus: 'unpaid',
    });

    // 4. Clear Cart
    await Cart.deleteMany({ user: req.user._id });

    res.status(201).json({
      orderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('❌ Razorpay Order Creation Failed:', error);
    res.status(500);
    throw new Error(`Razorpay Error: ${error.description || error.message}`);
  }
});

// @desc    Verify payment signature
// @route   PUT /api/orders/verify
// @access  Private
const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    res.status(400);
    throw new Error('Payment details missing');
  }

  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Verify signature
  const secret = process.env.RAZORPAY_KEY_SECRET;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
  const expectedSignature = hmac.digest('hex');

  if (expectedSignature !== razorpay_signature) {
    console.error('❌ Signature Mismatch!', { expectedSignature, razorpay_signature });
    order.paymentStatus = 'failed';
    await order.save();
    res.status(400);
    throw new Error('Invalid payment signature');
  }

  console.log('✅ Payment Verified Successfully for Order:', orderId);

  // Update Order
  order.paymentStatus = 'paid';
  order.razorpayPaymentId = razorpay_payment_id;
  order.razorpaySignature = razorpay_signature;
  await order.save();

  // Update all related Bookings
  await Booking.updateMany(
    { _id: { $in: order.bookings } },
    {
      $set: {
        paymentStatus: 'paid',
        paymentId: razorpay_payment_id,
        status: 'confirmed',
      },
    }
  );

  // Increment totalRentals for each product
  const bookings = await Booking.find({ _id: { $in: order.bookings } });
  for (const b of bookings) {
    await Product.findByIdAndUpdate(b.product, { $inc: { totalRentals: 1 } });
  }

  res.json({ message: 'Payment verified and order updated successfully', order });
});

// @desc    Get user orders
// @route   GET /api/orders/my
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate({
      path: 'bookings',
      populate: { path: 'product', select: 'title images' },
    })
    .sort('-createdAt');
  res.json(orders);
});

module.exports = {
  createOrder,
  verifyPayment,
  getMyOrders,
};

