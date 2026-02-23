const User = require("../models/User");
const Event = require("../models/Event");
const Booking = require("../models/Booking");
const Chat = require("../models/Chat");

// --- Users ---
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 }).lean();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { password, ...updates } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.setUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// --- Events ---
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 }).lean();
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json({ message: "Event deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// --- Bookings ---
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "firstName lastName email")
      .populate("event", "title date location")
      .sort({ createdAt: -1 })
      .lean();
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateBooking = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const updates = {};
    if (status) updates.status = status;
    if (paymentStatus) updates.paymentStatus = paymentStatus;
    const booking = await Booking.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    })
      .populate("user", "firstName lastName email")
      .populate("event", "title date location");
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json({ message: "Booking deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// --- Chats ---
exports.getAllChats = async (req, res) => {
  try {
    const chats = await Chat.find()
      .populate("participants", "firstName lastName email")
      .populate("event", "title date")
      .sort({ updatedAt: -1 })
      .lean();
    res.json(chats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getChatById = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate("participants", "firstName lastName email photoUrl")
      .populate("event", "title date")
      .populate("messages.sender", "firstName lastName")
      .lean();
    if (!chat) return res.status(404).json({ message: "Chat not found" });
    res.json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteChat = async (req, res) => {
  try {
    const chat = await Chat.findByIdAndDelete(req.params.id);
    if (!chat) return res.status(404).json({ message: "Chat not found" });
    res.json({ message: "Chat deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
