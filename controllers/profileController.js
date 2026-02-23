const User = require("../models/User");

exports.getMe = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const user = await User.findById(req.user._id)
      .select("-password")
      .lean();
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("getMe error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const ALLOWED_FIELDS = [
  "firstName",
  "lastName",
  "phoneNumber",
  "city",
  "gender",
  "birthday",
  "photoUrl",
  "interests",
  "relationshipStatus",
  "workStatus",
  "goalsFromSahbi",
  "personality",
];

exports.updateMe = async (req, res) => {
  try {
    const updates = {};
    for (const key of ALLOWED_FIELDS) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("updateMe error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
