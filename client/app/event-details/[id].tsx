import { Event, getEvent, updateEvent } from "@/services/eventService";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
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

export default function EventDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"Scheduled" | "Live" | "Closed">(
    "Scheduled",
  );
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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

  const formattedDate = event?.startDate
    ? new Date(event.startDate).toLocaleString()
    : "";

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
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="bg-white border-b border-slate-200 px-5 py-4 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-slate-100"
        >
          <AntDesign name="arrow-left" size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-slate-900">
          Event Details
        </Text>
        <View className="h-10 w-10" />
      </View>

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
          <View className="bg-white rounded-3xl p-6">
            <Text className="text-slate-600 text-center">
              Event not available.
            </Text>
          </View>
        ) : (
          <View className="bg-white rounded-3xl p-6 shadow-sm">
            <Text className="text-3xl font-bold text-slate-900">
              {event.title}
            </Text>
            <Text className="text-slate-500 mt-2">{event.category}</Text>
            <View className="mt-4">
              <Text className="font-semibold text-slate-900 mb-3">
                Event Status
              </Text>

              <View className="flex-row bg-slate-100 rounded-2xl p-1">
                {(["Scheduled", "Live", "Closed"] as const).map((option) => (
                  <TouchableOpacity
                    key={option}
                    disabled={saving}
                    onPress={() => handleStatusChange(option)}
                    className={`flex-1 py-3 rounded-xl items-center ${
                      status === option ? "bg-white" : ""
                    }`}
                  >
                    <Text
                      className={`font-medium ${
                        status === option ? "text-blue-600" : "text-slate-500"
                      }`}
                    >
                      {saving && status === option ? "..." : option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {statusMessage ? (
                <Text className="text-sm text-slate-500 mt-3">
                  {statusMessage}
                </Text>
              ) : null}
            </View>

            {/* {event.latitude != null && event.longitude != null ? (
              <View className="mt-4 rounded-2xl bg-slate-100 p-3">
                <Text className="text-slate-700">
                  Latitude: {event.latitude.toFixed(6)}
                </Text>
                <Text className="text-slate-700 mt-1">
                  Longitude: {event.longitude.toFixed(6)}
                </Text>
              </View>
            ) : null} */}

            <View className="mt-5">
              <Text className="font-semibold text-slate-900">Description</Text>
              <Text className="text-slate-700 mt-2">{event.description}</Text>
            </View>

            <View className="mt-6 space-y-4">
              <View className="flex-row items-center gap-2">
                <MaterialIcons name="location-on" size={20} color="#2563EB" />
                <Text className="text-slate-900 font-semibold">Venue</Text>
              </View>
              <Text className="text-slate-700 ml-8">{event.venueName}</Text>
              <Text className="text-slate-700 ml-8">{event.address}</Text>

              <View className="flex-row items-center gap-2 mt-4">
                <MaterialIcons name="schedule" size={20} color="#2563EB" />
                <Text className="text-slate-900 font-semibold">
                  Date & Time
                </Text>
              </View>
              <Text className="text-slate-700 ml-8">{formattedDate}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
