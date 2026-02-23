const Subscription = require("../models/Subscription");
const User = require("../models/User");

exports.getSubscriptions = async (req, res) => {
  const subs = await Subscription.find();
  res.json(subs);
};

exports.subscribe = async (req, res) => {
  const { subscriptionId } = req.body;
  const subscription = await Subscription.findById(subscriptionId);
  if (!subscription)
    return res.status(404).json({ msg: "Subscription not found" });
  const user = await User.findById(req.user.id);
  user.subscription = subscriptionId;
  await user.save();
  res.json(user);
};
