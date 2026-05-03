const express = require('express');
const router = express.Router();
const { createDistribution, getDistributions } = require('../controllers/distributionController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, authorize('admin', 'ngo'), getDistributions)
  .post(protect, authorize('volunteer'), createDistribution);

module.exports = router;
