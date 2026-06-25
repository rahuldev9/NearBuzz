import { AUTH_API_URL } from "@/config/api";
import { useAuth } from "@/context/AuthContext";
import { AntDesign } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OtpVerificationScreen() {
  const params = useLocalSearchParams();
  const email = Array.isArray(params.email) ? params.email[0] : params.email;
  const mode = Array.isArray(params.mode) ? params.mode[0] : params.mode;
  const isRegisterMode = mode === "register";
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { confirmSignUp, pendingRegistration, verifySignUpOtp } = useAuth();

  const handleVerify = async () => {
    if (isRegisterMode) {
      if (!otp) {
        Alert.alert("Error", "OTP is required.");
        return;
      }

      if (!pendingRegistration) {
        Alert.alert("Error", "Please start registration again.");
        router.replace("/(auth)/register");
        return;
      }

      setIsLoading(true);

      try {
        if (!isEmailVerified) {
          await verifySignUpOtp(otp);
          setIsEmailVerified(true);
          return;
        }

        if (!password) {
          Alert.alert("Error", "Password is required.");
          return;
        }

        await confirmSignUp(otp, password);
        router.replace("/(root)/(tabs)");
      } catch (error) {
        Alert.alert(
          "Error",
          error instanceof Error
            ? error.message
            : isEmailVerified
              ? "Unable to register."
              : "Unable to verify email.",
        );
      } finally {
        setIsLoading(false);
      }

      return;
    }

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
          {isRegisterMode ? "Verification" : "Reset Password"}
        </Text>
      </View>

      {/* Body */}
      <View className="flex-1 px-6 justify-center">
        <Text className="text-4xl font-bold text-slate-900">
          {isRegisterMode && isEmailVerified
            ? "Create Password 🔐"
            : "Verify OTP 📩"}
        </Text>

        <Text className="text-slate-500 text-base mt-2 mb-10">
          {isRegisterMode && isEmailVerified
            ? "Your email has been verified. Create a secure password to finish setting up your account."
            : isRegisterMode
              ? "Enter the 6-digit verification code sent to your email."
              : "Enter the OTP sent to your email and choose a new password."}
        </Text>

        {/* OTP */}
        <TextInput
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          placeholder="Enter OTP"
          editable={!isLoading && !isEmailVerified}
          maxLength={6}
          className="bg-white h-14 rounded-xl px-4 border border-slate-200 mb-4 text-center text-lg tracking-widest"
        />

        {/* Password */}
        {(!isRegisterMode || isEmailVerified) && (
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder={isRegisterMode ? "Create Password" : "New Password"}
            editable={!isLoading}
            className="bg-white h-14 rounded-xl px-4 border border-slate-200 mb-8"
          />
        )}

        {/* Button */}
        <TouchableOpacity
          onPress={handleVerify}
          disabled={isLoading}
          className={`h-14 rounded-xl items-center justify-center ${
            isLoading ? "bg-blue-800" : "bg-blue-900"
          }`}
        >
          <Text className="text-white text-lg font-bold">
            {isLoading
              ? isRegisterMode
                ? isEmailVerified
                  ? "Creating Account..."
                  : "Verifying..."
                : "Resetting..."
              : isRegisterMode
                ? isEmailVerified
                  ? "Create Account"
                  : "Verify Email"
                : "Reset Password"}
          </Text>
        </TouchableOpacity>

        {/* Back */}
        <TouchableOpacity
          className="mt-8"
          onPress={() => router.back()}
          disabled={isLoading}
        >
          <Text className="text-center text-blue-600 font-medium">Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
