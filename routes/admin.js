const express = require("express");
const router = express.Router();
const adminMiddleware = require("../middleware/adminMiddleware");
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  setUserRole,
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getAllBookings,
  updateBooking,
  deleteBooking,
  getAllChats,
  getChatById,
  deleteChat,
  createGlobalNotification,
} = require("../controllers/adminController");

// Users
router.get("/users", adminMiddleware, getAllUsers);
router.get("/users/:id", adminMiddleware, getUserById);
router.put("/users/:id", adminMiddleware, updateUser);
router.delete("/users/:id", adminMiddleware, deleteUser);
router.patch("/users/:id/role", adminMiddleware, setUserRole);

// Events
router.get("/events", adminMiddleware, getAllEvents);
router.post("/events", adminMiddleware, createEvent);
router.put("/events/:id", adminMiddleware, updateEvent);
router.delete("/events/:id", adminMiddleware, deleteEvent);

// Bookings
router.get("/bookings", adminMiddleware, getAllBookings);
router.put("/bookings/:id", adminMiddleware, updateBooking);
router.delete("/bookings/:id", adminMiddleware, deleteBooking);

// Chats
router.get("/chats", adminMiddleware, getAllChats);
router.get("/chats/:id", adminMiddleware, getChatById);
router.delete("/chats/:id", adminMiddleware, deleteChat);

// Notifications (global)
router.post("/notifications", adminMiddleware, createGlobalNotification);

module.exports = router;
