import dotenv from "dotenv";
import nodemailer from "nodemailer";
dotenv.config();
const useConsoleDelivery =
  !process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS;

export const sendOtpEmail = async (email, otp, purpose = "password-reset") => {
  const isRegistration = purpose === "registration";
  const subject = isRegistration
    ? "Your NearBuzz Registration Code"
    : "Your NearBuzz Password Reset Code";
  const action = isRegistration ? "registration" : "password reset";
  const text = `Your ${action} code is ${otp}. It expires in 10 minutes.`;
  const html = `<p>Your ${action} code is <strong>${otp}</strong>.</p><p>This code will expire in 10 minutes.</p>`;

  if (useConsoleDelivery) {
    console.log("[OTP EMAIL]", { to: email, subject, text });
    return {
      accepted: [email],
      messageId: "console-delivery",
    };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  return transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject,
    text,
    html,
  });
};
