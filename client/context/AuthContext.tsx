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
import { KEY_ACCESS_TOKEN, KEY_REFRESH_TOKEN, KEY_USER } from "@/config/auth";

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

// keys are loaded from env via client/config/auth.ts

/* ===========================
   TYPES
=========================== */

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  profileImage?: string;
  phone?: string;
};

type PendingRegistration = {
  name: string;
  email: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  pendingRegistration: PendingRegistration | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  isLoading: boolean;
  error: string | null;

  signIn: (email: string, password: string) => Promise<void>;

  signUp: (name: string, email: string, password: string) => Promise<void>;
  requestSignUpOtp: (name: string, email: string) => Promise<void>;
  verifySignUpOtp: (otp: string) => Promise<void>;
  confirmSignUp: (otp: string, password: string) => Promise<void>;

  signOut: () => Promise<void>;

  setUser: React.Dispatch<React.SetStateAction<AuthUser | null>>;
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
  if (Platform.OS === "web") {
    await storage.setItem(KEY_USER, JSON.stringify(user));
    return;
  }

  await Promise.all([
    storage.setItem(KEY_USER, JSON.stringify(user)),
    storage.setItem(KEY_ACCESS_TOKEN, accessToken),
    storage.setItem(KEY_REFRESH_TOKEN, refreshToken),
  ]);
};

const clearAuthData = async () => {
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

/* ===========================
   PROVIDER
=========================== */

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [pendingRegistration, setPendingRegistration] =
    useState<PendingRegistration | null>(null);

  const [isInitializing, setIsInitializing] = useState(true);

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  /* ===========================
     RESTORE SESSION
  =========================== */

  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        if (Platform.OS === "web") {
          const response = await fetch(`${AUTH_API_URL}/current-user`, {
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          });

          const data = await response.json();

          if (response.ok && data.user) {
            setUser(data.user);
          } else {
            await clearAuthData();
          }
        } else {
          const storedUser = await storage.getItem(KEY_USER);

          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        }
      } catch (err) {
        console.warn("Failed to restore auth:", err);
        await clearAuthData();
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
        credentials: Platform.OS === "web" ? "include" : undefined,
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

  const requestSignUpOtp = async (name: string, email: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const username = name.trim().toLowerCase();

      const response = await fetch(`${AUTH_API_URL}/register/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: username,
          email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to send OTP");
      }

      setPendingRegistration({ name: username, email });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to send OTP";

      setError(message);

      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const verifySignUpOtp = async (otp: string) => {
    if (!pendingRegistration) {
      throw new Error("Please start registration again.");
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${AUTH_API_URL}/register/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: Platform.OS === "web" ? "include" : undefined,
        body: JSON.stringify({
          email: pendingRegistration.email,
          otp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to verify email");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Email verification failed";

      setError(message);

      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmSignUp = async (otp: string, password: string) => {
    if (!pendingRegistration) {
      throw new Error("Please start registration again.");
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${AUTH_API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: Platform.OS === "web" ? "include" : undefined,
        body: JSON.stringify({
          ...pendingRegistration,
          password,
          otp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to register");
      }

      await saveAuthData(data.user, data.accessToken, data.refreshToken);

      setUser(data.user);
      setPendingRegistration(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign up failed";

      setError(message);

      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    await requestSignUpOtp(name, email);
  };

  /* ===========================
     LOGOUT
  =========================== */

  const signOut = async () => {
    try {
      setIsLoading(true);

      await fetch(`${AUTH_API_URL}/logout`, {
        method: "POST",
        credentials: Platform.OS === "web" ? "include" : undefined,
      }).catch(() => null);

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
      pendingRegistration,
      isAuthenticated: !!user,
      isInitializing,
      isLoading,
      error,

      signIn,
      signUp,
      requestSignUpOtp,
      verifySignUpOtp,
      confirmSignUp,

      signOut,

      setUser,
    }),
    [user, pendingRegistration, isInitializing, isLoading, error],
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
