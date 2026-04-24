const express = require('express');
const router = express.Router();
const { getDashboardAnalytics, getReports } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin'), getDashboardAnalytics);
router.get('/reports', protect, authorize('admin'), getReports);

module.exports = router;

router.get('/admin-summary', async (req, res) => {
  try {
    const Incident = require('../models/Incident');

    const total = await Incident.countDocuments();
    const active = await Incident.countDocuments({ status: 'active' });
    const critical = await Incident.countDocuments({ priority: 'critical' });

    res.json({ total, active, critical });
  } catch (err) {
    res.status(500).json(err);
  }
});