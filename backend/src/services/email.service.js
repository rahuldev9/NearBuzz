import dotenv from "dotenv";
import nodemailer from "nodemailer";
dotenv.config();

const normalizeEnv = (value) =>
  value?.trim().replace(/^['"]+|['"]+$/g, "") || "";

const emailHost = normalizeEnv(process.env.EMAIL_HOST);
const emailUser = normalizeEnv(process.env.EMAIL_USER);
const emailPass = normalizeEnv(process.env.EMAIL_PASS).replace(/\s+/g, "");
const emailPort = Number(normalizeEnv(process.env.EMAIL_PORT) || 587);
const emailSecure = normalizeEnv(process.env.EMAIL_SECURE) === "true";
const emailFrom = normalizeEnv(process.env.EMAIL_FROM) || emailUser;

const useConsoleDelivery =
  process.env.NODE_ENV !== "production" &&
  (!emailHost || !emailUser || !emailPass);

const ensureProductionEmailConfig = () => {
  if (
    process.env.NODE_ENV === "production" &&
    (!emailHost || !emailUser || !emailPass)
  ) {
    throw new Error(
      "Missing production email SMTP configuration. Set EMAIL_HOST, EMAIL_USER, and EMAIL_PASS.",
    );
  }
};

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

  ensureProductionEmailConfig();

  const transporter = nodemailer.createTransport({
    host: emailHost,
    port: emailPort,
    secure: emailSecure,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  return transporter.sendMail({
    from: emailFrom,
    to: email,
    subject,
    text,
    html,
  });
};
