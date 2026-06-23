import { EVENTS_API_URL } from "@/config/api";
import { authFetch } from "./apiClient";

export type Event = {
  _id: string;
  title: string;
  description: string;
  category: string;
  venueName?: string;
  address?: string;
  startDate: string;
  endDate: string;
  status?: "Scheduled" | "Live" | "Closed";
  latitude?: number;
  longitude?: number;
  bannerImage?: string;
  organizerName?: string;
};

export type CreateEventPayload = {
  title: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
  status?: "Scheduled" | "Live" | "Closed";
  latitude?: number;
  longitude?: number;
  venueName?: string;
  address?: string;
  bannerImage?: string;
};

const parseResponse = async (response: Response) => {
  const contentType = response.headers.get("Content-Type") || "";

  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "string"
        ? data
        : data?.message || response.statusText || "Request failed";

    throw new Error(message);
  }

  return data;
};

/* ==========================
   CREATE EVENT
========================== */

export const createEvent = async (payload: CreateEventPayload) => {
  const response = await authFetch(EVENTS_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
};

/* ==========================
   GET ALL EVENTS
========================== */

export const getEvents = async () => {
  const response = await authFetch(EVENTS_API_URL);

  return parseResponse(response);
};

export const getMyEvents = async () => {
  const response = await authFetch(`${EVENTS_API_URL}/my-events`);

  return parseResponse(response);
};

/* ==========================
   GET SINGLE EVENT
========================== */

export const getEvent = async (eventId: string) => {
  const response = await authFetch(`${EVENTS_API_URL}/${eventId}`);

  return parseResponse(response);
};

/* ==========================
   UPDATE EVENT
========================== */

export const updateEvent = async (
  eventId: string,
  payload: Partial<CreateEventPayload>,
) => {
  const response = await authFetch(`${EVENTS_API_URL}/${eventId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
};

/* ==========================
   DELETE EVENT
========================== */

export const deleteEvent = async (eventId: string) => {
  const response = await authFetch(`${EVENTS_API_URL}/${eventId}`, {
    method: "DELETE",
  });

  return parseResponse(response);
};

/* ==========================
   SAVE EVENT
========================== */

export const saveEvent = async (eventId: string) => {
  const response = await authFetch(`${EVENTS_API_URL}/${eventId}/save`, {
    method: "POST",
  });

  return parseResponse(response);
};

/* ==========================
   ATTEND EVENT
========================== */

export const attendEvent = async (eventId: string) => {
  const response = await authFetch(`${EVENTS_API_URL}/${eventId}/attend`, {
    method: "POST",
  });

  return parseResponse(response);
};
