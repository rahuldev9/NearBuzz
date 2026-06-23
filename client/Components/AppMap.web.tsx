import React from "react";
import { View } from "react-native";

type Props = {
  latitude: number;
  longitude: number;
  height?: number;
};

export default function AppMap({ latitude, longitude, height = 300 }: Props) {
  return (
    <View
      style={{
        width: "100%",
        height,
        overflow: "hidden",
      }}
    >
      <iframe
        src={`https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`}
        width="100%"
        height="100%"
        style={{
          border: 0,
        }}
      />
    </View>
  );
}
