const mongoose = require("mongoose");

const sosRequestSchema = new mongoose.Schema(
  {
    victim: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    needs: {
      type: [String],
      enum: ["food", "medicine", "shelter", "water", "clothing", "other"],
      required: true,
    },
    description: { type: String },
    media: [{ type: String }], // file paths / URLs
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }, // [longitude, latitude]
    },
    address: { type: String },
    priority: {
      type: String,
      enum: ["critical", "high", "medium", "low"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["pending", "assigned", "on_the_way", "rescued", "closed"],
      default: "pending",
    },
    assignedVolunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    resolvedAt: { type: Date },
    // Who closed this request — 'victim' means self-resolved, 'admin' means closed by staff
    resolvedBy: {
      type: String,
      enum: ["victim", "admin"],
      default: null,
    },
    // Free-text reason the victim provided when self-resolving
    resolveReason: { type: String, default: null },
  },
  { timestamps: true },
);

sosRequestSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("SOSRequest", sosRequestSchema);
