import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";

export default function ProfileScreen() {
  const { user, signOut, isLoading } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="items-center pt-10">
        <View className="w-28 h-28 rounded-full bg-blue-500 items-center justify-center">
          <Text className="text-white text-4xl font-bold">
            {user?.name?.[0] ?? "N"}
          </Text>
        </View>

        <Text className="text-2xl font-bold mt-4">
          {user?.name ?? "NearBuzz User"}
        </Text>

        <Text className="text-slate-500">
          {user?.email ?? "user@example.com"}
        </Text>
      </View>

      <View className="px-5 mt-10">
        <TouchableOpacity className="bg-white rounded-2xl p-4 flex-row items-center mb-3">
          <MaterialIcons name="person" size={24} />
          <Text className="ml-3">Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity className="bg-white rounded-2xl p-4 flex-row items-center mb-3">
          <MaterialIcons name="settings" size={24} />
          <Text className="ml-3">Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={signOut}
          disabled={isLoading}
          className="bg-red-500 rounded-2xl p-4 items-center mt-4"
        >
          <Text className="text-white font-semibold">
            {isLoading ? "Signing out..." : "Logout"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
