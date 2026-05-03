const Distribution = require('../models/Distribution');
const Task = require('../models/Task');
const SOSRequest = require('../models/SOSRequest');
const User = require('../models/User');
const Camp = require('../models/Camp');
const Inventory = require('../models/Inventory');

// @desc    Log a distribution record
// @route   POST /api/distribution
// @access  Private (volunteer)
const createDistribution = async (req, res) => {
  try {
    const { taskId, victimId, inventoryItemId, quantity, campId, notes, date } = req.body;

    if (!taskId || !campId || !inventoryItemId || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'taskId, campId, inventoryItemId, and quantity are required when delivering items',
      });
    }

    const task = await Task.findById(taskId).populate({
      path: 'sosRequest',
      populate: { path: 'victim', select: 'name' },
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (task.volunteer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (task.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'This task is already completed',
      });
    }

    if (!['accepted', 'on_the_way'].includes(task.status)) {
      return res.status(400).json({
        success: false,
        message: 'Only active volunteer tasks can submit distribution records',
      });
    }

    const camp = await Camp.findOne({
      _id: campId,
      assignedVolunteers: req.user._id,
      isActive: true,
    });
    if (!camp) {
      return res.status(403).json({
        success: false,
        message: 'Volunteer must be assigned to the selected active camp before distributing items',
      });
    }

    const sosRequest = task.sosRequest;
    if (!sosRequest) {
      return res.status(400).json({ success: false, message: 'Linked SOS request not found' });
    }

    const resolvedVictimId =
      victimId || (typeof sosRequest.victim === 'object' ? sosRequest.victim._id : sosRequest.victim);
    const victim = await User.findById(resolvedVictimId).select('name');

    const parsedQuantity = Number(quantity);
    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be greater than zero',
      });
    }

    const inventoryItem = await Inventory.findOne({
      _id: inventoryItemId,
      camp: camp._id,
    });
    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        message: 'Selected item was not found in this camp inventory',
      });
    }

    if (inventoryItem.quantity < parsedQuantity) {
      return res.status(400).json({
        success: false,
        message: `Not enough ${inventoryItem.itemName} in ${camp.name}. Available: ${inventoryItem.quantity} ${inventoryItem.unit || 'units'}`,
      });
    }

    const distributionDate = date ? new Date(date) : new Date();
    inventoryItem.quantity -= parsedQuantity;
    inventoryItem.isLow = inventoryItem.quantity <= inventoryItem.lowStockThreshold;
    await inventoryItem.save();

    const record = await Distribution.create({
      ngo: camp.ngo,
      volunteerId: req.user._id,
      victimId: resolvedVictimId,
      camp: camp._id,
      recipient: victim?.name || 'Victim',
      recipientUser: resolvedVictimId || null,
      items: [
        {
          inventoryItem: inventoryItem._id,
          itemName: inventoryItem.itemName,
          quantity: parsedQuantity,
          unit: inventoryItem.unit,
        },
      ],
      quantity: parsedQuantity,
      date: distributionDate,
      distributedAt: distributionDate,
      notes,
    });

    task.status = 'completed';
    task.completedAt = distributionDate;
    await task.save();

    await SOSRequest.findByIdAndUpdate(sosRequest._id, {
      status: 'rescued',
      resolvedAt: distributionDate,
    });

    res.status(201).json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all distribution records for admin/NGO monitoring
// @route   GET /api/distribution
// @access  Private (admin, ngo)
const getDistributions = async (req, res) => {
  try {
    const records = await Distribution.find({})
      .populate('camp', 'name address')
      .populate('volunteerId', 'name phone')
      .populate('victimId', 'name phone')
      .populate('recipientUser', 'name phone')
      .sort({ distributedAt: -1 });
    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createDistribution, getDistributions };
