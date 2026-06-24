import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Event } from "@/services/eventService";

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
      Scheduled: "bg-blue-100 text-blue-700",
      Live: "bg-green-100 text-green-700",
      Closed: "bg-red-100 text-red-700",
    };

    const statusClass =
      statusColors[item.status as keyof typeof statusColors] ??
      "bg-slate-100 text-slate-700";

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => onSelectEvent(item)}
        className={`mb-4 rounded-3xl border p-4 ${
          isSelected
            ? "border-blue-500 bg-blue-50"
            : "border-slate-200 bg-white"
        }`}
      >
        {/* Header */}
        <View className="flex-row justify-between items-start">
          <View className="flex-1 pr-3">
            <Text
              className="text-lg font-bold text-slate-900"
              numberOfLines={2}
            >
              {item.title}
            </Text>

            <Text className="text-sm text-slate-500 mt-1" numberOfLines={1}>
              {item.category}
            </Text>
          </View>

          <View className="rounded-full px-3 py-1 bg-slate-100">
            <Text className={`text-xs font-semibold ${statusClass}`}>
              {item.status}
            </Text>
          </View>
        </View>

        {/* Description */}
        <Text className="text-slate-600 mt-3 leading-5" numberOfLines={3}>
          {item.description}
        </Text>

        {/* Info Cards */}
        <View className="mt-4 space-y-3">
          <View className="flex-row items-center">
            <MaterialIcons name="calendar-today" size={18} color="#64748B" />

            <Text className="ml-2 flex-1 text-slate-700 text-sm">
              {new Date(item.startDate).toLocaleDateString()} ·{" "}
              {new Date(item.startDate).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>

          <View className="flex-row items-center mt-2">
            <MaterialIcons name="place" size={18} color="#64748B" />

            <View className="ml-2 flex-1">
              <Text className="font-medium text-slate-800" numberOfLines={1}>
                {item.venueName}
              </Text>

              <Text className="text-sm text-slate-500" numberOfLines={2}>
                {item.address}
              </Text>
            </View>
          </View>
        </View>

        {/* Divider */}
        {/* Divider */}
        <View className="h-px bg-slate-200 my-4" />

        {/* Actions */}
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={() => onOpenMaps(item)}
            className="flex-1 bg-slate-100 rounded-2xl py-3 flex-row justify-center items-center"
          >
            <MaterialIcons name="map" size={18} color="#475569" />

            <Text className="ml-2 text-slate-700 font-medium">Open Maps</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onBookSlot(item)}
            className="flex-1 bg-blue-600 rounded-2xl py-3 flex-row justify-center items-center"
          >
            <MaterialIcons name="event-available" size={18} color="#FFF" />

            <Text className="ml-2 text-white font-semibold">Book Slot</Text>
          </TouchableOpacity>
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
        className="flex-1 bg-white rounded-t-[32px] px-5 pt-3"
        style={{
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 12,
        }}
      >
        <View className="items-center mb-4">
          <View className="h-1.5 w-12 rounded-full bg-slate-300" />
        </View>

        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-bold text-slate-900">Events</Text>

          <View className="bg-blue-100 px-3 py-1 rounded-full">
            <Text className="font-medium text-blue-600">{events.length}</Text>
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
