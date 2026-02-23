const express = require("express");
const router = express.Router();
const {
  getEvents,
  getEventById,
  createEvent,
} = require("../controllers/eventsController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", getEvents);
router.get("/:id", getEventById);
router.post("/", authMiddleware, createEvent);

module.exports = router;
