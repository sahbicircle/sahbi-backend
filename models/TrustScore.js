const mongoose = require("mongoose");

const trustScoreSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  scores: [
    {
      event: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
      punctuality: Number,
      politeness: Number,
      conviviality: Number,
    },
  ],
});

module.exports = mongoose.model("TrustScore", trustScoreSchema);
