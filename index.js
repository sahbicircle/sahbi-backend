require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const eventRoutes = require("./routes/events");
const bookingRoutes = require("./routes/bookings");
const chatRoutes = require("./routes/chat");
const userRoutes = require("./routes/user");
const profileRoutes = require("./routes/profile");
const subscriptionRoutes = require("./routes/subscriptions");
const trustRoutes = require("./routes/trust");
const facialRoutes = require("./routes/facial");
const adminRoutes = require("./routes/admin");
const notificationRoutes = require("./routes/notifications");
const paymentRoutes = require("./routes/payments");
const waitingListRoutes = require("./routes/waitingList");

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ strict: true, type: "application/json", limit: "10mb" }));

// Routes
const { sendOtp, verifyOtp } = require("./controllers/authController");
app.post("/api/auth/send-otp", sendOtp);
app.post("/api/auth/verify-otp", verifyOtp);
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/users", userRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/trust", trustRoutes);
app.use("/api/facial", facialRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/waiting-list", waitingListRoutes);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err.message));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);

  // Run 24h-before-event notification job every hour
  const { run24hNotificationJob } = require("./jobs/notification24h");
  run24hNotificationJob();
  setInterval(run24hNotificationJob, 60 * 60 * 1000);
});
