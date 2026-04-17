const Notification = require("../models/Notification");
const User = require("../models/User");
const transporter = require("../config/mailer");

// @desc    Create a notification (admin broadcast)
// @route   POST /api/notifications
// @access  Private (admin)
const createNotification = async (req, res) => {
  try {
    const { title, message, targetRoles, isEmergencyBroadcast } = req.body;

    const notification = await Notification.create({
      sender: req.user._id,
      title,
      message,
      targetRoles,
      isEmergencyBroadcast,
    });

    // Send emails if emergency broadcast
    if (isEmergencyBroadcast) {
      const roleFilter = targetRoles.includes("all")
        ? {}
        : { role: { $in: targetRoles } };
      const users = await User.find(roleFilter).select("email name");

      const emailList = users.map((u) => u.email);
      if (emailList.length > 0) {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: emailList,
          subject: `🚨 EMERGENCY ALERT: ${title}`,
          html: `<h2>${title}</h2><p>${message}</p>`,
        });
      }
    }

    res.status(201).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get notifications for logged-in user (based on role OR direct targetUsers match)
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [
        // Role-based broadcast notifications
        { targetRoles: "all" },
        { targetRoles: req.user.role },
        // Direct per-user notifications (e.g. volunteer notified of SOS update/resolve)
        { targetUsers: req.user._id },
      ],
    }).sort({ createdAt: -1 });

    res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, {
      $addToSet: { readBy: req.user._id },
    });
    res.json({ success: true, message: "Marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createNotification, getNotifications, markAsRead };
