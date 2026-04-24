const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Product = require('../models/Product');
const Booking = require('../models/Booking');
const Review = require('../models/Review');

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalVendors, totalProducts, totalBookings, totalRevenue, recentBookings] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    User.countDocuments({ role: 'vendor' }),
    Product.countDocuments(),
    Booking.countDocuments(),
    Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    Booking.find().populate('user', 'name').populate('product', 'title').sort('-createdAt').limit(10),
  ]);

  res.json({
    totalUsers,
    totalVendors,
    totalProducts,
    totalBookings,
    totalRevenue: totalRevenue[0]?.total || 0,
    recentBookings,
  });
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').sort('-createdAt');
  res.json(users);
});

// @desc    Update user role or status
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  user.role = req.body.role || user.role;
  user.isActive = req.body.isActive !== undefined ? req.body.isActive : user.isActive;
  const updated = await user.save();
  res.json(updated);
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  await user.deleteOne();
  res.json({ message: 'User deleted' });
});

// @desc    Get all bookings (admin)
// @route   GET /api/admin/bookings
// @access  Private/Admin
const getAllBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find()
    .populate('user', 'name email')
    .populate('product', 'title')
    .populate('owner', 'name')
    .sort('-createdAt');
  res.json(bookings);
});

// @desc    Get all listings (admin)
// @route   GET /api/admin/products
// @access  Private/Admin
const getAllProducts = asyncHandler(async (req, res) => {
  const products = await Product.find().populate('owner', 'name email').sort('-createdAt');
  res.json(products);
});

module.exports = { getDashboardStats, getAllUsers, updateUser, deleteUser, getAllBookings, getAllProducts };
