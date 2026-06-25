import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  onRefresh?: () => void;
};

export default function EmptyNotification({ onRefresh }: Props) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <View className="w-28 h-28 rounded-full  items-center justify-center">
        <MaterialIcons name="notifications-none" size={56} color="#2563eb" />
      </View>

      <Text className="text-2xl font-bold text-slate-900 mt-8">
        No Notifications
      </Text>

      <Text className="text-center text-slate-500 mt-3 leading-6">
        You're all caught up.
        {"\n"}
        We'll notify you when something important happens.
      </Text>

      {onRefresh && (
        <TouchableOpacity
          onPress={onRefresh}
          className="bg-blue-600 rounded-xl px-8 py-3 mt-8"
        >
          <Text className="text-white font-semibold">Refresh</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
