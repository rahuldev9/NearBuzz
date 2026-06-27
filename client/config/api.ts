const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const apiUrl = process.env.EXPO_PUBLIC_API_URL;

if (!apiUrl) {
  throw new Error("EXPO_PUBLIC_API_URL is not set");
}

export const API_URL = trimTrailingSlash(apiUrl);
export const AUTH_API_URL = `${API_URL}/api/auth`;
export const EVENTS_API_URL = `${API_URL}/api/events`;
export const EVENTS_BOOKING_API_URL = `${API_URL}/api/bookings`;
export const NOTIFICATIONS_API_URL = `${API_URL}/api/notifications`;
export const AI_API_URL = `${API_URL}/api/ai`;
