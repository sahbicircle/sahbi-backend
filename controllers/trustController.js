const TrustScore = require("../models/TrustScore");

exports.getUserTrust = async (req, res) => {
  const trust = await TrustScore.findOne({ user: req.user.id });
  res.json(trust);
};

exports.addTrustScore = async (req, res) => {
  const { eventId, punctuality, politeness, conviviality } = req.body;
  let trust = await TrustScore.findOne({ user: req.user.id });
  if (!trust) {
    trust = new TrustScore({ user: req.user.id, scores: [] });
  }
  trust.scores.push({ event: eventId, punctuality, politeness, conviviality });
  await trust.save();
  res.json(trust);
};
