const SOSRequest = require("../models/SOSRequest");
const Task = require("../models/Task");
const User = require("../models/User");
const Notification = require("../models/Notification");

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
			location: { type: "Point", coordinates },
			address,
		});

		// Smart task allocation: find nearest available volunteer using $near
		const nearestVolunteer = await User.findOne({
			role: "volunteer",
			isAvailable: true,
			location: {
				$near: {
					$geometry: { type: "Point", coordinates },
					$maxDistance: 50000, // 50km radius
				},
			},
		});

		if (nearestVolunteer) {
			await Task.create({
				sosRequest: sosRequest._id,
				volunteer: nearestVolunteer._id,
			});
			sosRequest.assignedVolunteer = nearestVolunteer._id;
			sosRequest.status = "assigned";
			await sosRequest.save();
		}

		res.status(201).json({ success: true, data: sosRequest });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

// @desc    Get SOS requests (victim sees own; admin/NGO see all)
// @route   GET /api/sos
// @access  Private
const getSOSRequests = async (req, res) => {
	try {
		const canViewAll = ["admin", "ngo"].includes(req.user.role);
		const filter = canViewAll ? {} : { victim: req.user._id };
		const requests = await SOSRequest.find(filter)
			.populate("victim", "name phone")
			.populate("assignedVolunteer", "name phone")
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
			.populate("victim", "name phone")
			.populate("assignedVolunteer", "name phone");

		if (!request)
			return res
				.status(404)
				.json({ success: false, message: "Request not found" });

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
		if (!request)
			return res
				.status(404)
				.json({ success: false, message: "Request not found" });
		if (request.victim.toString() !== req.user._id.toString()) {
			return res
				.status(403)
				.json({ success: false, message: "Not authorized" });
		}

		// Convert each in-memory buffer to a base64 data-URI so the value
		// can be stored directly in MongoDB and rendered by the browser
		// without any disk path or proxy configuration.
		const dataURIs = req.files.map(
			(f) => `data:${f.mimetype};base64,${f.buffer.toString("base64")}`,
		);
		request.media.push(...dataURIs);
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
			{ new: true },
		);
		if (!request)
			return res
				.status(404)
				.json({ success: false, message: "Request not found" });

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
		const { lng, lat, radius = 10000 } = req.query;

		// Find all SOS request IDs that this volunteer has rejected
		const rejectedTasks = await Task.find({
			volunteer: req.user._id,
			status: "rejected",
		}).select("sosRequest");

		const rejectedSOSIds = rejectedTasks.map((task) => task.sosRequest);

		const requests = await SOSRequest.find({
			status: "pending",
			_id: { $nin: rejectedSOSIds }, // Exclude rejected ones
			location: {
				$near: {
					$geometry: {
						type: "Point",
						coordinates: [parseFloat(lng), parseFloat(lat)],
					},
					$maxDistance: parseInt(radius),
				},
			},
		}).populate("victim", "name");

		res.json({ success: true, data: requests });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};
