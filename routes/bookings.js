const express = require("express");
const router = express.Router();
const {
  getBookings,
  createBooking,
  checkIn,
  cancelBooking,
  getEventBookingsUsers,
  getUserBookings,
} = require("../controllers/bookingController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, getBookings);
router.post("/", authMiddleware, createBooking);
router.post("/checkin/:id", authMiddleware, checkIn);
router.get("/event-users/:eventId", authMiddleware, getEventBookingsUsers);
router.get("/my-bookings", authMiddleware, getUserBookings);
router.post("/:id/cancel", authMiddleware, cancelBooking);

module.exports = router;
