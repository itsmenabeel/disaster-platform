const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema(
  {
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    disasterType: {
      type: String,
      enum: ['flood', 'earthquake', 'fire', 'cyclone', 'landslide', 'other'],
      required: true,
    },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
    },
    address: { type: String },
    description: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    status: { type: String, enum: ['active', 'resolved'], default: 'active' },
    // Linked SOS requests for reference
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low',
    },
    sosRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SOSRequest' }],
    totalRescued: { type: Number, default: 0 },
  },
  { timestamps: true }
);

incidentSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Incident', incidentSchema);
