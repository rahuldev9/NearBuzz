import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import { AUTH_API_URL } from "@/config/api";
import { KEY_ACCESS_TOKEN, KEY_REFRESH_TOKEN, KEY_USER } from "@/config/auth";

const storage = {
  async setItem(key: string, value: string) {
    if (Platform.OS === "web") {
      localStorage.setItem(key, value);
      return;
    }

    await SecureStore.setItemAsync(key, value);
  },

  async getItem(key: string) {
    if (Platform.OS === "web") {
      return localStorage.getItem(key);
    }

    return await SecureStore.getItemAsync(key);
  },

  async removeItem(key: string) {
    if (Platform.OS === "web") {
      localStorage.removeItem(key);
      return;
    }

    await SecureStore.deleteItemAsync(key);
  },
};

const getAccessToken = async () => {
  if (Platform.OS === "web") {
    return null;
  }

  return await storage.getItem(KEY_ACCESS_TOKEN);
};

const getRefreshToken = async () => {
  if (Platform.OS === "web") {
    return null;
  }

  return await storage.getItem(KEY_REFRESH_TOKEN);
};

const saveAuthTokens = async (
  accessToken?: string,
  refreshToken?: string,
  user?: string,
) => {
  if (Platform.OS === "web") {
    return;
  }

  const promises = [] as Promise<void>[];

  if (accessToken) {
    promises.push(storage.setItem(KEY_ACCESS_TOKEN, accessToken));
  }

  if (refreshToken) {
    promises.push(storage.setItem(KEY_REFRESH_TOKEN, refreshToken));
  }

  if (user) {
    promises.push(storage.setItem(KEY_USER, user));
  }

  await Promise.all(promises);
};

const clearAuthStorage = async () => {
  if (Platform.OS === "web") {
    await storage.removeItem(KEY_USER);
    return;
  }

  await Promise.all([
    storage.removeItem(KEY_USER),
    storage.removeItem(KEY_ACCESS_TOKEN),
    storage.removeItem(KEY_REFRESH_TOKEN),
  ]);
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

const refreshAuth = async () => {
  if (Platform.OS === "web") {
    const response = await fetch(`${AUTH_API_URL}/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const data = await parseResponse(response);

    if (data.accessToken || data.refreshToken) {
      await saveAuthTokens(
        data.accessToken,
        data.refreshToken,
        data.user ? JSON.stringify(data.user) : undefined,
      );
    }

    return data;
  }

  const refreshToken = await getRefreshToken();

  if (!refreshToken) {
    await clearAuthStorage();
    throw new Error("Refresh token missing");
  }

  const response = await fetch(`${AUTH_API_URL}/refresh-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });

  const data = await parseResponse(response);

  await saveAuthTokens(
    data.accessToken,
    data.refreshToken,
    data.user ? JSON.stringify(data.user) : undefined,
  );

  return data;
};

export const authFetch = async (
  url: string,
  options: RequestInit = {},
): Promise<Response> => {
  const buildRequest = async (override?: Partial<RequestInit>) => {
    const requestOptions: RequestInit = {
      ...options,
      ...override,
      headers: {
        ...(options.headers as Record<string, string>),
      },
    };

    if (Platform.OS === "web") {
      requestOptions.credentials = "include";
    } else {
      const token = await getAccessToken();

      if (token) {
        requestOptions.headers = {
          ...(requestOptions.headers as Record<string, string>),
          Authorization: `Bearer ${token}`,
        };
      }
    }

    return fetch(url, requestOptions);
  };

  let response = await buildRequest();

  if (response.status === 401) {
    try {
      await refreshAuth();
    } catch (err) {
      throw err;
    }

    response = await buildRequest({
      ...options,
    });
  }

  return response;
};

export const logoutClient = async () => {
  await clearAuthStorage();
};
