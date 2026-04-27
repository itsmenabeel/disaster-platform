const Task = require("../models/Task");
const SOSRequest = require("../models/SOSRequest");
const User = require("../models/User");

// @desc    Get tasks for logged-in volunteer
// @route   GET /api/tasks
// @access  Private (volunteer)
const getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ volunteer: req.user._id })
      .populate({
        path: "sosRequest",
        populate: { path: "victim", select: "name phone" },
      })
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

    if (!task)
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    if (task.volunteer.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    if (action === "accept") {
      task.status = "accepted";
      task.acceptedAt = Date.now();
      await SOSRequest.findByIdAndUpdate(task.sosRequest, {
        status: "assigned",
      });
    } else if (action === "reject") {
      task.status = "rejected";
      // SOS goes back to pending so system can re-assign
      await SOSRequest.findByIdAndUpdate(task.sosRequest, {
        status: "pending",
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

    if (!task)
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    if (task.volunteer.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    if (status === "completed") {
      return res.status(400).json({
        success: false,
        message:
          "Use the distribution submission flow to complete a task and record delivered items.",
      });
    }

    task.status = status;
    if (status === "on_the_way") {
      await SOSRequest.findByIdAndUpdate(task.sosRequest, {
        status: "on_the_way",
      });
    }

    await task.save();
    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// task.controller.js
const getTaskRatingStatus = async (req, res) => {
  try {
    const { id: sosId } = req.params;
    const { volunteerId } = req.query;

    if (!volunteerId) {
      return res
        .status(400)
        .json({ success: false, message: "volunteerId is required." });
    }

    const task = await Task.findOne({
      sosRequest: sosId,
      volunteer: volunteerId,
    });

    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found." });
    }

    return res.status(200).json({
      success: true,
      isRated: task.isRated,
      status: task.status,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
// /**
//  * POST /api/tasks/:id/rate
//  * Params: id = sosId
//  * Body: { volunteerId, score }

const rateTask = async (req, res) => {
  try {
    const { id: sosId } = req.params;
    const { volunteerId, score } = req.body;

    // ── Validate inputs ──────────────────────────────────────────────────────
    if (!volunteerId || score === undefined) {
      return res.status(400).json({
        success: false,
        message: "volunteerId and score are required.",
      });
    }

    if (typeof score !== "number" || score < 1 || score > 5) {
      return res.status(400).json({
        success: false,
        message: "Score must be a number between 1 and 5.",
      });
    }

    // ── Find the task ────────────────────────────────────────────────────────
    const task = await Task.findOne({
      sosRequest: sosId,
      volunteer: volunteerId,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "No task found for the given sosId and volunteerId.",
      });
    }

    // ── task: must be completed ─────────────────────────────────────────────
    if (task.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Task cannot be rated because it is not completed yet.",
      });
    }

    // ── task & Volunteer: already rated ─────────────────────────────────────────────────
    if (task.isRated) {
      return res.status(400).json({
        success: false,
        message: "This task has already been rated.",
      });
    }

    // ── Find the volunteer ───────────────────────────────────────────────────
    const volunteer = await User.findById(volunteerId);

    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: "Volunteer not found.",
      });
    }

    if (volunteer.role !== "volunteer") {
      return res.status(400).json({
        success: false,
        message: "You can only rate volunteers.",
      });
    }

    // ── Recalculate running average ──────────────────────────────────────────
    // newAvg = (oldAvg * totalRatings + newScore) / (totalRatings + 1)
    const oldTotal = volunteer.totalRatings || 0;
    const oldAvg = volunteer.reliabilityScore || 0;
    const newTotal = oldTotal + 1;
    const newAvg = parseFloat(
      ((oldAvg * oldTotal + score) / newTotal).toFixed(2),
    );

    volunteer.reliabilityScore = newAvg;
    volunteer.totalRatings = newTotal;

    // ── Save both atomically ─────────────────────────────────────────────────
    task.isRated = true;
    await Promise.all([task.save(), volunteer.save()]);

    return res.status(200).json({
      success: true,
      message: "Task rated successfully.",
      data: {
        taskId: task._id,
        isRated: task.isRated,
        volunteer: {
          id: volunteer._id,
          reliabilityScore: volunteer.reliabilityScore,
          totalRatings: volunteer.totalRatings,
        },
      },
    });
  } catch (error) {
    console.error("rateTask error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

module.exports = {
  getMyTasks,
  respondToTask,
  updateTaskStatus,
  rateTask,
  getTaskRatingStatus,
};
