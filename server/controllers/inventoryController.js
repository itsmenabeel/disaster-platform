const Inventory = require('../models/Inventory');
const Camp = require('../models/Camp');

const resolveCampForNgo = async (campId, ngoId) => {
  if (campId === undefined) return undefined;
  if (!campId) return null;

  const camp = await Camp.findOne({ _id: campId, ngo: ngoId });
  if (!camp) {
    const error = new Error('Selected camp was not found for this NGO');
    error.statusCode = 400;
    throw error;
  }

  return camp._id;
};

// @desc    Get all inventory for logged-in NGO
// @route   GET /api/inventory
// @access  Private (ngo)
const getInventory = async (req, res) => {
  try {
    const items = await Inventory.find({ ngo: req.user._id })
      .populate('camp', 'name address isActive')
      .sort({ isLow: -1, updatedAt: -1 });
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
    const { itemName, category, quantity, unit, lowStockThreshold, camp } = req.body;
    const linkedCamp = await resolveCampForNgo(camp, req.user._id);

    const item = await Inventory.create({
      ngo: req.user._id,
      itemName,
      category,
      quantity,
      unit,
      lowStockThreshold,
      camp: linkedCamp,
      isLow: Number(quantity) <= Number(lowStockThreshold ?? 10),
    });

    const populatedItem = await item.populate('camp', 'name address isActive');
    res.status(201).json({ success: true, data: populatedItem });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

// @desc    Update inventory item
// @route   PUT /api/inventory/:id
// @access  Private (ngo)
const updateItem = async (req, res) => {
  try {
    const existingItem = await Inventory.findOne({ _id: req.params.id, ngo: req.user._id });
    if (!existingItem) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    const nextQuantity =
      req.body.quantity !== undefined ? Number(req.body.quantity) : existingItem.quantity;
    const nextThreshold =
      req.body.lowStockThreshold !== undefined
        ? Number(req.body.lowStockThreshold)
        : existingItem.lowStockThreshold;

    const resolvedCamp = await resolveCampForNgo(req.body.camp, req.user._id);
    const updateData = {
      ...req.body,
      isLow: nextQuantity <= nextThreshold,
    };

    if (resolvedCamp !== undefined) {
      updateData.camp = resolvedCamp;
    }

    const item = await Inventory.findOneAndUpdate(
      { _id: req.params.id, ngo: req.user._id },
      updateData,
      { new: true, runValidators: true }
    ).populate('camp', 'name address isActive');

    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
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
    const items = await Inventory.find({ ngo: req.user._id, isLow: true })
      .populate('camp', 'name')
      .sort({ quantity: 1, updatedAt: -1 });
    res.json({ success: true, count: items.length, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getInventory, addItem, updateItem, deleteItem, getLowStockAlerts };
