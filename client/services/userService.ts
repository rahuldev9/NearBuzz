import { AUTH_API_URL } from "@/config/api";
import { authFetch } from "./apiClient";
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  profileImage?: string;
  phone?: string;
}
const parseResponse = async (response: Response) => {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  return data;
};

export const updateProfile = async (payload: {
  profileImage?: string;
  name?: string;
  phone?: string;
}) => {
  const response = await authFetch(`${AUTH_API_URL}/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
};

export const deleteAccount = async () => {
  const response = await authFetch(`${AUTH_API_URL}/delete-account`, {
    method: "DELETE",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  return data;
};
