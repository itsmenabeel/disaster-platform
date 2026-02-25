const Camp = require('../models/Camp');

// @desc    Get all camps for NGO
// @route   GET /api/camps
// @access  Private (ngo, admin)
const getCamps = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { ngo: req.user._id };
    const camps = await Camp.find(filter).populate('assignedVolunteers', 'name phone');
    res.json({ success: true, data: camps });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a relief camp
// @route   POST /api/camps
// @access  Private (ngo)
const createCamp = async (req, res) => {
  try {
    const { name, coordinates, address, capacity } = req.body;
    const camp = await Camp.create({
      ngo: req.user._id,
      name,
      location: { type: 'Point', coordinates },
      address,
      capacity,
    });
    res.status(201).json({ success: true, data: camp });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a camp
// @route   PUT /api/camps/:id
// @access  Private (ngo)
const updateCamp = async (req, res) => {
  try {
    const camp = await Camp.findOneAndUpdate(
      { _id: req.params.id, ngo: req.user._id },
      req.body,
      { new: true }
    );
    if (!camp) return res.status(404).json({ success: false, message: 'Camp not found' });
    res.json({ success: true, data: camp });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Assign a volunteer to a camp
// @route   PUT /api/camps/:id/assign
// @access  Private (ngo)
const assignVolunteer = async (req, res) => {
  try {
    const { volunteerId } = req.body;
    const camp = await Camp.findOneAndUpdate(
      { _id: req.params.id, ngo: req.user._id },
      { $addToSet: { assignedVolunteers: volunteerId } },
      { new: true }
    ).populate('assignedVolunteers', 'name phone');

    if (!camp) return res.status(404).json({ success: false, message: 'Camp not found' });
    res.json({ success: true, data: camp });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove a volunteer from a camp
// @route   PUT /api/camps/:id/unassign
// @access  Private (ngo)
const unassignVolunteer = async (req, res) => {
  try {
    const { volunteerId } = req.body;
    const camp = await Camp.findOneAndUpdate(
      { _id: req.params.id, ngo: req.user._id },
      { $pull: { assignedVolunteers: volunteerId } },
      { new: true }
    ).populate('assignedVolunteers', 'name phone');

    if (!camp) return res.status(404).json({ success: false, message: 'Camp not found' });
    res.json({ success: true, data: camp });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getCamps, createCamp, updateCamp, assignVolunteer, unassignVolunteer };
