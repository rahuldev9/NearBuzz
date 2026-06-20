import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SearchScreen() {
  const [search, setSearch] = useState("");

  const cities = [
    "Hyderabad",
    "Mumbai",
    "Delhi",
    "Bengaluru",
    "Chennai",
    "Pune",
  ];

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="p-5">
        <Text className="text-3xl font-bold text-slate-900">Search</Text>

        <View className="mt-5 flex-row items-center bg-white rounded-2xl px-4 h-14">
          <MaterialIcons name="search" size={22} color="#64748B" />
          <TextInput
            placeholder="Search city..."
            value={search}
            onChangeText={setSearch}
            className="flex-1 ml-2"
          />
        </View>

        <Text className="text-lg font-semibold mt-6 mb-3">Popular Cities</Text>

        <FlatList
          data={cities}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity className="bg-white p-4 rounded-xl mb-3">
              <Text>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
}
