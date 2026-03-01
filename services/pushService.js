const Expo = require("expo-server-sdk").default;
const User = require("../models/User");
const Notification = require("../models/Notification");

const expo = new Expo();

exports.sendPushToUser = async (userId, title, body, data = {}) => {
  const user = await User.findById(userId).select("expoPushToken");
  if (!user?.expoPushToken || !Expo.isExpoPushToken(user.expoPushToken)) {
    return;
  }
  const messages = [
    {
      to: user.expoPushToken,
      sound: "default",
      title,
      body,
      data: { ...data, userId: userId.toString() },
    },
  ];
  const chunks = expo.chunkPushNotifications(messages);
  for (const chunk of chunks) {
    try {
      await expo.sendPushNotificationsAsync(chunk);
    } catch (err) {
      console.error("Push send error:", err);
    }
  }
};

exports.sendPushToAll = async (title, body, data = {}) => {
  const users = await User.find({
    expoPushToken: { $exists: true, $ne: null },
    role: "user",
  }).select("expoPushToken");

  const messages = users
    .filter((u) => u.expoPushToken && Expo.isExpoPushToken(u.expoPushToken))
    .map((u) => ({
      to: u.expoPushToken,
      sound: "default",
      title,
      body,
      data,
    }));

  const chunks = expo.chunkPushNotifications(messages);
  for (const chunk of chunks) {
    try {
      await expo.sendPushNotificationsAsync(chunk);
    } catch (err) {
      console.error("Push send error:", err);
    }
  }
};
