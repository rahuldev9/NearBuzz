import { MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppMap from "@/Components/AppMap.web";

export default function SearchScreen() {
  const [search, setSearch] = useState("");

  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});

      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
    } catch (error) {
      console.log("Location Error:", error);
    }
  };

  return (
    <SafeAreaView className="flex-1">
      {!location ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <>
          {/* Full Screen Map */}
          <View className="absolute inset-0">
            <AppMap
              latitude={location.latitude}
              longitude={location.longitude}
              height={1000}
            />
          </View>

          {/* Floating Search Bar */}
          <View className="absolute top-4 left-4 right-4">
            <View className="flex-row items-center bg-white rounded-2xl px-4 h-14 shadow">
              <MaterialIcons name="search" size={22} color="#64748B" />

              <TextInput
                placeholder="Search city..."
                value={search}
                onChangeText={setSearch}
                className="flex-1 ml-2"
              />
            </View>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
