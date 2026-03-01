const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  event: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled"],
    default: "pending",
  },
  checkedIn: { type: Boolean, default: false },
  paymentStatus: { type: String, enum: ["unpaid", "paid"], default: "unpaid" },
  languages: {
    type: [String],
    enum: [
      "Arabic",
      "English",
      "Spanish",
      "French",
      "German",
      "Chinese",
      "Japanese",
      "Other",
    ],
    default: [],
  },
  budget: {
    type: String,
    enum: ["under 200", "200-400", "above 400+"],
    default: "under 200",
  },
  dinnerOptions: {
    type: [String],
    enum: ["Vegetarian", "Vegan", "Seafood", "Meat", "Gluten-Free", "Other"],
    default: [],
  },
  notification24hSent: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Booking", bookingSchema);
