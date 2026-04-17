const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    targetRoles: {
      type: [String],
      enum: ["victim", "volunteer", "ngo", "admin", "all"],
      default: ["all"],
    },
    // For direct, per-user notifications (e.g. notifying a specific volunteer
    // that their assigned SOS was resolved/updated by the victim).
    // When this is populated, targetRoles should be set to [] so the
    // notification is NOT broadcast to an entire role group.
    targetUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isEmergencyBroadcast: { type: Boolean, default: false },
    // Track which users have read this notification
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Notification", notificationSchema);
