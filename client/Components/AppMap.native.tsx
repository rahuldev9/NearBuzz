import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Text, View } from "react-native";
import MapView, { Callout, Marker } from "react-native-maps";

type EventMarker = {
  _id: string;
  title: string;
  description?: string;
  venueName?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
};

type Props = {
  latitude: number;
  longitude: number;
  height?: number;
  events?: EventMarker[];
  selectedEvent?: EventMarker | null;
  onSelectEvent?: (event: EventMarker) => void;
};

export default function AppMap({
  latitude,
  longitude,
  height = 300,
  events = [],
  selectedEvent,
  onSelectEvent,
}: Props) {
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (selectedEvent?.latitude && selectedEvent?.longitude) {
      mapRef.current?.animateToRegion(
        {
          latitude: selectedEvent.latitude,
          longitude: selectedEvent.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000,
      );
    } else {
      mapRef.current?.animateToRegion(
        {
          latitude,
          longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        },
        1000,
      );
    }
  }, [selectedEvent, latitude, longitude]);

  return (
    <MapView
      ref={mapRef}
      style={{
        width: "100%",
        height,
      }}
      initialRegion={{
        latitude,
        longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }}
      showsUserLocation
    >
      {/* USER MARKER */}
      <Marker
        coordinate={{
          latitude,
          longitude,
        }}
        title="My Location"
      >
        <MaterialIcons name="my-location" size={34} color="#2563EB" />
      </Marker>

      {/* EVENTS */}
      {events.map((event) => {
        if (event.latitude == null || event.longitude == null) {
          return null;
        }

        const isSelected = selectedEvent?._id === event._id;

        return (
          <Marker
            key={event._id}
            coordinate={{
              latitude: event.latitude,
              longitude: event.longitude,
            }}
            onPress={() => {
              onSelectEvent?.(event);
            }}
          >
            <MaterialIcons
              name="location-on"
              size={isSelected ? 52 : 40}
              color={isSelected ? "#2563EB" : "#EF4444"}
            />

            <Callout tooltip>
              <View
                style={{
                  backgroundColor: "#fff",
                  padding: 12,
                  borderRadius: 12,
                  minWidth: 240,
                  elevation: 5,
                }}
              >
                <Text
                  style={{
                    fontWeight: "bold",
                    fontSize: 16,
                    marginBottom: 4,
                  }}
                >
                  {event.title}
                </Text>

                {!!event.venueName && <Text>{event.venueName}</Text>}

                {!!event.address && <Text>{event.address}</Text>}

                {!!event.description && (
                  <Text
                    numberOfLines={3}
                    style={{
                      marginTop: 6,
                    }}
                  >
                    {event.description}
                  </Text>
                )}
              </View>
            </Callout>
          </Marker>
        );
      })}
    </MapView>
  );
}
