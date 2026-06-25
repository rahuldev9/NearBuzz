import jwt from "jsonwebtoken";
import Notification from "../models/Notification.js";

const getTokenFromRequest = (req) =>
  req.cookies?.accessToken || req.headers.authorization?.split(" ")[1] || null;

const getUserId = (req) => {
  const token = getTokenFromRequest(req);

  if (!token) {
    throw new Error("Unauthorized");
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  return decoded.id;
};

/* ===========================
   GET ALL NOTIFICATIONS
=========================== */

export const getNotifications = async (req, res) => {
  try {
    const userId = getUserId(req);

    const notifications = await Notification.find({
      userId,
    })
      .sort({ createdAt: -1 })
      .populate("eventId", "title eventId");

    res.json({
      success: true,
      notifications,
    });
  } catch (err) {
    res.status(401).json({
      message: err.message,
    });
  }
};

/* ===========================
   UNREAD COUNT
=========================== */

export const getUnreadCount = async (req, res) => {
  try {
    const userId = getUserId(req);

    const count = await Notification.countDocuments({
      userId,
      isRead: false,
    });

    res.json({
      success: true,
      count,
    });
  } catch (err) {
    res.status(401).json({
      message: err.message,
    });
  }
};

/* ===========================
   MARK ONE AS READ
=========================== */

export const markAsRead = async (req, res) => {
  try {
    const userId = getUserId(req);

    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        userId,
      },
      {
        isRead: true,
      },
      {
        new: true,
      },
    );

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    res.json({
      success: true,
      notification,
    });
  } catch (err) {
    res.status(401).json({
      message: err.message,
    });
  }
};

/* ===========================
   MARK ALL AS READ
=========================== */

export const markAllAsRead = async (req, res) => {
  try {
    const userId = getUserId(req);

    const result = await Notification.updateMany(
      {
        userId,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
        },
      },
    );

    res.json({
      success: true,
      modified: result.modifiedCount,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};
/* ===========================
   DELETE ONE
=========================== */

export const deleteNotification = async (req, res) => {
  try {
    const userId = getUserId(req);

    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId,
    });

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    res.json({
      success: true,
      message: "Notification deleted.",
    });
  } catch (err) {
    res.status(401).json({
      message: err.message,
    });
  }
};

/* ===========================
   DELETE ALL
=========================== */

export const deleteAllNotifications = async (req, res) => {
  try {
    const userId = getUserId(req);

    await Notification.deleteMany({
      userId,
    });

    res.json({
      success: true,
      message: "All notifications deleted.",
    });
  } catch (err) {
    res.status(401).json({
      message: err.message,
    });
  }
};
