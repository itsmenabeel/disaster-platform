const express = require('express');
const router = express.Router();
const { createDistribution, getDistributions } = require('../controllers/distributionController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, authorize('ngo', 'admin'), getDistributions)
  .post(protect, authorize('ngo'), createDistribution);

module.exports = router;
