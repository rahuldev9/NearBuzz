import Notification from "../models/Notification.js";

export const createNotification = async ({
  userId,
  title,
  message,
  type = "system",
  eventId = null,
  data = {},
}) => {
  return Notification.create({
    userId,
    title,
    message,
    type,
    eventId,
    data,
  });
};
