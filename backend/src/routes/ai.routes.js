import express from "express";
import {
  chatWithAi,
  generateAiBanner,
  generateAiDescription,
  getAiChatHistory,
  getRecommendedEvents,
  searchEventsAi,
} from "../controllers/ai.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/recommendations", protect, getRecommendedEvents);
router.post("/description", protect, generateAiDescription);
router.post("/banner", protect, generateAiBanner);
router.post("/search", protect, searchEventsAi);
router.post("/chat", protect, chatWithAi);
router.get("/chat/history", protect, getAiChatHistory);

export default router;
