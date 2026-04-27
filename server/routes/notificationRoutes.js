const express = require('express');
const router = express.Router();
const { createNotification, getNotifications, markAsRead } = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getNotifications)
  .post(protect, authorize('admin'), createNotification);
router.put('/:id/read', protect, markAsRead);

module.exports = router;
