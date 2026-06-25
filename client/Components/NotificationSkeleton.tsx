import React from "react";
import { View } from "react-native";

export default function NotificationSkeleton() {
  return (
    <View className="mx-4 mb-3 bg-white rounded-2xl p-4">
      <View className="flex-row">
        <View className="w-12 h-12 rounded-full bg-slate-200" />

        <View className="flex-1 ml-4">
          <View className="w-40 h-5 rounded bg-slate-200" />

          <View className="w-full h-4 rounded bg-slate-200 mt-3" />

          <View className="w-2/3 h-4 rounded bg-slate-200 mt-2" />

          <View className="w-20 h-3 rounded bg-slate-200 mt-4" />
        </View>
      </View>
    </View>
  );
}
