const mongoose = require('mongoose');

const distributionSchema = new mongoose.Schema(
  {
    ngo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    volunteerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    victimId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    camp: { type: mongoose.Schema.Types.ObjectId, ref: 'Camp' },
    recipient: { type: String, required: true }, // name (victim may not be registered)
    recipientUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    items: [
      {
        inventoryItem: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory' },
        itemName: { type: String },
        quantity: { type: Number, required: true },
        unit: { type: String },
      },
    ],
    quantity: { type: Number, default: 0 },
    date: { type: Date, default: Date.now },
    distributedAt: { type: Date, default: Date.now },
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Distribution', distributionSchema);
