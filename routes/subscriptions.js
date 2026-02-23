const express = require("express");
const router = express.Router();
const {
  getSubscriptions,
  subscribe,
} = require("../controllers/subscriptionController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, getSubscriptions);
router.post("/subscribe", authMiddleware, subscribe);

module.exports = router;
