import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Platform, RefreshControl, TouchableOpacity, View } from "react-native";

type Props = {
  refreshing: boolean;
  onRefresh: () => void;
};

export default function AppRefresh({ refreshing, onRefresh }: Props) {
  if (Platform.OS === "web") {
    return (
      <View className="absolute top-4 right-4 z-50">
        <TouchableOpacity
          onPress={onRefresh}
          disabled={refreshing}
          className="bg-blue-600 rounded-full p-3 shadow-lg"
        >
          <MaterialIcons
            name={refreshing ? "hourglass-empty" : "refresh"}
            size={22}
            color="white"
          />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      colors={["#2563eb"]}
      tintColor="#2563eb"
    />
  );
}
