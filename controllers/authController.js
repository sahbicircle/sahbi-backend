const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const oauthService = require("../services/oauthService");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const CODE_EXPIRY_MINUTES = 15;

const buildUserResponse = (user) => ({
  id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  photoUrl: Array.isArray(user.photoUrl) ? user.photoUrl : (user.photoUrl ? [user.photoUrl] : []),
  trustScore: user.trustScore,
  role: user.role || "user",
});

function normalizePhone(phone) {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, "");
  if (!digits) return null;
  return "+" + digits;
}

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phoneNumber } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        message: "First name, last name, email and password are required",
      });
    }

    const emailNorm = email.toLowerCase().trim();
    const existingByEmail = await User.findOne({ email: emailNorm });
    if (existingByEmail) {
      return res.status(409).json({ message: "Email already in use" });
    }

    if (phoneNumber && phoneNumber.trim()) {
      const phoneNorm = normalizePhone(phoneNumber) || phoneNumber.trim();
      const phoneDigits = (phoneNorm || "").replace(/\D/g, "");
      const phoneVariants = [
        phoneNorm,
        phoneNumber.trim(),
        phoneDigits ? "+" + phoneDigits : null,
        phoneDigits || null,
      ].filter(Boolean);
      const existingByPhone = await User.findOne({
        phoneNumber: { $in: phoneVariants },
      });
      if (existingByPhone) {
        return res.status(409).json({ message: "Phone number already in use" });
      }
    }

    const body = { ...req.body };
    body.email = emailNorm;
    if (body.phoneNumber && body.phoneNumber.trim()) {
      body.phoneNumber = normalizePhone(body.phoneNumber) || body.phoneNumber.trim();
    }
    if (body.photos && !body.photoUrl) {
      body.photoUrl = Array.isArray(body.photos) ? body.photos : [body.photos];
    }

    const user = new User(body);
    await user.save();

    // Generate JWT
    const token = signToken(user._id);

    res.status(201).json({
      token,
      user: buildUserResponse(user),
    });
  } catch (err) {
    console.error("❌ Register error:", err);
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

/**
 * Forgot password: send 6-digit code to user's email
 * In dev, code is logged to console. Add SMTP/Resend for production.
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.json({ message: "If an account exists, a code was sent to your email" });
    }

    if (user.authProvider !== "local" || !user.password) {
      return res.status(400).json({
        message: "This account uses social sign-in. Use Google or Apple to log in.",
      });
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    user.resetPasswordCode = code;
    user.resetPasswordExpires = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000);
    await user.save();

    const emailService = require("../services/emailService");
    await emailService.sendPasswordResetCode(email, code);

    res.json({ message: "If an account exists, a code was sent to your email" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Reset password: validate code and set new password
 */
exports.resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: "Email, code, and new password are required" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ message: "Invalid or expired code" });

    if (
      !user.resetPasswordCode ||
      user.resetPasswordCode !== code ||
      !user.resetPasswordExpires ||
      user.resetPasswordExpires < new Date()
    ) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    user.password = newPassword;
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.sendOtp = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber) return res.status(400).json({ message: "Phone number is required" });

    const otpService = require("../services/otpService");
    await otpService.sendOtp(phoneNumber);

    res.json({ message: "Verification code sent" });
  } catch (err) {
    console.error("Send OTP error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { phoneNumber, code } = req.body;
    if (!phoneNumber || !code) {
      return res.status(400).json({ message: "Phone number and code are required" });
    }

    const otpService = require("../services/otpService");
    const valid = otpService.verifyOtp(phoneNumber, code);

    if (!valid) return res.status(400).json({ message: "Invalid or expired code" });

    res.json({ verified: true });
  } catch (err) {
    console.error("Verify OTP error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = signToken(user._id);

    res.json({
      token,
      user: buildUserResponse(user),
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

/**
 * Google Sign-In / Sign-Up
 * Verifies idToken, finds or creates user, returns JWT
 */
exports.googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: "idToken is required" });
    }

    const payload = await oauthService.verifyGoogleToken(idToken);
    const { email, name, givenName, familyName, picture } = payload;

    if (!email) {
      return res.status(400).json({ message: "Email not provided by Google" });
    }

    let user = await User.findOne({ email });

    if (user) {
      if (user.authProvider !== "google") user.authProvider = "google";
      const photos = Array.isArray(user.photoUrl) ? user.photoUrl : (user.photoUrl ? [user.photoUrl] : []);
      if (picture && !photos.length) user.photoUrl = [picture];
      if (!user.googleId) user.googleId = payload.sub;
      await user.save();
    } else {
      // Create new user
      const firstName = givenName || name?.split(" ")[0] || "User";
      const lastName = familyName || name?.split(" ").slice(1).join(" ") || "";

      user = new User({
        firstName,
        lastName,
        email,
        password: crypto.randomBytes(32).toString("hex"),
        authProvider: "google",
        googleId: payload.sub,
        photoUrl: picture ? [picture] : [],
      });
      await user.save();
    }

    const token = signToken(user._id);
    res.json({ token, user: buildUserResponse(user) });
  } catch (err) {
    console.error("❌ Google auth error:", err);
    if (err.message?.includes("GOOGLE_WEB_CLIENT_ID")) {
      return res.status(500).json({ message: "Google auth not configured" });
    }
    res.status(401).json({ message: "Invalid Google token" });
  }
};

/**
 * Apple Sign-In / Sign-Up
 * Verifies identityToken, finds or creates user, returns JWT
 * For new users, email/name may be sent in body (Apple only sends on first auth)
 */
exports.appleAuth = async (req, res) => {
  try {
    const { identityToken, email: bodyEmail, firstName: bodyFirstName, lastName: bodyLastName } = req.body;
    if (!identityToken) {
      return res.status(400).json({ message: "identityToken is required" });
    }

    const payload = await oauthService.verifyAppleToken(identityToken);
    const { email: tokenEmail, sub } = payload;

    let user = await User.findOne({ appleId: sub });
    if (!user) {
      user = await User.findOne({ email: tokenEmail || bodyEmail });
    }
    if (!user && !email) {
      return res.status(400).json({
        message: "Email required for new Apple sign-in. Pass it in the request body.",
      });
    }

    if (user) {
      if (!user.appleId) {
        user.appleId = sub;
        user.authProvider = "apple";
        await user.save();
      }
    } else {
      const firstName = bodyFirstName || "User";
      const lastName = bodyLastName || "";

      user = new User({
        firstName,
        lastName,
        email,
        password: crypto.randomBytes(32).toString("hex"),
        authProvider: "apple",
        appleId: sub,
      });
      await user.save();
    }

    const token = signToken(user._id);
    res.json({ token, user: buildUserResponse(user) });
  } catch (err) {
    console.error("❌ Apple auth error:", err);
    res.status(401).json({ message: "Invalid Apple token" });
  }
};
