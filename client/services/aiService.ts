import { AI_API_URL } from "@/config/api";
import { authFetch } from "./apiClient";

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

export const getRecommendedEvents = async () => {
  const response = await authFetch(`${AI_API_URL}/recommendations`);
  const data = await parseResponse(response);
  return data?.data || [];
};

export const generateAiDescription = async (payload: {
  title: string;
  category: string;
  venue: string;
  date: string;
}) => {
  const response = await authFetch(`${AI_API_URL}/description`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await parseResponse(response);
  return data?.data || "";
};

export const generateAiBanner = async (payload: {
  title: string;
  category: string;
  venue: string;
  date: string;
}) => {
  const response = await authFetch(`${AI_API_URL}/banner`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await parseResponse(response);
  return data?.data || { prompt: "", imageUrl: "" };
};

export const searchEventsWithAi = async (payload: {
  query: string;
  events: any[];
}) => {
  const response = await authFetch(`${AI_API_URL}/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await parseResponse(response);
  return data?.data || [];
};

export const chatWithAi = async (payload: {
  message: string;
  sessionId?: string;
  context?: Record<string, unknown>;
}) => {
  const response = await authFetch(`${AI_API_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await parseResponse(response);
  return data?.data || "";
};

export const getAiChatHistory = async (sessionId = "default") => {
  const response = await authFetch(
    `${AI_API_URL}/chat/history?sessionId=${encodeURIComponent(sessionId)}`,
  );
  const data = await parseResponse(response);
  return data?.data || [];
};
