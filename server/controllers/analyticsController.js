const SOSRequest = require('../models/SOSRequest');
const Task = require('../models/Task');
const User = require('../models/User');
const Distribution = require('../models/Distribution');

// @desc    Get all analytics data for admin dashboard
// @route   GET /api/analytics
// @access  Private (admin)
const getDashboardAnalytics = async (req, res) => {
  try {
    // 1. SOS requests by status
    const requestsByStatus = await SOSRequest.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // 2. Average response time (accepted - createdAt) in minutes
    const responseTimes = await Task.aggregate([
      { $match: { acceptedAt: { $exists: true } } },
      {
        $project: {
          responseMinutes: {
            $divide: [{ $subtract: ['$acceptedAt', '$createdAt'] }, 60000],
          },
        },
      },
      { $group: { _id: null, avgResponseTime: { $avg: '$responseMinutes' } } },
    ]);

    const requestsByPriority = await SOSRequest.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);

    // 3. Volunteer activity (tasks completed per volunteer, top 10)
    const volunteerActivity = await Task.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: '$volunteer', completedTasks: { $sum: 1 } } },
      { $sort: { completedTasks: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'volunteer',
        },
      },
      { $unwind: '$volunteer' },
      { $project: { name: '$volunteer.name', completedTasks: 1 } },
    ]);

    // 4. Distribution by item/resource name
    const distributionByItem = await Distribution.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: {
            $ifNull: ['$items.itemName', 'Unknown'],
          },
          totalDistributed: { $sum: '$items.quantity' },
        },
      },
      { $sort: { totalDistributed: -1 } },
    ]);

    // Summary counts
    const totalRequests = await SOSRequest.countDocuments();
    const rescuedCount = await SOSRequest.countDocuments({ status: 'rescued' });
    const pendingCount = await SOSRequest.countDocuments({ status: 'pending' });
    const volunteerCount = await User.countDocuments({ role: 'volunteer' });

    res.json({
      success: true,
      data: {
        summary: { totalRequests, rescuedCount, pendingCount, volunteerCount },
        requestsByStatus,
        requestsByPriority,
        avgResponseTime: responseTimes[0]?.avgResponseTime?.toFixed(1) || 0,
        volunteerActivity,
        distributionByItem,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Basic reports (counts and summaries)
// @route   GET /api/analytics/reports
// @access  Private (admin)
const getReports = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter =
      startDate && endDate
        ? { createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) } }
        : {};

    const requests = await SOSRequest.countDocuments(dateFilter);
    const rescued = await SOSRequest.countDocuments({ ...dateFilter, status: 'rescued' });
    const pending = await SOSRequest.countDocuments({ ...dateFilter, status: 'pending' });
    const users = await User.countDocuments({ role: { $ne: 'admin' } });

    res.json({
      success: true,
      data: {
        period: { startDate, endDate },
        totalSOSRequests: requests,
        rescued,
        pending,
        registeredUsers: users,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDashboardAnalytics, getReports };
