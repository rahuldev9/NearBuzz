import express from "express";

import {
  deleteAllNotifications,
  deleteNotification,
  getNotifications,
  getUnreadCount,
  markAllAsRead,
  markAsRead,
} from "../controllers/notification.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", protect, getNotifications);

router.get("/unread-count", protect, getUnreadCount);

router.patch("/read-all", protect, markAllAsRead);

router.patch("/:id/read", protect, markAsRead);

router.delete("/:id", protect, deleteNotification);

router.delete("/", protect, deleteAllNotifications);

export default router;
