import React from "react";
import MapView, { Marker } from "react-native-maps";

type Props = {
  latitude: number;
  longitude: number;
  height?: number;
};

export default function AppMap({ latitude, longitude, height = 300 }: Props) {
  return (
    <MapView
      style={{ width: "100%", height }}
      showsUserLocation
      initialRegion={{
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
    >
      <Marker coordinate={{ latitude, longitude }} />
    </MapView>
  );
}
