const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    ngo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    camp: { type: mongoose.Schema.Types.ObjectId, ref: 'Camp', default: null },
    itemName: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['food', 'medicine', 'shelter', 'water', 'clothing', 'other'],
      required: true,
    },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, default: 'units' }, // e.g. kg, liters, pieces
    lowStockThreshold: { type: Number, default: 10 },
    isLow: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Auto-flag low stock before saving
inventorySchema.pre('save', function (next) {
  this.isLow = this.quantity <= this.lowStockThreshold;
  next();
});

module.exports = mongoose.model('Inventory', inventorySchema);
