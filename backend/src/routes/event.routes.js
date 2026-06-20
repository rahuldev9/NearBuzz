import express from "express";
import {
  createEvent,
  getAllEvents,
  getMyEvents,
  getSingleEvent,
} from "../controllers/event.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", protect, createEvent);
router.get("/", protect, getAllEvents);
router.get("/my-events", protect, getMyEvents);
router.get("/:id", protect, getSingleEvent);

export default router;
