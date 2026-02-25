const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    sosRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'SOSRequest', required: true },
    volunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'on_the_way', 'completed'],
      default: 'pending',
    },
    acceptedAt: { type: Date },
    completedAt: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
