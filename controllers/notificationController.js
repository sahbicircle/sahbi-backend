const Notification = require("../models/Notification");
const pushService = require("../services/pushService");

exports.createUserNotification = async (userId, title, body, extraData = {}) => {
  const notification = await Notification.create({
    type: "user",
    userId,
    title,
    body,
  });
  await pushService.sendPushToUser(userId, title, body, {
    notificationId: notification._id.toString(),
    ...extraData,
  });
  return notification;
};

exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [
        { type: "user", userId: req.user.id },
        { type: "global" },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.json(notifications);
  } catch (err) {
    console.error("getMyNotifications error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      $or: [{ type: "user", userId: req.user.id }, { type: "global" }],
    });
    if (!notification)
      return res.status(404).json({ message: "Notification not found" });
    notification.readAt = new Date();
    await notification.save();
    res.json(notification);
  } catch (err) {
    console.error("markAsRead error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      {
        $or: [{ type: "user", userId: req.user.id }, { type: "global" }],
        readAt: null,
      },
      { readAt: new Date() }
    );
    res.json({ success: true });
  } catch (err) {
    console.error("markAllAsRead error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
