const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    sosRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SOSRequest",
      required: true,
    },
    volunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "rejected",
        "on_the_way",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },
    acceptedAt: { type: Date },
    completedAt: { type: Date },
    notes: { type: String },
    isRated: {
      type: Boolean,
      default: false,
      validate: {
        validator: function (value) {
          // isRated can only be true if the task is completed
          if (value === true && this.status !== "completed") {
            return false;
          }
          return true;
        },
        message: "A task can only be rated if it is completed.",
      },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Task", taskSchema);
