import { MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Keyboard,
  KeyboardEvent,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppMap from "@/Components/AppMap";
import { Event, getEvents } from "@/services/eventService";

const SCREEN_HEIGHT = Dimensions.get("window").height;

// Sheet is fully hidden below the screen until the user starts searching,
// then it slides up to exactly half the screen height.
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.5;

export default function SearchScreen() {
  const [search, setSearch] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isFocused, setIsFocused] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const inputRef = useRef<TextInput>(null);

  // Expanded whenever the user is focused on the input OR has typed
  // something, so results stay visible even if the keyboard is dismissed.
  const isExpanded = isFocused || search.trim().length > 0;

  // translateY: 0 = visible at half-screen, SHEET_HEIGHT = fully off-screen.
  const sheetTranslateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;

  useEffect(() => {
    loadLocation();
    loadEvents();
  }, []);

  useEffect(() => {
    Animated.spring(sheetTranslateY, {
      toValue: isExpanded ? 0 : SHEET_HEIGHT,
      useNativeDriver: true,
      tension: 80,
      friction: 11,
    }).start();
  }, [isExpanded]);

  // Track keyboard height so the list isn't hidden behind it.
  useEffect(() => {
    const showSub = Keyboard.addListener(
      "keyboardDidShow",
      (e: KeyboardEvent) => setKeyboardHeight(e.endCoordinates?.height ?? 0),
    );
    const hideSub = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardHeight(0),
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const loadLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setError("Location permission denied.");
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});

      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
    } catch (err) {
      console.log(err);
      setError("Unable to get your location.");
    } finally {
      setLoadingLocation(false);
    }
  };

  const loadEvents = async () => {
    try {
      const data = await getEvents();
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log(err);
      setError("Unable to load events.");
    } finally {
      setLoadingEvents(false);
    }
  };

  const filteredEvents = useMemo(() => {
    if (!search.trim()) return events;

    const query = search.toLowerCase();

    return events.filter((event) =>
      [
        event.title,
        event.description,
        event.category,
        event.venueName,
        event.address,
      ]
        .filter(Boolean)
        .some((field) => field?.toLowerCase().includes(query)),
    );
  }, [events, search]);

  const mapLatitude = selectedEvent?.latitude ?? location?.latitude ?? 17.385;

  const mapLongitude =
    selectedEvent?.longitude ?? location?.longitude ?? 78.4867;

  const handleSelectEvent = (item: Event) => {
    setSelectedEvent(item);
    setSearch("");
    inputRef.current?.blur();
    Keyboard.dismiss();
    setIsFocused(false);
  };

  // Doubles as "clear text" and "cancel search" — fully resets and
  // collapses the sheet back off-screen.
  const handleCancel = () => {
    setSearch("");
    inputRef.current?.blur();
    Keyboard.dismiss();
    setIsFocused(false);
  };

  const renderEvent = ({ item }: { item: Event }) => {
    const isSelected = selectedEvent?._id === item._id;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => handleSelectEvent(item)}
        className={`mb-3 rounded-2xl p-4 ${
          isSelected
            ? "bg-blue-50 border border-blue-500"
            : "bg-slate-50 border border-slate-200"
        }`}
      >
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            <Text
              className="text-base font-semibold text-slate-900"
              numberOfLines={1}
            >
              {item.title}
            </Text>

            <Text className="text-sm text-slate-500 mt-1" numberOfLines={1}>
              {item.category}
            </Text>
          </View>

          {isSelected && (
            <MaterialIcons name="location-on" size={24} color="#2563EB" />
          )}
        </View>

        <View className="flex-row items-center mt-3">
          <MaterialIcons name="place" size={16} color="#64748B" />

          <Text className="ml-1 flex-1 text-slate-600" numberOfLines={1}>
            {item.venueName || item.address || "Location unavailable"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loadingEvents || loadingLocation) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-100">
      {/* MAP */}
      <View className="absolute inset-0">
        <AppMap
          latitude={mapLatitude}
          longitude={mapLongitude}
          events={filteredEvents}
          selectedEvent={selectedEvent}
          height={9999}
        />
      </View>

      {/* BACKDROP — dims the map and lets the user tap away to collapse */}
      {isExpanded && (
        <Pressable
          onPress={handleCancel}
          className="absolute inset-0 bg-black/10"
          style={{ zIndex: 30 }}
        />
      )}

      {/* SEARCH BAR */}
      <View className="absolute top-4 left-4 right-4" style={{ zIndex: 50 }}>
        <View
          className="flex-row items-center bg-white rounded-2xl px-4"
          style={{
            height: 56,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <MaterialIcons name="search" size={22} color="#64748B" />

          <TextInput
            ref={inputRef}
            placeholder="Search events..."
            placeholderTextColor="#94A3B8"
            value={search}
            onFocus={() => setIsFocused(true)}
            onChangeText={setSearch}
            className="flex-1 ml-2 text-slate-900 focus:outline-none"
            returnKeyType="search"
          />

          {/* Cancel/clear — shown only while searching, as an X mark inside the bar */}
          {isExpanded && (
            <TouchableOpacity
              onPress={handleCancel}
              activeOpacity={0.7}
              className="p-1"
            >
              <MaterialIcons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* BOTTOM SHEET — hidden off-screen until expanded, then slides up to half screen */}
      <Animated.View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: SHEET_HEIGHT,
          zIndex: 40,
          transform: [{ translateY: sheetTranslateY }],
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
          {/* HANDLE */}
          <View className="items-center mb-4">
            <View className="h-1.5 w-12 rounded-full bg-slate-300" />
          </View>

          {/* HEADER */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-slate-900">Events</Text>

            <View className="bg-blue-100 px-3 py-1 rounded-full">
              <Text className="font-medium text-blue-600">
                {filteredEvents.length}
              </Text>
            </View>
          </View>

          {error ? (
            <View className="flex-1 justify-center items-center">
              <Text className="text-red-500">{error}</Text>
            </View>
          ) : (
            <FlatList
              data={filteredEvents}
              keyExtractor={(item) => item._id}
              renderItem={renderEvent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              className="flex-1"
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
    </SafeAreaView>
  );
}
