import AppLoader from "@/Components/AppLoader";
import { useAuth } from "@/context/AuthContext";
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Redirect, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { SafeAreaView } from "react-native-safe-area-context";

const DASHBOARD_CARDS = [
  {
    label: "Events",
    image: require("../assets/images/create-event.png"),
    rotate: "-10deg",
  },
  {
    label: "AI",
    image: require("../assets/images/ai-home.png"),
    rotate: "-5deg",
  },
  {
    label: "Tickets",
    image: require("../assets/images/booking-confirm.png"),
    rotate: "5deg",
  },
  {
    label: "Profile",
    image: require("../assets/images/home.png"),
    rotate: "10deg",
  },
];
const images = [
  require("../assets/images/nearbuzz.png"),
  require("../assets/images/home.png"),
  require("../assets/images/ai-home.png"),
  require("../assets/images/create-event.png"),
  require("../assets/images/discover.png"),
  require("../assets/images/event-book.png"),
  require("../assets/images/booking-confirm.png"),
  require("../assets/images/notification.png"),
  require("../assets/images/settings.png"),
];
export default function Index() {
  const router = useRouter();
  const { isAuthenticated, isInitializing } = useAuth();
  const [email, setEmail] = useState("");

  const { width } = Dimensions.get("window");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 2500);

    return () => clearInterval(timer);
  }, []);
  if (isInitializing) {
    return <AppLoader />;
  }

  if (isAuthenticated) {
    return <Redirect href="/(root)/(tabs)" />;
  }

  return (
    <SafeAreaView className="flex-1 ">
      {/* Navbar */}
      <View className="flex-row items-center justify-between px-5 py-4">
        <View className="flex-row items-center gap-2">
          <Image
            source={require("../assets/images/favicon.png")}
            style={{ width: 34, height: 34 }}
            resizeMode="contain"
          />

          <Text className="text-2xl font-bold text-slate-900">NearBuzz</Text>
        </View>

        <Pressable
          onPress={() => router.push("/(auth)/register")}
          className="rounded-full bg-blue-800 px-4 py-2.5 active:bg-blue-8900"
        >
          <Text className="text-xs font-bold text-white">Get Started</Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Hero */}

        <View className="mt-9 h-36 w-full items-center justify-center">
          <View className="flex-row items-center">
            {DASHBOARD_CARDS.map((card, i) => (
              <View
                key={card.label}
                style={{
                  transform: [{ rotate: card.rotate }],
                  marginLeft: i === 0 ? 0 : -22,
                  zIndex: i,
                }}
                className="h-32 w-20 items-center justify-center rounded-2xl border border-violet-100 bg-white p-2 shadow-sm"
              >
                <Image
                  source={card.image}
                  style={{ width: 170, height: 170 }}
                  resizeMode="contain"
                />
              </View>
            ))}
          </View>
        </View>

        <View className="items-center px-6 pb-10 pt-6">
          <Text className="mt-4 text-center text-3xl font-bold leading-9 text-slate-900">
            Find, Book &{"\n"}Promote Your Buzz.
          </Text>

          <Text className="mt-4 max-w-[320px] text-center  leading-7 ">
            Discover nearby events in a tap. Book fast, easy, local — or put
            your own event on the map with a little help from AI.
          </Text>

          <Pressable
            onPress={() => router.push("/(auth)/register")}
            className="mt-7 w-full max-w-[280px] rounded-2xl bg-blue-800 py-4 active:bg-slate-800"
          >
            <Text className="text-center text-base font-bold text-white">
              Start For Free
            </Text>
          </Pressable>
        </View>

        <View className="flex-row m-8">
          <View className="flex-1 items-center">
            <Feather name="search" size={26} />
            <Text className="mt-2 text-xs text-center">Search</Text>
          </View>

          <View className="flex-1 items-center">
            <MaterialCommunityIcons name="robot-excited" size={26} />
            <Text className="mt-2 text-xs text-center">AI</Text>
          </View>

          <View className="flex-1 items-center">
            <MaterialCommunityIcons name="qrcode-scan" size={26} />
            <Text className="mt-2 text-xs text-center">QR Ticket</Text>
          </View>

          <View className="flex-1 items-center">
            <MaterialIcons name="notifications-active" size={26} />
            <Text className="mt-2 text-xs text-center">Alerts</Text>
          </View>

          <View className="flex-1 items-center">
            <MaterialCommunityIcons name="theme-light-dark" size={26} />
            <Text className="mt-2 text-xs text-center">Theme</Text>
          </View>
        </View>
        {/* How NearBuzz Works */}
        <View className="mt-10 px-5">
          <Text className="mb-8 text-center text-3xl font-bold text-slate-900">
            How NearBuzz Works
          </Text>

          {/* Card 1: Image is on the Right -> Icon on the Left */}
          <View className="mb-5 flex-row items-center justify-between rounded-3xl p-5 shadow-sm bg-slate-50">
            <View className="flex-1 pr-4 items-start">
              {" "}
              {/* items-start aligns icon left */}
              <View className="h-14 w-14 items-center justify-center rounded-2xl bg-white">
                <Feather name="search" size={34} />
              </View>
              <Text className="mt-4 text-lg font-bold text-slate-900">
                1. Discover Nearby
              </Text>
              <Text className="mt-2 text-sm leading-6 text-slate-600">
                Search local music, sports, food, cafés and events around you.
              </Text>
            </View>

            <View className="w-[25%] items-center justify-center">
              <View className="h-20 w-20 items-center justify-center rounded-2xl bg-white/70 p-2">
                <Image
                  source={require("../assets/images/discover.png")}
                  style={{ width: 170, height: 170 }}
                  resizeMode="contain"
                />
              </View>
            </View>
          </View>

          {/* Card 2: Image is on the Left -> Icon on the Right */}
          <View className="mb-5 flex-row-reverse items-center justify-between rounded-3xl shadow-sm p-5 bg-slate-50">
            <View className="flex-1 pl-4 items-end text-right">
              {" "}
              {/* items-end aligns icon right */}
              <View className="h-14 w-14 items-center justify-center rounded-2xl bg-white">
                <MaterialCommunityIcons name="robot-excited" size={34} />
              </View>
              <Text className="mt-4 text-lg font-bold text-slate-900 text-right">
                2. AI Smart Match
              </Text>
              <Text className="mt-2 text-sm leading-6 text-slate-600 text-right">
                AI recommends events and places you'll love based on your
                interests.
              </Text>
            </View>

            <View className="w-[25%] items-center justify-center">
              <View className="h-20 w-20 items-center justify-center rounded-2xl bg-white/70 p-2">
                <Image
                  source={require("../assets/images/ai-chat.png")}
                  style={{ width: 170, height: 170 }}
                  resizeMode="contain"
                />
              </View>
            </View>
          </View>

          {/* Card 3: Image is on the Right -> Icon on the Left */}
          <View className="mb-5 flex-row items-center justify-between rounded-3xl shadow-sm p-5 bg-slate-50">
            <View className="flex-1 pr-4 items-start">
              {" "}
              {/* items-start aligns icon left */}
              <View className="h-14 w-14 items-center justify-center rounded-2xl bg-white">
                <MaterialCommunityIcons name="qrcode-scan" size={34} />
              </View>
              <Text className="mt-4 text-lg font-bold text-slate-900">
                3. QR Tickets
              </Text>
              <Text className="mt-2 text-sm leading-6 text-slate-600">
                Book and access events quickly with secure QR code tickets.
              </Text>
            </View>

            <View className="w-[25%] items-center justify-center">
              <View className="h-20 w-20 items-center justify-center rounded-2xl bg-white/70 p-2">
                <Image
                  source={require("../assets/images/booking-confirm.png")}
                  style={{ width: 170, height: 170 }}
                  resizeMode="contain"
                />
              </View>
            </View>
          </View>

          {/* Card 4: Image is on the Left -> Icon on the Right */}
          <View className="mb-5 flex-row-reverse items-center justify-between rounded-3xl shadow-sm p-5 bg-slate-50">
            <View className="flex-1 pl-4 items-end text-right">
              {" "}
              {/* items-end aligns icon right */}
              <View className="h-14 w-14 items-center justify-center rounded-2xl bg-white">
                <MaterialIcons name="notifications-active" size={34} />
              </View>
              <Text className="mt-4 text-lg font-bold text-slate-900 text-right">
                4. Promote & Notify
              </Text>
              <Text className="mt-2 text-sm leading-6 text-slate-600 text-right">
                Reach nearby users instantly with alerts and personalized
                notifications.
              </Text>
            </View>

            <View className="w-[25%] items-center justify-center">
              <View className="h-20 w-20 items-center justify-center rounded-2xl bg-white/70 p-2">
                <Image
                  source={require("../assets/images/notification.png")}
                  style={{ width: 170, height: 170 }}
                  resizeMode="contain"
                />
              </View>
            </View>
          </View>
        </View>

        {/* AI create demo */}

        {/* Personalized Dashboard */}
        <View className="mt-10 items-center px-6">
          <Text className="text-2xl font-bold text-slate-900">
            Personalized Dashboard
          </Text>
          <Text className="mt-2 text-center text-sm text-slate-500">
            Your Everything Buzz, in one place.
          </Text>
          <View className="items-center justify-center m-4">
            <Animated.Image
              key={index}
              entering={FadeIn.duration(600).withInitialValues({
                transform: [{ translateX: 100 }],
                opacity: 0,
              })}
              exiting={FadeOut.duration(600).withInitialValues({
                transform: [{ translateX: 0 }],
                opacity: 1,
              })}
              source={images[index]}
              resizeMode="contain"
              style={{
                width: width * 0.7,
                height: 220,
              }}
            />
          </View>
        </View>

        {/* Sign up + app badges */}
        <View className="mx-5 mt-10 rounded-3xl bg-sky-50 p-6">
          <Text className="text-center text-sm font-bold">
            Sign Up for NearBuzz Early Access
          </Text>

          <TextInput
            placeholder="Enter email address"
            placeholderTextColor="#94a3b8"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            className="mt-4 rounded-2xl border border-violet-100 bg-white px-4 py-3.5 text-sm text-slate-900"
          />

          <Pressable
            onPress={() => router.push("/(auth)/register")}
            className="mt-3 rounded-full bg-blue-800 py-3.5 active:bg-blue-900"
          >
            <Text className="text-center text-base font-bold text-white">
              Sign Up
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
