const Distribution = require('../models/Distribution');
const Inventory = require('../models/Inventory');

// @desc    Log a distribution record
// @route   POST /api/distribution
// @access  Private (ngo)
const createDistribution = async (req, res) => {
  try {
    const { camp, recipient, recipientUser, items, notes } = req.body;

    // Deduct from inventory
    for (const item of items) {
      await Inventory.findByIdAndUpdate(item.inventoryItem, {
        $inc: { quantity: -item.quantity },
      });
    }

    const record = await Distribution.create({
      ngo: req.user._id,
      camp,
      recipient,
      recipientUser,
      items,
      notes,
    });

    res.status(201).json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all distribution records for NGO
// @route   GET /api/distribution
// @access  Private (ngo, admin)
const getDistributions = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { ngo: req.user._id };
    const records = await Distribution.find(filter)
      .populate('camp', 'name')
      .sort({ distributedAt: -1 });
    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createDistribution, getDistributions };
