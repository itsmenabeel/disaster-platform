const mongoose = require('mongoose');

const campSchema = new mongoose.Schema(
  {
    ngo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }, // [longitude, latitude]
    },
    address: { type: String },
    capacity: { type: Number, required: true },
    currentOccupancy: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    assignedVolunteers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

campSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Camp', campSchema);
