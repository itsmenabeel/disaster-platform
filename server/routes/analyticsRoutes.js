const express = require('express');
const router = express.Router();
const { getDashboardAnalytics, getReports } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin'), getDashboardAnalytics);
router.get('/reports', protect, authorize('admin'), getReports);

module.exports = router;
