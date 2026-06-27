import ConfirmDialog from "@/Components/ConfirmDialog";
import { generateAiBanner, generateAiDescription } from "@/services/aiService";
import {
  createEvent,
  deleteEvent,
  getMyEvents,
  updateEvent,
} from "@/services/eventService";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner";
interface FormErrors {
  title?: string;
  description?: string;
  category?: string;
  date?: string;
  time?: string;
  venue?: string;
  address?: string;
  image?: string;
}

export default function EventPostingScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [venue, setVenue] = useState("");
  const [address, setAddress] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [status, setStatus] = useState<"Scheduled" | "Live" | "Closed">(
    "Scheduled",
  );
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [image, setImage] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [aiGenerating, setAiGenerating] = useState(false);
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

  const validateForm = (): FormErrors => {
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
    return newErrors;
  };

  const getFirstValidationError = (errors: FormErrors): string | null => {
    if (errors.title) return errors.title;
    if (errors.description) return errors.description;
    if (errors.category) return errors.category;
    if (errors.venue) return errors.venue;
    if (errors.address) return errors.address;
    if (errors.date) return errors.date;
    if (errors.time) return errors.time;
    return null;
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      alert("Permission to access photos is required.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled) {
      const asset = result.assets[0];

      // Save as Base64 Data URL
      setImage(`data:${asset.mimeType};base64,${asset.base64}`);
    }
  };
  const handlePublish = async () => {
    setStatusMessage(null);

    const formErrors = validateForm();
    const firstError = getFirstValidationError(formErrors);
    if (firstError) {
      toast.error(firstError);
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

      let latitude: number | undefined;
      let longitude: number | undefined;

      if (status === "Live") {
        const { status: locationStatus } =
          await Location.requestForegroundPermissionsAsync();

        if (locationStatus !== "granted") {
          setStatusMessage("Location permission is required for live events.");
          setLoading(false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({});

        latitude = location.coords.latitude;
        longitude = location.coords.longitude;
      }

      const payload = {
        title,
        description,
        category,
        status,
        latitude,
        longitude,
        venueName: venue,
        address,
        image,
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
      setStatus("Scheduled");
      setImage("");
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
  const handleGenerateDescription = async () => {
    if (!title.trim() || !category.trim() || !venue.trim()) {
      toast.error("Add title, category, and venue first.");
      return;
    }

    try {
      setAiGenerating(true);
      const generated = await generateAiDescription({
        title,
        category,
        venue,
        date,
      });
      setDescription(generated);
      toast.success("Description generated.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to generate description.",
      );
    } finally {
      setAiGenerating(false);
    }
  };

  const handleGenerateBanner = async () => {
    if (!title.trim() || !category.trim() || !venue.trim()) {
      toast.error("Add title, category, and venue first.");
      return;
    }

    try {
      setAiGenerating(true);
      const result = await generateAiBanner({
        title,
        category,
        venue,
        date,
      });
      if (result?.imageUrl) {
        setImage(result.imageUrl);
        toast.success("Banner generated.");
      } else {
        toast.error("No banner image was generated.");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to generate banner.",
      );
    } finally {
      setAiGenerating(false);
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
    setVenue(event.venueName || "");
    setAddress(event.address || "");
    setStatus(event.status || "Scheduled");
    setImage(event.image || "");
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
    <SafeAreaView className="flex-1 ">
      <ScrollView
        className="flex-1 px-5 bg-white dark:bg-neutral-900"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-3xl font-bold dark:text-slate-200 mt-4">
          Create Event
        </Text>
        <Text className="dark:text-slate-200 mt-1">
          Discover what's buzzing near you
        </Text>
        <View className=" rounded-3xl p-5 mt-6">
          {/* Event Title */}
          <Text className="font-semibold dark:text-slate-200 mb-2">
            Event Title
          </Text>
          <TextInput
            placeholder="Startup Meetup 2026"
            value={title}
            onChangeText={(val) => {
              setTitle(val);
              clearError("title");
            }}
            className={`border rounded-xl px-4 py-3 dark:text-slate-200 ${errors.title ? "border-red-500 bg-red-50/30" : "border-slate-300"}`}
          />
          {/* {errors.title && (
            <Text className="text-red-500 text-xs mt-1 ml-1">
              {errors.title}
            </Text>
          )} */}

          {/* Description */}

          <View className="flex-row items-center justify-between mb-2 pt-4">
            <Text className="font-semibold dark:text-slate-200">
              Description
            </Text>
            <TouchableOpacity
              onPress={handleGenerateDescription}
              disabled={aiGenerating}
              className="rounded-full bg-indigo-600 px-3 py-2"
            >
              <Text className="text-white text-xs font-semibold">
                {aiGenerating ? "Generating..." : "Generate with AI"}
              </Text>
            </TouchableOpacity>
          </View>
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
            className={`border rounded-xl dark:text-slate-200 px-4 py-3 h-28 ${errors.description ? "border-red-500 bg-red-50/30" : "border-slate-300"}`}
          />
          {/* {errors.description && (
            <Text className="text-red-500 text-xs mt-1 ml-1">
              {errors.description}
            </Text>
          )} */}

          {/* Category */}
          <Text className="font-semibold mt-5 mb-2 dark:text-slate-200">
            Category
          </Text>
          <TextInput
            placeholder="Technology"
            value={category}
            onChangeText={(val) => {
              setCategory(val);
              clearError("category");
            }}
            className={`border rounded-xl px-4 py-3 dark:text-slate-200 ${errors.category ? "border-red-500 bg-red-50/30" : "border-slate-300"}`}
          />
          {/* {errors.category && (
            <Text className="text-red-500 text-xs mt-1 ml-1">
              {errors.category}
            </Text>
          )} */}

          <Text className="font-semibold mt-5 mb-2 dark:text-slate-200">
            Date
          </Text>

          {Platform.OS === "web" ? (
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{
                padding: "12px",
                borderRadius: "12px",
                border: `1px solid ${
                  colorScheme === "dark" ? "#404040" : "#CBD5E1"
                }`,
                color: colorScheme === "dark" ? "#fff" : "#000",
                backgroundColor: colorScheme === "dark" ? "#171717" : "#fff",
                width: "100%",
              }}
            />
          ) : (
            <>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                className={`border rounded-xl px-4 py-4 dark:text-slate-200 ${
                  errors.date
                    ? "border-red-500 bg-red-50/30"
                    : "border-slate-300"
                }`}
              >
                <Text
                  className={
                    date
                      ? "text-slate-900 dark:text-slate-200"
                      : "text-slate-400 dark:text-slate-200"
                  }
                >
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
          <Text className="font-semibold mt-5 mb-2 dark:text-slate-200">
            Time
          </Text>

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
                padding: "14px",
                borderRadius: "12px",
                border: errors.time
                  ? "1px solid #ef4444"
                  : `1px solid ${colorScheme === "dark" ? "#404040" : "#CBD5E1"}`,
                outline: "none",
                backgroundColor: colorScheme === "dark" ? "#171717" : "#ffffff",
                color: colorScheme === "dark" ? "#ffffff" : "#000000",
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
          <Text className="font-semibold mt-5 mb-2 dark:text-slate-200">
            Venue
          </Text>
          <TextInput
            placeholder="Jio Convention Centre"
            value={venue}
            onChangeText={(val) => {
              setVenue(val);
              clearError("venue");
            }}
            className={`border rounded-xl px-4 py-3 dark:text-slate-200 ${errors.venue ? "border-red-500 bg-red-50/30" : "border-slate-300"}`}
          />
          {/* {errors.venue && (
            <Text className="text-red-500 text-xs mt-1 ml-1">
              {errors.venue}
            </Text>
          )} */}

          {/* Address */}
          <Text className="font-semibold mt-5 mb-2 dark:text-slate-200">
            Address
          </Text>
          <TextInput
            placeholder="BKC, Mumbai"
            value={address}
            onChangeText={(val) => {
              setAddress(val);
              clearError("address");
            }}
            className={`border rounded-xl px-4 py-3 dark:text-slate-200 ${errors.address ? "border-red-500 bg-red-50/30" : "border-slate-300"}`}
          />
          {/* {errors.address && (
            <Text className="text-red-500 text-xs mt-1 ml-1">
              {errors.address}
            </Text>
          )} */}

          {/* Status Message */}
          {statusMessage ? (
            <Text className="text-sm text-slate-500 mb-4">{statusMessage}</Text>
          ) : null}
          <Text className="font-semibold mt-5 mb-2 dark:text-slate-200">
            Uplad Event Image
          </Text>
          <View className="flex-row gap-3 mt-2">
            <TouchableOpacity
              onPress={pickImage}
              className="flex-1 bg-blue-600 rounded-2xl py-3 px-5 flex-row items-center justify-center"
            >
              <MaterialIcons name="photo-library" size={20} color="#fff" />
              <Text className="text-white font-semibold ml-2">
                Select Event Image
              </Text>
            </TouchableOpacity>
            {/* <TouchableOpacity
              onPress={handleGenerateBanner}
              disabled={aiGenerating}
              className="flex-1 bg-purple-600 rounded-2xl py-3 px-5 flex-row items-center justify-center"
            >
              <MaterialIcons name="auto-awesome" size={20} color="#fff" />
              <Text className="text-white font-semibold ml-2">
                Generate Banner
              </Text>
            </TouchableOpacity> */}
          </View>
          {image ? (
            <Image
              source={{ uri: image }}
              className="w-full h-52 rounded-2xl mt-4"
              resizeMode="cover"
            />
          ) : null}

          {/* Publish Button */}
          <TouchableOpacity
            disabled={loading}
            onPress={handlePublish}
            className={`rounded-2xl py-4 mt-8 ${loading ? "bg-blue-900" : "bg-blue-800"}`}
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
        <Text className="text-2xl font-bold mt-8 mb-4 dark:text-slate-200">
          My Events
        </Text>

        {events.length === 0 ? (
          <View className=" rounded-3xl p-6 mb-10">
            <Text className="text-center dark:text-slate-200">
              No events posted yet
            </Text>
          </View>
        ) : (
          events.map((event) => (
            <TouchableOpacity
              key={event._id}
              disabled={loading}
              activeOpacity={0.9}
              onPress={() =>
                router.push({
                  pathname: "/event-details/[id]",
                  params: { id: event._id },
                })
              }
              className="mb-6 rounded-3xl overflow-hidden bg-white dark:bg-neutral-800 shadow-lg"
            >
              {/* Event Image */}
              {event.image ? (
                <Image
                  source={{ uri: event.image }}
                  className="w-full h-52"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-full h-52 bg-slate-200 dark:bg-neutral-700 justify-center items-center">
                  <MaterialIcons name="event" size={60} color="#2563EB" />
                </View>
              )}

              {/* Card Content */}
              <View className="p-5">
                {/* Title + Actions */}
                <View className="flex-row items-start">
                  <View className="flex-1">
                    <Text className="text-xl font-bold dark:text-slate-100">
                      {event.title}
                    </Text>

                    <View className="self-start mt-2 bg-blue-100 dark:bg-blue-900 rounded-full px-3 py-1">
                      <Text className="text-blue-700 dark:text-blue-300 text-xs font-semibold">
                        {event.category}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row gap-4">
                    <TouchableOpacity
                      disabled={loading}
                      onPress={() => {
                        setSelectedEventId(event._id);
                        setShowConfirm(true);
                      }}
                    >
                      <AntDesign name="delete" size={20} color="#EF4444" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      disabled={loading}
                      onPress={() => handleEditEvent(event)}
                    >
                      <AntDesign name="edit" size={20} color="#2563EB" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Description */}
                <Text
                  numberOfLines={3}
                  className="mt-4 text-slate-600 dark:text-slate-300 leading-6"
                >
                  {event.description}
                </Text>

                {/* Venue */}
                <View className="flex-row items-center mt-5">
                  <MaterialIcons
                    name="location-on"
                    size={18}
                    color={colorScheme === "dark" ? "#CBD5E1" : "#64748B"}
                  />

                  <Text className="ml-2 flex-1 text-slate-700 dark:text-slate-200">
                    {event.venueName}
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
                    {new Date(event.startDate).toLocaleDateString()} •{" "}
                    {new Date(event.startDate).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>

                {/* Status */}
                <View className="mt-5 self-start rounded-full bg-green-100 dark:bg-green-900 px-3 py-1">
                  <Text className="text-green-700 dark:text-green-300 font-semibold text-xs">
                    {event.status}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
