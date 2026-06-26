import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "nativewind";
import React, { useEffect } from "react";
import { Platform, Switch, Text, View } from "react-native";

export default function ThemeToggle() {
  const { colorScheme, setColorScheme } = useColorScheme();

  const darkMode = colorScheme === "dark";

  useEffect(() => {
    const loadTheme = async () => {
      let savedTheme = null;

      if (Platform.OS === "web") {
        savedTheme = localStorage.getItem("theme");
      } else {
        savedTheme = await AsyncStorage.getItem("theme");
      }

      if (savedTheme === "dark" || savedTheme === "light") {
        setColorScheme(savedTheme);

        // Required for Tailwind dark mode on the web
        if (Platform.OS === "web") {
          document.documentElement.classList.toggle(
            "dark",
            savedTheme === "dark",
          );
        }
      }
    };

    loadTheme();
  }, [setColorScheme]);

  const toggleTheme = async (value: boolean) => {
    const theme = value ? "dark" : "light";

    setColorScheme(theme);

    if (Platform.OS === "web") {
      localStorage.setItem("theme", theme);
      document.documentElement.classList.toggle("dark", value);
    } else {
      await AsyncStorage.setItem("theme", theme);
    }
  };

  return (
    <View className=" rounded-2xl p-4 flex-row items-center mb-3">
      <MaterialIcons
        name="dark-mode"
        size={24}
        color={darkMode ? "#facc15" : "#2563eb"}
      />

      <Text className="ml-4 flex-1 text-base text-black dark:text-slate-200">
        Dark Mode
      </Text>

      <Switch
        value={darkMode}
        onValueChange={toggleTheme}
        trackColor={{ false: "#d1d5db", true: "#2563eb" }}
      />
    </View>
  );
}
