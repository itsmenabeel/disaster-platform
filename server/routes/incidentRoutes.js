const express = require('express');
const router = express.Router();

const {
  getIncidents,
  createIncident,
  updateIncident
} = require('../controllers/incidentController');

const Incident = require('../models/Incident');
const { protect, authorize } = require('../middleware/auth');


// ==============================
// PUBLIC: VIEW INCIDENT HISTORY
// ==============================
router.get('/', getIncidents);


// ==============================
// ADMIN: CREATE INCIDENT
// ==============================
router.post('/', protect, authorize('admin'), createIncident);


// ==============================
// ADMIN: UPDATE FULL INCIDENT
// ==============================
router.put('/:id', protect, authorize('admin'), updateIncident);


// ==============================
// ADMIN: UPDATE PRIORITY
// ==============================
router.put('/:id/priority', protect, authorize('admin'), async (req, res) => {
  try {
    const updated = await Incident.findByIdAndUpdate(
      req.params.id,
      { priority: req.body.priority },
      { new: true }
    );

    res.json({
      success: true,
      data: updated
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Priority update failed"
    });
  }
});


// ==============================
// ADMIN: DELETE INCIDENT (optional but recommended)
// ==============================
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Incident.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Incident deleted"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Delete failed"
    });
  }
});


module.exports = router;