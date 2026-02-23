const Event = require("../models/Event");

exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find().lean();
    res.status(200).json(events);
  } catch (err) {
    console.error("❌ Events error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ msg: "Event not found" });
    res.json(event);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

exports.createEvent = async (req, res) => {
  try {
    const newEvent = new Event(req.body);
    const event = await newEvent.save();
    res.json(event);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};
