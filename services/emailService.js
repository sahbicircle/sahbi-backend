/**
 * Email service for password reset codes (Nodemailer + SMTP)
 */

const nodemailer = require("nodemailer");

async function sendPasswordResetEmail(to, code) {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.log("⚠️ SMTP not configured. Code for", to, ":", code);
    console.log("   Add SMTP_HOST, SMTP_USER, SMTP_PASS to .env");
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port: parseInt(process.env.SMTP_PORT || "587", 10),
      secure: process.env.SMTP_SECURE === "true",
      auth: { user, pass },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || user,
      to,
      subject: "Your Sahbi password reset code",
      html: `
        <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto;">
          <h2>Password reset</h2>
          <p>Use this code to reset your Sahbi password:</p>
          <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">${code}</p>
          <p style="color: #666;">This code expires in 15 minutes.</p>
          <p style="color: #999; font-size: 12px;">If you didn't request this, you can ignore this email.</p>
        </div>
      `,
    });
    return true;
  } catch (err) {
    console.error("Nodemailer send error:", err);
    return false;
  }
}

exports.sendPasswordResetCode = sendPasswordResetEmail;
