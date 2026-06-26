import { Slot } from "expo-router";
import { Toaster } from "sonner";
import { AuthProvider } from "../context/AuthContext";
import "../global.css";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "nativewind";
import { useEffect } from "react";
import { Platform } from "react-native";

function RootContent() {
  const { setColorScheme } = useColorScheme();

  useEffect(() => {
    const loadTheme = async () => {
      const theme =
        Platform.OS === "web"
          ? localStorage.getItem("theme")
          : await AsyncStorage.getItem("theme");

      if (theme === "dark" || theme === "light") {
        setColorScheme(theme);

        if (Platform.OS === "web") {
          document.documentElement.classList.toggle("dark", theme === "dark");
        }
      }
    };

    loadTheme();
  }, [setColorScheme]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <Toaster position="top-right" richColors />
      <RootContent />
    </AuthProvider>
  );
}
