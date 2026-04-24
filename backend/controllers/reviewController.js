const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');
const Product = require('../models/Product');

// @desc    Add a review
// @route   POST /api/reviews
// @access  Private
const addReview = asyncHandler(async (req, res) => {
  const { productId, rating, comment, bookingId } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const existingReview = await Review.findOne({ user: req.user._id, product: productId });
  if (existingReview) {
    res.status(400);
    throw new Error('You have already reviewed this product');
  }

  const review = await Review.create({
    user: req.user._id,
    product: productId,
    booking: bookingId,
    rating: Number(rating),
    comment,
  });

  // Recalculate average rating
  const allReviews = await Review.find({ product: productId });
  const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

  product.averageRating = Math.round(avgRating * 10) / 10;
  product.numReviews = allReviews.length;
  await product.save();

  const populated = await review.populate('user', 'name avatar');
  res.status(201).json(populated);
});

// @desc    Get reviews for a product
// @route   GET /api/reviews/:productId
// @access  Public
const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId })
    .populate('user', 'name avatar')
    .sort('-createdAt');
  res.json(reviews);
});

// @desc    Delete a review (owner or admin)
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this review');
  }

  await review.deleteOne();

  // Recalculate average rating
  const allReviews = await Review.find({ product: review.product });
  const product = await Product.findById(review.product);
  if (product) {
    product.numReviews = allReviews.length;
    product.averageRating = allReviews.length
      ? Math.round((allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length) * 10) / 10
      : 0;
    await product.save();
  }

  res.json({ message: 'Review deleted' });
});

module.exports = { addReview, getProductReviews, deleteReview };
