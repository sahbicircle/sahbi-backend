const Booking = require("../models/Booking");
const notificationController = require("../controllers/notificationController");

/**
 * Send "event in less than 24h" notification to users with upcoming bookings.
 * Run every hour.
 */
async function run24hNotificationJob() {
  try {
    const now = new Date();

    const bookings = await Booking.find({
      status: { $ne: "cancelled" },
      notification24hSent: false,
    })
      .populate("event", "title date")
      .populate("user", "_id");

    for (const booking of bookings) {
      if (!booking.event?.date) continue;
      const eventDate = new Date(booking.event.date);
      const hoursUntil = (eventDate - now) / (1000 * 60 * 60);

      if (hoursUntil > 0 && hoursUntil <= 24) {
        const title = "Your event is in less than 24 hours!";
        const body = `${booking.event.title || "Your event"} starts soon. Get ready!`;
        await notificationController.createUserNotification(
          booking.user._id,
          title,
          body
        );
        booking.notification24hSent = true;
        await booking.save();
      }
    }
  } catch (err) {
    console.error("24h notification job error:", err);
  }
}

module.exports = { run24hNotificationJob };
