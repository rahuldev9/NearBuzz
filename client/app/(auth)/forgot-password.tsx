import { AUTH_API_URL } from "@/config/api";
import { AntDesign } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner";
export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address.");
      toast.error("Please enter your email address.");
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
        toast.error("Unable to send OTP.");
        throw new Error(data.message || "Unable to send OTP.");
      }

      Alert.alert("Success", data.message);
      toast.success(data.message);
      router.push(
        `/(auth)/otp-verification?email=${encodeURIComponent(email)}`,
      );
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Unable to send OTP.",
      );
      toast.error("Unable to send OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="flex-row items-center px-5 py-4 bg-white border-b border-slate-200">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-10 w-10 rounded-full bg-slate-100 items-center justify-center"
        >
          <AntDesign name="arrow-left" size={20} color="#0F172A" />
        </TouchableOpacity>

        <Text className="ml-4 text-2xl font-bold text-slate-900">
          Forgot Password
        </Text>
      </View>

      {/* Body */}
      <View className="flex-1 px-6 justify-center">
        <Text className="text-4xl font-bold text-slate-900">
          Reset Password 🔑
        </Text>

        <Text className="text-slate-500 text-base mt-2 mb-10">
          Enter your registered email address. We'll send you a verification
          code to reset your password.
        </Text>

        {/* Email */}
        <TextInput
          placeholder="Email Address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!isLoading}
          className="bg-white h-14 rounded-xl px-4 border border-slate-200 mb-8"
        />

        {/* Button */}
        <TouchableOpacity
          onPress={handleSendOtp}
          disabled={isLoading}
          className={`h-14 rounded-xl items-center justify-center ${
            isLoading ? "bg-blue-900" : "bg-blue-900"
          }`}
        >
          <Text className="text-white text-lg font-bold">
            {isLoading ? "Sending OTP..." : "Send OTP"}
          </Text>
        </TouchableOpacity>

        {/* Back to Login */}
        <TouchableOpacity
          className="mt-8"
          onPress={() => router.back()}
          disabled={isLoading}
        >
          <Text className="text-center text-blue-600 font-medium">
            Back to Login
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
