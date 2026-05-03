const Camp = require("../models/Camp");
const Inventory = require("../models/Inventory");
const User = require("../models/User");

const buildLocation = (coordinates = []) => ({
  type: "Point",
  coordinates: coordinates.map(Number),
});

const getNearbyCamps = async (req, res) => {
  try {
    const { lng, lat, radius = 10000 } = req.query;

    if (!lng || !lat) {
      return res.status(400).json({
        success: false,
        message: "Latitude and Longitude are required",
      });
    }

    const camps = await Camp.find({
      isActive: true, // ✅ only active camps
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: parseInt(radius),
        },
      },
    });

    res.json({ success: true, data: camps });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get camps for NGO/admin dashboards and management screens
// @route   GET /api/camps
// @access  Private (ngo, admin)
const getCamps = async (req, res) => {
  try {
    const canViewAll = req.user.role === "admin" || req.query.scope === "all";
    const filter = canViewAll ? {} : { ngo: req.user._id };
    const camps = await Camp.find(filter)
      .populate("ngo", "name")
      .populate("assignedVolunteers", "name phone")
      .sort({ isActive: -1, updatedAt: -1 });
    res.json({ success: true, data: camps });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get camps assigned to the logged-in volunteer with available inventory
// @route   GET /api/camps/my-assigned
// @access  Private (volunteer)
const getMyAssignedCamps = async (req, res) => {
  try {
    const camps = await Camp.find({
      assignedVolunteers: req.user._id,
      isActive: true,
    })
      .select("name address capacity currentOccupancy isActive assignedVolunteers")
      .sort({ updatedAt: -1 })
      .lean();

    const campIds = camps.map((camp) => camp._id);
    const inventoryItems = await Inventory.find({
      camp: { $in: campIds },
      quantity: { $gt: 0 },
    })
      .select("camp itemName category quantity unit lowStockThreshold isLow")
      .sort({ itemName: 1 })
      .lean();

    const inventoryByCamp = inventoryItems.reduce((acc, item) => {
      const campId = item.camp?.toString();
      if (!acc[campId]) acc[campId] = [];
      acc[campId].push(item);
      return acc;
    }, {});

    const data = camps.map((camp) => ({
      ...camp,
      inventory: inventoryByCamp[camp._id.toString()] || [],
    }));

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a relief camp
// @route   POST /api/camps
// @access  Private (ngo)
const createCamp = async (req, res) => {
  try {
    const { name, coordinates, address, capacity, currentOccupancy, isActive } =
      req.body;
    const camp = await Camp.create({
      ngo: req.user._id,
      name,
      location: buildLocation(coordinates),
      address,
      capacity,
      currentOccupancy,
      isActive,
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
    const updateData = { ...req.body };

    if (req.body.coordinates) {
      updateData.location = buildLocation(req.body.coordinates);
      delete updateData.coordinates;
    }

    const camp = await Camp.findOneAndUpdate(
      { _id: req.params.id, ngo: req.user._id },
      updateData,
      { new: true, runValidators: true },
    );
    if (!camp)
      return res
        .status(404)
        .json({ success: false, message: "Camp not found" });
    res.json({ success: true, data: camp });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a camp
// @route   DELETE /api/camps/:id
// @access  Private (ngo)
const deleteCamp = async (req, res) => {
  try {
    const camp = await Camp.findOneAndDelete({
      _id: req.params.id,
      ngo: req.user._id,
    });
    if (!camp)
      return res
        .status(404)
        .json({ success: false, message: "Camp not found" });

    await Inventory.updateMany(
      { ngo: req.user._id, camp: camp._id },
      { $set: { camp: null } },
    );

    res.json({ success: true, message: "Camp deleted successfully" });
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

    const volunteer = await User.findOne({ _id: volunteerId, role: "volunteer" });
    if (!volunteer) {
      return res
        .status(400)
        .json({ success: false, message: "Selected volunteer was not found" });
    }

    const camp = await Camp.findOneAndUpdate(
      { _id: req.params.id, ngo: req.user._id },
      { $addToSet: { assignedVolunteers: volunteerId } },
      { new: true },
    ).populate("assignedVolunteers", "name phone");

    if (!camp)
      return res
        .status(404)
        .json({ success: false, message: "Camp not found" });
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
      { new: true },
    ).populate("assignedVolunteers", "name phone");

    if (!camp)
      return res
        .status(404)
        .json({ success: false, message: "Camp not found" });
    res.json({ success: true, data: camp });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCamps,
  getMyAssignedCamps,
  createCamp,
  updateCamp,
  deleteCamp,
  assignVolunteer,
  unassignVolunteer,
  getNearbyCamps,
};
