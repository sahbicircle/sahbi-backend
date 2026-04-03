const mongoose = require("mongoose");

/** E.164-style: optional + then 8–15 digits (after stripping spaces). */
const phoneRegex = /^\+?[0-9]{8,15}$/;

const waitingListSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      trim: true,
      set: (v) => (v == null ? "" : String(v).replace(/\s/g, "")),
      validate: {
        validator: (v) => phoneRegex.test(v),
        message: "Invalid phone number",
      },
    },
    source: { type: String, trim: true, default: "landing" },
  },
  { timestamps: true, collection: "waitingList" }
);

waitingListSchema.index({ phone: 1 }, { unique: true });
waitingListSchema.index({ createdAt: -1 });

module.exports = mongoose.model("WaitingList", waitingListSchema);
