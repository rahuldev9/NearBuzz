import express from "express";

import {
  bookEvent,
  checkInBooking,
  deleteBooking,
  getBookingById,
  getEventBookings,
  getMyBookings,
  verifyBooking,
} from "../controllers/booking.controller.js";

import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();
router.post("/verify", protect, verifyBooking);
router.post("/:eventId/book", protect, bookEvent);

router.get("/my-bookings", protect, getMyBookings);
router.get("/event/:eventId", protect, getEventBookings);

router.get("/:id", protect, getBookingById);
router.delete("/:id", protect, deleteBooking);

router.put("/:id/checkin", protect, checkInBooking);

export default router;
