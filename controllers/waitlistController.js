const WaitlistEntry = require("../models/WaitlistEntry");

exports.createWaitlistEntry = async (req, res) => {
  try {
    const { name, email, city } = req.body || {};

    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: "Name is required" });
    }
    if (!email || !String(email).trim()) {
      return res.status(400).json({ message: "Email is required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    const entry = await WaitlistEntry.create({
      name: String(name).trim(),
      email: normalizedEmail,
      city: city ? String(city).trim() : "",
      source: "landing",
    });

    return res.status(201).json({
      message: "Waitlist entry created",
      entry,
    });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: "Email is already on the waitlist" });
    }
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
