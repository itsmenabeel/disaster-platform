const Incident = require('../models/Incident');

// @desc    Get all incidents
// @route   GET /api/incidents
// @access  Private
const getIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find()
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: incidents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create an incident record
// @route   POST /api/incidents
// @access  Private (admin)
const createIncident = async (req, res) => {
  try {
    const { title, disasterType, coordinates, address, description, startDate } = req.body;

    const incident = await Incident.create({
      createdBy: req.user._id,
      title,
      disasterType,
      location: { type: 'Point', coordinates },
      address,
      description,
      startDate,
    });

    res.status(201).json({ success: true, data: incident });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update incident (close it, add rescue count, etc.)
// @route   PUT /api/incidents/:id
// @access  Private (admin)
const updateIncident = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (Array.isArray(req.body.coordinates) && req.body.coordinates.length === 2) {
      updateData.location = { type: 'Point', coordinates: req.body.coordinates };
      delete updateData.coordinates;
    }

    const incident = await Incident.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!incident) return res.status(404).json({ success: false, message: 'Incident not found' });
    res.json({ success: true, data: incident });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete incident
// @route   DELETE /api/incidents/:id
// @access  Private (admin)
const deleteIncident = async (req, res) => {
  try {
    const incident = await Incident.findByIdAndDelete(req.params.id);
    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found' });
    }

    res.json({ success: true, message: 'Incident deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getIncidents, createIncident, updateIncident, deleteIncident };
