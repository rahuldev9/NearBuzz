import { router, useLocalSearchParams } from "expo-router";
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

export default function OtpVerificationScreen() {
  const { email } = useLocalSearchParams();
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async () => {
    if (!email || !otp || !password) {
      Alert.alert("Error", "Email, OTP, and new password are required.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${AUTH_API_URL}/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to reset password.");
      }

      Alert.alert("Success", data.message);
      router.replace("/(auth)/login");
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Unable to reset password.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 justify-center px-6">
      <Text className="text-4xl font-bold">Verify OTP</Text>

      <Text className="text-slate-500 mt-2 mb-8">
        Enter the code sent to your email and choose a new password.
      </Text>

      <TextInput
        value={otp}
        onChangeText={setOtp}
        keyboardType="number-pad"
        placeholder="Enter OTP"
        className="bg-white h-14 rounded-2xl px-4 mb-4 text-center text-lg"
      />

      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="New Password"
        className="bg-white h-14 rounded-2xl px-4 mb-6"
      />

      <TouchableOpacity
        onPress={handleVerify}
        disabled={isLoading}
        className="bg-blue-600 h-14 rounded-2xl items-center justify-center"
      >
        <Text className="text-white font-semibold">
          {isLoading ? "Resetting password..." : "Reset Password"}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
