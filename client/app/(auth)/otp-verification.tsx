import { AUTH_API_URL } from "@/config/api";
import { useAuth } from "@/context/AuthContext";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity } from "react-native";
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
    <SafeAreaView className="flex-1 bg-slate-50 justify-center px-6 m-2">
      <Text className="text-4xl font-bold">
        {isRegisterMode && isEmailVerified ? "Create Password" : "Verify OTP"}
      </Text>

      <Text className="text-slate-500 mt-2 mb-8">
        {isRegisterMode && isEmailVerified
          ? "Your email is verified. Enter a password to finish creating your account."
          : isRegisterMode
            ? "Enter the code sent to your email to verify your account."
            : "Enter the code sent to your email and choose a new password."}
      </Text>

      <TextInput
        value={otp}
        onChangeText={setOtp}
        keyboardType="number-pad"
        placeholder="Enter OTP"
        editable={!isLoading && !isEmailVerified}
        className="bg-white h-14 rounded-2xl px-4 mb-4 text-center text-lg"
      />

      {(!isRegisterMode || isEmailVerified) && (
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder={isRegisterMode ? "Password" : "New Password"}
          className="bg-white h-14 rounded-2xl px-4 mb-6"
        />
      )}

      <TouchableOpacity
        onPress={handleVerify}
        disabled={isLoading}
        className={`h-14 rounded-2xl items-center justify-center ${
          isRegisterMode ? "mt-2" : ""
        } bg-blue-600`}
      >
        <Text className="text-white font-semibold">
          {isLoading
            ? isRegisterMode
              ? isEmailVerified
                ? "Creating account..."
                : "Verifying email..."
              : "Resetting password..."
            : isRegisterMode
              ? isEmailVerified
                ? "Create Account"
                : "Verify Email"
              : "Reset Password"}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
