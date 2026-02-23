const express = require("express");
const router = express.Router();
const {
  getChat,
  getChats,
  getMessages,
  sendMessage,
} = require("../controllers/chatController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, getChats);
router.get("/:id", authMiddleware, getChat);
router.get("/:id/messages", authMiddleware, getMessages);
router.post("/:id/messages", authMiddleware, sendMessage);

module.exports = router;
