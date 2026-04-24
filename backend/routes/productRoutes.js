const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyProducts,
  getFeaturedProducts,
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

router.get('/featured', getFeaturedProducts);
router.get('/my', protect, getMyProducts);
router.route('/').get(getProducts).post(protect, authorize('vendor', 'admin'), upload.array('images', 5), createProduct);
router
  .route('/:id')
  .get(getProductById)
  .put(protect, authorize('vendor', 'admin'), upload.array('images', 5), updateProduct)
  .delete(protect, authorize('vendor', 'admin'), deleteProduct);

module.exports = router;
