import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FavoritesScreen() {
  const favorites = ["Hyderabad", "Mumbai", "Bengaluru"];

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView className="p-5">
        <Text className="text-3xl font-bold text-slate-900">Favorites</Text>

        {favorites.map((city) => (
          <View
            key={city}
            className="bg-white rounded-2xl p-4 mt-4 flex-row items-center"
          >
            <MaterialIcons name="favorite" size={24} color="red" />
            <Text className="ml-3 text-lg">{city}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
