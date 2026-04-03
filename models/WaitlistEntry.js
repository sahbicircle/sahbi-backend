const mongoose = require("mongoose");

const waitlistEntrySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 255,
    },
    city: { type: String, trim: true, maxlength: 120, default: "" },
    source: { type: String, trim: true, default: "landing" },
  },
  { timestamps: true }
);

waitlistEntrySchema.index({ email: 1 }, { unique: true });
waitlistEntrySchema.index({ createdAt: -1 });

module.exports = mongoose.model("WaitlistEntry", waitlistEntrySchema);
