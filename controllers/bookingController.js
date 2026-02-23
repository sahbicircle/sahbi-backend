const Booking = require("../models/Booking");
const User = require("../models/User");
const chatService = require("../services/chatService");

exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id }).populate(
      "event",
    );
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

exports.createBooking = async (req, res) => {
  const { eventId } = req.body;
  try {
    const booking = new Booking({ user: req.user.id, event: eventId });
    await booking.save();

    // Create or update event group chat with all users who booked this event
    const bookings = await Booking.find({ event: eventId }).select("user");
    const userIds = [...new Set(bookings.map((b) => b.user.toString()))];
    await chatService.getOrCreateEventChat(eventId, userIds);

    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

exports.checkIn = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ msg: "Booking not found" });
    booking.checkedIn = true;
    await booking.save();
    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

exports.getEventBookingsUsers = async (req, res) => {
  try {
    const { eventId } = req.params;

    // 1. Get bookings
    const bookings = await Booking.find({ event: eventId }).select("user");

    // 2. Extract unique user IDs
    const userIds = [...new Set(bookings.map((b) => b.user.toString()))];

    // 3. Query users collection (exclude password)
    const users = await User.find({ _id: { $in: userIds } }).select(
      "_id firstName lastName photoUrl",
    );

    res.status(200).json({ users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!booking)
      return res.status(404).json({ message: "Booking not found" });
    booking.status = "cancelled";
    await booking.save();
    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id; // authMiddleware sets req.user

    // Find bookings for this user and populate event details
    const bookings = await Booking.find({ user: userId })
      .populate("event", "title date location price") // include event info
      .sort({ createdAt: -1 }); // most recent first

    res.status(200).json({ bookings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
