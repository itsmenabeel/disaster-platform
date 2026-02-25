const express = require('express');
const router = express.Router();
const { getMyTasks, respondToTask, updateTaskStatus, rateVolunteer } = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('volunteer'), getMyTasks);
router.put('/:id/respond', protect, authorize('volunteer'), respondToTask);
router.put('/:id/status', protect, authorize('volunteer'), updateTaskStatus);
router.put('/:id/rate', protect, authorize('victim'), rateVolunteer);

module.exports = router;
