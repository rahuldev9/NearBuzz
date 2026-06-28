import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Event } from "@/services/eventService";
import { useColorScheme } from "nativewind";
const SCREEN_HEIGHT = Dimensions.get("window").height;
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.5;

type Props = {
  visible: boolean;
  events: Event[];
  selectedEvent: Event | null;
  error: string | null;
  keyboardHeight: number;
  isFocused: boolean;

  onSelectEvent: (event: Event) => void;
  onOpenMaps: (event: Event) => void;
  onBookSlot: (event: Event) => void;
};
export default function EventBottomSheet({
  visible,
  events,
  selectedEvent,
  error,
  keyboardHeight,
  isFocused,
  onSelectEvent,
  onOpenMaps,
  onBookSlot,
}: Props) {
  const { colorScheme } = useColorScheme();
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const getStatusClasses = (status?: string) => {
    switch (status) {
      case "Live":
        return {
          bg: "bg-green-100",
          text: "text-green-700",
        };

      case "Scheduled":
        return {
          bg: "bg-blue-100",
          text: "text-blue-700",
        };

      case "Closed":
        return {
          bg: "bg-red-100",
          text: "text-red-700",
        };

      default:
        return {
          bg: "bg-slate-100",
          text: "text-slate-700",
        };
    }
  };

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: visible ? 0 : SHEET_HEIGHT,
      useNativeDriver: true,
      tension: 80,
      friction: 11,
    }).start();
  }, [visible]);

  const renderEvent = ({ item }: { item: Event }) => {
    const isSelected = selectedEvent?._id === item._id;

    const statusColors = {
      Scheduled: " dark:text-white",
      Live: "dark:text-white",
      Closed: "dark:text-white",
    };

    const statusClass =
      statusColors[item.status as keyof typeof statusColors] ??
      "dark:bg-slate-100 dark:text-slate-200";

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => onSelectEvent(item)}
        className={`mb-3 rounded-2xl overflow-hidden shadow-lg ${
          isSelected
            ? "bg-blue-50 dark:bg-blue-950/30"
            : "bg-white dark:bg-neutral-900"
        }`}
        style={{
          elevation: 6,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
        }}
      >
        {/* Event Image */}
        {item.image ? (
          <Image
            source={{ uri: item.image }}
            className="w-full h-36"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-36 bg-slate-200 dark:bg-neutral-700 justify-center items-center">
            <MaterialIcons name="event" size={40} color="#2563EB" />
          </View>
        )}

        <View className="p-4">
          {/* Header */}
          <View className="flex-row justify-between items-start">
            <View className="flex-1 pr-2">
              <Text
                numberOfLines={1}
                className="text-base font-bold text-slate-900 dark:text-slate-100"
              >
                {item.title}
              </Text>

              <Text
                numberOfLines={1}
                className="text-xs text-slate-500 dark:text-slate-400 mt-1"
              >
                {item.category}
              </Text>
            </View>

            <View className="bg-blue-100 text-b dark:bg-blue-900 rounded-full px-2.5 py-1">
              <Text className={`text-[11px] font-semibold ${statusClass}`}>
                {item.status}
              </Text>
            </View>
          </View>

          {/* Description */}
          <Text
            numberOfLines={2}
            className="mt-3 text-sm text-slate-600 dark:text-slate-300"
          >
            {item.description}
          </Text>

          {/* Venue */}
          <View className="flex-row items-center mt-3">
            <MaterialIcons
              name="place"
              size={15}
              color={colorScheme === "dark" ? "#CBD5E1" : "#64748B"}
            />

            <Text
              numberOfLines={1}
              className="ml-2 flex-1 text-xs text-slate-700 dark:text-slate-300"
            >
              {item.venueName}
            </Text>
          </View>

          {/* Date */}
          <View className="flex-row items-center mt-2">
            <MaterialIcons
              name="schedule"
              size={15}
              color={colorScheme === "dark" ? "#CBD5E1" : "#64748B"}
            />

            <Text className="ml-2 text-xs text-slate-700 dark:text-slate-300">
              {new Date(item.startDate).toLocaleDateString()}
            </Text>
          </View>

          {/* Buttons */}
          <View className="flex-row mt-4 gap-2">
            <TouchableOpacity
              onPress={() => onOpenMaps(item)}
              className="flex-1 bg-slate-100 dark:bg-neutral-800 rounded-xl py-2 flex-row justify-center items-center"
            >
              <MaterialIcons
                name="map"
                size={16}
                color={colorScheme === "dark" ? "#CBD5E1" : "#475569"}
              />

              <Text className="ml-1 text-xs font-medium text-slate-700 dark:text-slate-200">
                Maps
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onBookSlot(item)}
              className="flex-1 bg-blue-700 rounded-xl py-2 flex-row justify-center items-center"
            >
              <MaterialIcons name="event-available" size={16} color="#FFF" />

              <Text className="ml-1 text-xs font-semibold text-white">
                Book
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Animated.View
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: SHEET_HEIGHT,
        zIndex: 40,
        transform: [{ translateY }],
      }}
    >
      <View
        className="flex-1 bg-white dark:bg-neutral-900 rounded-t-[32px] px-5 pt-3"
        style={{
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 12,
        }}
      >
        <View className="items-center mb-4">
          <View className="h-1.5 w-12 rounded-full " />
        </View>

        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-bold dark:text-slate-200">Events</Text>

          <View className="bg-blue-100 dark:bg-neutral-800 px-3 py-1 rounded-full">
            <Text className="font-medium dark:text-slate-200">
              {events.length}
            </Text>
          </View>
        </View>

        {error ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-red-500">{error}</Text>
          </View>
        ) : (
          <FlatList
            data={events}
            keyExtractor={(item) => item._id}
            renderItem={renderEvent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              paddingBottom: 30 + (isFocused ? keyboardHeight : 0),
            }}
            ListEmptyComponent={
              <View className="items-center py-8">
                <Text className="text-slate-500">No events found</Text>
              </View>
            }
          />
        )}
      </View>
    </Animated.View>
  );
}
