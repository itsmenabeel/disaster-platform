const SOSRequest = require('../models/SOSRequest');
const Task = require('../models/Task');
const User = require('../models/User');

// @desc    Create SOS request (auto-assigns nearest available volunteer)
// @route   POST /api/sos
// @access  Private (victim)
const createSOS = async (req, res) => {
  try {
    const { needs, description, coordinates, address } = req.body;
    // coordinates should be [longitude, latitude]

    const sosRequest = await SOSRequest.create({
      victim: req.user._id,
      needs,
      description,
      location: { type: 'Point', coordinates },
      address,
    });

    // Smart task allocation: find nearest available volunteer using $near
    const nearestVolunteer = await User.findOne({
      role: 'volunteer',
      isAvailable: true,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates },
          $maxDistance: 50000, // 50km radius
        },
      },
    });

    if (nearestVolunteer) {
      await Task.create({ sosRequest: sosRequest._id, volunteer: nearestVolunteer._id });
      sosRequest.assignedVolunteer = nearestVolunteer._id;
      sosRequest.status = 'assigned';
      await sosRequest.save();
    }

    res.status(201).json({ success: true, data: sosRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get SOS requests (victim sees own; admin sees all)
// @route   GET /api/sos
// @access  Private
const getSOSRequests = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { victim: req.user._id };
    const requests = await SOSRequest.find(filter)
      .populate('victim', 'name phone')
      .populate('assignedVolunteer', 'name phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single SOS request
// @route   GET /api/sos/:id
// @access  Private
const getSOSById = async (req, res) => {
  try {
    const request = await SOSRequest.findById(req.params.id)
      .populate('victim', 'name phone')
      .populate('assignedVolunteer', 'name phone');

    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload media to an SOS request
// @route   PUT /api/sos/:id/media
// @access  Private (victim)
const uploadMedia = async (req, res) => {
  try {
    const request = await SOSRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    if (request.victim.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const filePaths = req.files.map((f) => f.path);
    request.media.push(...filePaths);
    await request.save();

    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Set priority of SOS request (admin only)
// @route   PUT /api/sos/:id/priority
// @access  Private (admin)
const setPriority = async (req, res) => {
  try {
    const request = await SOSRequest.findByIdAndUpdate(
      req.params.id,
      { priority: req.body.priority },
      { new: true }
    );
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all SOS requests within a radius (for volunteer map view)
// @route   GET /api/sos/nearby?lng=&lat=&radius=
// @access  Private (volunteer)
const getNearbyRequests = async (req, res) => {
  try {
    const { lng, lat, radius = 20000 } = req.query; // radius in meters

    const requests = await SOSRequest.find({
      status: 'pending',
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(radius),
        },
      },
    }).populate('victim', 'name');

    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createSOS, getSOSRequests, getSOSById, uploadMedia, setPriority, getNearbyRequests };
