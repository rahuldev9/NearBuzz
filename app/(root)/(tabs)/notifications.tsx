import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotificationsScreen() {
  const notifications = [
    "New event added in Hyderabad",
    "Mumbai trending today",
    "Weather alert in Bengaluru",
  ];

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView className="p-5">
        <Text className="text-3xl font-bold text-slate-900">Notifications</Text>

        {notifications.map((item, index) => (
          <View key={index} className="bg-white rounded-2xl p-4 mt-4 flex-row">
            <MaterialIcons name="notifications" size={24} color="#F59E0B" />
            <Text className="ml-3 flex-1">{item}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
