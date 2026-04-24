const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, getUnreadCount } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, sendMessage);
router.get('/unread', protect, getUnreadCount);
router.get('/:bookingId', protect, getMessages);

module.exports = router;
