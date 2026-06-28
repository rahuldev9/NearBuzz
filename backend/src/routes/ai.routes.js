import express from "express";
import {
  chatWithAi,
  createAiChatSession,
  generateAiBanner,
  generateAiDescription,
  getAiChatHistory,
  getAiChatSessions,
  getRecommendedEvents,
  removeAiChatSession,
  searchEventsAi,
  updateAiChatSession,
} from "../controllers/ai.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/recommendations", protect, getRecommendedEvents);
router.post("/description", protect, generateAiDescription);
router.post("/banner", protect, generateAiBanner);
router.post("/search", protect, searchEventsAi);
router.get("/chat/sessions", protect, getAiChatSessions);
router.post("/chat/sessions", protect, createAiChatSession);
router.patch("/chat/sessions/:sessionId", protect, updateAiChatSession);
router.delete("/chat/sessions/:sessionId", protect, removeAiChatSession);
router.post("/chat", protect, chatWithAi);
router.get("/chat/history", protect, getAiChatHistory);

export default router;
