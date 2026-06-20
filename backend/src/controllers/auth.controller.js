import bcrypt from "bcryptjs";
import OtpToken from "../models/OtpToken.js";
import User from "../models/User.js";
import { sendOtpEmail } from "../services/email.service.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const exists = await User.findOne({ email });

  if (exists) {
    return res.status(400).json({
      message: "Email already exists",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  const sanitizedUser = sanitizeUser(user);
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  res.status(201).json({
    success: true,
    user: sanitizedUser,
    accessToken,
    refreshToken,
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return res.status(400).json({
      message: "Invalid credentials",
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(400).json({
      message: "Invalid credentials",
    });
  }

  const sanitizedUser = sanitizeUser(user);
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  res.json({
    user: sanitizedUser,
    accessToken,
    refreshToken,
  });
};

export const sendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "Email not found" });
  }

  const code = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await OtpToken.findOneAndUpdate(
    { email },
    { code, expiresAt },
    { upsert: true, new: true },
  );

  await sendOtpEmail(email, code);

  res.json({ success: true, message: "OTP sent to email" });
};

export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  const record = await OtpToken.findOne({ email, code: otp });

  if (!record || record.expiresAt < new Date()) {
    return res.status(400).json({ message: "OTP is invalid or expired" });
  }

  res.json({ success: true, message: "OTP verified" });
};

export const resetPassword = async (req, res) => {
  const { email, otp, password } = req.body;

  if (!email || !otp || !password) {
    return res
      .status(400)
      .json({ message: "Email, OTP and password are required" });
  }

  const record = await OtpToken.findOne({ email, code: otp });

  if (!record || record.expiresAt < new Date()) {
    return res.status(400).json({ message: "OTP is invalid or expired" });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "Email not found" });
  }

  user.password = await bcrypt.hash(password, 12);
  await user.save();
  await OtpToken.deleteOne({ email, code: otp });

  res.json({ success: true, message: "Password reset successfully" });
};
