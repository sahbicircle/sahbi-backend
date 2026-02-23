/**
 * OTP service for phone verification.
 * Uses Twilio SMS when configured, otherwise logs to console.
 */

const OTP_EXPIRY_MINUTES = 5;
const otpStore = new Map();

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function normalizePhone(phone) {
  let p = (phone || "").replace(/\D/g, "");
  if (p && !p.startsWith("+")) p = "+" + p;
  return p || phone;
}

async function sendViaTwilio(phoneNumber, code) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (!sid || !token || !from) return { sent: false, reason: "not_configured" };

  try {
    const twilio = require("twilio")(sid, token);
    const to = normalizePhone(phoneNumber);
    await twilio.messages.create({
      body: `Your Sahbi verification code is: ${code}. It expires in ${OTP_EXPIRY_MINUTES} minutes.`,
      from,
      to,
    });
    return { sent: true };
  } catch (err) {
    console.error("Twilio send error:", err.message || err);
    return { sent: false, reason: "error", error: err };
  }
}

exports.sendOtp = async (phoneNumber) => {
  const normalized = normalizePhone(phoneNumber);
  const code = generateCode();
  const expires = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  const result = await sendViaTwilio(phoneNumber, code);
  if (!result.sent) {
    console.log("📱 OTP for", normalized, ":", code);
    if (result.reason === "not_configured") {
      console.log("   Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER to .env for real SMS");
    }
  }

  otpStore.set(normalized, { code, expires });
  return true;
};

exports.verifyOtp = (phoneNumber, code) => {
  const normalized = normalizePhone(phoneNumber);
  const entry = otpStore.get(normalized);
  if (!entry) return false;
  if (entry.expires < new Date()) {
    otpStore.delete(normalized);
    return false;
  }
  if (entry.code !== String(code)) return false;
  otpStore.delete(normalized);
  return true;
};
