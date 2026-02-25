const express = require('express');
const router = express.Router();
const { getCamps, createCamp, updateCamp, assignVolunteer, unassignVolunteer } = require('../controllers/campController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, authorize('ngo', 'admin'), getCamps)
  .post(protect, authorize('ngo'), createCamp);
router.put('/:id', protect, authorize('ngo'), updateCamp);
router.put('/:id/assign', protect, authorize('ngo'), assignVolunteer);
router.put('/:id/unassign', protect, authorize('ngo'), unassignVolunteer);

module.exports = router;
