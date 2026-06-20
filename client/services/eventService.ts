import { EVENTS_API_URL } from "@/config/api";
import { KEY_ACCESS_TOKEN } from "@/config/auth";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export type Event = {
  _id: string;
  title: string;
  description: string;
  category: string;
  venueName: string;
  address: string;
  startDate: string;
  endDate: string;
  bannerImage?: string;
  organizerName?: string;
};

export type CreateEventPayload = {
  title: string;
  description: string;
  category: string;
  venueName: string;
  address: string;
  startDate: string;
  endDate: string;
  bannerImage?: string;
};

const getToken = async () => {
  if (Platform.OS === "web") {
    return localStorage.getItem(KEY_ACCESS_TOKEN);
  }

  return SecureStore.getItemAsync(KEY_ACCESS_TOKEN);
};

/* ==========================
   CREATE EVENT
========================== */

export const createEvent = async (payload: CreateEventPayload) => {
  const token = await getToken();

  const response = await fetch(EVENTS_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(text);
  }

  return JSON.parse(text);
};

/* ==========================
   GET ALL EVENTS
========================== */

export const getEvents = async () => {
  const response = await fetch(EVENTS_API_URL);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch events");
  }

  return data;
};
export const getMyEvents = async () => {
  const token = await getToken();

  const response = await fetch(`${EVENTS_API_URL}/my-events`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  return data;
};

/* ==========================
   GET SINGLE EVENT
========================== */

export const getEvent = async (eventId: string) => {
  const response = await fetch(`${EVENTS_API_URL}/${eventId}`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch event");
  }

  return data;
};

/* ==========================
   UPDATE EVENT
========================== */

export const updateEvent = async (
  eventId: string,
  payload: Partial<CreateEventPayload>,
) => {
  const token = await getToken();

  const response = await fetch(`${EVENTS_API_URL}/${eventId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update event");
  }

  return data;
};

/* ==========================
   DELETE EVENT
========================== */

export const deleteEvent = async (eventId: string) => {
  const token = await getToken();

  const response = await fetch(`${EVENTS_API_URL}/${eventId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete event");
  }

  return data;
};

/* ==========================
   SAVE EVENT
========================== */

export const saveEvent = async (eventId: string) => {
  const token = await getToken();

  const response = await fetch(`${EVENTS_API_URL}/${eventId}/save`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to save event");
  }

  return data;
};

/* ==========================
   ATTEND EVENT
========================== */

export const attendEvent = async (eventId: string) => {
  const token = await getToken();

  const response = await fetch(`${EVENTS_API_URL}/${eventId}/attend`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to attend event");
  }

  return data;
};
