const express = require('express');
const router = express.Router();
const { getIncidents, createIncident, updateIncident } = require('../controllers/incidentController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getIncidents)
  .post(protect, authorize('admin'), createIncident);
router.put('/:id', protect, authorize('admin'), updateIncident);

module.exports = router;
