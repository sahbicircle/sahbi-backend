const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["event", "private"],
      required: true,
    },
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", default: null },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    messages: [
      {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        message: String,
        timestamp: { type: Date, default: Date.now },
        readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Chat", chatSchema);
