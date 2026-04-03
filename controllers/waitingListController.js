const WaitingList = require("../models/WaitingList");

exports.createWaitingListEntry = async (req, res) => {
  try {
    const { phone, source } = req.body || {};

    if (!phone || !String(phone).trim()) {
      return res.status(400).json({ message: "Phone is required" });
    }

    const entry = await WaitingList.create({
      phone: String(phone).trim(),
      source: source != null && String(source).trim() ? String(source).trim() : "landing",
    });

    return res.status(201).json({
      message: "Waiting list entry created",
      entry,
    });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: "This phone number is already on the waiting list" });
    }
    if (err?.name === "ValidationError") {
      const msg = Object.values(err.errors || {})
        .map((e) => e.message)
        .join(" ");
      return res.status(400).json({ message: msg || "Validation failed" });
    }
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.listWaitingList = async (req, res) => {
  try {
    const items = await WaitingList.find().sort({ createdAt: -1 }).lean();
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getWaitingListById = async (req, res) => {
  try {
    const { id } = req.params;
    const entry = await WaitingList.findById(id).lean();
    if (!entry) {
      return res.status(404).json({ message: "Not found" });
    }
    res.json(entry);
  } catch (err) {
    if (err?.name === "CastError") {
      return res.status(400).json({ message: "Invalid id" });
    }
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateWaitingListEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { phone, source } = req.body || {};

    const update = {};
    if (phone !== undefined) {
      if (!String(phone).trim()) {
        return res.status(400).json({ message: "Phone cannot be empty" });
      }
      update.phone = String(phone).trim();
    }
    if (source !== undefined) {
      update.source = String(source).trim();
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    const entry = await WaitingList.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });
    if (!entry) {
      return res.status(404).json({ message: "Not found" });
    }
    res.json({ message: "Updated", entry });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: "This phone number is already on the waiting list" });
    }
    if (err?.name === "CastError") {
      return res.status(400).json({ message: "Invalid id" });
    }
    if (err?.name === "ValidationError") {
      const msg = Object.values(err.errors || {})
        .map((e) => e.message)
        .join(" ");
      return res.status(400).json({ message: msg || "Validation failed" });
    }
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteWaitingListEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await WaitingList.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Not found" });
    }
    res.json({ message: "Deleted", id: deleted._id });
  } catch (err) {
    if (err?.name === "CastError") {
      return res.status(400).json({ message: "Invalid id" });
    }
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
