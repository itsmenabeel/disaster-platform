const express = require("express");
const router = express.Router();
const {
  createSOS,
  getSOSRequests,
  getSOSById,
  uploadMedia,
  setPriority,
  getNearbyRequests,
  acceptSOS,
  rejectSOS,
  rateVolunteer,
  updateSOS,
  resolveSOS,
} = require("../controllers/sosController");
const { protect, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.get(
  "/nearby",
  protect,
  authorize("volunteer", "admin"),
  getNearbyRequests,
);

router
  .route("/")
  .get(protect, getSOSRequests)
  .post(protect, authorize("victim"), createSOS);

router.put("/:id/accept", protect, authorize("volunteer"), acceptSOS);
router.put("/:id/reject", protect, authorize("volunteer"), rejectSOS);

router.put(
  "/:id/media",
  protect,
  authorize("victim"),
  upload.array("media", 5),
  uploadMedia,
);
router.put("/:id/rate", protect, authorize("victim"), rateVolunteer);
router.put("/:id/priority", protect, authorize("admin"), setPriority);

// Victim-only: edit SOS fields
router.put("/:id", protect, authorize("victim"), updateSOS);

// Victim-only: self-resolve (close) their SOS request
router.delete("/:id", protect, authorize("victim"), resolveSOS);

router.route("/:id").get(protect, getSOSById);

module.exports = router;
