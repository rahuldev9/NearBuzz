import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../../context/AuthContext";

export default function SettingsScreen() {
  const { signOut, isLoading } = useAuth();
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1">
      <View className="bg-white border-b border-slate-200 px-5 py-4 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-slate-100"
        >
          <AntDesign name="arrow-left" size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-slate-900">Settings</Text>
        <View className="h-10 w-10" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="px-5 pt-5">
          <Text className="text-3xl font-bold">Settings</Text>

          <Text className="text-slate-500 mt-1">
            Manage your NearBuzz account
          </Text>
        </View>

        <View className="px-5 mt-8">
          <Text className="text-slate-400 mb-2 ml-1 font-medium">ACCOUNT</Text>

          <TouchableOpacity
            onPress={() => router.push("/edit-profile")}
            className="bg-white rounded-2xl p-4 flex-row items-center mb-3"
          >
            <MaterialIcons name="person" size={24} color="#2563eb" />

            <Text className="ml-4 text-base flex-1">Edit Profile</Text>

            <MaterialIcons name="chevron-right" size={22} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity className="bg-white rounded-2xl p-4 flex-row items-center mb-3">
            <MaterialIcons name="notifications" size={24} color="#2563eb" />

            <Text className="ml-4 flex-1 text-base">Notifications</Text>

            <MaterialIcons name="chevron-right" size={22} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity className="bg-white rounded-2xl p-4 flex-row items-center mb-3">
            <MaterialIcons name="security" size={24} color="#2563eb" />

            <Text className="ml-4 flex-1 text-base">Privacy</Text>

            <MaterialIcons name="chevron-right" size={22} color="#94a3b8" />
          </TouchableOpacity>

          <Text className="text-slate-400 mt-5 mb-2 ml-1 font-medium">
            PREFERENCES
          </Text>

          <View className="bg-white rounded-2xl p-4 flex-row items-center mb-3">
            <MaterialIcons name="dark-mode" size={24} color="#2563eb" />

            <Text className="ml-4 flex-1 text-base">Dark Mode</Text>

            <Switch value={false} onValueChange={() => {}} />
          </View>

          <Text className="text-slate-400 mt-5 mb-2 ml-1 font-medium">
            SUPPORT
          </Text>

          <TouchableOpacity className="bg-white rounded-2xl p-4 flex-row items-center mb-3">
            <MaterialIcons name="help-outline" size={24} color="#2563eb" />

            <Text className="ml-4 flex-1 text-base">Help & Support</Text>

            <MaterialIcons name="chevron-right" size={22} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity className="bg-white rounded-2xl p-4 flex-row items-center mb-3">
            <MaterialIcons name="info-outline" size={24} color="#2563eb" />

            <Text className="ml-4 flex-1 text-base">About NearBuzz</Text>

            <MaterialIcons name="chevron-right" size={22} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={signOut}
            disabled={isLoading}
            className="bg-red-500 rounded-2xl p-4 items-center mt-8 mb-8"
          >
            <Text className="text-white font-semibold text-base">
              {isLoading ? "Signing out..." : "Logout"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
