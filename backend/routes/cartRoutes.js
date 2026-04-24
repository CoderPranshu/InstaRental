const express = require('express');
const router = express.Router();
const { addToCart, getCart, removeFromCart, clearCart } = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/').get(getCart).post(addToCart).delete(clearCart);
router.route('/:id').delete(removeFromCart);

module.exports = router;
