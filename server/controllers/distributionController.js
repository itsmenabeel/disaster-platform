const Distribution = require('../models/Distribution');
const Task = require('../models/Task');
const SOSRequest = require('../models/SOSRequest');
const User = require('../models/User');

// @desc    Log a distribution record
// @route   POST /api/distribution
// @access  Private (volunteer)
const createDistribution = async (req, res) => {
  try {
    const { taskId, victimId, items, quantity, campId, notes, date } = req.body;

    if (!taskId || !items || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'taskId, items, and quantity are required',
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

    const distributionDate = date ? new Date(date) : new Date();
    const record = await Distribution.create({
      ngo: null,
      volunteerId: req.user._id,
      victimId: resolvedVictimId,
      camp: campId || null,
      recipient: victim?.name || 'Victim',
      recipientUser: resolvedVictimId || null,
      items: [
        {
          itemName: String(items).trim(),
          quantity: parsedQuantity,
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

// @desc    Get all distribution records for admin monitoring
// @route   GET /api/distribution
// @access  Private (admin)
const getDistributions = async (req, res) => {
  try {
    const records = await Distribution.find({})
      .populate('camp', 'name')
      .populate('volunteerId', 'name')
      .populate('victimId', 'name')
      .populate('recipientUser', 'name')
      .sort({ distributedAt: -1 });
    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createDistribution, getDistributions };
