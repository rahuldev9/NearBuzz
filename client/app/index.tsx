import AppLoader from "@/Components/AppLoader";
import { useAuth } from "@/context/AuthContext";
import { Redirect, useRouter } from "expo-router";
import React from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function Index() {
  const router = useRouter();
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return <AppLoader />;
  }

  if (isAuthenticated) {
    return <Redirect href="/(root)/(tabs)" />;
  }
  const features = [
    {
      icon: "📍",
      title: "Discover Nearby Events",
      description:
        "Explore concerts, workshops, sports, food festivals and exciting experiences happening around you.",
    },
    {
      icon: "🎟️",
      title: "Book Instantly",
      description:
        "Reserve tickets in seconds with a fast, secure, and hassle-free booking experience.",
    },
    {
      icon: "👥",
      title: "Invite Friends",
      description:
        "Plan memorable outings together by sharing events with your friends.",
    },
    {
      icon: "⭐",
      title: "Trusted Community",
      description:
        "Browse genuine reviews and recommendations from real event attendees.",
    },
  ];

  return (
    <SafeAreaView className="flex-1 ">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Hero */}
        <View className="items-center rounded-b-[40px] px-6 pt-14 pb-10">
          <Image
            source={require("../assets/images/logo.webp")}
            style={{ width: 200, height: 200 }}
            resizeMode="contain"
          />
          <Text className="mt-4 text-center text-base leading-7 text-slate-500">
            Discover amazing events near you, book tickets instantly, and create
            unforgettable memories with your friends.
          </Text>
        </View>

        {/* Promotion */}
        <View className="mx-5 mt-8 rounded-3xl bg-gradient-to-r from-cyan-500 via-sky-700 to-blue-900 p-6">
          <Text className="text-2xl font-extrabold text-white">
            🎉 Discover What's Happening
          </Text>

          <Text className="mt-3 text-base leading-6 text-cyan-50">
            From live concerts and food festivals to workshops and sports,
            explore trending events happening around your city today.
          </Text>
        </View>

        {/* Feature Cards */}
        <View className="mt-10 px-5">
          <Text className="mb-5 text-3xl font-bold text-slate-900">
            Why NearBuzz?
          </Text>

          {features.map((item, index) => (
            <View
              key={index}
              className="mb-4 flex-row rounded-3xl border border-cyan-100 bg-white p-5 shadow-sm"
            >
              <View className="mr-4 h-14 w-14 items-center justify-center rounded-2xl bg-cyan-100 ">
                <Text className="text-2xl">{item.icon}</Text>
              </View>

              <View className="flex-1">
                <Text className="text-lg font-bold text-slate-900">
                  {item.title}
                </Text>

                <Text className="mt-2 text-sm leading-6 text-slate-500">
                  {item.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* CTA */}
        <View className="mx-5 mt-10 rounded-3xl bg-slate-900 p-8">
          <Text className="text-center text-3xl font-bold text-white">
            Ready to Explore?
          </Text>

          <Text className="mt-3 text-center text-base leading-7 text-slate-300">
            Join thousands of users discovering amazing experiences every day.
          </Text>

          <Pressable
            onPress={() => router.push("/(auth)/register")}
            className="mt-8 rounded-2xl bg-blue-800 py-4 active:bg-blue-900"
          >
            <Text className="text-center text-lg font-bold text-white">
              Create Free Account
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/(auth)/login")}
            className="mt-4 rounded-2xl border border-slate-600 py-4 active:bg-slate-800"
          >
            <Text className="text-center text-lg font-semibold text-white">
              I Already Have an Account
            </Text>
          </Pressable>
        </View>

        {/* Benefits */}
        <View className="mt-10 px-6">
          <Text className="text-center text-2xl font-bold text-slate-900">
            Trusted by Thousands
          </Text>

          <Text className="mt-4 text-center text-base leading-7 text-slate-500">
            ✔ Discover local events effortlessly{"\n"}✔ Secure ticket booking
            {"\n"}✔ Personalized recommendations{"\n"}✔ Share experiences with
            friends
          </Text>
        </View>

        {/* Footer */}
        <View className="mt-10 px-8">
          <Text className="text-center text-xs leading-5 text-slate-400">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
