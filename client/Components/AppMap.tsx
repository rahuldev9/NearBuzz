import React from "react";
import { Platform } from "react-native";

import AppMapNative from "./AppMap.native";
import AppMapWeb from "./AppMap.web";

type Props = {
  latitude: number;
  longitude: number;
  height?: number;
};

export default function AppMap(props: Props) {
  if (Platform.OS === "web") {
    return <AppMapWeb {...props} />;
  }

  return <AppMapNative {...props} />;
}
