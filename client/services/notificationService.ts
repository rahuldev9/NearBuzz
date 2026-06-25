import { NOTIFICATIONS_API_URL } from "@/config/api";
import { authFetch } from "./apiClient";

export type NotificationType =
  | "booking"
  | "event"
  | "reminder"
  | "checkin"
  | "announcement"
  | "system";

export interface Notification {
  _id: string;

  title: string;

  message: string;

  type: NotificationType;

  isRead: boolean;

  createdAt: string;

  eventId?: {
    _id: string;
    title: string;
    eventId: string;
  };

  data?: Record<string, any>;
}

const parseResponse = async (response: Response) => {
  const contentType = response.headers.get("content-type") || "";

  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new Error(
      typeof data === "string" ? data : data.message || "Something went wrong",
    );
  }

  return data;
};

/* ===========================
   GET NOTIFICATIONS
=========================== */

export const getNotifications = async (): Promise<Notification[]> => {
  const response = await authFetch(NOTIFICATIONS_API_URL);

  const data = await parseResponse(response);

  return data.notifications;
};

/* ===========================
   UNREAD COUNT
=========================== */

export const getUnreadCount = async (): Promise<number> => {
  const response = await authFetch(`${NOTIFICATIONS_API_URL}/unread-count`);

  const data = await parseResponse(response);

  return data.count;
};

/* ===========================
   MARK READ
=========================== */

export const markAsRead = async (id: string) => {
  const response = await authFetch(`${NOTIFICATIONS_API_URL}/${id}/read`, {
    method: "PATCH",
  });

  return parseResponse(response);
};

/* ===========================
   MARK ALL
=========================== */

export const markAllAsRead = async () => {
  const response = await authFetch(`${NOTIFICATIONS_API_URL}/read-all`, {
    method: "PATCH",
  });

  return parseResponse(response);
};
/* ===========================
   DELETE ONE
=========================== */

export const deleteNotification = async (id: string) => {
  const response = await authFetch(`${NOTIFICATIONS_API_URL}/${id}`, {
    method: "DELETE",
  });

  return parseResponse(response);
};

/* ===========================
   DELETE ALL
=========================== */

export const deleteAllNotifications = async () => {
  const response = await authFetch(NOTIFICATIONS_API_URL, {
    method: "DELETE",
  });

  return parseResponse(response);
};
