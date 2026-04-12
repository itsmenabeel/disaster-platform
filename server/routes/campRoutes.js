const express = require('express');
const router = express.Router();
const {
  getCamps,
  createCamp,
  updateCamp,
  deleteCamp,
  assignVolunteer,
  unassignVolunteer,
} = require('../controllers/campController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, authorize('ngo', 'admin'), getCamps)
  .post(protect, authorize('ngo'), createCamp);
router.route('/:id')
  .put(protect, authorize('ngo'), updateCamp)
  .delete(protect, authorize('ngo'), deleteCamp);
router.put('/:id/assign', protect, authorize('ngo'), assignVolunteer);
router.put('/:id/unassign', protect, authorize('ngo'), unassignVolunteer);

module.exports = router;
