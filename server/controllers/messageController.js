const Message = require("../models/Message");
const SOSRequest = require("../models/SOSRequest");

// @desc    Get all messages for an SOS thread
// @route   GET /api/sos/:sosId/messages
// @access  Private (victim who owns it, or its assigned volunteer)
const getMessages = async (req, res) => {
  try {
    const sos = await SOSRequest.findById(req.params.sosId);
    if (!sos)
      return res
        .status(404)
        .json({ success: false, message: "SOS request not found" });

    const userId = req.user._id.toString();
    const isVictim = sos.victim.toString() === userId;
    const isAssignedVolunteer = sos.assignedVolunteer?.toString() === userId;

    if (!isVictim && !isAssignedVolunteer)
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });

    const messages = await Message.find({ sosRequest: req.params.sosId })
      .populate("sender", "name role")
      .sort({ createdAt: 1 }); // oldest first — natural chat order

    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send a message to an SOS thread
// @route   POST /api/sos/:sosId/messages
// @access  Private (victim who owns it, or its assigned volunteer)
const sendMessage = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content?.trim())
      return res
        .status(400)
        .json({ success: false, message: "Message content is required" });

    const sos = await SOSRequest.findById(req.params.sosId);
    if (!sos)
      return res
        .status(404)
        .json({ success: false, message: "SOS request not found" });

    const userId = req.user._id.toString();
    const isVictim = sos.victim.toString() === userId;
    const isAssignedVolunteer = sos.assignedVolunteer?.toString() === userId;

    if (!isVictim && !isAssignedVolunteer)
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });

    // Block messaging once the request has reached a terminal state
    if (sos.status === "rescued" || sos.status === "closed")
      return res.status(400).json({
        success: false,
        message:
          "This request is already resolved. No new messages can be sent.",
      });

    const message = await Message.create({
      sosRequest: req.params.sosId,
      sender: req.user._id,
      content: content.trim(),
    });

    await message.populate("sender", "name role");

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getMessages, sendMessage };
