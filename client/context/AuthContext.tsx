import * as SecureStore from "expo-secure-store";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Platform } from "react-native";

import { AUTH_API_URL } from "@/config/api";

/* ===========================
   STORAGE
=========================== */

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

/* ===========================
   CONSTANTS
=========================== */

const KEY_USER = "NEARBUZZ_USER";
const KEY_ACCESS_TOKEN = "NEARBUZZ_ACCESS_TOKEN";
const KEY_REFRESH_TOKEN = "NEARBUZZ_REFRESH_TOKEN";

/* ===========================
   TYPES
=========================== */

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  isLoading: boolean;
  error: string | null;

  signIn: (email: string, password: string) => Promise<void>;

  signUp: (name: string, email: string, password: string) => Promise<void>;

  signOut: () => Promise<void>;
};

/* ===========================
   CONTEXT
=========================== */

const AuthContext = createContext<AuthContextValue | null>(null);

/* ===========================
   HELPERS
=========================== */

const saveAuthData = async (
  user: AuthUser,
  accessToken: string,
  refreshToken: string,
) => {
  await Promise.all([
    storage.setItem(KEY_USER, JSON.stringify(user)),
    storage.setItem(KEY_ACCESS_TOKEN, accessToken),
    storage.setItem(KEY_REFRESH_TOKEN, refreshToken),
  ]);
};

const clearAuthData = async () => {
  await Promise.all([
    storage.removeItem(KEY_USER),
    storage.removeItem(KEY_ACCESS_TOKEN),
    storage.removeItem(KEY_REFRESH_TOKEN),
  ]);
};

/* ===========================
   PROVIDER
=========================== */

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  const [isInitializing, setIsInitializing] = useState(true);

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  /* ===========================
     RESTORE SESSION
  =========================== */

  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        const storedUser = await storage.getItem(KEY_USER);

        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.warn("Failed to restore auth:", err);
      } finally {
        setIsInitializing(false);
      }
    };

    bootstrapAuth();
  }, []);

  /* ===========================
     LOGIN
  =========================== */

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${AUTH_API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to sign in");
      }

      await saveAuthData(data.user, data.accessToken, data.refreshToken);

      setUser(data.user);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign in failed";

      setError(message);

      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  /* ===========================
     REGISTER
  =========================== */

  const signUp = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${AUTH_API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to register");
      }

      await saveAuthData(data.user, data.accessToken, data.refreshToken);

      setUser(data.user);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign up failed";

      setError(message);

      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  /* ===========================
     LOGOUT
  =========================== */

  const signOut = async () => {
    try {
      setIsLoading(true);

      await clearAuthData();

      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  /* ===========================
     CONTEXT VALUE
  =========================== */

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isInitializing,
      isLoading,
      error,
      signIn,
      signUp,
      signOut,
    }),
    [user, isInitializing, isLoading, error],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/* ===========================
   HOOK
=========================== */

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
