import EventBottomSheet from "@/app/Components/EventBottomSheet";
import AppMap from "@/Components/AppMap";
import { Event, getEvents } from "@/services/eventService";
import { MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardEvent,
  Linking,
  Pressable,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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

  useEffect(() => {
    loadLocation();
    loadEvents();
  }, []);

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

  const handleOpenMaps = (event: Event) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${event.latitude},${event.longitude}`;

    Linking.openURL(url);
  };

  const handleBookSlot = (event: Event) => {
    router.push({
      pathname: "/book-event/[id]",
      params: {
        id: event._id,
      },
    });
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
    <SafeAreaView className="flex-1 bg-white">
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
          className="flex-row items-center bg-white dark:bg-neutral-900 rounded-2xl px-4"
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
            className="flex-1 ml-2 dark:text-slate-200 focus:outline-none"
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
      <EventBottomSheet
        visible={isExpanded}
        events={filteredEvents}
        selectedEvent={selectedEvent}
        error={error}
        keyboardHeight={keyboardHeight}
        isFocused={isFocused}
        onSelectEvent={handleSelectEvent}
        onOpenMaps={handleOpenMaps}
        onBookSlot={handleBookSlot}
      />
    </SafeAreaView>
  );
}
