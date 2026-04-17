const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sosRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SOSRequest',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: { type: String, required: true, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

// Fast lookup: all messages for a given SOS, in chronological order
messageSchema.index({ sosRequest: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
