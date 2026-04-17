const express = require("express");
const router = express.Router();
const {
  getMyTasks,
  respondToTask,
  updateTaskStatus,
  getTaskRatingStatus,
  rateTask,
} = require("../controllers/taskController");
const { protect, authorize } = require("../middleware/auth");

router.get("/", protect, authorize("volunteer"), getMyTasks);
router.put("/:id/respond", protect, authorize("volunteer"), respondToTask);
router.put("/:id/status", protect, authorize("volunteer"), updateTaskStatus);
// GET /api/tasks/:sosId/rating-status?volunteerId=xxx
router.get("/:id/rating-status", getTaskRatingStatus);
// POST /api/tasks/:id/rate  (id = sosId)
router.post("/:id/rate", rateTask);

module.exports = router;
