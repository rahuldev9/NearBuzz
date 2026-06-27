import { useAuth } from "@/context/AuthContext";
import {
  Booking,
  Event,
  deleteBooking,
  getEvent,
  getEventBookings,
  updateEvent,
} from "@/services/eventService";
import { MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppHeader from "../Components/AppHeader";

export default function EventDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"Scheduled" | "Live" | "Closed">(
    "Scheduled",
  );
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState<string | null>(null);
  const [bookingMessage, setBookingMessage] = useState<string | null>(null);
  const [deletingBookingId, setDeletingBookingId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const loadEvent = async () => {
      if (!id) {
        setError("Event not found.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getEvent(id);
        setEvent(data);
        setStatus(data.status ?? "Scheduled");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load event details.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [id]);

  useEffect(() => {
    if (!event || !user) {
      return;
    }

    const eventOwnerId = String(event.userId || "");

    if (eventOwnerId !== user.id) {
      setBookings([]);
      setBookingsError(null);
      return;
    }

    const loadBookings = async () => {
      setBookingsLoading(true);
      setBookingsError(null);
      setBookingMessage(null);

      try {
        const data = await getEventBookings(id as string);
        setBookings(data.bookings || []);
      } catch (err) {
        setBookingsError(
          err instanceof Error ? err.message : "Unable to load event bookings.",
        );
      } finally {
        setBookingsLoading(false);
      }
    };

    loadBookings();
  }, [event, user, id]);

  const formattedDate = event?.startDate
    ? new Date(event.startDate).toLocaleString()
    : "";

  const isEventOwner =
    !!event && !!user && String(event.userId || "") === user.id;

  const handleDeleteBooking = async (bookingId: string) => {
    if (!bookingId || deletingBookingId) {
      return;
    }

    setDeletingBookingId(bookingId);
    setBookingMessage(null);

    try {
      await deleteBooking(bookingId);
      setBookings((prev) => prev.filter((item) => item._id !== bookingId));
      setBookingMessage("Booking deleted successfully.");
    } catch (err) {
      setBookingMessage(
        err instanceof Error
          ? err.message
          : "Unable to delete booking. Please try again.",
      );
    } finally {
      setDeletingBookingId(null);
    }
  };

  const handleStatusChange = async (
    selectedStatus: "Scheduled" | "Live" | "Closed",
  ) => {
    if (!id || !event || saving) return;

    setStatus(selectedStatus);
    setSaving(true);
    setStatusMessage(null);

    try {
      const payload: Record<string, unknown> = {
        status: selectedStatus,
      };

      if (selectedStatus === "Live") {
        const { status: permissionStatus } =
          await Location.requestForegroundPermissionsAsync();

        if (permissionStatus !== "granted") {
          setStatusMessage("Location permission is required for live events.");
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        payload.latitude = location.coords.latitude;
        payload.longitude = location.coords.longitude;
      }

      await updateEvent(id, payload);

      const updatedEvent = await getEvent(id);
      setEvent(updatedEvent);

      setStatusMessage("Status updated successfully.");
    } catch (err) {
      setStatusMessage(
        err instanceof Error ? err.message : "Unable to update event status.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-neutral-900">
      <AppHeader title="Event Details" />

      <ScrollView
        className="flex-1 px-5 py-6"
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        ) : error ? (
          <View className="bg-white rounded-3xl p-6">
            <Text className="text-red-600 text-center">{error}</Text>
          </View>
        ) : !event ? (
          <View className=" dark:bg-neutral-900rounded-3xl p-6">
            <Text className=" dark:text-slate-200 text-center">
              Event not available.
            </Text>
          </View>
        ) : (
          <View className="rounded-3xl p-6 shadow-sm">
            {/* Event Header */}
            <View className="flex-row justify-between items-start">
              <View className="flex-1">
                <Text className="text-3xl font-bold dark:text-slate-200">
                  {event.title}
                </Text>

                <Text className="dark:text-slate-200 mt-2">
                  {event.category}
                </Text>
              </View>

              <View
                className={`px-4 py-2 rounded-full ${
                  status === "Live"
                    ? "bg-green-100"
                    : status === "Closed"
                      ? "bg-red-100"
                      : "bg-amber-100"
                }`}
              >
                <Text
                  className={`font-semibold text-xs ${
                    status === "Live"
                      ? "text-green-700"
                      : status === "Closed"
                        ? "text-red-700"
                        : "text-amber-700"
                  }`}
                >
                  {status}
                </Text>
              </View>
            </View>

            {/* Description */}
            <View className="mt-6">
              <Text className="text-lg font-bold dark:text-slate-200">
                Description
              </Text>

              <Text className="dark:text-slate-200 mt-2 leading-6">
                {event.description}
              </Text>
            </View>

            {/* Event Details */}
            <View className="mt-6 dark:bg-neutral-900 rounded-2xl p-4">
              <View className="flex-row items-start">
                <MaterialIcons name="location-on" size={22} color="#2563EB" />

                <View className="ml-3 flex-1">
                  <Text className="font-semibold dark:text-slate-200">
                    Venue
                  </Text>

                  <Text className="dark:text-slate-200 mt-1">
                    {event.venueName}
                  </Text>

                  <Text className="dark:text-slate-200 text-sm">
                    {event.address}
                  </Text>
                </View>
              </View>

              <View className="h-px dark:bg-neutral-900 my-4" />

              <View className="flex-row items-start">
                <MaterialIcons name="schedule" size={22} color="#2563EB" />

                <View className="ml-3">
                  <Text className="font-semibold dark:text-slate-200">
                    Date & Time
                  </Text>

                  <Text className="dark:text-slate-200 mt-1">
                    {formattedDate}
                  </Text>
                </View>
              </View>
            </View>

            {/* Scan QR Button */}
            <TouchableOpacity
              onPress={() => router.push("/scan-qr")}
              className="bg-blue-800 active:bg-blue-900 rounded-2xl p-4 mt-6 flex-row items-center justify-center"
            >
              <MaterialIcons name="qr-code-scanner" size={22} color="white" />

              <Text className="text-white font-bold ml-2 text-base">
                Scan Attendee QR
              </Text>
            </TouchableOpacity>

            {/* Status Controls */}
            <View className="mt-6">
              <Text className="font-bold text-slate-900 dark:text-white mb-3 text-lg">
                Event Status
              </Text>

              <View className="flex-row bg-slate-100 dark:bg-neutral-800 rounded-2xl p-1">
                {(["Scheduled", "Live", "Closed"] as const).map((option) => (
                  <TouchableOpacity
                    key={option}
                    disabled={saving}
                    onPress={() => handleStatusChange(option)}
                    className={`flex-1 py-3 rounded-xl items-center ${
                      status === option
                        ? "bg-white dark:bg-neutral-700 shadow-sm"
                        : ""
                    }`}
                  >
                    <Text
                      className={`font-semibold ${
                        status === option
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-slate-500 dark:text-slate-300"
                      }`}
                    >
                      {saving && status === option ? "..." : option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {statusMessage ? (
                <View className="bg-blue-50 dark:bg-blue-950 rounded-xl p-3 mt-3">
                  <Text className="text-blue-700 dark:text-blue-300 text-sm">
                    {statusMessage}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        )}
        {isEventOwner ? (
          <View className="mt-6 rounded-3xl p-5 shadow-sm">
            <Text className="text-lg font-bold dark:text-slate-200 mb-4">
              Event Bookings
            </Text>

            {bookingsLoading ? (
              <View className="items-center py-8">
                <ActivityIndicator size="large" color="#2563EB" />
              </View>
            ) : bookingsError ? (
              <View className="rounded-3xl bg-red-50 p-4">
                <Text className="text-red-700 text-center">
                  {bookingsError}
                </Text>
              </View>
            ) : bookings.length === 0 ? (
              <View className="rounded-3xl dark:bg-neutral-900 p-4">
                <Text className="dark:text-slate-200 text-center">
                  No bookings yet for this event.
                </Text>
              </View>
            ) : (
              <View className="mt-4 rounded-3xl overflow-hidden">
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View>
                    {/* Table Header */}
                    <View className="flex-row  border-b border-slate-200">
                      <Text className="w-40 px-4 py-3 font-bold dark:text-slate-200">
                        Name
                      </Text>
                      <Text className="w-56 px-4 py-3 font-bold dark:text-slate-200">
                        Email
                      </Text>
                      <Text className="w-28 px-4 py-3 font-bold dark:text-slate-200">
                        QR Status
                      </Text>
                      <Text className="w-32 px-4 py-3 font-bold dark:text-slate-200">
                        Booking
                      </Text>
                      <Text className="w-44 px-4 py-3 font-bold dark:text-slate-200">
                        Date
                      </Text>
                      <Text className="w-28 px-4 py-3 font-bold dark:text-slate-200">
                        Action
                      </Text>
                    </View>

                    {/* Table Rows */}
                    {bookings.map((booking, index) => {
                      const attendeeName =
                        typeof booking.userId === "object"
                          ? booking.userId.name || booking.userId.email
                          : booking.userEmail;

                      return (
                        <View
                          key={booking._id}
                          className={`flex-row border-b border-slate-100 ${
                            index % 2 === 0
                              ? "dark:bg-neutral-900"
                              : "dark:bg-neutral-800"
                          }`}
                        >
                          <Text
                            numberOfLines={1}
                            className="w-40 px-4 py-4 dark:text-slate-200 font-medium"
                          >
                            {attendeeName}
                          </Text>

                          <Text
                            numberOfLines={1}
                            className="w-56 px-4 py-4 dark:text-slate-200"
                          >
                            {booking.userEmail}
                          </Text>

                          <View className="w-28 px-4 py-4">
                            <View
                              className={`rounded-full px-3 py-1 self-start ${
                                booking.qrStatus === "Expired"
                                  ? "bg-red-100"
                                  : "bg-green-100"
                              }`}
                            >
                              <Text
                                className={`text-xs font-semibold ${
                                  booking.qrStatus === "Expired"
                                    ? "text-red-700"
                                    : "text-green-700"
                                }`}
                              >
                                {booking.qrStatus}
                              </Text>
                            </View>
                          </View>

                          <Text className="w-32 px-4 py-4 dark:text-slate-200">
                            {booking.bookingStatus}
                          </Text>

                          <Text className="w-44 px-4 py-4 dark:text-slate-200 text-xs">
                            {new Date(booking.createdAt).toLocaleDateString()}
                          </Text>

                          <View className="w-28 px-4 py-3">
                            <TouchableOpacity
                              disabled={deletingBookingId === booking._id}
                              onPress={() => handleDeleteBooking(booking._id)}
                              className="bg-red-600 rounded-xl py-2"
                            >
                              <Text className="text-center text-white font-semibold text-sm">
                                {deletingBookingId === booking._id
                                  ? "Deleting..."
                                  : "Delete"}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>
            )}

            {bookingMessage ? (
              <View className="mt-4 rounded-3xl bg-blue-50 p-4">
                <Text className="text-blue-700 text-sm text-center">
                  {bookingMessage}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
