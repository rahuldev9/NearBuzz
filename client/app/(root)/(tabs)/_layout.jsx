import { MaterialIcons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { useColorScheme } from "nativewind";
import { Image } from "react-native";
import { useAuth } from "../../../context/AuthContext";
export default function TabLayout() {
  const { user, isAuthenticated, isInitializing } = useAuth();
  const { colorScheme } = useColorScheme();

  if (isInitializing) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colorScheme === "dark" ? "#171717" : "#ffffff",
          borderTopColor: colorScheme === "dark" ? "#262626" : "#e5e7eb",
        },
        tabBarActiveTintColor: "#2563eb",
        tabBarInactiveTintColor: colorScheme === "dark" ? "#a3a3a3" : "#6b7280",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: () => null,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          tabBarLabel: () => null,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="search" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="eventpost"
        options={{
          tabBarLabel: () => null,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="event" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="notifications"
        options={{
          tabBarLabel: () => null,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="notifications" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: () => null,
          tabBarIcon: ({ color, size, focused }) =>
            user?.profileImage ? (
              <Image
                source={{ uri: user.profileImage }}
                className="rounded-full"
                style={{
                  width: size + 6,
                  height: size + 6,
                }}
              />
            ) : (
              <MaterialIcons name="person" size={size} color={color} />
            ),
        }}
      />
    </Tabs>
  );
}
