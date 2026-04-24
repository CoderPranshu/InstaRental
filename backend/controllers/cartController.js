const asyncHandler = require('express-async-handler');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = asyncHandler(async (req, res) => {
  const { productId, startDate, endDate, totalDays, totalAmount } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Check date conflicts
  const start = new Date(startDate);
  const end = new Date(endDate);
  const conflict = product.bookedDates.some((range) => start < range.endDate && end > range.startDate);
  if (conflict) {
    res.status(400);
    throw new Error('Product is already booked for these dates');
  }

  // Check if item already in cart for this user with same product (optional: update dates if exists)
  let cartItem = await Cart.findOne({ user: req.user._id, product: productId });

  if (cartItem) {
    cartItem.startDate = startDate;
    cartItem.endDate = endDate;
    cartItem.totalDays = totalDays;
    cartItem.totalAmount = totalAmount;
    await cartItem.save();
  } else {
    cartItem = await Cart.create({
      user: req.user._id,
      product: productId,
      startDate,
      endDate,
      totalDays,
      totalAmount,
    });
  }

  res.status(201).json(cartItem);
});

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
  const cartItems = await Cart.find({ user: req.user._id }).populate('product', 'title images pricePerDay category owner city');
  res.json(cartItems);
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:id
// @access  Private
const removeFromCart = asyncHandler(async (req, res) => {
  const cartItem = await Cart.findById(req.params.id);

  if (!cartItem) {
    res.status(404);
    throw new Error('Cart item not found');
  }

  if (cartItem.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('User not authorized');
  }

  await Cart.findByIdAndDelete(req.params.id);
  res.json({ message: 'Item removed from cart' });
});

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = asyncHandler(async (req, res) => {
  await Cart.deleteMany({ user: req.user._id });
  res.json({ message: 'Cart cleared' });
});

module.exports = {
  addToCart,
  getCart,
  removeFromCart,
  clearCart,
};
