const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const chatService = require("../services/chatService");

// Get user basic info (firstName, lastName) - must be before /:id to avoid conflict
router.get("/:id/basic", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "firstName lastName _id photoUrl",
    );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("Failed to fetch user:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Like another user - creates private chat on mutual like
router.put("/:id/like", authMiddleware, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const userId = req.user.id;

    if (targetUserId === userId) {
      return res.status(400).json({ message: "Cannot like yourself" });
    }

    const [user, targetUser] = await Promise.all([
      User.findById(userId),
      User.findById(targetUserId),
    ]);

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const alreadyLiked = user.likedProfiles.some(
      (id) => id.toString() === targetUserId,
    );

    if (!alreadyLiked) {
      user.likedProfiles.push(targetUserId);
      await user.save();
    }

    // Check for mutual like -> create private chat
    let chat = null;
    const mutualLike = targetUser.likedProfiles.some(
      (id) => id.toString() === userId,
    );

    if (mutualLike) {
      chat = await chatService.getOrCreatePrivateChat(userId, targetUserId);
    }

    res.json({
      success: true,
      likedProfiles: user.likedProfiles,
      match: !!mutualLike,
      chat: chat
        ? {
            id: chat._id,
            type: "private",
          }
        : null,
    });
  } catch (err) {
    console.error("Like error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user by id (optional, for profile viewing)
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get user" });
  }
});

module.exports = router;
