import AssistantChatModal from "@/Components/AssistantChatModal";
import { useAuth } from "@/context/AuthContext";
import { getRecommendedEvents } from "@/services/aiService";
import { getMyBookings, getMyEvents } from "@/services/eventService";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function HomeScreen() {
  const { user } = useAuth();
  const { colorScheme } = useColorScheme();
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingCount, setBookingCount] = useState(0);
  const [checkedInCount, setCheckedInCount] = useState(0);
  const [eventsCount, seteventsCount] = useState(0);
  const [recommendedEvents, setRecommendedEvents] = useState<any[]>([]);
  const [showAssistant, setShowAssistant] = useState(false);
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        loadBookings(),
        loadLatestEvent(),
        loadRecommendations(),
      ]);
    };

    loadData();
  }, []);
  const [latestBooking, setLatestBooking] = useState<any | null>(null);
  const [latestEvent, setLatestEvent] = useState<any | null>(null);
  const loadBookings = async () => {
    try {
      const response = await getMyBookings();

      const bookings = response.bookings || [];

      setBookings(bookings);
      setBookingCount(bookings.length);
      const latest = [...bookings].sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )[0];

      setLatestBooking(latest);
      const count = bookings.filter(
        (booking: any) => booking.bookingStatus === "CheckedIn",
      ).length;
      setCheckedInCount(count);
    } catch (error) {
      console.log(error);
    }
  };
  const loadLatestEvent = async () => {
    try {
      const response = await getMyEvents();

      const events = Array.isArray(response) ? response : response.data || [];

      const latest = [...events].sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )[0];

      seteventsCount(events.length);
      setLatestEvent(latest);
    } catch (error) {
      console.log(error);
    }
  };

  const loadRecommendations = async () => {
    try {
      const response = await getRecommendedEvents();
      setRecommendedEvents(Array.isArray(response) ? response : []);
    } catch (error) {
      console.log(error);
    }
  };

  const openAssistant = () => {
    setShowAssistant(true);
  };
  const handleBookingPress = (bookingId: string) => {
    router.push(`/booking-success/${bookingId}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-neutral-900">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={["#1e40af", "#1e3a8a"]}
          className="rounded-b-[35px] px-6 pt-14 pb-8"
        >
          <TouchableOpacity
            onPress={() => router.push("/settings")}
            className="absolute top-14 right-5"
          >
            <MaterialIcons name="settings" size={24} color="white" />
          </TouchableOpacity>

          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.push("/profile")}>
              {user?.profileImage ? (
                <Image
                  source={{ uri: user.profileImage }}
                  className="w-20 h-20 rounded-full border-2 border-white"
                />
              ) : (
                <View className="w-20 h-20 rounded-full border-2 border-white justify-center items-center">
                  <Text className="text-3xl font-bold text-white">
                    {user?.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <View className="ml-4">
              <Text className="text-white text-2xl font-bold">
                {user?.name}
              </Text>

              <View className="flex-row items-center mt-1">
                <MaterialIcons name="phone" size={16} color="white" />

                <Text className="text-white ml-2">
                  {user?.phone || "No phone added"}
                </Text>
              </View>
            </View>
          </View>

          {/* Stats */}
          <View className="bg-white/15 rounded-3xl mt-8 flex-row justify-around py-5">
            <TouchableOpacity onPress={() => router.push("/my-bookings")}>
              <View className="items-center">
                <Text className="text-white text-2xl font-bold">
                  {bookingCount}
                </Text>
                <Text className="text-white/80">Bookings</Text>
              </View>
            </TouchableOpacity>

            <View className="w-px bg-white/30" />
            <TouchableOpacity onPress={() => router.push("/my-bookings")}>
              <View className="items-center">
                <Text className="text-white text-2xl font-bold">
                  {checkedInCount}
                </Text>
                <Text className="text-white/80">Attended</Text>
              </View>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Action Card */}
        <View className="mx-5 -mt-4 bg-white dark:bg-neutral-800 rounded-3xl p-5 shadow-lg">
          <View className="flex-row justify-between items-center">
            <Text className="text-xl font-bold dark:text-slate-200">
              Action Required
            </Text>

            <View className="bg-indigo-700 w-8 h-8 rounded-full items-center justify-center">
              <Text className="text-white font-bold">3</Text>
            </View>
          </View>

          <TouchableOpacity className="rounded-2xl p-4 mt-5 flex-row items-center">
            <View className="w-14 h-14 rounded-full bg-green-100 items-center justify-center">
              <MaterialIcons name="verified-user" size={30} color="#16A34A" />
            </View>

            <View className="ml-4 flex-1">
              <Text className="font-bold text-lg dark:text-slate-200">
                Verify Profile
              </Text>

              <Text className="dark:text-slate-200">
                Complete your profile verification
              </Text>
            </View>

            <MaterialIcons name="chevron-right" size={28} color="#999" />
          </TouchableOpacity>
        </View>

        {recommendedEvents.length > 0 ? (
          <View className="px-5 mt-8">
            <View className="flex-row justify-between items-center mb-5">
              <Text className="text-2xl font-bold dark:text-slate-200">
                Recommended For You
              </Text>
            </View>
            {recommendedEvents.map((event) => (
              <TouchableOpacity
                key={event.title + event.venueName}
                activeOpacity={0.9}
                onPress={() =>
                  router.push({
                    pathname: "/search",
                  })
                }
                className="mb-4 rounded-3xl overflow-hidden bg-white dark:bg-neutral-800 shadow-lg"
              >
                <View className="p-5">
                  <Text className="text-xl font-bold dark:text-slate-100">
                    {event.title}
                  </Text>
                  <View className="self-start mt-2 bg-indigo-100 dark:bg-indigo-900 rounded-full px-3 py-1">
                    <Text className="text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
                      {event.category}
                    </Text>
                  </View>
                  <Text
                    className="mt-3 text-slate-600 dark:text-slate-300 leading-6"
                    numberOfLines={3}
                  >
                    {event.description}
                  </Text>
                  <View className="flex-row items-center mt-4">
                    <MaterialIcons
                      name="location-on"
                      size={16}
                      color="#64748B"
                    />
                    <Text className="ml-2 text-slate-700 dark:text-slate-200">
                      {event.venueName || event.address || "Local venue"}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        {/* Activities */}
        <View className="px-5 mt-8">
          <View className="flex-row justify-between items-center mb-5">
            <Text className="text-2xl font-bold dark:text-slate-200">
              Recent Activities
            </Text>

            <TouchableOpacity>
              <Text className="text-indigo-600 font-semibold">See all</Text>
            </TouchableOpacity>
          </View>
          {latestBooking && (
            <TouchableOpacity
              onPress={() => handleBookingPress(latestBooking._id)}
              className="dark:bg-neutral-800 bg-white rounded-3xl p-4 mb-5 flex-row shadow-lg"
            >
              <Image
                source={{ uri: latestBooking.qrCode }}
                className="w-24 h-24 rounded-2xl"
              />

              <View className="flex-1 ml-4 justify-center">
                <Text className="text-xl font-bold dark:text-slate-200">
                  {latestBooking.eventId.title}
                </Text>

                <Text className="text-indigo-500 mt-1">
                  {latestBooking.eventId.category}
                </Text>

                <TouchableOpacity className="bg-indigo-700 rounded-full px-5 py-2 self-start mt-4">
                  <Text className="text-white font-semibold">
                    {latestBooking.bookingStatus}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
          {latestEvent && (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() =>
                router.push({
                  pathname: "/event-details/[id]",
                  params: { id: latestEvent._id },
                })
              }
              className="mb-6 rounded-3xl overflow-hidden bg-white dark:bg-neutral-800 shadow-lg"
            >
              {/* Banner Image */}
              {latestEvent.image ? (
                <Image
                  source={{ uri: latestEvent.image }}
                  className="w-full h-52"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-full h-52 bg-slate-200 dark:bg-neutral-700 justify-center items-center">
                  <MaterialIcons name="event" size={60} color="#2563EB" />
                </View>
              )}

              {/* Content */}
              <View className="p-5">
                {/* Title & Status */}
                <View className="flex-row justify-between items-start">
                  <View className="flex-1 pr-3">
                    <Text
                      numberOfLines={2}
                      className="text-2xl font-bold text-slate-900 dark:text-white"
                    >
                      {latestEvent.title}
                    </Text>

                    <View className="self-start mt-3 bg-blue-100 dark:bg-blue-900 rounded-full px-3 py-1">
                      <Text className="text-blue-700 dark:text-blue-300 text-xs font-semibold">
                        {latestEvent.category}
                      </Text>
                    </View>
                  </View>

                  <View
                    className={`rounded-full px-3 py-1 ${
                      latestEvent.status === "Live"
                        ? "bg-green-100 dark:bg-green-900"
                        : latestEvent.status === "Closed"
                          ? "bg-red-100 dark:bg-red-900"
                          : "bg-yellow-100 dark:bg-yellow-900"
                    }`}
                  >
                    <Text
                      className={`font-semibold text-xs ${
                        latestEvent.status === "Live"
                          ? "text-green-700 dark:text-green-300"
                          : latestEvent.status === "Closed"
                            ? "text-red-700 dark:text-red-300"
                            : "text-yellow-700 dark:text-yellow-300"
                      }`}
                    >
                      {latestEvent.status}
                    </Text>
                  </View>
                </View>

                {/* Description */}
                <Text
                  numberOfLines={3}
                  className="mt-4 text-slate-600 dark:text-slate-300 leading-6"
                >
                  {latestEvent.description}
                </Text>

                {/* Venue */}
                <View className="flex-row items-center mt-5">
                  <MaterialIcons
                    name="location-on"
                    size={18}
                    color={colorScheme === "dark" ? "#CBD5E1" : "#64748B"}
                  />

                  <Text className="ml-2 flex-1 text-slate-700 dark:text-slate-200">
                    {latestEvent.venueName}
                  </Text>
                </View>

                {/* Address */}
                <View className="flex-row items-center mt-3">
                  <MaterialIcons
                    name="place"
                    size={18}
                    color={colorScheme === "dark" ? "#CBD5E1" : "#64748B"}
                  />

                  <Text
                    numberOfLines={2}
                    className="ml-2 flex-1 text-slate-600 dark:text-slate-300"
                  >
                    {latestEvent.address}
                  </Text>
                </View>

                {/* Date */}
                <View className="flex-row items-center mt-3">
                  <MaterialIcons
                    name="schedule"
                    size={18}
                    color={colorScheme === "dark" ? "#CBD5E1" : "#64748B"}
                  />

                  <Text className="ml-2 text-slate-700 dark:text-slate-200">
                    {new Date(latestEvent.startDate).toLocaleDateString()} •{" "}
                    {new Date(latestEvent.startDate).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>

                {/* Footer */}
                <View className="mt-6 flex-row justify-between items-center">
                  <Text className="text-xs text-slate-500 dark:text-slate-400">
                    Created{" "}
                    {new Date(latestEvent.createdAt).toLocaleDateString()}
                  </Text>

                  <TouchableOpacity
                    className="bg-blue-600 rounded-full px-5 py-2"
                    onPress={() =>
                      router.push({
                        pathname: "/event-details/[id]",
                        params: { id: latestEvent._id },
                      })
                    }
                  >
                    <Text className="text-white font-semibold">View Event</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        onPress={openAssistant}
        className="absolute bottom-6 right-5 rounded-full bg-indigo-600 p-4 shadow-xl"
      >
        <MaterialIcons name="smart-toy" size={28} color="white" />
      </TouchableOpacity>

      <AssistantChatModal
        visible={showAssistant}
        onClose={() => setShowAssistant(false)}
        sessionId="home-assistant"
      />
    </SafeAreaView>
  );
}
