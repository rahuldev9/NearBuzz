import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { MdOutlineDone } from "react-icons/md";
import { ActivityIndicator, Image, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getBookingById } from "@/services/eventService";
import AppHeader from "../Components/AppHeader";

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
    <SafeAreaView className="flex-1 bg-white dark:bg-neutral-900">
      <AppHeader title="My Bookings" />

      <ScrollView
        className="flex-1 px-5 py-6"
        contentContainerStyle={{
          alignItems: "center",
        }}
      >
        <View className="h-24 w-24 rounded-full bg-green-50 dark:bg-neutral-800 items-center justify-center">
          <MdOutlineDone size={46} color="#16A34A" />
        </View>

        <Text className="text-3xl font-bold dark:text-slate-200 mt-6">
          Booking Confirmed
        </Text>

        <Text className=" dark:text-slate-200 mt-2 text-center">
          Show this QR code at the event entrance.
        </Text>

        <View className="rounded-3xl p-6 mt-8 w-full items-center">
          <Image
            source={{
              uri: booking.qrCode,
            }}
            style={{
              width: 250,
              height: 250,
            }}
          />

          <View
            className={`mt-5 px-4 py-2 rounded-full ${
              booking.qrStatus === "Active"
                ? "bg-green-100 dark:bg-green-900/40"
                : "bg-red-100 dark:bg-red-900/40"
            }`}
          >
            <Text
              className={`font-semibold ${
                booking.qrStatus === "Active"
                  ? "text-green-700 dark:text-green-300"
                  : "text-red-700 dark:text-red-300"
              }`}
            >
              {booking.qrStatus}
            </Text>
          </View>

          <Text className="mt-6 text-sm  dark:text-slate-200">
            Registered Email
          </Text>

          <Text className="font-medium text-slate-900 dark:text-slate-100 mt-1">
            {booking.userEmail}
          </Text>
        </View>

        {/* <TouchableOpacity
        onPress={() => router.replace("/")}
        className="bg-blue-600 rounded-2xl py-4 px-10 mt-8"
      >
        <Text className="text-white font-bold">
          Back to Home
        </Text>
      </TouchableOpacity> */}
      </ScrollView>
    </SafeAreaView>
  );
}
