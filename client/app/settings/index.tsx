import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../../context/AuthContext";
import AppHeader from "../Components/AppHeader";
import ThemeToggle from "../Components/ThemeToggle";

export default function SettingsScreen() {
  const { signOut, isLoading } = useAuth();
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 dark:bg-neutral-900 dark:text-slate-200">
      <AppHeader title="Settings" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 dark:text-slate-200"
      >
        <View className="px-5 pt-5">
          <Text className="text-3xl font-bold dark:text-slate-200">
            Settings
          </Text>

          <Text className="text-slate-500 mt-1 dark:text-slate-200">
            Manage your NearBuzz account
          </Text>
        </View>

        <View className="px-5 mt-8 ">
          <Text className="text-slate-400 mb-2 ml-1 font-medium dark:text-slate-200">
            ACCOUNT
          </Text>

          <TouchableOpacity
            onPress={() => router.push("/edit-profile")}
            className=" rounded-2xl p-4 flex-row items-center mb-3"
          >
            <MaterialIcons name="person" size={24} color="#2563eb" />

            <Text className="ml-4 text-base flex-1 dark:text-slate-200 ">
              Edit Profile
            </Text>

            <MaterialIcons name="chevron-right" size={22} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/notifications")}
            className=" rounded-2xl p-4 flex-row items-center mb-3"
          >
            <MaterialIcons name="notifications" size={24} color="#2563eb" />

            <Text className="ml-4 flex-1 text-base dark:text-slate-200">
              Notifications
            </Text>

            <MaterialIcons name="chevron-right" size={22} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity className=" rounded-2xl p-4 flex-row items-center mb-3">
            <MaterialIcons name="security" size={24} color="#2563eb" />

            <Text className="ml-4 flex-1 text-base dark:text-slate-200">
              Privacy
            </Text>

            <MaterialIcons name="chevron-right" size={22} color="#94a3b8" />
          </TouchableOpacity>

          <Text className="text-slate-400 mt-5 mb-2 ml-1 font-medium dark:text-slate-200">
            PREFERENCES
          </Text>

          <ThemeToggle />

          <Text className="text-slate-400 mt-5 mb-2 ml-1 font-medium dark:text-slate-200">
            SUPPORT
          </Text>

          <TouchableOpacity className=" rounded-2xl p-4 flex-row items-center mb-3">
            <MaterialIcons name="help-outline" size={24} color="#2563eb" />

            <Text className="ml-4 flex-1 text-base dark:text-slate-200">
              Help & Support
            </Text>

            <MaterialIcons name="chevron-right" size={22} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity className=" rounded-2xl p-4 flex-row items-center mb-3">
            <MaterialIcons name="info-outline" size={24} color="#2563eb" />

            <Text className="ml-4 flex-1 text-base dark:text-slate-200">
              About NearBuzz
            </Text>

            <MaterialIcons name="chevron-right" size={22} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={signOut}
            disabled={isLoading}
            className="bg-red-500 rounded-2xl p-4 items-center mt-8 mb-8"
          >
            <Text className="text-white font-semibold text-base dark:text-slate-200">
              {isLoading ? "Signing out..." : "Logout"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
