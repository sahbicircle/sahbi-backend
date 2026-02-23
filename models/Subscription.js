const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
  type: { type: String, enum: ["Essentiel", "Premium"], required: true },
  price: Number,
  trialDays: Number,
  features: [String],
  stripeId: String,
});

module.exports = mongoose.model("Subscription", subscriptionSchema);