// @desc    Volunteer self-assigns / accepts an SOS request
// @route   PUT /api/sos/:id/accept
// @access  Private (volunteer)
const acceptSOS = async (req, res) => {
	try {
		const sosRequest = await SOSRequest.findById(req.params.id)
			.populate("victim", "name phone")
			.populate("assignedVolunteer", "name phone");

		if (!sosRequest)
			return res
				.status(404)
				.json({ success: false, message: "SOS request not found" });

		if (sosRequest.status !== "pending")
			return res.status(400).json({
				success: false,
				message: `Cannot accept — request is already "${sosRequest.status}"`,
			});

		// Self-assign volunteer
		sosRequest.assignedVolunteer = req.user._id;
		sosRequest.status = "assigned";
		await sosRequest.save();

		// Upsert task
		let task = await Task.findOne({
			sosRequest: sosRequest._id,
			volunteer: req.user._id,
		});
		if (!task) {
			task = await Task.create({
				sosRequest: sosRequest._id,
				volunteer: req.user._id,
				status: "accepted",
				acceptedAt: new Date(),
			});
		} else {
			task.status = "accepted";
			task.acceptedAt = new Date();
			await task.save();
		}

		res.json({ success: true, data: { sosRequest, task } });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

// @desc    Volunteer rejects / passes on an SOS request
// @route   PUT /api/sos/:id/reject
// @access  Private (volunteer)
const rejectSOS = async (req, res) => {
	try {
		const sosRequest = await SOSRequest.findById(req.params.id);
		if (!sosRequest)
			return res
				.status(404)
				.json({ success: false, message: "SOS request not found" });

		// Log the rejection in the Task collection so we can track it
		const existing = await Task.findOne({
			sosRequest: sosRequest._id,
			volunteer: req.user._id,
		});
		if (!existing) {
			await Task.create({
				sosRequest: sosRequest._id,
				volunteer: req.user._id,
				status: "rejected",
			});
		} else {
			existing.status = "rejected";
			await existing.save();
		}

		res.json({ success: true, message: "Request declined" });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

// @desc    Rate a volunteer after rescue is complete
// @route   PUT /api/sos/:id/rate
// @access  Private (victim)
const rateVolunteer = async (req, res) => {
	try {
		const { score } = req.body;
		const { id } = req.params;
		// Validate score
		if (!score || typeof score !== "number" || score < 1 || score > 5) {
			return res.status(400).json({
				success: false,
				message: "Score must be a number between 1 and 5.",
			});
		}

		const volunteer = await User.findById(id);

		if (!volunteer) {
			return res
				.status(404)
				.json({ success: false, message: "Volunteer not found." });
		}

		if (volunteer.role !== "volunteer") {
			return res
				.status(400)
				.json({ success: false, message: "You can only rate volunteers." });
		}

		// Prevent self-rating (shouldn't happen given role guard, but just in case)
		if (volunteer._id.toString() === req.user._id.toString()) {
			return res
				.status(400)
				.json({ success: false, message: "You cannot rate yourself." });
		}

		// Recalculate running average:
		// newAvg = (oldAvg * totalRatings + newScore) / (totalRatings + 1)
		const oldTotal = volunteer.totalRatings || 0;
		const oldScore = volunteer.reliabilityScore || 0;
		const newTotal = oldTotal + 1;
		const newScore = parseFloat(
			((oldScore * oldTotal + score) / newTotal).toFixed(2),
		);

		volunteer.reliabilityScore = newScore;
		volunteer.totalRatings = newTotal;

		await volunteer.save();

		res.status(200).json({
			success: true,
			message: "Rating submitted successfully.",
			data: {
				reliabilityScore: volunteer.reliabilityScore,
				totalRatings: volunteer.totalRatings,
			},
		});
	} catch (error) {
		console.log("inside eror");
		console.error("rateVolunteer error:", error);
		res.status(500).json({ success: false, message: "Server error." });
	}
};

// @desc    Update an existing SOS request (victim only, cannot edit resolved/rescued)
// @route   PUT /api/sos/:id
// @access  Private (victim)
const updateSOS = async (req, res) => {
	try {
		const { needs, description, address, coordinates, removeMediaIndices } =
			req.body;

		const sosRequest = await SOSRequest.findById(req.params.id);

		if (!sosRequest) {
			return res
				.status(404)
				.json({ success: false, message: "SOS request not found" });
		}

		// Only the victim who posted this SOS may edit it
		if (sosRequest.victim.toString() !== req.user._id.toString()) {
			return res.status(403).json({
				success: false,
				message: "Not authorized — you can only edit your own SOS requests",
			});
		}

		// Block edits on terminal statuses
		if (sosRequest.status === "rescued" || sosRequest.status === "closed") {
			return res.status(400).json({
				success: false,
				message:
					"Cannot edit an SOS request that is already resolved or closed",
			});
		}

		// --- Apply field updates ---
		if (Array.isArray(needs) && needs.length > 0) sosRequest.needs = needs;
		if (description !== undefined) sosRequest.description = description;
		if (address !== undefined) sosRequest.address = address;
		if (Array.isArray(coordinates) && coordinates.length === 2) {
			sosRequest.location = { type: "Point", coordinates };
		}

		// Remove specific existing media items by their original array index.
		// Sort descending so splicing earlier indices doesn't shift later ones.
		if (Array.isArray(removeMediaIndices) && removeMediaIndices.length > 0) {
			const sorted = [...removeMediaIndices].sort((a, b) => b - a);
			sorted.forEach((i) => {
				if (i >= 0 && i < sosRequest.media.length) {
					sosRequest.media.splice(i, 1);
				}
			});
		}

		await sosRequest.save();

		// If coordinates changed and the request is still pending, try to
		// auto-assign the nearest available volunteer at the new location.
		if (
			Array.isArray(coordinates) &&
			coordinates.length === 2 &&
			sosRequest.status === "pending"
		) {
			const nearestVolunteer = await User.findOne({
				role: "volunteer",
				isAvailable: true,
				location: {
					$near: {
						$geometry: { type: "Point", coordinates },
						$maxDistance: 50000,
					},
				},
			});

			if (nearestVolunteer) {
				await Task.create({
					sosRequest: sosRequest._id,
					volunteer: nearestVolunteer._id,
				});
				sosRequest.assignedVolunteer = nearestVolunteer._id;
				sosRequest.status = "assigned";
				await sosRequest.save();
			}
		}

		// If a volunteer is already assigned, notify them of the changes
		// so they can review the updated details before heading out.
		if (sosRequest.assignedVolunteer) {
			const shortId = sosRequest._id.toString().slice(-6).toUpperCase();
			await Notification.create({
				sender: req.user._id,
				title: "SOS Request Updated by Victim",
				message: `The victim has updated the details of SOS request #${shortId}. Please review the latest information in your active task before proceeding.`,
				targetRoles: [], // targeted — do NOT broadcast to the whole role group
				targetUsers: [sosRequest.assignedVolunteer],
			});
		}

		// Return the fully populated updated document
		const updated = await SOSRequest.findById(sosRequest._id)
			.populate("victim", "name phone")
			.populate("assignedVolunteer", "name phone");

		res.json({ success: true, data: updated });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

// @desc    Victim self-resolves (closes) their SOS request
// @route   DELETE /api/sos/:id
// @access  Private (victim)
const resolveSOS = async (req, res) => {
	try {
		const { resolveReason } = req.body;

		if (!resolveReason || !resolveReason.trim()) {
			return res.status(400).json({
				success: false,
				message: "A resolve reason is required",
			});
		}

		const sosRequest = await SOSRequest.findById(req.params.id);

		if (!sosRequest) {
			return res
				.status(404)
				.json({ success: false, message: "SOS request not found" });
		}

		// Only the victim who posted this SOS may resolve it
		if (sosRequest.victim.toString() !== req.user._id.toString()) {
			return res.status(403).json({
				success: false,
				message: "Not authorized — you can only resolve your own SOS requests",
			});
		}

		// Already in a terminal state — nothing to do
		if (sosRequest.status === "rescued" || sosRequest.status === "closed") {
			return res.status(400).json({
				success: false,
				message: "This SOS request is already closed",
			});
		}

		// Capture the assigned volunteer ID before closing, so we can notify them
		const assignedVolunteerId =
			sosRequest.assignedVolunteer ?
				sosRequest.assignedVolunteer.toString()
			:	null;

		// Close the request
		sosRequest.status = "closed";
		sosRequest.resolvedBy = "victim";
		sosRequest.resolveReason = resolveReason.trim();
		sosRequest.resolvedAt = new Date();
		await sosRequest.save();

		// If a volunteer was assigned, update their task record and notify them
		if (assignedVolunteerId) {
			const task = await Task.findOne({
				sosRequest: sosRequest._id,
				volunteer: assignedVolunteerId,
				status: { $nin: ["completed", "rejected"] },
			});

			if (task) {
				task.status = "cancelled";
				task.notes = `SOS resolved by victim before completion. Reason: "${resolveReason.trim()}"`;
				await task.save();
			}

			const shortId = sosRequest._id.toString().slice(-6).toUpperCase();
			await Notification.create({
				sender: req.user._id,
				title: "SOS Request Resolved by Victim",
				message: `The victim has resolved SOS request #${shortId} before it could be completed. Reason: "${resolveReason.trim()}". No further action is required on your part.`,
				targetRoles: [], // targeted — do NOT broadcast to the whole role group
				targetUsers: [assignedVolunteerId],
			});
		}

		res.json({
			success: true,
			message: "SOS request resolved successfully",
			data: sosRequest,
		});
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

module.exports = {
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
};
