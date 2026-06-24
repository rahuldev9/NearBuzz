import express from "express";
import {
  createEvent,
  deleteEvent,
  getAllEvents,
  getMyEvents,
  getSingleEvent,
  updateEvent,
} from "../controllers/event.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", protect, createEvent);
router.get("/", protect, getAllEvents);
router.get("/my-events", protect, getMyEvents);

router.get("/:id", protect, getSingleEvent);
router.put("/:id", protect, updateEvent);
router.delete("/:id", protect, deleteEvent);

export default router;
