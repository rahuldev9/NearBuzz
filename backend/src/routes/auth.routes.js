import express from "express";

import {
  deleteAccount,
  getCurrentUser,
  login,
  logout,
  refreshToken,
  register,
  resetPassword,
  sendOtp,
  sendRegistrationOtp,
  updateProfile,
  verifyOtp,
  verifyRegistrationOtp,
} from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

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
router.put("/me", protect, updateProfile);
router.delete("/delete-account", protect, deleteAccount);
export default router;
