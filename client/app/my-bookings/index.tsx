import { getMyBookings } from "@/services/eventService";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MyBookingsScreen() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const response = await getMyBookings();

      setBookings(response.bookings || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadBookings();
  };

  const handleBookingPress = (bookingId: string) => {
    router.push(`/booking-success/${bookingId}`);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#2563EB" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="bg-white border-b border-slate-200 px-5 py-4 flex-row items-center">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-10 w-10 rounded-full bg-slate-100 items-center justify-center"
        >
          <AntDesign name="arrow-left" size={20} color="#0F172A" />
        </TouchableOpacity>

        <Text className="ml-4 text-xl font-bold text-slate-900">
          My Bookings
        </Text>
      </View>

      <FlatList
        data={bookings}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{
          padding: 16,
          flexGrow: bookings.length === 0 ? 1 : undefined,
        }}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center">
            <MaterialIcons name="event-busy" size={90} color="#CBD5E1" />

            <Text className="text-lg font-semibold text-slate-700 mt-4">
              No Bookings Yet
            </Text>

            <Text className="text-slate-500 mt-2 text-center px-10">
              Book an event to see your QR passes here.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => handleBookingPress(item._id)}
            className="bg-white rounded-3xl p-5 mb-4"
            style={{
              shadowColor: "#000",
              shadowOpacity: 0.05,
              shadowRadius: 10,
              elevation: 2,
            }}
          >
            {/* Top Row */}
            <View className="flex-row justify-between items-start">
              <View className="flex-1 pr-3">
                <Text
                  className="text-lg font-bold text-slate-900"
                  numberOfLines={1}
                >
                  {item.eventId?.title}
                </Text>

                <Text className="text-slate-500 mt-1" numberOfLines={1}>
                  {item.eventId?.category}
                </Text>
              </View>

              <View className="bg-green-100 px-3 py-1 rounded-full">
                <Text className="text-green-700 text-xs font-semibold">
                  {item.bookingStatus}
                </Text>
              </View>
            </View>

            {/* Venue */}
            <View className="mt-4 flex-row items-center">
              <MaterialIcons name="location-on" size={18} color="#2563EB" />

              <Text className="ml-2 flex-1 text-slate-600" numberOfLines={1}>
                {item.eventId?.venueName}
              </Text>
            </View>

            {/* Date */}
            {item.eventId?.startDate && (
              <View className="mt-3 flex-row items-center">
                <MaterialIcons name="schedule" size={18} color="#2563EB" />

                <Text className="ml-2 text-slate-600">
                  {new Date(item.eventId.startDate).toLocaleDateString()}
                </Text>
              </View>
            )}

            {/* Footer */}
            <View className="mt-5 pt-4 border-t border-slate-100 flex-row items-center justify-between">
              <Text className="text-blue-600 font-semibold">View QR Pass</Text>

              <AntDesign size={18} color="#2563EB" />
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
