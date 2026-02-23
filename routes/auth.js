const express = require("express");
const router = express.Router();
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  sendOtp,
  verifyOtp,
  googleAuth,
  appleAuth,
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/google", googleAuth);
router.post("/apple", appleAuth);

module.exports = router;
