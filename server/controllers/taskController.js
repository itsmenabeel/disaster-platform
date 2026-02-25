const Task = require('../models/Task');
const SOSRequest = require('../models/SOSRequest');

// @desc    Get tasks for logged-in volunteer
// @route   GET /api/tasks
// @access  Private (volunteer)
const getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ volunteer: req.user._id })
      .populate({ path: 'sosRequest', populate: { path: 'victim', select: 'name phone' } })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Accept or reject a task
// @route   PUT /api/tasks/:id/respond
// @access  Private (volunteer)
const respondToTask = async (req, res) => {
  try {
    const { action } = req.body; // 'accept' or 'reject'
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    if (task.volunteer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (action === 'accept') {
      task.status = 'accepted';
      task.acceptedAt = Date.now();
      await SOSRequest.findByIdAndUpdate(task.sosRequest, { status: 'assigned' });
    } else if (action === 'reject') {
      task.status = 'rejected';
      // SOS goes back to pending so system can re-assign
      await SOSRequest.findByIdAndUpdate(task.sosRequest, {
        status: 'pending',
        assignedVolunteer: null,
      });
    }

    await task.save();
    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update task status (on_the_way → completed)
// @route   PUT /api/tasks/:id/status
// @access  Private (volunteer)
const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    if (task.volunteer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    task.status = status;
    if (status === 'completed') {
      task.completedAt = Date.now();
      await SOSRequest.findByIdAndUpdate(task.sosRequest, {
        status: 'rescued',
        resolvedAt: Date.now(),
      });
    } else if (status === 'on_the_way') {
      await SOSRequest.findByIdAndUpdate(task.sosRequest, { status: 'on_the_way' });
    }

    await task.save();
    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Rate a volunteer after task completion
// @route   PUT /api/tasks/:id/rate
// @access  Private (victim)
const rateVolunteer = async (req, res) => {
  try {
    const { rating } = req.body; // 1-5
    const task = await Task.findById(req.params.id).populate('sosRequest');

    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    if (task.sosRequest.victim.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const User = require('../models/User');
    const volunteer = await User.findById(task.volunteer);
    // Rolling average
    const newTotal = volunteer.totalRatings + 1;
    volunteer.reliabilityScore =
      (volunteer.reliabilityScore * volunteer.totalRatings + rating) / newTotal;
    volunteer.totalRatings = newTotal;
    await volunteer.save();

    res.json({ success: true, message: 'Rating submitted', score: volunteer.reliabilityScore });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getMyTasks, respondToTask, updateTaskStatus, rateVolunteer };
