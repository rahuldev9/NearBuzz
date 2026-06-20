import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const API_HOST =
  Platform.OS === "android" ? "http://10.0.2.2:5000" : "http://localhost:5000";
const AUTH_API_URL = `${API_HOST}/api/auth`;

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${AUTH_API_URL}/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to send OTP.");
      }

      Alert.alert("Success", data.message);
      router.push(
        `/(auth)/otp-verification?email=${encodeURIComponent(email)}`,
      );
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Unable to send OTP.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 justify-center px-6">
      <Text className="text-4xl font-bold">Reset Password</Text>

      <Text className="text-slate-500 mt-2 mb-8">Enter your email address</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        className="bg-white h-14 rounded-2xl px-4 mb-6"
      />

      <TouchableOpacity
        onPress={handleSendOtp}
        disabled={isLoading}
        className="bg-blue-600 h-14 rounded-2xl items-center justify-center"
      >
        <Text className="text-white font-semibold">
          {isLoading ? "Sending OTP..." : "Send OTP"}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
