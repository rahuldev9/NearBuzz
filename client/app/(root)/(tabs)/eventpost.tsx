import ConfirmDialog from "@/Components/ConfirmDialog";
import {
  createEvent,
  deleteEvent,
  getMyEvents,
  updateEvent,
} from "@/services/eventService";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface FormErrors {
  title?: string;
  description?: string;
  category?: string;
  date?: string;
  time?: string;
  venue?: string;
  address?: string;
}

export default function EventPostingScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [venue, setVenue] = useState("");
  const [address, setAddress] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  useEffect(() => {
    loadEvents();
  }, []);
  const clearError = (field: keyof FormErrors) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };
  const loadEvents = async () => {
    try {
      const data = await getMyEvents();

      if (Array.isArray(data)) {
        setEvents(data);
      } else if (data?.data) {
        setEvents(data.data);
      }
    } catch (error) {
      console.log("Failed loading events", error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!title.trim()) newErrors.title = "Event title is required.";
    if (!description.trim()) newErrors.description = "Description is required.";
    if (!category.trim()) newErrors.category = "Category field is required.";
    if (!venue.trim()) newErrors.venue = "Venue name is required.";
    if (!address.trim()) newErrors.address = "Street address is required.";

    if (!date.trim()) {
      newErrors.date = "Date is required.";
    }

    if (!time.trim()) {
      newErrors.time = "Time is required.";
    }

    setErrors(newErrors);

    // Returns true only if errors object is empty
    return Object.keys(newErrors).length === 0;
  };

  const handlePublish = async () => {
    setStatusMessage(null);

    if (!validateForm()) {
      console.log("Validation failed:", errors); // Debug log 2
      return;
    }

    try {
      setLoading(true);
      setStatusMessage("Publishing event...");

      const parseDateTime = (dateValue: string, timeValue: string) => {
        const trimmedDate = dateValue.trim();
        const trimmedTime = timeValue.trim();

        const dateMatch = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(
          trimmedDate,
        );
        let parsedDate = null;

        if (dateMatch) {
          const [, year, month, day] = dateMatch;
          if (/^[0-9]{2}:[0-9]{2}$/.test(trimmedTime)) {
            const [hour, minute] = trimmedTime.split(":");
            parsedDate = new Date(
              Number(year),
              Number(month) - 1,
              Number(day),
              Number(hour),
              Number(minute),
            );
          } else {
            parsedDate = new Date(Number(year), Number(month) - 1, Number(day));
          }
        }

        if (!parsedDate || isNaN(parsedDate.getTime())) {
          parsedDate = new Date(`${trimmedDate}T${trimmedTime || "00:00"}:00`);
        }

        return parsedDate;
      };

      const finalDate = parseDateTime(date, time);

      if (isNaN(finalDate.getTime())) {
        setErrors((prev) => ({
          ...prev,
          date: "Date/time format unreadable. Use YYYY-MM-DD and HH:MM.",
        }));
        setLoading(false);
        return;
      }

      const isoTimestamp = finalDate.toISOString();
      console.log("Sending Payload ISO Timestamp:", isoTimestamp);

      const payload = {
        title,
        description,
        category,
        venueName: venue,
        address,
        startDate: isoTimestamp,
        endDate: isoTimestamp,
      };

      if (isEditing && selectedEventId) {
        await updateEvent(selectedEventId, payload);

        setStatusMessage("Event updated successfully!");
      } else {
        await createEvent(payload);

        setStatusMessage("Event published successfully!");
      }

      Alert.alert("Success", "Event Published Successfully");
      await loadEvents();
      // Clear all fields upon successful response
      setTitle("");
      setDescription("");
      setCategory("");
      setVenue("");
      setAddress("");
      setDate("");
      setTime("");
      setErrors({});
    } catch (error) {
      console.error("API Error caught:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Something went wrong sending the request";
      setStatusMessage(errorMessage);
      Alert.alert("Network Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteEvent = async () => {
    if (!selectedEventId) return;

    try {
      setLoading(true);

      await deleteEvent(selectedEventId);
      await loadEvents();

      setShowConfirm(false);
      setSelectedEventId(null);

      setStatusMessage("Event deleted successfully.");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete event";

      setStatusMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditEvent = (event: any) => {
    setSelectedEventId(event._id);

    setTitle(event.title);
    setDescription(event.description);
    setCategory(event.category);
    setVenue(event.venueName);
    setAddress(event.address);

    const date = new Date(event.startDate);

    setDate(date.toISOString().split("T")[0]);
    setTime(
      `${String(date.getHours()).padStart(2, "0")}:${String(
        date.getMinutes(),
      ).padStart(2, "0")}`,
    );

    setIsEditing(true);
  };
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <Text className="text-3xl font-bold text-slate-900 mt-4">
          Create Event
        </Text>
        <Text className="text-slate-500 mt-1">
          Discover what's buzzing near you
        </Text>
        <View className="bg-white rounded-3xl p-5 mt-6">
          {/* Event Title */}
          <Text className="font-semibold mb-2">Event Title</Text>
          <TextInput
            placeholder="Startup Meetup 2026"
            value={title}
            onChangeText={(val) => {
              setTitle(val);
              clearError("title");
            }}
            className={`border rounded-xl px-4 py-3 ${errors.title ? "border-red-500 bg-red-50/30" : "border-slate-300"}`}
          />
          {errors.title && (
            <Text className="text-red-500 text-xs mt-1 ml-1">
              {errors.title}
            </Text>
          )}

          {/* Description */}
          <Text className="font-semibold mt-5 mb-2">Description</Text>
          <TextInput
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholder="Describe your event..."
            value={description}
            onChangeText={(val) => {
              setDescription(val);
              clearError("description");
            }}
            className={`border rounded-xl px-4 py-3 h-28 ${errors.description ? "border-red-500 bg-red-50/30" : "border-slate-300"}`}
          />
          {errors.description && (
            <Text className="text-red-500 text-xs mt-1 ml-1">
              {errors.description}
            </Text>
          )}

          {/* Category */}
          <Text className="font-semibold mt-5 mb-2">Category</Text>
          <TextInput
            placeholder="Technology"
            value={category}
            onChangeText={(val) => {
              setCategory(val);
              clearError("category");
            }}
            className={`border rounded-xl px-4 py-3 ${errors.category ? "border-red-500 bg-red-50/30" : "border-slate-300"}`}
          />
          {errors.category && (
            <Text className="text-red-500 text-xs mt-1 ml-1">
              {errors.category}
            </Text>
          )}

          <Text className="font-semibold mt-5 mb-2">Date</Text>

          {Platform.OS === "web" ? (
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{
                padding: 12,
                borderRadius: 12,
                border: "1px solid #CBD5E1",
                width: "100%",
              }}
            />
          ) : (
            <>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                className={`border rounded-xl px-4 py-4 ${
                  errors.date
                    ? "border-red-500 bg-red-50/30"
                    : "border-slate-300"
                }`}
              >
                <Text className={date ? "text-slate-900" : "text-slate-400"}>
                  {date || "Select Date"}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="default"
                  onChange={(event, pickedDate) => {
                    setShowDatePicker(false);

                    if (pickedDate) {
                      setSelectedDate(pickedDate);

                      const formattedDate = `${pickedDate.getFullYear()}-${String(
                        pickedDate.getMonth() + 1,
                      ).padStart(2, "0")}-${String(
                        pickedDate.getDate(),
                      ).padStart(2, "0")}`;

                      setDate(formattedDate);
                      clearError("date");
                    }
                  }}
                />
              )}
            </>
          )}
          {/* Time */}
          {/* Time */}
          <Text className="font-semibold mt-5 mb-2">Time</Text>

          {Platform.OS === "web" ? (
            <input
              type="time"
              value={time}
              onChange={(e) => {
                setTime(e.target.value);
                clearError("time");
              }}
              style={{
                width: "100%",
                padding: 14,
                borderRadius: 12,
                border: errors.time ? "1px solid #ef4444" : "1px solid #cbd5e1",
                outline: "none",
              }}
            />
          ) : (
            <>
              <TouchableOpacity
                onPress={() => setShowTimePicker(true)}
                className="border border-slate-300 rounded-xl px-4 py-4"
              >
                <Text>{time || "Select Time"}</Text>
              </TouchableOpacity>

              {showTimePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="time"
                  is24Hour
                  onChange={(event, pickedTime) => {
                    setShowTimePicker(false);

                    if (pickedTime) {
                      const formattedTime = `${String(
                        pickedTime.getHours(),
                      ).padStart(2, "0")}:${String(
                        pickedTime.getMinutes(),
                      ).padStart(2, "0")}`;

                      setTime(formattedTime);
                      clearError("time");
                    }
                  }}
                />
              )}
            </>
          )}
          {/* Venue */}
          <Text className="font-semibold mt-5 mb-2">Venue</Text>
          <TextInput
            placeholder="Jio Convention Centre"
            value={venue}
            onChangeText={(val) => {
              setVenue(val);
              clearError("venue");
            }}
            className={`border rounded-xl px-4 py-3 ${errors.venue ? "border-red-500 bg-red-50/30" : "border-slate-300"}`}
          />
          {errors.venue && (
            <Text className="text-red-500 text-xs mt-1 ml-1">
              {errors.venue}
            </Text>
          )}

          {/* Address */}
          <Text className="font-semibold mt-5 mb-2">Address</Text>
          <TextInput
            placeholder="BKC, Mumbai"
            value={address}
            onChangeText={(val) => {
              setAddress(val);
              clearError("address");
            }}
            className={`border rounded-xl px-4 py-3 ${errors.address ? "border-red-500 bg-red-50/30" : "border-slate-300"}`}
          />
          {errors.address && (
            <Text className="text-red-500 text-xs mt-1 ml-1">
              {errors.address}
            </Text>
          )}

          {/* Status Message */}
          {statusMessage ? (
            <Text className="text-sm text-slate-500 mb-4">{statusMessage}</Text>
          ) : null}

          {/* Publish Button */}
          <TouchableOpacity
            disabled={loading}
            onPress={handlePublish}
            className={`rounded-2xl py-4 mt-8 ${loading ? "bg-slate-400" : "bg-blue-600"}`}
          >
            <View className="flex-row items-center justify-center gap-2">
              <Text className="text-center text-white font-bold text-lg">
                {loading
                  ? "Saving..."
                  : isEditing
                    ? "Update Event"
                    : "Publish Event"}
              </Text>
              {loading && <ActivityIndicator color="#FFF" />}
            </View>
          </TouchableOpacity>
        </View>
        {showConfirm && (
          <ConfirmDialog
            visible={showConfirm}
            loading={loading}
            title="Delete Event"
            message="Are you sure you want to delete this event?"
            confirmText="Delete"
            onConfirm={handleDeleteEvent}
            onCancel={() => {
              setShowConfirm(false);
              setSelectedEventId(null);
            }}
          />
        )}
        {/* Preview Card */}
        <Text className="text-2xl font-bold mt-8 mb-4">My Events</Text>

        {events.length === 0 ? (
          <View className="bg-white rounded-3xl p-6 mb-10">
            <Text className="text-center text-slate-500">
              No events posted yet
            </Text>
          </View>
        ) : (
          events.map((event) => (
            <View key={event._id} className="bg-white rounded-3xl p-5 mb-4">
              <View className="flex-row items-center">
                <MaterialIcons name="event" size={24} color="#2563EB" />

                <Text className="text-lg font-bold ml-3 flex-1">
                  {event.title}
                </Text>
                <View className="flex-row items-center gap-3">
                  <TouchableOpacity
                    disabled={loading}
                    onPress={() => {
                      setSelectedEventId(event._id);
                      setShowConfirm(true);
                    }}
                  >
                    <AntDesign name="delete" size={18} color="red" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    disabled={loading}
                    onPress={() => handleEditEvent(event)}
                  >
                    <AntDesign name="edit" size={18} color="#2563EB" />
                  </TouchableOpacity>
                </View>
              </View>

              <Text className="text-slate-500 mt-1">{event.category}</Text>

              <Text className="mt-2 text-slate-700" numberOfLines={2}>
                {event.description}
              </Text>

              <View className="flex-row items-center mt-3">
                <MaterialIcons name="location-on" size={16} color="#64748B" />

                <Text className="ml-1 text-slate-600">{event.venueName}</Text>
              </View>

              <View className="flex-row items-center mt-2">
                <MaterialIcons name="schedule" size={16} color="#64748B" />

                <Text className="ml-1 text-slate-600">
                  {new Date(event.startDate).toLocaleDateString()}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
