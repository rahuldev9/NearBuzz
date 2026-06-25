import React from "react";
import { View } from "react-native";

export default function NotificationSkeleton() {
  return (
    <View className="mx-4 mb-4 rounded-3xl border border-slate-200 bg-white p-4">
      <View className="flex-row">
        {/* Icon */}
        <View className="w-14 h-14 rounded-2xl bg-slate-200" />

        {/* Content */}
        <View className="flex-1 ml-4">
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <View className="h-5 w-40 rounded-full bg-slate-200" />

            <View className="h-9 w-9 rounded-full bg-slate-200" />
          </View>

          {/* Message */}
          <View className="mt-4 h-4 w-full rounded-full bg-slate-200" />
          <View className="mt-2 h-4 w-11/12 rounded-full bg-slate-200" />
          <View className="mt-2 h-4 w-8/12 rounded-full bg-slate-200" />

          {/* Badges */}
          <View className="mt-4 flex-row">
            <View className="h-7 w-24 rounded-full bg-slate-200" />
            <View className="ml-2 h-7 w-28 rounded-full bg-slate-200" />
          </View>

          {/* Footer */}
          <View className="mt-5 flex-row items-center justify-between">
            <View className="h-3 w-20 rounded-full bg-slate-200" />

            <View className="flex-row items-center">
              <View className="h-2 w-2 rounded-full bg-slate-300" />
              <View className="ml-2 h-3 w-12 rounded-full bg-slate-200" />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
