import { AntDesign } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { MdOutlineDone } from "react-icons/md";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getBookingById } from "@/services/eventService";

export default function BookingSuccessScreen() {
  const router = useRouter();

  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBooking();
  }, [id]);

  const loadBooking = async () => {
    try {
      if (!id) return;

      const data = await getBookingById(id);

      setBooking(data.booking || data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
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
      <ScrollView
        className="flex-1 px-5 py-6"
        contentContainerStyle={{
          alignItems: "center",
        }}
      >
        <View className="h-24 w-24 rounded-full bg-green-100 items-center justify-center">
          <MdOutlineDone size={46} color="#16A34A" />
        </View>

        <Text className="text-3xl font-bold text-slate-900 mt-6">
          Booking Confirmed
        </Text>

        <Text className="text-slate-500 mt-2 text-center">
          Show this QR code at the event entrance.
        </Text>

        <View className="bg-white rounded-3xl p-6 mt-8 w-full items-center">
          <Image
            source={{
              uri: booking.qrCode,
            }}
            style={{
              width: 250,
              height: 250,
            }}
          />

          {/* <Text className="mt-6 text-sm text-slate-500">Event Code</Text>

          <Text className="text-xl font-bold text-blue-600">
            {booking.eventCode}
          </Text> */}
          <View
            className={`px-3 py-1 rounded-full ${
              booking.qrStatus === "Active" ? "bg-green-100" : "bg-red-100"
            }`}
          >
            <Text
              className={`font-semibold ${
                booking.qrStatus === "Active"
                  ? "text-green-700"
                  : "text-red-700"
              }`}
            >
              {booking.qrStatus}
            </Text>
          </View>

          <Text className="mt-4 text-sm text-slate-500">Registered Email</Text>

          <Text className="font-medium">{booking.userEmail}</Text>
        </View>

        {/* <TouchableOpacity
          onPress={() => router.replace("/")}
          className="bg-blue-600 rounded-2xl py-4 px-10 mt-8"
        >
          <Text className="text-white font-bold">Back to Home</Text>
        </TouchableOpacity> */}
      </ScrollView>
    </SafeAreaView>
  );
}
