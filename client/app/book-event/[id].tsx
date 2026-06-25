import ConfirmDialog from "@/Components/ConfirmDialog";
import { bookEvent, getEvent, getMyBookings } from "@/services/eventService";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BookEventScreen() {
  const router = useRouter();

  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [existingBooking, setExistingBooking] = useState<any | null>(null);
  useEffect(() => {
    loadEvent();
  }, [id]);

  const loadEvent = async () => {
    try {
      if (!id) return;

      const data = await getEvent(id);
      setEvent(data);
      // check if current user already booked this event
      try {
        const mb = await getMyBookings();
        const found = (mb.bookings || []).find((b: any) => {
          const bid = b.eventId?._id || b.eventId;
          return bid === data._id || bid === id;
        });

        setExistingBooking(found || null);
      } catch (err) {
        console.log("Failed to check existing bookings", err);
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Unable to load event");
    } finally {
      setLoading(false);
    }
  };

  const handleBook = () => {
    setShowConfirmDialog(true);
  };

  const confirmBooking = async () => {
    try {
      setBooking(true);

      const response = await bookEvent(event._id);

      setShowConfirmDialog(false);

      router.replace({
        pathname: "/booking-success/[id]",
        params: {
          id: response.booking._id,
        },
      });
    } catch (error: any) {
      console.log(error);

      setShowConfirmDialog(false);

      Alert.alert(
        "Booking Failed",
        error?.message || "Unable to book this event",
      );
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <Text>Event not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ConfirmDialog
        visible={showConfirmDialog}
        loading={booking}
        title="Confirm Booking"
        message={`Do you want to book "${event?.title}"?`}
        confirmText="Book Event"
        cancelText="Cancel"
        onCancel={() => {
          if (!booking) {
            setShowConfirmDialog(false);
          }
        }}
        onConfirm={confirmBooking}
      />
      <View className="bg-white border-b border-slate-200 px-5 py-4 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-slate-100"
        >
          <AntDesign name="arrow-left" size={20} color="#0F172A" />
        </TouchableOpacity>

        <Text className="text-lg font-semibold">Book Event</Text>

        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-5 py-5">
        <View className="bg-white rounded-3xl p-5">
          <Text className="text-3xl font-bold text-slate-900">
            {event.title}
          </Text>

          <View className="self-start mt-3 bg-blue-100 px-3 py-1 rounded-full">
            <Text className="text-blue-700 font-semibold">{event.status}</Text>
          </View>

          <Text className="text-slate-500 mt-2">{event.category}</Text>

          <Text className="text-slate-700 mt-4 leading-6">
            {event.description}
          </Text>
        </View>

        <View className="bg-white rounded-3xl p-5 mt-4">
          <View className="flex-row items-center">
            <MaterialIcons name="location-on" size={20} color="#2563EB" />

            <Text className="ml-2 font-semibold">Venue</Text>
          </View>

          <Text className="mt-3 text-slate-900">{event.venueName}</Text>

          <Text className="text-slate-500 mt-1">{event.address}</Text>
        </View>

        {/* <View className="bg-white rounded-3xl p-5 mt-4">
          <Text className="font-semibold">Event Code</Text>

          <Text className="text-blue-600 text-xl font-bold mt-2">
            {event.eventId}
          </Text>
        </View> */}

        <View className="bg-white rounded-3xl p-5 mt-4">
          <Text className="font-semibold">Date & Time</Text>

          <Text className="mt-2 text-slate-700">
            {new Date(event.startDate).toLocaleString()}
          </Text>
        </View>

        <TouchableOpacity
          disabled={booking}
          onPress={
            existingBooking
              ? () => router.push({ pathname: "/my-bookings" })
              : handleBook
          }
          className={`mt-8 rounded-2xl py-4 ${
            booking ? "bg-blue-900" : "bg-blue-800"
          }`}
        >
          <Text className="text-center text-white text-lg font-bold">
            {booking
              ? "Booking..."
              : existingBooking
                ? "View Booking"
                : "Book Event"}
          </Text>
        </TouchableOpacity>

        {existingBooking && (
          <View className="mt-4 px-4 py-3 bg-white rounded-2xl">
            <Text className="font-semibold">You already booked this event</Text>
            <Text className="text-slate-600 mt-1">
              Status: {existingBooking.bookingStatus || "Booked"}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
