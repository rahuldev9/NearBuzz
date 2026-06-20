import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const [search, setSearch] = useState("");

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        {/* Header */}
        <View className="px-5 pt-4">
          <Text className="text-3xl font-bold text-slate-900">NearBuzz 👋</Text>
          <Text className="text-slate-500 mt-1">
            {"Discover what's happening around you"}
          </Text>
        </View>

        {/* Search Card */}
        <View className="mx-5 mt-6 bg-white rounded-3xl p-4 shadow-sm">
          <Text className="text-lg font-semibold text-slate-800 mb-3">
            Search City
          </Text>

          <View className="flex-row items-center bg-slate-100 rounded-2xl px-4">
            <MaterialIcons name="search" size={22} color="#64748B" />
            <TextInput
              placeholder="Enter city name..."
              value={search}
              onChangeText={setSearch}
              className="flex-1 h-14 ml-2 text-slate-800"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <TouchableOpacity className="bg-blue-600 h-14 rounded-2xl items-center justify-center mt-4">
            <Text className="text-white font-semibold text-base">Search</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View className="flex-row px-5 mt-6 justify-between">
          <View className="bg-white rounded-2xl p-4 w-[48%]">
            <Text className="text-slate-500">Cities</Text>
            <Text className="text-2xl font-bold text-slate-900 mt-1">120+</Text>
          </View>

          <View className="bg-white rounded-2xl p-4 w-[48%]">
            <Text className="text-slate-500">Events</Text>
            <Text className="text-2xl font-bold text-slate-900 mt-1">5.4K</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-5 mt-8">
          <Text className="text-xl font-bold text-slate-900 mb-4">
            Quick Actions
          </Text>

          <TouchableOpacity className="bg-white rounded-2xl p-4 mb-3 flex-row items-center">
            <MaterialIcons name="location-city" size={28} color="#2563EB" />
            <View className="ml-4">
              <Text className="font-semibold text-slate-900">
                Browse Cities
              </Text>
              <Text className="text-slate-500">Explore trending locations</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="bg-white rounded-2xl p-4 mb-3 flex-row items-center">
            <MaterialIcons name="trending-up" size={28} color="#16A34A" />
            <View className="ml-4">
              <Text className="font-semibold text-slate-900">
                Trending Places
              </Text>
              <Text className="text-slate-500">
                {"See what's popular today"}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="bg-white rounded-2xl p-4 flex-row items-center">
            <MaterialIcons name="notifications" size={28} color="#EA580C" />
            <View className="ml-4">
              <Text className="font-semibold text-slate-900">
                Latest Updates
              </Text>
              <Text className="text-slate-500">Stay informed in real time</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
