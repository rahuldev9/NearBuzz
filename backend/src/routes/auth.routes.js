import express from "express";

import {
  getCurrentUser,
  login,
  logout,
  refreshToken,
  register,
  resetPassword,
  sendOtp,
  sendRegistrationOtp,
  verifyOtp,
  verifyRegistrationOtp,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/register/send-otp", sendRegistrationOtp);
router.post("/register/verify-otp", verifyRegistrationOtp);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);
router.get("/current-user", getCurrentUser);
router.post("/forgot-password", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

export default router;
