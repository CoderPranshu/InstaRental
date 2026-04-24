const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc    Get wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist', 'title images pricePerDay category averageRating city');
  res.json(user.wishlist);
});

// @desc    Toggle wishlist item
// @route   POST /api/wishlist/:productId
// @access  Private
const toggleWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { productId } = req.params;

  const idx = user.wishlist.indexOf(productId);
  let added;
  if (idx === -1) {
    user.wishlist.push(productId);
    added = true;
  } else {
    user.wishlist.splice(idx, 1);
    added = false;
  }

  await user.save();
  res.json({ added, message: added ? 'Added to wishlist' : 'Removed from wishlist' });
});

module.exports = { getWishlist, toggleWishlist };
