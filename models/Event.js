const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  category: String,
  location: String,
  date: { type: Date, required: true },
  price: Number,
  image: String,
  maxParticipants: Number,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Event", eventSchema);
