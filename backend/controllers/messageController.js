const asyncHandler = require('express-async-handler');
const Message = require('../models/Message');
const Booking = require('../models/Booking');

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
  const { bookingId, text } = req.body;

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  // Only renter or owner can message
  const isRenter = booking.user.toString() === req.user._id.toString();
  const isOwner = booking.owner.toString() === req.user._id.toString();
  if (!isRenter && !isOwner && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to send messages in this booking');
  }

  const receiver = isRenter ? booking.owner : booking.user;

  const message = await Message.create({
    booking: bookingId,
    sender: req.user._id,
    receiver,
    text,
  });

  const populated = await message.populate('sender', 'name avatar');
  res.status(201).json(populated);
});

// @desc    Get messages for a booking
// @route   GET /api/messages/:bookingId
// @access  Private
const getMessages = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  const isRenter = booking.user.toString() === req.user._id.toString();
  const isOwner = booking.owner.toString() === req.user._id.toString();
  if (!isRenter && !isOwner && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized');
  }

  const messages = await Message.find({ booking: bookingId })
    .populate('sender', 'name avatar')
    .sort('createdAt');

  // Mark unread messages as read
  await Message.updateMany(
    { booking: bookingId, receiver: req.user._id, read: false },
    { read: true }
  );

  res.json(messages);
});

// @desc    Get unread message count
// @route   GET /api/messages/unread
// @access  Private
const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Message.countDocuments({ receiver: req.user._id, read: false });
  res.json({ count });
});

module.exports = { sendMessage, getMessages, getUnreadCount };
