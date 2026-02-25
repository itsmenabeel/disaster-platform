const Inventory = require('../models/Inventory');

// @desc    Get all inventory for logged-in NGO
// @route   GET /api/inventory
// @access  Private (ngo)
const getInventory = async (req, res) => {
  try {
    const items = await Inventory.find({ ngo: req.user._id }).populate('camp', 'name');
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add inventory item
// @route   POST /api/inventory
// @access  Private (ngo)
const addItem = async (req, res) => {
  try {
    const item = await Inventory.create({ ...req.body, ngo: req.user._id });
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update inventory item
// @route   PUT /api/inventory/:id
// @access  Private (ngo)
const updateItem = async (req, res) => {
  try {
    const item = await Inventory.findOneAndUpdate(
      { _id: req.params.id, ngo: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
// @access  Private (ngo)
const deleteItem = async (req, res) => {
  try {
    const item = await Inventory.findOneAndDelete({ _id: req.params.id, ngo: req.user._id });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get low-stock alerts for logged-in NGO
// @route   GET /api/inventory/alerts
// @access  Private (ngo)
const getLowStockAlerts = async (req, res) => {
  try {
    const items = await Inventory.find({ ngo: req.user._id, isLow: true });
    res.json({ success: true, count: items.length, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getInventory, addItem, updateItem, deleteItem, getLowStockAlerts };
