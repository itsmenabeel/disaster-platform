const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    targetRoles: {
      type: [String],
      enum: ['victim', 'volunteer', 'ngo', 'admin', 'all'],
      default: ['all'],
    },
    isEmergencyBroadcast: { type: Boolean, default: false },
    // Track which users have read this notification
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
