import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Event from "../models/Event.js";
import EventBooking from "../models/EventBooking.js";
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
  profileImage: user.profileImage,
  phone: user.phone,
});

const getCookieOptions = (maxAge) => {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge,
    path: "/",
  };
};

const setTokenCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, getCookieOptions(15 * 60 * 1000));
  res.cookie(
    "refreshToken",
    refreshToken,
    getCookieOptions(7 * 24 * 60 * 60 * 1000),
  );
};

const clearTokenCookies = (res) => {
  const cookieOptions = {
    path: "/",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
  };

  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);
};

const getTokenFromRequest = (req) =>
  req.cookies?.accessToken || req.headers.authorization?.split(" ")[1] || null;

const getRefreshTokenFromRequest = (req) =>
  req.cookies?.refreshToken ||
  req.body?.refreshToken ||
  req.headers["x-refresh-token"] ||
  null;

const refreshSession = async (req, res) => {
  const refreshToken = getRefreshTokenFromRequest(req);

  if (!refreshToken) {
    clearTokenCookies(res);
    return res.status(401).json({ message: "Refresh token missing" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      clearTokenCookies(res);
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const accessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    setTokenCookies(res, accessToken, newRefreshToken);

    return res.json({
      success: true,
      user: sanitizeUser(user),
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    clearTokenCookies(res);
    return res.status(401).json({ message: "Invalid refresh token" });
  }
};

export const getCurrentUser = async (req, res) => {
  const accessToken = getTokenFromRequest(req);

  if (!accessToken) {
    return refreshSession(req, res);
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      clearTokenCookies(res);
      return res.status(401).json({ message: "User not found" });
    }

    return res.json({ success: true, user: sanitizeUser(user) });
  } catch (error) {
    if (error?.name === "TokenExpiredError") {
      return refreshSession(req, res);
    }

    clearTokenCookies(res);
    return res.status(401).json({ message: "Invalid token" });
  }
};

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const normalizeEmail = (email) => email.trim().toLowerCase();
const normalizeUsername = (name) => name.trim().toLowerCase();
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const findUserByEmail = (email) => {
  const normalizedEmail = normalizeEmail(email);

  return User.findOne({
    email: { $regex: `^${escapeRegExp(normalizedEmail)}$`, $options: "i" },
  });
};

const findUserByUsername = (name) => {
  const normalizedName = normalizeUsername(name);

  return User.findOne({
    name: { $regex: `^${escapeRegExp(normalizedName)}$`, $options: "i" },
  });
};

const isValidUsername = (name) =>
  /^(?!.*\.\.)(?!\.)(?!.*\.$)[a-z0-9._]{3,30}$/.test(name);

const usernameValidationMessage =
  "Username must be 3-30 characters and can only use lowercase letters, numbers, periods, and underscores.";

const validateUsername = (name) => {
  const username = normalizeUsername(name);

  if (!isValidUsername(username)) {
    return { error: usernameValidationMessage };
  }

  return { username };
};

const createOtpToken = async (email, purpose) => {
  const code = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  const normalizedEmail = normalizeEmail(email);

  await OtpToken.findOneAndUpdate(
    { email: normalizedEmail, purpose },
    { email: normalizedEmail, code, purpose, expiresAt },
    { upsert: true, new: true },
  );

  await sendOtpEmail(normalizedEmail, code, purpose);
};

const validateOtpToken = async (email, otp, purpose) => {
  const record = await OtpToken.findOne({
    email: normalizeEmail(email),
    code: otp,
    purpose,
  });

  if (!record || record.expiresAt < new Date()) {
    return null;
  }

  return record;
};

export const sendRegistrationOtp = async (req, res) => {
  const { name: rawName, email: rawEmail } = req.body;

  if (!rawName || !rawEmail) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const { username, error: usernameError } = validateUsername(rawName);

  if (usernameError) {
    return res.status(400).json({ message: usernameError });
  }

  const email = normalizeEmail(rawEmail);
  const exists = await findUserByEmail(email);

  if (exists) {
    return res.status(400).json({
      message: "Email already exists",
    });
  }

  const usernameExists = await findUserByUsername(username);

  if (usernameExists) {
    return res.status(400).json({
      message: "Username is already taken",
    });
  }

  await createOtpToken(email, "registration");

  res.json({ success: true, message: "OTP sent to email" });
};

export const verifyRegistrationOtp = async (req, res) => {
  const { email: rawEmail, otp } = req.body;

  if (!rawEmail || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  const email = normalizeEmail(rawEmail);
  const record = await validateOtpToken(email, otp, "registration");

  if (!record) {
    return res.status(400).json({ message: "OTP is invalid or expired" });
  }

  res.json({ success: true, message: "Email verified" });
};

export const register = async (req, res) => {
  const { name: rawName, email: rawEmail, password, otp } = req.body;

  if (!rawName || !rawEmail || !password || !otp) {
    return res
      .status(400)
      .json({ message: "Username, email, password and OTP are required" });
  }

  const { username, error: usernameError } = validateUsername(rawName);

  if (usernameError) {
    return res.status(400).json({ message: usernameError });
  }

  const email = normalizeEmail(rawEmail);
  const exists = await findUserByEmail(email);

  if (exists) {
    return res.status(400).json({
      message: "Email already exists",
    });
  }

  const usernameExists = await findUserByUsername(username);

  if (usernameExists) {
    return res.status(400).json({
      message: "Username is already taken",
    });
  }

  const otpRecord = await validateOtpToken(email, otp, "registration");

  if (!otpRecord) {
    return res.status(400).json({ message: "OTP is invalid or expired" });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  let user;

  try {
    user = await User.create({
      name: username,
      email,
      password: hashedPassword,
      isVerified: true,
    });
  } catch (error) {
    if (error?.code === 11000) {
      const duplicatedField = Object.keys(error.keyPattern || {})[0];
      const message =
        duplicatedField === "name"
          ? "Username is already taken"
          : "Email already exists";

      return res.status(400).json({ message });
    }

    throw error;
  }

  const sanitizedUser = sanitizeUser(user);
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  setTokenCookies(res, accessToken, refreshToken);

  await OtpToken.deleteOne({ email, code: otp, purpose: "registration" });

  res.status(201).json({
    success: true,
    user: sanitizedUser,
    accessToken,
    refreshToken,
  });
};

export const login = async (req, res) => {
  const { email: rawEmail, password } = req.body;

  if (!rawEmail || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const email = normalizeEmail(rawEmail);
  const user = await findUserByEmail(email).select("+password");

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

  setTokenCookies(res, accessToken, refreshToken);

  res.json({
    user: sanitizedUser,
    accessToken,
    refreshToken,
  });
};

export const sendOtp = async (req, res) => {
  const { email: rawEmail } = req.body;

  if (!rawEmail) {
    return res.status(400).json({ message: "Email is required" });
  }

  const email = normalizeEmail(rawEmail);
  const user = await findUserByEmail(email);

  if (!user) {
    return res.status(404).json({ message: "Email not found" });
  }

  await createOtpToken(email, "password-reset");

  res.json({ success: true, message: "OTP sent to email" });
};

export const verifyOtp = async (req, res) => {
  const { email: rawEmail, otp } = req.body;

  if (!rawEmail || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  const email = normalizeEmail(rawEmail);
  const record = await validateOtpToken(email, otp, "password-reset");

  if (!record) {
    return res.status(400).json({ message: "OTP is invalid or expired" });
  }

  res.json({ success: true, message: "OTP verified" });
};

export const refreshToken = async (req, res) => refreshSession(req, res);

export const logout = async (req, res) => {
  clearTokenCookies(res);
  res.json({ success: true, message: "Logged out successfully" });
};

export const resetPassword = async (req, res) => {
  const { email: rawEmail, otp, password } = req.body;

  if (!rawEmail || !otp || !password) {
    return res
      .status(400)
      .json({ message: "Email, OTP and password are required" });
  }

  const email = normalizeEmail(rawEmail);
  const record = await validateOtpToken(email, otp, "password-reset");

  if (!record) {
    return res.status(400).json({ message: "OTP is invalid or expired" });
  }

  const user = await findUserByEmail(email);

  if (!user) {
    return res.status(404).json({ message: "Email not found" });
  }

  user.password = await bcrypt.hash(password, 12);
  await user.save();
  await OtpToken.deleteOne({ email, code: otp, purpose: "password-reset" });

  res.json({ success: true, message: "Password reset successfully" });
};
export const updateProfile = async (req, res) => {
  try {
    const decoded = jwt.verify(
      getTokenFromRequest(req),
      process.env.JWT_SECRET,
    );

    const { name, profileImage, phone } = req.body;

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (name) {
      user.name = name.toLowerCase().trim();
    }

    if (profileImage) {
      user.profileImage = profileImage;
    }
    if (phone !== undefined && phone !== null && phone !== "") {
      const cleanedPhone = phone.trim();

      // Support both formats:
      // 1. With country code: +91-3 digits, then 10 digits starting with 6-9
      // 2. Without country code: 10 digits starting with 6-9
      const internationalRegex = /^\+\d{1,3}[6-9]\d{9}$/; // +CC + 10 digit number starting with 6-9
      const domesticRegex = /^[6-9]\d{9}$/; // 10 digit number starting with 6-9

      if (
        !internationalRegex.test(cleanedPhone) &&
        !domesticRegex.test(cleanedPhone)
      ) {
        return res.status(400).json({
          message:
            "Phone must be 10 digits (6-9xxxxxxxxx) or with country code (+CC6-9xxxxxxxxx)",
        });
      }

      user.phone = cleanedPhone;
    } else if (phone === "") {
      // Allow clearing phone if explicitly set to empty string
      user.phone = undefined;
    }

    await user.save();

    res.json({
      success: true,
      user: sanitizeUser(user),
    });
  } catch (err) {
    console.error("Error updating profile:", err);

    // Handle MongoDB validation errors
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors)
        .map((e) => e.message)
        .join(", ");
      return res.status(400).json({
        message: messages || "Validation error",
      });
    }

    // Handle duplicate key errors (e.g., phone number already exists)
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0];
      return res.status(400).json({
        message: `This ${field} is already in use`,
      });
    }

    res.status(401).json({
      message: "Unauthorized",
    });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decoded.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Find all events created by the user
    const events = await Event.find({ userId }).select("_id");

    const eventIds = events.map((event) => event._id);

    // Delete bookings for those events
    if (eventIds.length > 0) {
      await EventBooking.deleteMany({
        eventId: { $in: eventIds },
      });
    }

    // Delete bookings made by the user
    await EventBooking.deleteMany({
      userId,
    });

    // Delete user's events
    await Event.deleteMany({
      userId,
    });

    // Delete user
    await User.findByIdAndDelete(userId);

    clearTokenCookies(res);

    return res.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Failed to delete account",
    });
  }
};
