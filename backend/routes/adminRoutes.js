const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  updateUser,
  deleteUser,
  getAllBookings,
  getAllProducts,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect, authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.route('/users/:id').put(updateUser).delete(deleteUser);
router.get('/bookings', getAllBookings);
router.get('/products', getAllProducts);

module.exports = router;
