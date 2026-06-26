import React, { useEffect, useRef } from "react";
import { Animated, Easing, Image, Text, View } from "react-native";

const AnimatedImage = Animated.createAnimatedComponent(Image);
const AnimatedText = Animated.createAnimatedComponent(Text);

export default function AppLoader() {
  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const scale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1.08],
  });

  const opacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1],
  });

  const translateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [8, -8],
  });

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#F8FAFC",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <AnimatedImage
        source={require("../assets/images/logo.webp")}
        resizeMode="contain"
        style={{
          width: 180,
          height: 180,
          opacity,
          transform: [{ scale }, { translateY }],
        }}
      />

      <AnimatedText
        style={{
          marginTop: 30,
          fontSize: 18,
          fontWeight: "600",
          color: "#475569",
          opacity,
          letterSpacing: 0.5,
        }}
      >
        Opening NearBuzz...
      </AnimatedText>
    </View>
  );
}
